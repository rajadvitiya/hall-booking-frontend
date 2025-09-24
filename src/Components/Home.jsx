import React from "react";
import { Container, Typography, Box, Grid, Card } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import CelebrationIcon from '@mui/icons-material/Celebration';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function Home() {
  const navigate = useNavigate();

  const hallImages = [
    "/images/mover-1.jpg",
    "/images/mover-2.jpg",
    "/images/mover-3.jpg",
  ];

  const facilities = [
    { title: "Spacious Hall", desc: "Beautiful hall with 1000+ seating capacity.", icon: <CelebrationIcon fontSize="large" /> },
    { title: "Catering Services", desc: "Delicious food options for your guests.", icon: <RestaurantMenuIcon fontSize="large" /> },
    { title: "Parking Facility", desc: "Ample parking space available.", icon: <LocalParkingIcon fontSize="large" /> },
    { title: "Decoration & Lighting", desc: "Customizable decorations and lighting.", icon: <LightbulbIcon fontSize="large" /> },
    { title: "Live Music", desc: "Professional live bands and DJs.", icon: <MusicNoteIcon fontSize="large" /> },
    { title: "Photography Services", desc: "Capture every moment professionally.", icon: <CameraAltIcon fontSize="large" /> },
    { title: "Event Planning", desc: "Complete planning and coordination services.", icon: <EventAvailableIcon fontSize="large" /> },
  ];

  const welcomeText = "Welcome to Heritage Marriage Hall 💍";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        py: 5,
        px: 2,
        borderRadius: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Carousel */}
        <Box
          sx={{
            height: { xs: 300, md: 450 },
            borderRadius: 3,
            overflow: "hidden",
            mb: 5,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
          }}
        >
          <Carousel indicators={false} navButtonsAlwaysVisible animation="slide" interval={4000}>
            {hallImages.map((img, index) => (
              <Box
                key={index}
                sx={{
                  width: "100%",
                  height: { xs: 300, md: 450 },
                  borderRadius: 3,
                  backgroundImage: `url(${img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "white",
                  textShadow: "2px 2px 12px rgba(0,0,0,0.7)",
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3rem" },
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  {welcomeText.split("").map((char, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      style={{ display: "inline-block" }}
                    >
                      {char}
                    </motion.span>
                  ))}
                </Typography>
              </Box>
            ))}
          </Carousel>
        </Box>

        {/* Book Now Button */}
        <Box textAlign="center" mb={8}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ duration: 0.3 }}>
            <Box
              component="button"
              onClick={() => navigate("/packages")}
              sx={{
                background: "linear-gradient(45deg, #4c00ffff 30%, #095deeff 90%)",
                color: "white",
                border: "none",
                borderRadius: "25px",
                px: 6,
                py: 1.5,
                fontWeight: "bold",
                fontSize: { xs: "1rem", sm: "1.2rem" },
                cursor: "pointer",
                boxShadow: "0px 8px 24px rgba(0,0,0,0.2)",
                "&:hover": { boxShadow: "0px 12px 32px rgba(0,0,0,0.3)" },
                transition: "all 0.3s ease",
              }}
            >
              Book Now
            </Box>
          </motion.div>
        </Box>

        {/* Facilities Section */}
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          mb={4}
          sx={{
            textDecoration: "underline",
            textDecorationColor: "#fff",
            color: "white",
          }}
        >
          Our Facilities
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {facilities.map((facility, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Card
                  sx={{
                    height: 220,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    px: 2,
                    py: 4,
                    cursor: "pointer",
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      transform: "scale(1.05)",
                      boxShadow: "0 15px 35px rgba(0,0,0,0.4)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box sx={{ mb: 2 }}>{facility.icon}</Box>
                  <Typography variant="h6" fontWeight="bold">
                    {facility.title}
                  </Typography>
                  <Typography variant="body2">{facility.desc}</Typography>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
