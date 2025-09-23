import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  IconButton, // <-- added
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material"; // <-- added
import { useNavigate } from "react-router-dom";
import API from "../Api";

export default function ContactManagement() {
  const navigate = useNavigate(); // for back button

  const [contact, setContact] = useState({
    phone: "",
    location: "",
    socialMedia: { facebook: "", instagram: "" },
    _id: "",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    location: "",
    socialMedia: { facebook: "", instagram: "" },
  });

  // Fetch contact from backend
  const fetchContact = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/contacts");

      // Extract first contact from array
      const data = res.data.contacts?.[0] || {};

      setContact({
        phone: data.phone || "",
        location: data.location || "",
        socialMedia: data.socialMedia || { facebook: "", instagram: "" },
        _id: data._id || "",
      });
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Error fetching contact", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleOpenDialog = () => {
    setForm(contact);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => setOpenDialog(false);

  const handleSaveContact = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!form.phone || !form.location) {
        setToast({ open: true, message: "Phone and Location are required", severity: "warning" });
        return;
      }

      await API.put(`/admin/contacts/${contact._id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setToast({ open: true, message: "Contact updated successfully ✅", severity: "success" });
      setOpenDialog(false);
      fetchContact();
    } catch (err) {
      console.error(err);
      setToast({ open: true, message: "Error updating contact", severity: "error" });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      {/* Back Button */}
      <IconButton color="primary" onClick={() => navigate("/admin/dashboard")} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }}>
          Hall Contact Details
        </Typography>
        <Box>
          <Button variant="contained" onClick={handleOpenDialog}>
            Edit Contact
          </Button>
        </Box>
      </Box>

      <Card sx={{ boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6">Phone: {contact.phone}</Typography>
          <Typography variant="h6">Location: {contact.location}</Typography>
          <Typography variant="h6">
            Social Media:{" "}
            {contact.socialMedia?.facebook && (
              <Link href={contact.socialMedia.facebook} target="_blank" sx={{ mr: 2 }}>
                Facebook
              </Link>
            )}
            {contact.socialMedia?.instagram && (
              <Link href={contact.socialMedia.instagram} target="_blank">
                Instagram
              </Link>
            )}
          </Typography>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Hall Contact</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            label="Location"
            fullWidth
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
          <TextField
            label="Facebook URL"
            fullWidth
            value={form.socialMedia?.facebook || ""}
            onChange={(e) =>
              setForm({ ...form, socialMedia: { ...form.socialMedia, facebook: e.target.value } })
            }
          />
          <TextField
            label="Instagram URL"
            fullWidth
            value={form.socialMedia?.instagram || ""}
            onChange={(e) =>
              setForm({ ...form, socialMedia: { ...form.socialMedia, instagram: e.target.value } })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveContact}>
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
