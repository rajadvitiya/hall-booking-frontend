import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Grid,
  Avatar,
  Divider,
  IconButton,
} from "@mui/material";
import { Phone, LocationOn, Facebook, Instagram, Email } from "@mui/icons-material";
import API from "../Api";

export default function ContactDetails() {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch contact details from backend
  const fetchContact = async () => {
    try {
      const res = await API.get("/admin/contacts");
      const data = res.data.contacts?.[0] || null;
      setContact(data);
    } catch (err) {
      console.error("Error fetching contact:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!contact) {
    return (
      <Box sx={{ textAlign: "center", mt: 10 }}>
        <Typography variant="h6" color="text.secondary">
          No contact information available
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: 6,
        px: 2,
      }}
    >
      {/* Hero Section */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "white",
          mb: 4,
          textAlign: "center",
        }}
      >
        Get in Touch
      </Typography>

      {/* Contact Card */}
      <Card
        sx={{
          maxWidth: 600,
          width: "100%",
          boxShadow: 8,
          borderRadius: 4,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.9)",
          p: 2,
        }}
      >
        <CardContent>
          <Typography
            variant="h5"
            sx={{ fontWeight: "bold", mb: 3, textAlign: "center", color: "#333" }}
          >
            Contact Information
          </Typography>

          {/* Phone */}
          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item>
              <Phone sx={{ color: "#667eea" }} />
            </Grid>
            <Grid item>
              <Typography variant="body1">{contact.phone}</Typography>
            </Grid>
          </Grid>

          {/* Email */}
          {contact.email && (
            <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
              <Grid item>
                <Email sx={{ color: "#667eea" }} />
              </Grid>
              <Grid item>
                <Typography variant="body1">{contact.email}</Typography>
              </Grid>
            </Grid>
          )}

          {/* Location */}
          <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Grid item>
              <LocationOn sx={{ color: "#667eea" }} />
            </Grid>
            <Grid item>
              <Typography variant="body1">{contact.location}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Social Media */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body1" sx={{ mb: 2, color: "#444" }}>
              Connect with us
            </Typography>
            <Box>
              {contact.socialMedia?.facebook && (
                <IconButton
                  component="a"
                  href={contact.socialMedia.facebook}
                  target="_blank"
                  sx={{
                    bgcolor: "#1877F2",
                    color: "white",
                    mx: 1,
                    "&:hover": { bgcolor: "#0d5bd9" },
                  }}
                >
                  <Facebook />
                </IconButton>
              )}
              {contact.socialMedia?.instagram && (
                <IconButton
                  component="a"
                  href={contact.socialMedia.instagram}
                  target="_blank"
                  sx={{
                    bgcolor: "#E4405F",
                    color: "white",
                    mx: 1,
                    "&:hover": { bgcolor: "#c72d4d" },
                  }}
                >
                  <Instagram />
                </IconButton>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
