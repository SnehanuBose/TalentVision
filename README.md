# 🚀 TalentVision — AI-Powered Resume & Candidate Matching System

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express.js-Backend-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![FastAPI](https://img.shields.io/badge/FastAPI-ML_API-teal)
![Python](https://img.shields.io/badge/Python-3.10+-yellow)
![OpenAI](https://img.shields.io/badge/LLM-GPT--Powered-purple)
![License](https://img.shields.io/badge/License-MIT-orange)
![Status](https://img.shields.io/badge/Status-Active-success)

---

## 🧠 Overview

TalentVision is an **AI-powered recruitment engine** that intelligently matches resumes to jobs and ranks candidates using **Machine Learning + LLM-based evaluation**.

It simulates how a real recruiter evaluates candidates — combining:

* Semantic understanding
* Skill matching
* Experience analysis
* AI reasoning (LLM)

---

## ✨ Features

### 🔐 Authentication & Security

* JWT + Refresh Token system
* Role-based access:

  * Candidate
  * Recruiter
  * Admin
* HttpOnly cookies
* Rate limiting (brute-force protection)

---

### 🤖 AI Resume Matching

* Sentence Transformer embeddings
* Cross-encoder reranking
* Skill extraction (regex + NLP)
* Experience detection
* Hybrid scoring system

---

### 🧠 LLM Recruiter AI

* GPT-powered evaluation
* Human-like reasoning
* Outputs:

  * Score
  * Strengths
  * Weaknesses
  * Explanation

---

### 📊 Candidate Ranking System

* Rank multiple candidates for a job
* AI-based scoring pipeline
* Recruiter-ready output

---

## 🏗️ System Architecture

```mermaid
flowchart LR
    A[Frontend / Client] --> B[Node.js Backend]
    B --> C[MongoDB]
    B --> D[ML API - FastAPI]

    D --> E[Sentence Transformer]
    D --> F[Cross Encoder]
    D --> G[LLM - OpenAI GPT]

    G --> D
    E --> D
    F --> D

    D --> B
    B --> A
```

---

## 🤖 AI Matching Pipeline

```mermaid
flowchart TD
    A[Resume Upload] --> B[Text Extraction]
    B --> C[Skill Extraction]
    B --> D[Embedding Generation]

    D --> E[Semantic Similarity]
    D --> F[Cross Encoder Score]

    C --> G[Skill Match Score]

    E --> H[Hybrid Scoring Engine]
    F --> H
    G --> H

    H --> I[LLM Evaluation]
    I --> J[Final Ranking]
```

---

## 📊 Candidate Ranking Flow

```mermaid
flowchart LR
    A[Job Selected] --> B[Fetch Candidates]
    B --> C[Send to ML API]

    C --> D[Semantic Scoring]
    C --> E[Skill Matching]
    C --> F[LLM Evaluation]

    D --> G[Final Score]
    E --> G
    F --> G

    G --> H[Rank Candidates]
```

---

## 📁 Project Structure

```mermaid
graph TD
    A[TalentVision] --> B[backend]
    A --> C[ml-api]
    A --> D[frontend]

    B --> B1[models]
    B --> B2[routes]
    B --> B3[controllers]
    B --> B4[middleware]

    C --> C1[main.py]
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/TalentVision.git
cd TalentVision
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

---

### 3️⃣ Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
ML_API_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key
```

---

### 4️⃣ Run Backend

```bash
npm run dev
```

---

### 5️⃣ Setup ML API

```bash
cd ../ml-api
pip install -r requirements.txt
```

Run:

```bash
uvicorn main:app --reload --port 8000
```

---

## 🔗 API Documentation

---

### 🔐 Auth

#### Register

```http
POST /api/auth/register
```

#### Login

```http
POST /api/auth/login
```

#### Refresh

```http
GET /api/auth/refresh
```

#### Logout

```http
POST /api/auth/logout
```

---

### 📄 Resume

```http
POST /api/resumes/upload
```

---

### 💼 Jobs

```http
GET /api/jobs
POST /api/jobs
```

---

### 🤖 AI Matching

```http
POST /match_resume_jobs
```

---

### 🧠 Candidate Ranking (CORE FEATURE)

```http
POST /rank_candidates_for_job
```

#### Request:

```json
{
  "job": {
    "id": "job1",
    "title": "ML Engineer",
    "description": "...",
    "skills": ["python", "ml"]
  },
  "candidates": [
    {
      "id": "user1",
      "resume": "text..."
    }
  ]
}
```

---

#### Response:

```json
{
  "rankedCandidates": [
    {
      "candidateId": "user1",
      "score": 91,
      "llmScore": 94,
      "matchedSkills": ["python", "ml"],
      "reason": "Strong ML experience",
      "strengths": ["ML", "projects"],
      "weaknesses": ["no cloud"]
    }
  ]
}
```


---

## 🔐 Security

* JWT Authentication
* Refresh Tokens
* HttpOnly Cookies
* Rate Limiting
* Role-Based Access Control

---

## 🧠 Tech Stack

### Backend

* Node.js
* Express
* MongoDB (Mongoose)

### AI / ML

* FastAPI
* Sentence Transformers
* Cross Encoder
* OpenAI GPT

### Dev Tools

* ESLint
* Prettier
* Nodemon

---

## 🚀 Future Improvements

* 📊 Recruiter dashboard UI
* 🤖 AI interview question generator
* 📄 Resume improvement suggestions
* 📈 Hiring analytics
* 🌐 SaaS multi-tenant system

---

## ⚠️ Notes

* Do NOT commit `.env`
* Use `.env.example`
* Ensure MongoDB & ML API are running

---

## 👨‍💻 Contributors

**Snehanu Bose , Ahamit Pal**

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
