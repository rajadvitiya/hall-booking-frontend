import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import API from "../Api";

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await API.get("/packages");
        setPackages(data);
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "200px", md: "280px" },
          backgroundImage: `url("https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1350&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.55)",
            borderBottomLeftRadius: "20px",
            borderBottomRightRadius: "20px",
          }}
        />
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <Typography variant="h3" fontWeight="bold">
            Explore Our Wedding Packages
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1 }}>
            Choose the perfect plan for your dream celebration ✨
          </Typography>
        </Box>

        <IconButton
          onClick={() => navigate("/home")}
          sx={{
            position: "absolute",
            top: 20,
            left: 20,
            bgcolor: "white",
            color: "primary.main",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            "&:hover": { bgcolor: "primary.main", color: "white" },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>

      {/* Packages Section */}
      <Box sx={{ p: { xs: 2, md: 6 } }}>
        <Grid container spacing={4}>
          {packages.map((pkg, index) => {
            const stockImages = [
              "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
              "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=900&q=80",
            ];
            const bgImage =
              pkg.images?.[0] || stockImages[index % stockImages.length];
            const isExpanded = expandedIds.includes(pkg._id);

            return (
              <Grid item xs={12} sm={6} md={4} key={pkg._id}>
                <Card
                  sx={{
                    borderRadius: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                    bgcolor: "white", // ensure good contrast
                  }}
                >
                  {/* Image header */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 180,
                      backgroundImage: `url("${bgImage}")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "rgba(0,0,0,0.45)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 12,
                        left: 16,
                        color: "white",
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        {pkg.name}
                      </Typography>
                      <Typography variant="body2">
                        {pkg.pricingType === "fixed"
                          ? `₹${pkg.fixedPrice.toLocaleString()}`
                          : pkg.pricingType === "perPerson"
                          ? "Per Person Pricing"
                          : "Custom Pricing"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      📌 {pkg.category}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    {/* Included List */}
                    {pkg.included?.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <CheckCircleIcon color="success" sx={{ mr: 1 }} />{" "}
                          Includes
                        </Typography>
                        <List dense>
                          {(isExpanded
                            ? pkg.included
                            : pkg.included.slice(0, 3)
                          ).map((item, i) => (
                            <ListItem key={i} sx={{ py: 0 }}>
                              <ListItemText primary={`• ${item}`} />
                            </ListItem>
                          ))}
                          {pkg.included.length > 3 && (
                            <Button
                              size="small"
                              sx={{ textTransform: "none", ml: 1 }}
                              onClick={() => toggleExpand(pkg._id)}
                            >
                              {isExpanded
                                ? "Show Less"
                                : `+${pkg.included.length - 3} more`}
                            </Button>
                          )}
                        </List>
                      </Box>
                    )}

                    {/* Menu Highlights */}
                    {pkg.menu && Object.keys(pkg.menu).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <MenuBookIcon color="primary" sx={{ mr: 1 }} /> Menu
                          Highlights
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {Object.keys(pkg.menu)
                            .slice(0, 3)
                            .map((category) => (
                              <Chip
                                key={category}
                                label={`${category}: ${pkg.menu[
                                  category
                                ].slice(0, 2).join(", ")}...`}
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: "0.75rem" }}
                              />
                            ))}
                        </Box>
                      </Box>
                    )}
                  </CardContent>

                  {/* Action Button */}
                  <CardActions sx={{ justifyContent: "center", pb: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        borderRadius: "30px",
                        px: 4,
                        py: 1.2,
                        fontWeight: "bold",
                      }}
                      onClick={() => navigate("/booking")}
                    >
                      Book Now
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
}
