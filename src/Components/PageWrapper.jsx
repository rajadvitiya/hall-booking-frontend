// PageWrapper.jsx
import React from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export default function PageWrapper({ children }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // centers vertically too
        p: 3,
      }}
    >
      {/* Back Button */}
      <Box sx={{ position: "absolute", top: 20, left: 20 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/home")}
          sx={{
            borderRadius: 50,
            textTransform: "none",
            fontWeight: "bold",
            px: 3,
            py: 1,
            color: "#fff",
            borderColor: "#fff",
            background: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(6px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.25)",
              borderColor: "#fff",
            },
          }}
        >
          Back to Home
        </Button>
      </Box>

      {/* Centered Form Container */}
      <Paper
        elevation={6}
        sx={{
          width: { xs: "100%", sm: "500px" },
          borderRadius: 4,
          p: 4,
          background: "#fff",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          sx={{ mb: 3, color: "#333" }}
        >
          Book Heritage Hall
        </Typography>

        {children}
      </Paper>
    </Box>
  );
}
