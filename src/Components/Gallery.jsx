import React, { useEffect, useState } from "react";
import { Box, Grid, Dialog, DialogContent, IconButton, Typography, CircularProgress, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import { motion } from "framer-motion";
import API from "../Api";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState({});

  const fetchImages = async () => {
    try {
      const res = await API.get("/admin/gallery");
      setImages(res.data);
    } catch (err) {
      console.error("Failed to fetch images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleOpen = (img) => {
    setSelectedImage(img);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage({});
  };

  if (loading)
    return (
      <Box textAlign="center" sx={{ mt: 10 }}>
        <CircularProgress size={60} />
      </Box>
    );

  return (
    <Box
      sx={{
        p: 6,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Back to Home Button */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            background: "linear-gradient(90deg, #ff9a9e, #fad0c4, #667eea, #764ba2)",
            color: "#fff",
            fontWeight: "bold",
            py: 1.5,
            px: 3,
            borderRadius: 3,
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
              background: "linear-gradient(90deg, #764ba2, #667eea, #fad0c4, #ff9a9e)",
            },
            transition: "0.3s",
          }}
          onClick={() => (window.location.href = "/home")}
        >
          Back to Home
        </Button>
      </Box>

      {/* Gallery Title */}
      <Typography
        variant="h3"
        align="center"
        gutterBottom
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring", stiffness: 100 }}
        sx={{
          fontWeight: "bold",
          background: "linear-gradient(90deg, #ff9a9e, #fad0c4, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 12px rgba(0,0,0,0.3)",
          mb: 6,
        }}
      >
        Our Hall Gallery
      </Typography>

      {/* Image Grid */}
      <Grid container spacing={4}>
        {images.map((img, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={img._id || index}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Box
                component={motion.div}
                whileHover={{ scale: 1.03 }}
                sx={{
                  position: "relative",
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "0.3s",
                }}
                onClick={() => handleOpen(img)}
              >
                <Box
                  component="img"
                  src={img.url}
                  alt={img.title}
                  sx={{
                    width: "100%",
                    height: 250,
                    objectFit: "cover",
                    display: "block",
                    transition: "transform 0.5s",
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                />

                {/* Overlay on hover */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))",
                    opacity: 0,
                    transition: "opacity 0.3s",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    "&:hover": { opacity: 1 },
                    p: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="white"
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      textShadow: "2px 2px 10px rgba(0,0,0,0.7)",
                    }}
                  >
                    {img.title || "Gallery Image"}
                  </Typography>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Lightbox Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        PaperProps={{
          component: motion.div,
          initial: { opacity: 0, scale: 0.8 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.8 },
          transition: { duration: 0.3 },
          sx: { backgroundColor: "transparent", boxShadow: "none" },
        }}
      >
        <DialogContent sx={{ position: "relative", p: 0, backgroundColor: "rgba(0,0,0,0.85)", borderRadius: 2 }}>
          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8, color: "#fff", zIndex: 10 }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component={motion.img}
            src={selectedImage.url}
            alt={selectedImage.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            sx={{ width: "100%", height: "auto", borderRadius: 2 }}
          />
          {selectedImage.title && (
            <Typography
              variant="h6"
              color="white"
              sx={{ mt: 1, textAlign: "center", textShadow: "2px 2px 10px rgba(0,0,0,0.7)" }}
            >
              {selectedImage.title}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
