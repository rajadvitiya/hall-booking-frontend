import React from "react";
import { Outlet, Link } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";

import HomeIcon from "@mui/icons-material/Home";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";

const drawerWidth = 240;

export default function CommonPage() {
  const menuItems = [
    { text: "Home", path: "/home", icon: <HomeIcon /> },
    { text: "Gallery", path: "/gallery", icon: <PhotoLibraryIcon /> },
    { text: "Packages", path: "/packages", icon: <CardGiftcardIcon /> },
    { text: "Contact", path: "/contact", icon: <ContactMailIcon /> },
    // { text: "Booking", path: "/booking", icon: <EventAvailableIcon /> },
    { text: "Admin Login", path: "/admin", icon: <AdminPanelSettingsIcon /> }, // added
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #6a11cb, #2575fc)", // modern gradient
            color: "#fff",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: "bold", mx: "auto" }}>
            Heritage Hall
          </Typography>
        </Toolbar>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                sx={{
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.2)",
                    transform: "scale(1.05)",
                    transition: "all 0.3s ease",
                  },
                }}
              >
                <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontWeight: "500" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
