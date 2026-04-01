from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import logging
import re
import numpy as np
import json
import os

# NLP
import spacy

# ML Models
from sentence_transformers import SentenceTransformer, CrossEncoder
# LLM
from openai import OpenAI

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

# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


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

# ---------------- UTIL FUNCTIONS ----------------

def extract_skills(text, skills_set):
    text = text.lower()
    return [
        skill for skill in skills_set
        if re.search(rf'\b{re.escape(skill.lower())}\b', text)
    ]

def extract_experience(text, skill):
    patterns = [
        rf'(\d+)\+?\s*(years?).{{0,15}}{skill}',
        rf'{skill}.{{0,15}}(\d+)\+?\s*(years?)'
    ]
    months = 0
    for pat in patterns:
        matches = re.findall(pat, text.lower())
        for m in matches:
            months += int(m[0]) * 12
    return months / 12

def cosine(a, b):
    return np.dot(a, b.T) / (np.linalg.norm(a) * np.linalg.norm(b))

# ---------------- LLM ----------------

def llm_score(resume, job):
    prompt = f"""
You are a senior recruiter.

Evaluate candidate for job.

JOB:
{job['title']} | {job['description']} | {job['skills']}

RESUME:
{resume}

Return JSON:
{{
 "score": 0-100,
 "reason": "...",
 "strengths": ["..."],
 "weaknesses": ["..."]
}}
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return res.choices[0].message.content

# ---------------- MAIN ENDPOINT ----------------

@app.post("/rank_candidates_for_job")
async def rank_candidates(req: RankRequest):
    try:
        job = req.job
        candidates = req.candidates

        job_text = f"{job.title} {job.description} {' '.join(job.skills)}"

        job_embedding = bi_model.encode([job_text])[0]

        results = []

        for c in candidates:
            resume = c.resume.lower()

            # skills
            matched_skills = extract_skills(resume, job.skills)

            # embedding
            res_emb = bi_model.encode([resume])[0]
            semantic = cosine(job_embedding, res_emb)

            # cross encoder
            cross = cross_model.predict([(job_text, resume)])[0]
            cross = max(min((cross + 5) / 5, 1), 0)

            # experience
            exp = sum(extract_experience(resume, s) for s in job.skills)

            # LLM
            raw = llm_score(resume, job.dict())

            try:
                parsed = json.loads(raw)
                llm_s = parsed.get("score", 0) / 100
                reason = parsed.get("reason", "")
                strengths = parsed.get("strengths", [])
                weaknesses = parsed.get("weaknesses", [])
            except:
                llm_s = 0
                reason = "parse error"
                strengths = []
                weaknesses = []

            # final score
            hybrid = (
                0.3 * semantic +
                0.2 * cross +
                0.5 * llm_s
            ) * 100

            results.append({
                "candidateId": c.id,
                "score": round(hybrid, 2),
                "semantic": float(semantic),
                "llmScore": llm_s * 100,
                "matchedSkills": matched_skills,
                "reason": reason,
                "strengths": strengths,
                "weaknesses": weaknesses
            })

        results.sort(key=lambda x: x["score"], reverse=True)

        return {"rankedCandidates": results}

    except Exception as e:
        logging.error(str(e))
        raise HTTPException(status_code=500, detail=str(e))