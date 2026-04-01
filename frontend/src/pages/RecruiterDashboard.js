    import React, { useState,useEffect } from "react";
    import { useNavigate } from "react-router-dom";
import HomeTab from "../components/Dashboard/HomeTab";
import CandidateUpload from "../components/CandidateUpload";

const RecruiterDashboard = () => {
  const [tab, setTab] = useState("home");
    const navigate = useNavigate();

    // useEffect(() => {
    //   const token = localStorage.getItem("token");

    //   if (!token) {
    //     navigate("/login"); // redirect if not logged in
    //   }
    // }, [navigate]);

  return (
    <div>
      <h1>Recruiter Dashboard</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        <button onClick={() => setTab("home")}>Home</button>
        <button onClick={() => setTab("check")}>Check</button>
      </div>

      {tab === "home" && <HomeTab />}
      {tab === "check" && <CandidateUpload />}
    </div>
  );
};

export default RecruiterDashboard;