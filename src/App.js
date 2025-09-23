import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import Contacts from "./Components/Contacts";
import Home from "./Components/Home";
import CommonPage from "./pages/CommonPage";

// ✅ Temporary testing pages
import Gallery from "./Components/Gallery";
import Packages from "./Components/Packages";
import Booking from "./Components/Booking";
import AdminLogin from "./Components/AdminLogin";
import AdminDashboard from "./Components/AdminDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";

// 🔹 Import new admin pages here
import PackageManagement from "./Components/PackageManagement";
import ContactManagement from "./Components/ContactManagement";
import AdminGallery from "./Components/AdminGallery";

const muiTheme = createTheme(); // ✅ Customize if needed

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline /> {/* Reset default browser styles */}
      <Router>
        <Routes>
          {/* Default layout with sidebar/navbar */}
          <Route path="/" element={<CommonPage />}>
          <Route path="home" element={<Home />} />
          </Route>
            {/* Redirect / → /home */}
            <Route index element={<Navigate to="home" replace />} />

            {/* Public Routes */}
            
            <Route path="gallery" element={<Gallery />} />
            
            <Route path="contact" element={<Contacts />} />
            <Route path="booking" element={<Booking />} />
          
          <Route path="packages" element={<Packages />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/packages"
            element={
              <ProtectedRoute>
                <PackageManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/contacts"
            element={
              <ProtectedRoute>
                <ContactManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute>
                <AdminGallery />
              </ProtectedRoute>
            }
          />

          {/* Catch-all route → redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
