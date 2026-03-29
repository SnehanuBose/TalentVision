from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging
import re

# --- Skill extraction ---
import spacy
nlp = spacy.load("en_core_web_sm")


def extract_skills(text, skills_set):
    found = set()
    text_lower = text.lower()
    # Fuzzy/simple inclusion
    for skill in skills_set:
        if skill.lower() in text_lower:
            found.add(skill)
    # use spacy noun chunks
    doc = nlp(text)
    for chunk in doc.noun_chunks:
        if chunk.text.lower() in skills_set:
            found.add(chunk.text.lower())
    return list(found)


# --- Experience extraction ---
def extract_experience_years(text, skill):
    # Looks for experience 
    patterns = [
        rf'(\d+)\s+(years?|months?)\s+(?:of|in|with)?\s*{re.escape(skill)}',
        rf'{re.escape(skill)}\s*[:\-]?\s*(\d+)\s+(years?|months?)'
    ]
    total_months = 0
    for pat in patterns:
        for m in re.findall(pat, text, re.IGNORECASE):
            num, unit = m[:2]
            n = int(num)
            if "year" in unit:
                total_months += n * 12
            else:
                total_months += n
    return total_months / 12 if total_months > 0 else 0


def has_project_with_skill(text, skill):
    text_lower = text.lower()
    proj_keywords = ['project', 'developed', 'created', 'built', 'implemented', 'contributed', 'designed']
    skill = skill.lower()
    for word in proj_keywords:
        if re.search(rf'({word}).{{0,30}}{re.escape(skill)}', text_lower):
            return True
    if re.search(rf'project.*{re.escape(skill)}', text_lower):
        return True
    if re.search(rf'experience.*{re.escape(skill)}.*project', text_lower):
        return True
    return False


def normalize_cross_encoder_scores(results):
    scores = [job['crossEncoderScore'] for job in results]
    max_score = max(scores)
    min_score = min(scores)
    if max_score == min_score:
        for job in results:
            job['normalizedScore'] = 1.0
    else:
        for job in results:
            job['normalizedScore'] = (job['crossEncoderScore'] - min_score) / (max_score - min_score)
    return results


def calculate_final_score(matched_skills_count, required_skills_count, cross_encoder_score, 
                          experience_score, projects_found):
    """
    Calculate final score (0-100) with proper weighting:
    - Skills: 40 points (most important)
    - Semantic fit: 25 points
    - Experience: 20 points
    - Projects: 15 points
    """
    # 1. Skill Match Score (0-40 points)
    skill_coverage = matched_skills_count / max(required_skills_count, 1)
    skill_points = skill_coverage * 40
    
    # 2. Semantic Similarity Score (0-25 points)
    # Normalize cross-encoder score (typically -10 to 0, higher is better)
    normalized_similarity = min(max((cross_encoder_score + 10) / 10, 0), 1)
    similarity_points = normalized_similarity * 25
    
    # 3. Experience Score (0-20 points)
    # Cap at 10 years to avoid over-weighting senior candidates
    experience_normalized = min(experience_score / 10, 1)
    experience_points = experience_normalized * 20
    
    # 4. Project Score (0-15 points)
    # Cap at 5 projects
    projects_normalized = min(projects_found / 5, 1)
    project_points = projects_normalized * 15
    
    # Calculate final score (0-100)
    final_score = skill_points + similarity_points + experience_points + project_points
    
    return round(final_score, 2)


# --- ML Models ---
from sentence_transformers import SentenceTransformer, CrossEncoder

bi_model = SentenceTransformer('all-MiniLM-L6-v2')
cross_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-12-v2')


# --- FastAPI setup ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"]
)
logging.basicConfig(level=logging.INFO)


class JobInput(BaseModel):
    id: str
    title: str
    description: str
    skills: List[str]


class ResumeInput(BaseModel):
    id: str
    text: str


class MatchRequest(BaseModel):
    resume: str
    role: str = ""
    jobs: List[JobInput]


class BatchMatchRequest(BaseModel):
    resumes: List[ResumeInput]
    jobs: List[JobInput]


@app.get("/")
def root():
    return {"status": "ML API running"}


