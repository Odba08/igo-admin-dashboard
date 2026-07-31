import React, { useState } from "react";
import { Box, Button, TextField, Typography, useTheme, Paper, Alert, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from "@mui/icons-material";
import { tokens } from "../../theme";
import { loginAdmin } from "../../services/api";

const Login = ({ onLoginSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginAdmin(email, password);
      const { token, user } = response.data;
      
      // Save credentials in local storage
      localStorage.setItem("adminToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      if (onLoginSuccess) {
        onLoginSuccess(token, user);
      }
    } catch (err) {
      console.error("Login failed:", err);
      const errMsg = err.response?.data?.message || "Credenciales inválidas o error de conexión";
      setError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        backgroundColor: colors.primary[500],
        backgroundImage: "radial-gradient(circle, #222015 0%, #000000 100%)",
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: "40px",
          width: "400px",
          backgroundColor: "#111111",
          borderRadius: "12px",
          border: `1px solid ${colors.greenAccent[600]}`,
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb="30px">
          <Box
            sx={{
              backgroundColor: colors.greenAccent[500],
              borderRadius: "50%",
              p: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: "15px",
            }}
          >
            <LockOutlined sx={{ color: "#000000", fontSize: "28px" }} />
          </Box>
          <Typography variant="h3" color={colors.grey[100]} fontWeight="bold" align="center">
            INGÖ STORE
          </Typography>
          <Typography variant="h6" color={colors.greenAccent[500]} sx={{ mt: "5px" }}>
            Panel de Administración
          </Typography>
        </Box>

        <form onSubmit={handleLogin}>
          <Box display="flex" flexDirection="column" gap="20px">
            {error && (
              <Alert severity="error" sx={{ backgroundColor: "#2a1515", color: "#ff8888", border: "1px solid #5a2525" }}>
                {error}
              </Alert>
            )}

            <TextField
              label="Correo Electrónico"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined sx={{ color: colors.grey[400] }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: colors.grey[700] },
                  "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                  "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
                },
                "& .MuiInputLabel-root": { color: colors.grey[400] },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.greenAccent[500] },
              }}
            />

            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: colors.grey[400] }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: colors.grey[400] }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: colors.grey[700] },
                  "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                  "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
                },
                "& .MuiInputLabel-root": { color: colors.grey[400] },
                "& .MuiInputLabel-root.Mui-focused": { color: colors.greenAccent[500] },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: "#000000",
                fontWeight: "bold",
                py: "12px",
                fontSize: "15px",
                textTransform: "none",
                borderRadius: "6px",
                "&:hover": {
                  backgroundColor: colors.greenAccent[600],
                },
                "&.Mui-disabled": {
                  backgroundColor: colors.greenAccent[800],
                  color: "#555555",
                },
              }}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
