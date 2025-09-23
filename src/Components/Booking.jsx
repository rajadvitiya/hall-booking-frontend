import React, { useState, useEffect, useMemo } from "react";
import API from "../Api";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, PickersDay } from "@mui/x-date-pickers";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import "dayjs/locale/en";
import PageWrapper from "./PageWrapper";

// default locale
dayjs.locale("en");

export default function Booking() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    package: "", // changed from eventType
    guests: "",
    date: dayjs(),
    time: dayjs(),
    specialRequests: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
    package: "",
    guests: "",
    date: "",
    time: "",
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [bookedDates, setBookedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [packages, setPackages] = useState([]); // store packages

  const normalizeDate = (d) => {
    if (!d) return null;
    return dayjs(d).format("YYYY-MM-DD");
  };

  const bookedSet = useMemo(() => new Set(bookedDates.map((d) => normalizeDate(d))), [bookedDates]);

  // fetch booked dates
  useEffect(() => {
    const fetchBookedDates = async () => {
      try {
        const res = await API.get("/bookings");
        const data = res.data || {};
        const booked = (data.bookedDates || []).map((d) => normalizeDate(d)).filter(Boolean);
        setBookedDates(booked);
      } catch (err) {
        console.warn("Failed to fetch booked dates.", err);
        setBookedDates([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookedDates();
  }, []);

  // fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await API.get("/packages"); // backend should return [{_id, name, price}, ...]
        setPackages(res.data || []);
      } catch (err) {
        console.error("Failed to fetch packages", err);
      }
    };
    fetchPackages();
  }, []);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");
  const isValidPhone = (v) => /^\d{10}$/.test(v || "");
  const isValidGuests = (v) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1;
  };

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value?.trim() ? "" : "Name is required";
      case "email":
        return isValidEmail(value) ? "" : "Enter a valid email";
      case "phone":
        return isValidPhone(value) ? "" : "Phone must be 10 digits";
      case "package":
        return value ? "" : "Select a package";
      case "guests":
        return isValidGuests(value) ? "" : "Enter number of guests (min 1)";
      case "date":
        return value ? "" : "Select a date";
      case "time":
        return value ? "" : "Select a time";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const fields = ["name", "email", "phone", "package", "guests", "date", "time"];
    const newErrors = {};
    let ok = true;
    fields.forEach((f) => {
      const val = formData[f];
      const err = validateField(f, val);
      newErrors[f] = err;
      if (err) ok = false;
    });
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return ok;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digits }));
      setErrors((prev) => ({ ...prev, phone: validateField("phone", digits) }));
      return;
    }

    if (name === "guests") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, guests: digits }));
      setErrors((prev) => ({ ...prev, guests: validateField("guests", digits) }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const disableBookedDates = (date) => {
    if (!date) return false;
    return bookedSet.has(normalizeDate(date));
  };

  const renderDay = (day, _value, DayComponentProps = {}) => {
    const formatted = normalizeDate(day);
    const isBooked = bookedSet.has(formatted);

    return (
      <PickersDay
        {...DayComponentProps}
        day={day}
        disabled={DayComponentProps?.disabled || isBooked}
        sx={isBooked ? { bgcolor: "red", color: "white", "&:hover": { bgcolor: "darkred" } } : {}}
      />
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSnackbar((s) => ({ ...s, open: false }));

    if (!validateForm()) {
      setSnackbar({ open: true, message: "Please fix the highlighted errors", severity: "error" });
      return;
    }

    const normalized = normalizeDate(formData.date);
    if (bookedSet.has(normalized)) {
      setSnackbar({
        open: true,
        message: "⚠️ Selected date is already booked. Please choose another date.",
        severity: "error",
      });
      setErrors((prev) => ({ ...prev, date: "Selected date already booked" }));
      return;
    }

    setPreviewOpen(true);
  };

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        date: normalizeDate(formData.date),
        time: formData.time.format("HH:mm"),
      };

      // refresh booked dates before final submit
      try {
        const refreshRes = await API.get("/bookings");
        const currentBooked = (refreshRes.data?.bookedDates || []).map((d) => normalizeDate(d)).filter(Boolean);
        setBookedDates(currentBooked);

        if (currentBooked.includes(payload.date)) {
          setErrors((prev) => ({ ...prev, date: "Selected date already booked" }));
          setSnackbar({
            open: true,
            message: "⚠️ Selected date is already booked. Please choose another date.",
            severity: "error",
          });
          setSubmitting(false);
          return;
        }
      } catch (refreshErr) {
        console.warn("Could not refresh booked dates before submit.", refreshErr);
      }

      const res = await API.post("/bookings", payload);

      setPreviewOpen(false);
      setSnackbar({ open: true, message: "✅ Booking submitted!", severity: "success" });

      setFormData({
        name: "",
        email: "",
        phone: "",
        package: "",
        guests: "",
        date: dayjs(),
        time: dayjs(),
        specialRequests: "",
      });
      setErrors({
        name: "",
        email: "",
        phone: "",
        package: "",
        guests: "",
        date: "",
        time: "",
      });

      const updatedData = res.data || {};
      const booked = (updatedData.bookedDates || []).map((d) => normalizeDate(d)).filter(Boolean);
      if (booked.length) setBookedDates(booked);
      else setBookedDates((prev) => Array.from(new Set([...prev, payload.date])));
    } catch (err) {
      if (err?.response?.status === 409) {
        setErrors((prev) => ({ ...prev, date: "Selected date already booked" }));
        setSnackbar({
          open: true,
          message: "⚠️ Booking conflict: selected date was just taken. Please choose another date.",
          severity: "error",
        });
      } else {
        console.error(err);
        setSnackbar({ open: true, message: "⚠️ Failed to submit booking!", severity: "error" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const selectedIsBooked = useMemo(() => {
    const normalized = normalizeDate(formData.date);
    return normalized ? bookedSet.has(normalized) : false;
  }, [formData.date, bookedSet]);

  if (loading)
    return (
      <PageWrapper>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
        <Box sx={{ maxWidth: 500, width: "100%", padding: 3, background: "#fff", borderRadius: 3, boxShadow: 5 }}>
          

          <form onSubmit={handleSubmit} noValidate>
            <TextField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              error={!!errors.name}
              helperText={errors.name}
            />

            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              fullWidth
              margin="normal"
              required
              error={!!errors.email}
              helperText={errors.email}
            />

            <TextField
              label="Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              type="tel"
              fullWidth
              margin="normal"
              required
              inputProps={{ inputMode: "numeric", maxLength: 10 }}
              error={!!errors.phone}
              helperText={errors.phone || "Enter 10-digit mobile number"}
            />

            <TextField
              select
              label="Select Package"
              name="package"
              value={formData.package}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              error={!!errors.package}
              helperText={errors.package}
            >
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <MenuItem key={pkg._id} value={pkg.name}>
                    {pkg.name} {pkg.price ? `- ₹${pkg.price}` : ""}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>No packages available</MenuItem>
              )}
            </TextField>

            <TextField
              label="Number of Guests"
              name="guests"
              value={formData.guests}
              onChange={handleChange}
              type="number"
              fullWidth
              margin="normal"
              required
              inputProps={{ min: 1 }}
              error={!!errors.guests}
              helperText={errors.guests}
            />

            <DatePicker
              label="Select Date"
              value={formData.date}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, date: dayjs(newValue) }));
                setErrors((prev) => ({ ...prev, date: validateField("date", newValue) }));
              }}
              shouldDisableDate={disableBookedDates}
              renderDay={renderDay}
              slotProps={{
                textField: { fullWidth: true, margin: "normal", error: !!errors.date, helperText: errors.date },
              }}
            />

            <TimePicker
              label="Select Time"
              value={formData.time}
              onChange={(newValue) => {
                setFormData((prev) => ({ ...prev, time: dayjs(newValue) }));
                setErrors((prev) => ({ ...prev, time: validateField("time", newValue) }));
              }}
              slotProps={{
                textField: { fullWidth: true, margin: "normal", error: !!errors.time, helperText: errors.time },
              }}
            />

            <TextField
              label="Special Requests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              multiline
              rows={3}
              fullWidth
              margin="normal"
            />

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Check Availability
            </Button>
          </form>

          <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)}>
            <DialogTitle>Preview Booking</DialogTitle>
            <DialogContent>
              <List>
                <ListItem>
                  <ListItemText primary="Name" secondary={formData.name} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Email" secondary={formData.email} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Phone" secondary={formData.phone} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Package" secondary={formData.package} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Guests" secondary={formData.guests} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Date" secondary={formData.date.format("DD MMM YYYY")} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Time" secondary={formData.time.format("hh:mm A")} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Special Requests"
                    secondary={formData.specialRequests || "None"}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewOpen(false)} color="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleConfirmBooking}
                variant="contained"
                color="primary"
                disabled={submitting || selectedIsBooked}
              >
                {submitting ? "Submitting..." : selectedIsBooked ? "Date Unavailable" : "Confirm Booking"}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </PageWrapper>
  );
}