@app.post("/match_resume_jobs")
async def match_resume_jobs(request: MatchRequest):
    try:
        resume_text = request.resume
        role = request.role
        jobs = request.jobs
        job_inputs = [f"{job.title}: {job.description} Skills: {','.join(job.skills)}" for job in jobs]
        skills_set = set(skill for job in jobs for skill in job.skills)
        combined_text = f"{role} {resume_text}" if role else resume_text
        resume_skills = extract_skills(combined_text, skills_set)

        job_embeddings = bi_model.encode(job_inputs, convert_to_numpy=True)
        resume_embedding = bi_model.encode([combined_text], convert_to_numpy=True)
        scores = (job_embeddings @ resume_embedding.T).flatten()

        result_jobs = []
        for idx, job in enumerate(jobs):
            exp_years = sum(extract_experience_years(resume_text, skill) for skill in job.skills)
            project_hits = sum(1 for skill in job.skills if has_project_with_skill(resume_text, skill))
            matched_skills = list(set(job.skills) & set(resume_skills))
            
            result_jobs.append({
                "jobId": job.id,
                "score": float(scores[idx]),
                "matchedSkills": matched_skills,
                "experienceScore": exp_years,
                "projectsFound": project_hits
            })

        pairs = [(job_inputs[idx], resume_text) for idx in range(len(jobs))]
        cross_scores = cross_model.predict(pairs)
        for i, job_res in enumerate(result_jobs):
            job_res["crossEncoderScore"] = float(cross_scores[i])

        result_jobs = normalize_cross_encoder_scores(result_jobs)

        for job_res, job in zip(result_jobs, jobs):
            job_res["finalScore"] = calculate_final_score(
                matched_skills_count=len(job_res["matchedSkills"]),
                required_skills_count=len(job.skills),
                cross_encoder_score=job_res["crossEncoderScore"],
                experience_score=job_res["experienceScore"],
                projects_found=job_res["projectsFound"]
            )

        result_jobs.sort(key=lambda x: x["finalScore"], reverse=True)
        return {"rankedJobs": result_jobs}
    except Exception as e:
        logging.error(f"Error in matching: {e}")
        raise HTTPException(status_code=500, detail=f"Error in ML API: {str(e)}")


@app.post("/batch_match")
async def batch_match(request: BatchMatchRequest):
    try:
        resumes = request.resumes
        jobs = request.jobs
        job_inputs = [f"{job.title}: {job.description} Skills: {','.join(job.skills)}" for job in jobs]
        skills_set = set(skill for job in jobs for skill in job.skills)
        results = []

        job_embeddings = bi_model.encode(job_inputs, convert_to_numpy=True)
        for resume in resumes:
            resume_skills = extract_skills(resume.text, skills_set)
            resume_embedding = bi_model.encode([resume.text], convert_to_numpy=True)
            scores = (job_embeddings @ resume_embedding.T).flatten()

            result_jobs = []
            for idx, job in enumerate(jobs):
                exp_years = sum(extract_experience_years(resume.text, skill) for skill in job.skills)
                project_hits = sum(1 for skill in job.skills if has_project_with_skill(resume.text, skill))
                matched_skills = list(set(job.skills) & set(resume_skills))
                
                result_jobs.append({
                    "jobId": job.id,
                    "score": float(scores[idx]),
                    "matchedSkills": matched_skills,
                    "experienceScore": exp_years,
                    "projectsFound": project_hits
                })
            
            pairs = [(job_inputs[idx], resume.text) for idx in range(len(jobs))]
            cross_scores = cross_model.predict(pairs)
            for i, job_res in enumerate(result_jobs):
                job_res["crossEncoderScore"] = float(cross_scores[i])
            
            result_jobs = normalize_cross_encoder_scores(result_jobs)

            for job_res, job in zip(result_jobs, jobs):
                job_res["finalScore"] = calculate_final_score(
                    matched_skills_count=len(job_res["matchedSkills"]),
                    required_skills_count=len(job.skills),
                    cross_encoder_score=job_res["crossEncoderScore"],
                    experience_score=job_res["experienceScore"],
                    projects_found=job_res["projectsFound"]
                )
            
            result_jobs.sort(key=lambda x: x["finalScore"], reverse=True)
            results.append({
                "resumeId": resume.id,
                "results": result_jobs
            })

        return {"batchResults": results}
    except Exception as e:
        logging.error(f"Batch match error: {e}")
        raise HTTPException(status_code=500, detail=f"Error in batch ML API: {str(e)}")