import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { ArrowBack, Delete, Add } from "@mui/icons-material";
import API from "../Api";
import { useNavigate } from "react-router-dom";

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [openPackageDialog, setOpenPackageDialog] = useState(false);
  const [openArrayDialog, setOpenArrayDialog] = useState(false);
  const [arrayField, setArrayField] = useState("");
  const [arrayTitle, setArrayTitle] = useState("");
  const [menuField, setMenuField] = useState("");
  const [editPackage, setEditPackage] = useState(null);
  const [toast, setToast] = useState({ open: false, message: "", severity: "info" });
  const [arrayData, setArrayData] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const navigate = useNavigate();

  // Fetch all packages
  const fetchPackages = async () => {
    try {
      const res = await API.get("/packages");
      setPackages(res.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Open Package dialog (for creating or editing full package)
  const handleOpenPackageDialog = (pkg = null) => {
    setEditPackage(
      pkg || {
        name: "",
        description: "",
        category: "",
        pricingType: "fixed", // ✅ default lowercase
        fixedPrice: "",
        perPersonPricing: [],
        customPricingNote: "",
        included: [],
        excluded: [],
        terms: [],
        menu: { welcomeSweets: [], starters: [], mainCourse: [] },
      }
    );
    setOpenPackageDialog(true);
  };

  const handleClosePackageDialog = () => setOpenPackageDialog(false);

  // Save or Update package
  const handleSavePackage = async () => {
    try {
      if (editPackage._id) {
        await API.put(`/admin/packages/${editPackage._id}`, editPackage);
        setToast({ open: true, message: "Package updated ✅", severity: "success" });
      } else {
        await API.post("/admin/packages", editPackage);
        setToast({ open: true, message: "Package added ✅", severity: "success" });
      }
      setOpenPackageDialog(false);
      fetchPackages();
    } catch (error) {
      console.error("Error saving package:", error);
      setToast({ open: true, message: "Error saving package ❌", severity: "error" });
    }
  };

  const handleDeletePackage = async (id) => {
    try {
      await API.delete(`/admin/packages/${id}`);
      setToast({ open: true, message: "Package deleted 🗑️", severity: "success" });
      fetchPackages();
    } catch (error) {
      console.error("Error deleting package:", error);
      setToast({ open: true, message: "Error deleting package ❌", severity: "error" });
    }
  };

  // --- Array/Menu Field Modal Handlers ---
  const handleOpenArrayDialog = (pkg, field, menuSubField = "") => {
    const safePackage = {
      ...pkg,
      included: pkg.included || [],
      excluded: pkg.excluded || [],
      terms: pkg.terms || [],
      menu: {
        welcomeSweets: pkg.menu?.welcomeSweets || [],
        starters: pkg.menu?.starters || [],
        mainCourse: pkg.menu?.mainCourse || [],
      },
    };
    setEditPackage(safePackage);

    if (field === "menu") {
      setArrayTitle(`Menu: ${menuSubField}`);
      setArrayData([...safePackage.menu[menuSubField]]);
      setMenuField(menuSubField);
    } else {
      setArrayTitle(field === "included" ? "Includes" : field === "excluded" ? "Excludes" : "Terms");
      setArrayData([...safePackage[field]]);
      setMenuField("");
    }

    setArrayField(field);
    setEditMode(false); // default is view-only
    setOpenArrayDialog(true);
  };

  const handleArrayChange = (index, value) => {
    const newData = [...arrayData];
    newData[index] = value;
    setArrayData(newData);
  };

  const handleAddArrayItem = () => setArrayData([...arrayData, ""]);

  const handleDeleteArrayItem = (index) => {
    const newData = [...arrayData];
    newData.splice(index, 1);
    setArrayData(newData);
  };

  const handleSaveArrayDialog = async () => {
    try {
      let updatePayload = {};
      if (arrayField === "menu") {
        updatePayload = { menu: { [menuField]: arrayData } };
      } else {
        updatePayload = { [arrayField]: arrayData };
      }

      await API.put(`/admin/packages/${editPackage._id}`, updatePayload);
      setToast({ open: true, message: `${arrayTitle} updated ✅`, severity: "success" });
      setOpenArrayDialog(false);
      fetchPackages();
    } catch (error) {
      console.error("Error saving array field:", error);
      setToast({ open: true, message: `Error updating ${arrayTitle} ❌`, severity: "error" });
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Back + Add Button */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <IconButton color="primary" onClick={() => navigate("/admin/dashboard")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold", ml: 1 }}>
          Package Management
        </Typography>
        <Button variant="contained" sx={{ ml: "auto" }} onClick={() => handleOpenPackageDialog()}>
          ➕ Add Package
        </Button>
      </Box>

      {/* Package Cards */}
      <Grid container spacing={3}>
        {packages.map((pkg) => (
          <Grid item xs={12} md={6} lg={4} key={pkg._id}>
            <Card sx={{ boxShadow: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">{pkg.name}</Typography>
                <Typography sx={{ color: "gray" }}>{pkg.description}</Typography>
                <Typography sx={{ mt: 1 }}>📂 {pkg.category}</Typography>

                {/* ✅ lowercase pricingType display */}
                <Typography sx={{ mt: 1 }}>
                  💡 {pkg.pricingType === "fixed"
                    ? "Fixed"
                    : pkg.pricingType === "perPerson"
                    ? "Per Person"
                    : "Custom"}
                </Typography>

                {pkg.pricingType === "fixed" && (
                  <Typography sx={{ mt: 1, fontWeight: "bold" }}>💰 ₹{pkg.fixedPrice}</Typography>
                )}
                {pkg.pricingType === "perPerson" &&
                  pkg.perPersonPricing?.map((tier, i) => (
                    <Typography key={i} sx={{ mt: 1 }}>
                      👥 {tier.peopleCount} → ₹{tier.price}
                    </Typography>
                  ))}
                {pkg.pricingType === "custom" && (
                  <Typography sx={{ mt: 1, fontStyle: "italic" }}>📝 {pkg.customPricingNote}</Typography>
                )}

                {/* Array/Menu Buttons */}
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Button variant="outlined" color="success" onClick={() => handleOpenArrayDialog(pkg, "included")}>
                    ✅ Includes
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleOpenArrayDialog(pkg, "excluded")}>
                    ❌ Excludes
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => handleOpenArrayDialog(pkg, "terms")}>
                    📜 Terms
                  </Button>
                  <Button variant="outlined" color="primary" onClick={() => handleOpenArrayDialog(pkg, "menu", "welcomeSweets")}>
                    🍬 Welcome Sweets
                  </Button>
                  <Button variant="outlined" color="primary" onClick={() => handleOpenArrayDialog(pkg, "menu", "starters")}>
                    🥗 Starters
                  </Button>
                  <Button variant="outlined" color="primary" onClick={() => handleOpenArrayDialog(pkg, "menu", "mainCourse")}>
                    🍛 Main Course
                  </Button>
                </Box>

                {/* Edit/Delete */}
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button variant="outlined" onClick={() => handleOpenPackageDialog(pkg)} color="primary">
                    Edit Package
                  </Button>
                  <Button variant="outlined" color="error" onClick={() => handleDeletePackage(pkg._id)}>
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Package Dialog (Add/Edit) */}
      <Dialog open={openPackageDialog} onClose={handleClosePackageDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editPackage?._id ? "Edit Package" : "Add Package"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={editPackage?.name || ""}
            onChange={(e) => setEditPackage({ ...editPackage, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={editPackage?.description || ""}
            onChange={(e) => setEditPackage({ ...editPackage, description: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={editPackage?.category || ""}
            onChange={(e) => setEditPackage({ ...editPackage, category: e.target.value })}
          />
          <TextField
            margin="dense"
            select
            label="Pricing Type"
            fullWidth
            value={editPackage?.pricingType || "fixed"}
            onChange={(e) => setEditPackage({ ...editPackage, pricingType: e.target.value })}
          >
            <MenuItem value="fixed">Fixed</MenuItem>
            <MenuItem value="perPerson">Per Person</MenuItem>
            <MenuItem value="custom">Custom</MenuItem>
          </TextField>
          {editPackage?.pricingType === "fixed" && (
            <TextField
              margin="dense"
              label="Fixed Price"
              type="number"
              fullWidth
              value={editPackage.fixedPrice || ""}
              onChange={(e) => setEditPackage({ ...editPackage, fixedPrice: e.target.value })}
            />
          )}
          {editPackage?.pricingType === "custom" && (
            <TextField
              margin="dense"
              label="Custom Pricing Note"
              fullWidth
              value={editPackage.customPricingNote || ""}
              onChange={(e) => setEditPackage({ ...editPackage, customPricingNote: e.target.value })}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePackageDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePackage}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Array/Menu Table Dialog */}
      <Dialog open={openArrayDialog} onClose={() => setOpenArrayDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{arrayTitle}</DialogTitle>
        <DialogContent>
          {!editMode ? (
            <List>
              {arrayData.length === 0 && <Typography sx={{ mt: 1, color: "gray" }}>No items available</Typography>}
              {arrayData.map((item, i) => (
                <ListItem key={i}>
                  <ListItemText primary={item} />
                </ListItem>
              ))}
            </List>
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{arrayTitle} Item</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {arrayData.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField fullWidth value={item} onChange={(e) => handleArrayChange(i, e.target.value)} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton color="error" onClick={() => handleDeleteArrayItem(i)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button sx={{ mt: 1 }} variant="outlined" startIcon={<Add />} onClick={handleAddArrayItem}>
                Add Item
              </Button>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {!editMode ? (
            <>
              <Button onClick={() => setOpenArrayDialog(false)}>Close</Button>
              <Button variant="contained" onClick={() => setEditMode(true)}>
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSaveArrayDialog}>
                Save
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
