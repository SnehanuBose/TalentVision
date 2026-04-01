
import { useState } from "react";
import api from "../utils/api";
import Navbar from "../components/Navbar";

export default function Upload() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const role = localStorage.getItem("selectedRole");

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("role", role);

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/resumes/batchUpload", formData);

      setResults(res.data.batchResults || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #020617, #0f172a)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 750,
            background: "rgba(30,41,59,0.85)",
            backdropFilter: "blur(15px)",
            padding: 30,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0,0,0,0.6)",
          }}
        >
          <h2 style={{ color: "white", marginBottom: 10 }}>
            Upload Resume
          </h2>

          <p style={{ color: "#94a3b8", marginBottom: 20 }}>
            Role: <b>{role || "Not Selected"}</b>
          </p>

          {/* Upload Box */}
          <label
            style={{
              display: "block",
              border: "2px dashed #475569",
              borderRadius: 16,
              padding: 30,
              textAlign: "center",
              cursor: "pointer",
              color: "#cbd5f5",
              transition: "0.3s",
            }}
          >
            📄 Click or Drag & Drop Resume

            <input
              type="file"
              multiple
              onChange={handleUpload}
              style={{ display: "none" }}
            />
          </label>

          {/* Loading */}
          {loading && (
            <p style={{ color: "#38bdf8", marginTop: 20 }}>
              Uploading & Analyzing...
            </p>
          )}

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 20,
                padding: 12,
                background: "#7f1d1d",
                borderRadius: 10,
                color: "#fecaca",
              }}
            >
              {error}
            </div>
          )}

          {/* Results */}
          {results.map((r, i) => {
            const jobData = r?.rankedJobs?.[0] || {};
            const score = jobData.finalScore || 0;
            const explanation = jobData.explanation || {};

            return (
              <div
                key={i}
                style={{
                  marginTop: 20,
                  padding: 20,
                  borderRadius: 16,
                  background: "rgba(15,23,42,0.9)",
                }}
              >
                <h3 style={{ color: "white" }}>
                  {r.candidate.filename}
                </h3>

                {/* Score Bar */}
                <div
                  style={{
                    height: 12,
                    background: "#1e293b",
                    borderRadius: 10,
                    overflow: "hidden",
                    marginTop: 10,
                  }}
                >
                  <div
                    style={{
                      width: `${score}%`,
                      height: "100%",
                      background:
                        score > 70
                          ? "linear-gradient(90deg,#22c55e,#4ade80)"
                          : score > 40
                          ? "linear-gradient(90deg,#eab308,#facc15)"
                          : "linear-gradient(90deg,#ef4444,#f87171)",
                    }}
                  />
                </div>

                <p style={{ marginTop: 8, color: "#94a3b8" }}>
                  Match Score: <b>{score}</b>
                </p>

                {/* Skills */}
                <p style={{ color: "#cbd5f5" }}>
                  Skills:{" "}
                  {jobData.matchedSkills?.join(", ") || "None"}
                </p>

                {/* 🔥 EXPLANATION PANEL */}
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: "#020617",
                    color: "#cbd5f5",
                  }}
                >
                  <p>🧠 Semantic Match: {explanation.semanticScore || 0}%</p>
                  <p>⚖️ Relevance Score: {explanation.crossScore || 0}%</p>
                  <p>🛠 Skill Match: {explanation.skillScore || 0}%</p>
                </div>

                {/* Reason */}
                <p style={{ marginTop: 10, color: "#94a3b8" }}>
                  {jobData.reason || "No explanation available"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
