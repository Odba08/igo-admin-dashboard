import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import { CssBaseline, ThemeProvider, Box, Typography, Button } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar/calendar";
import Login from "./scenes/login";
import BusinessManage from "./scenes/business";
import BusinessProducts from "./scenes/business-products";
import UserProfile from "./scenes/profile";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  // If not authenticated, render Login view
  if (!token || !user) {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Login onLoginSuccess={handleLoginSuccess} />
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }

  // Role permissions checks
  const roles = user.roles || [];
  const isAdmin = roles.includes("admin");
  const isBusiness = roles.includes("bussiness") || roles.includes("business");
  const isEmployee = roles.includes("empleado") || roles.includes("worker");

  // Access denied screen for client / others
  if (!isAdmin && !isBusiness && !isEmployee) {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="100vh"
            sx={{
              backgroundColor: "#000000",
              color: "#ffffff",
              gap: "20px",
              p: "20px",
              textAlign: "center"
            }}
          >
            <Typography variant="h2" color="#fcd116" fontWeight="bold">
              Acceso Restringido
            </Typography>
            <Typography variant="h5">
              Tu cuenta ({user.email}) no tiene permisos para acceder a esta plataforma.
            </Typography>
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                backgroundColor: "#fcd116",
                color: "#000",
                fontWeight: "bold",
                px: "40px",
                py: "10px",
                "&:hover": { backgroundColor: "#caaa12" }
              }}
            >
              Cerrar Sesión
            </Button>
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar isSidebar={isSidebar} user={user} />
          <main className="content">
            <Topbar setIsSidebar={setIsSidebar} onLogout={handleLogout} />
            <Routes>
              {isAdmin && (
                <>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/geography" element={<Geography />} />
                  {/* Admin can also manage businesses if needed */}
                  <Route path="/my-business" element={<BusinessManage />} />
                  <Route path="/my-products" element={<BusinessProducts />} />
                  <Route path="/my-profile" element={<UserProfile />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </>
              )}
              {isBusiness && (
                <>
                  <Route path="/" element={<Navigate to="/my-business" />} />
                  <Route path="/my-business" element={<BusinessManage />} />
                  <Route path="/my-products" element={<BusinessProducts />} />
                  <Route path="/my-profile" element={<UserProfile />} />
                  <Route path="*" element={<Navigate to="/my-business" />} />
                </>
              )}
              {isEmployee && (
                <>
                  <Route path="/" element={<Navigate to="/my-profile" />} />
                  <Route path="/my-profile" element={<UserProfile />} />
                  <Route path="*" element={<Navigate to="/my-profile" />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
