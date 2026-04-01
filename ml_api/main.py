
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging
import re
import numpy as np

import spacy
from sentence_transformers import SentenceTransformer, CrossEncoder
from rapidfuzz import fuzz

nlp = None
bi_model = None
cross_model = None

app = FastAPI()

@app.on_event("startup")
def load_models():
    global nlp, bi_model, cross_model
    nlp = spacy.load("en_core_web_sm")
    bi_model = SentenceTransformer('all-MiniLM-L6-v2')
    cross_model = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-12-v2')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

# ---------------- MODELS ----------------
class Candidate(BaseModel):
    id: str
    resume: str

class Job(BaseModel):
    id: str
    title: str
    description: str
    skills: List[str]

class RankRequest(BaseModel):
    job: Job
    candidates: List[Candidate]

# ---------------- SKILL ENGINE ----------------

SKILL_SYNONYMS = {
    "node": ["nodejs", "node.js"],
    "react": ["reactjs", "react.js"],
    "python": ["py"],
    "javascript": ["js"],
    "machine learning": ["ml", "deep learning"],
    "docker": ["containerization"],
    "rest api": ["rest", "api development"],
}

def normalize_skill(skill):
    skill = skill.lower()
    for main, variants in SKILL_SYNONYMS.items():
        if skill == main or skill in variants:
            return main
    return skill


def extract_skills_advanced(text, job_skills):
    text = text.lower()
    doc = nlp(text)
    tokens = [token.text for token in doc]

    found = set()

    for skill in job_skills:
        norm = normalize_skill(skill)

        # direct match
        if norm in text:
            found.add(skill)
            continue

        # fuzzy match
        for token in tokens:
            if fuzz.partial_ratio(norm, token) > 85:
                found.add(skill)
                break

        # synonym match
        for main, variants in SKILL_SYNONYMS.items():
            if norm == main:
                if any(v in text for v in variants):
                    found.add(skill)

    return list(found)


def cosine(a, b):
    return np.dot(a, b.T) / (np.linalg.norm(a) * np.linalg.norm(b))

# ---------------- MAIN ----------------

@app.post("/rank_candidates_for_job")
async def rank_candidates(req: RankRequest):
    try:
        job = req.job
        candidates = req.candidates

        job_text = f"{job.title} {job.description} {' '.join(job.skills)}"
        job_embedding = bi_model.encode([job_text])[0]

        results = []

        for c in candidates:
            resume = c.resume.strip().lower()

            if len(resume) < 30:
                results.append({
                    "candidateId": c.id,
                    "score": 0,
                    "reason": "Invalid or empty resume",
                    "matchedSkills": [],
                })
                continue

            # 🔥 SKILL MATCH
            matched_skills = extract_skills_advanced(resume, job.skills)
            skill_score = (len(matched_skills) ** 1.2) / max(len(job.skills), 1)

            # 🔥 SEMANTIC
            res_emb = bi_model.encode([resume])[0]
            semantic = cosine(job_embedding, res_emb)

            # 🔥 CROSS ENCODER
            cross = cross_model.predict([(job_text, resume)])[0]
            cross = max(min((cross + 5) / 5, 1), 0)

            # 🔥 FINAL SCORE
            final_score = (
                0.4 * semantic +
                0.3 * cross +
                0.3 * skill_score
            ) * 100

            # 🔥 EXPLANATION
            explanation = {
                "semanticScore": round(float(semantic * 100), 2),
                "crossScore": round(float(cross * 100), 2),
                "skillScore": round(float(skill_score * 100), 2),
                "matchedSkills": matched_skills
            }

            results.append({
                "candidateId": c.id,
                "score": round(final_score, 2),
                "matchedSkills": matched_skills,
                "explanation": explanation,
                "reason": f"Matched {len(matched_skills)} key skills with strong semantic relevance"
            })

        results.sort(key=lambda x: x["score"], reverse=True)

        return {"rankedCandidates": results}

    except Exception as e:
        logging.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))
