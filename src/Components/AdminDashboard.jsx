import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Pagination,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import API from "../Api";
import { io } from "socket.io-client";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PackageIcon from "@mui/icons-material/Category";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import MenuIcon from "@mui/icons-material/Menu";

// 🔹 Highlight search matches
function HighlightedText({ text, highlight }) {
  if (!highlight) return <>{text}</>;
  const regex = new RegExp(`(${highlight})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark
            key={i}
            style={{
              backgroundColor: "yellow",
              fontWeight: "bold",
              padding: "0 2px",
            }}
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function AdminDashboard() {
  const MAX_AMOUNT = 1000000; // Razorpay max amount limit in ₹

  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // 🔔 Toast notification state
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });

  // 💰 Amount dialog state
  const [openAmountDialog, setOpenAmountDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [amount, setAmount] = useState("");

  // 👤 Update Admin dialog state
  const [openAdminDialog, setOpenAdminDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // 📡 Responsive navbar state
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNavigation = (path) => {
    window.location.href = path;
    handleMenuClose();
  };

  // 📡 Socket.IO setup
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("paymentUpdate", ({ bookingId, isPaid, name }) => {
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, isPaid: isPaid } : b))
      );

      if (isPaid) {
        setToast({
          open: true,
          message: `💰 Payment received for ${name || "a booking"}`,
          severity: "success",
        });
      }
    });

    socket.on("bookingDeleted", (bookingId) => {
      setBookings((prev) => prev.filter((b) => b._id !== bookingId));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/bookings", {
        params: { page, limit: 6, search: searchTerm },
      });

      let allBookings = Array.isArray(res.data) ? res.data : res.data.bookings || [];
      setTotalPages(Array.isArray(res.data) ? 1 : res.data.totalPages || 1);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      allBookings = allBookings.filter((b) => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= today;
      });

      setBookings(allBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, searchTerm]);

  const sortedBookings = [...bookings].sort((a, b) => {
    const aMatch = a.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
    const bMatch = b.name?.toLowerCase().startsWith(searchTerm.toLowerCase());
    return bMatch - aMatch;
  });

  const handleOpenAmountDialog = (id) => {
    setSelectedBookingId(id);
    setAmount("");
    setOpenAmountDialog(true);
  };

  const handleConfirmApprove = async () => {
    const amt = Number(amount);

    if (!amount || isNaN(amt) || amt <= 0) {
      setToast({ open: true, message: "Please enter a valid amount.", severity: "error" });
      return;
    }
    if (amt > MAX_AMOUNT) {
      setToast({
        open: true,
        message: `⚠️ Amount cannot exceed ₹${MAX_AMOUNT.toLocaleString()}.`,
        severity: "error",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      setToast({ open: true, message: "Processing approval, please wait...", severity: "info" });

      await API.post(
        `/admin/bookings/${selectedBookingId}/approve`,
        { amount: amt },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setOpenAmountDialog(false);
      fetchBookings();
      setToast({
        open: true,
        message: `Booking approved with amount ₹${amt.toLocaleString()}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error approving booking:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.description?.includes("maximum amount")
          ? "⚠️ Amount exceeds Razorpay limit. Please enter a smaller amount."
          : error.response?.data?.message || "Error approving booking";

      setToast({ open: true, message: errorMessage, severity: "error" });
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await API.post(
        `/admin/bookings/${id}/reject`,
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) => prev.filter((b) => b._id !== id && b.id !== id));
      setToast({ open: true, message: "Booking rejected and deleted ✅", severity: "success" });
    } catch (error) {
      console.error("Error rejecting booking:", error);
      setToast({ open: true, message: error.response?.data?.message || "Error rejecting booking", severity: "error" });
    }
  };

  // ✅ Handle Admin Update
  const handleUpdateAdmin = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/admin/update`,
        { email: newEmail, password: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToast({ open: true, message: "Admin credentials updated ✅", severity: "success" });
      setOpenAdminDialog(false);
      setNewEmail("");
      setNewPassword("");
    } catch (error) {
      console.error("Error updating admin:", error.response?.data || error.message);
      setToast({ open: true, message: "Error updating admin credentials", severity: "error" });
    }
  };

  return (
    <Box>
      {/* 🔝 Responsive Top Navbar */}
      <AppBar position="sticky" sx={{ backgroundColor: "#1976d2", mb: 4 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Admin Dashboard
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleMenuOpen}
              >
                <MenuIcon />
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => handleNavigation("/admin/packages")}>
                  <PackageIcon sx={{ mr: 1 }} /> Manage Packages
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/admin/contacts")}>
                  <ManageAccountsIcon sx={{ mr: 1 }} /> Manage Contacts
                </MenuItem>
                <MenuItem onClick={() => handleNavigation("/admin/gallery")}>
                  <PhotoLibraryIcon sx={{ mr: 1 }} /> Manage Gallery
                </MenuItem>
                <MenuItem onClick={() => setOpenAdminDialog(true)}>
                  <AdminPanelSettingsIcon sx={{ mr: 1 }} /> Update Admin
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    localStorage.removeItem("token");
                    window.location.href = "/home";
                  }}
                >
                  <LogoutIcon sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                startIcon={<PackageIcon />}
                onClick={() => (window.location.href = "/admin/packages")}
              >
                Manage Packages
              </Button>

              <Button
                color="inherit"
                startIcon={<ManageAccountsIcon />}
                sx={{ ml: 2 }}
                onClick={() => (window.location.href = "/admin/contacts")}
              >
                Manage Contacts
              </Button>

              <Button
                color="inherit"
                startIcon={<PhotoLibraryIcon />}
                sx={{ ml: 2 }}
                onClick={() => (window.location.href = "/admin/gallery")}
              >
                Manage Gallery
              </Button>

              <Button
                color="inherit"
                startIcon={<AdminPanelSettingsIcon />}
                sx={{ ml: 2 }}
                onClick={() => setOpenAdminDialog(true)}
              >
                Update Admin
              </Button>

              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                sx={{ ml: 2 }}
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/home";
                }}
              >
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* 🔹 Hero Section */}
      <Box
        sx={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          Bookings
        </Typography>
      </Box>

      {/* 🔹 Main Content */}
      <Box sx={{ p: 4 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Search by Name"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {sortedBookings.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{ ml: 2, mt: 2, color: "gray", fontStyle: "italic" }}
                >
                  ❌ No bookings found.
                </Typography>
              ) : (
                sortedBookings.map((b) => {
                  const dateObj = new Date(b.date);
                  const formattedDate = dateObj.toLocaleDateString();
                  const formattedTime = dateObj.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <Grid item xs={12} md={6} lg={4} key={b._id || b.id}>
                      <Card
                        sx={{
                          boxShadow: 4,
                          borderRadius: 3,
                          transition: "0.3s",
                          "&:hover": { transform: "scale(1.02)" },
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            <HighlightedText text={b.name} highlight={searchTerm} /> ({b.package})
                          </Typography>
                          <Typography>Email: {b.email}</Typography>
                          <Typography>Phone: {b.phone}</Typography>
                          <Typography>Guests: {b.guests}</Typography>
                          <Typography>Date: {formattedDate}</Typography>
                          <Typography>Time: {formattedTime}</Typography>

                          <Box sx={{ mt: 2 }}>
                            <Chip
                              label={b.status || "pending"}
                              color={
                                b.status === "approved"
                                  ? "success"
                                  : b.status === "rejected"
                                  ? "error"
                                  : "warning"
                              }
                              sx={{ mr: 1 }}
                            />
                            <Chip
                              label={b.isPaid ? "Paid ✅" : "Not Paid"}
                              color={b.isPaid ? "success" : "error"}
                            />
                          </Box>

                          <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                            {!b.status || b.status !== "approved" ? (
                              <Button
                                onClick={() => handleOpenAmountDialog(b._id || b.id)}
                                variant="contained"
                                color="success"
                                fullWidth
                              >
                                Approve
                              </Button>
                            ) : null}

                            {!b.isPaid ? (
                              <Button
                                onClick={() => handleReject(b._id || b.id)}
                                variant="contained"
                                color="error"
                                fullWidth
                              >
                                Reject
                              </Button>
                            ) : null}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Toast Snackbar */}
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

        {/* Amount Dialog */}
        <Dialog open={openAmountDialog} onClose={() => setOpenAmountDialog(false)}>
          <DialogTitle>Enter Amount for Booking</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Amount (₹)"
              type="number"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              helperText={`Maximum allowed amount is ₹${MAX_AMOUNT.toLocaleString()}`}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAmountDialog(false)}>Cancel</Button>
            <Button onClick={handleConfirmApprove} variant="contained" color="success">
              Approve & Send Payment Link
            </Button>
          </DialogActions>
        </Dialog>

        {/* Update Admin Dialog */}
        <Dialog open={openAdminDialog} onClose={() => setOpenAdminDialog(false)}>
          <DialogTitle>Update Admin Credentials</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="New Email"
              type="email"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <TextField
              margin="dense"
              label="New Password"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdminDialog(false)}>Cancel</Button>
            <Button onClick={handleUpdateAdmin} variant="contained" color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
