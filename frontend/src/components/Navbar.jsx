
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(90deg, #0f172a, #1e293b)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      <Toolbar>
        <Typography sx={{ flexGrow: 1, fontWeight: 700, fontSize: 20 }}>
          TalentVision 🚀
        </Typography>

        <Button color="inherit" onClick={() => navigate("/")}>Jobs</Button>
        <Button color="inherit" onClick={() => navigate("/upload")}>Upload</Button>
      </Toolbar>
    </AppBar>
  );
}
