import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/recruiter",
});

// ✅ attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN SENT:", token);

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

// ✅ handle 401 globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.log("401 → redirect to login");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const getDashboard = () => API.get("/dashboard");
export const getApplicants = (id) => API.get(`/job/${id}/applicants`);