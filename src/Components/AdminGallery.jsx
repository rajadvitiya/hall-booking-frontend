import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardActions,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import API from "../Api"; // import the Axios instance


// Styled drag-drop box
const DropZone = styled(Box)(({ theme, isDragging }) => ({
  border: "2px dashed #3f51b5",
  borderRadius: "12px",
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  backgroundColor: isDragging ? "rgba(63,81,181,0.1)" : "transparent",
  transition: "0.3s",
}));

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState({ text: "", severity: "success" });
  const [isDragging, setIsDragging] = useState(false);

  const token = localStorage.getItem("adminToken"); // Admin token

  // Fetch all images
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/gallery");
      setImages(res.data);
    } catch (err) {
      console.error(err);
      setMessage({ text: "Failed to fetch images", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Handle file selection
  const handleFileSelect = (e) => {
  const selected = e.target.files[0];
  if (!selected) return;
  setFile(selected);
  setPreview(URL.createObjectURL(selected));
};


  // Upload image
  const handleUpload = async () => {
    if (!file) {
      setMessage({ text: "Please select a file", severity: "warning" });
      return;
    }
    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await API.post("/admin/gallery/upload", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});
      setImages([res.data.image, ...images]);
      setFile(null);
      setPreview(null);
      setMessage({ text: "Image uploaded successfully", severity: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Upload failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Delete image
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      setLoading(true);
      await API.delete(`/admin/gallery/${id}`);
      setImages(images.filter((img) => img._id !== id));
      setMessage({ text: "Image deleted successfully", severity: "success" });
    } catch (err) {
      console.error(err);
      setMessage({ text: "Delete failed", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        Manage Gallery
      </Typography>

      {/* Drag & Drop / Upload Section */}
      <DropZone
        isDragging={isDragging}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <input
          type="file"
          id="fileInput"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
        <CloudUpload fontSize="large" sx={{ mb: 1 }} />
        <Typography variant="body1">
          Drag & Drop your image here or click to select
        </Typography>
        {preview && (
          <Box mt={2}>
            <Typography variant="subtitle2">Preview:</Typography>
            <img
              src={preview}
              alt="preview"
              style={{ width: "200px", borderRadius: "8px", marginTop: "5px" }}
            />
          </Box>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          sx={{ mt: 2 }}
          disabled={loading || !file}
        >
          Upload
        </Button>
      </DropZone>

      {/* Loading */}
      {loading && (
        <Box mt={2} textAlign="center">
          <CircularProgress />
        </Box>
      )}

      {/* Images Grid */}
      <Grid container spacing={3} mt={3}>
        {images.map((img) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={img._id}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                transition: "0.3s",
                "&:hover img": { transform: "scale(1.1)" },
                "&:hover .deleteBtn": { opacity: 1 },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={img.url}
                alt={img.title || "Gallery Image"}
                sx={{ transition: "0.3s" }}
              />
              <CardActions
                className="deleteBtn"
                sx={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  opacity: 0,
                  transition: "0.3s",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleDelete(img._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={!!message.text}
        autoHideDuration={3000}
        onClose={() => setMessage({ text: "", severity: "success" })}
      >
        <Alert severity={message.severity}>{message.text}</Alert>
      </Snackbar>
    </Box>
  );
}
