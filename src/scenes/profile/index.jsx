import React, { useState, useEffect } from "react";
import { 
  Box, Button, TextField, Typography, useTheme, Paper, CircularProgress, Alert, Avatar, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { updateUser, getOrders, uploadUserImage } from "../../services/api";
import BadgeIcon from "@mui/icons-material/Badge";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const UserProfile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || {});
  const userId = user?.id;

  // Form states
  const [fullName, setFullName] = useState(user?.fullname || user?.fullName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  
  // Delivery stats states (For employee/worker role)
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSetThisMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleSetLastMonth = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const handleSetAll = () => {
    setStartDate("");
    setEndDate("");
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const roles = user?.roles || [];
  const isEmployee = roles.includes("empleado") || roles.includes("worker");

  const fetchStats = async () => {
    if (!isEmployee || !userId) return;
    try {
      setLoadingStats(true);
      const res = await getOrders();
      const completed = res.data.filter(o => o.deliveryUser?.id === userId && o.status === "DELIVERED");
      setMyDeliveries(completed);
    } catch (err) {
      console.error("Error loading delivery stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const res = await uploadUserImage(formData);
      setAvatarUrl(res.data.secureUrl);
      setSuccess("Imagen de perfil subida correctamente.");
    } catch (err) {
      setError("Error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        fullName,
        email,
        avatarUrl
      };
      if (password) {
        payload.password = password;
      }

      const res = await updateUser(userId, payload);
      
      // Update local storage user details
      const updatedUser = {
        ...user,
        fullname: res.data.fullName,
        fullName: res.data.fullName,
        email: res.data.email,
        avatarUrl: res.data.avatarUrl
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setPassword("");
      setSuccess("Tu perfil se ha actualizado correctamente.");
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  // Filter deliveries based on selected date range
  const filteredDeliveries = myDeliveries.filter(o => {
    const oDate = new Date(o.createdAt);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (oDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (oDate > end) return false;
    }
    return true;
  });

  // Calculate earnings as 50% of the delivery fees
  const totalDeliveryFee = filteredDeliveries.reduce((sum, o) => sum + (parseFloat(o.deliveryFee) || 0), 0);
  const totalEarnings = totalDeliveryFee * 0.50;

  const handlePrintEmployeePDF = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Entregas - ${fullName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 30px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #EDB422; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #111; font-size: 24px; text-transform: uppercase; }
            .header p { margin: 5px 0 0 0; color: #555; font-size: 14px; }
            .profile-box { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; margin-bottom: 25px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
            .stat-card { background: #fff8e1; border: 1px solid #ffe082; border-radius: 8px; padding: 15px; text-align: center; }
            .stat-card h3 { margin: 0; color: #8d6e63; font-size: 14px; text-transform: uppercase; }
            .stat-card p { margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #EDB422; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            th, td { border: 1px solid #dee2e6; padding: 10px; text-align: left; font-size: 12px; }
            th { background: #f1f3f5; font-weight: bold; color: #495057; }
            .footer-notes { font-size: 11px; color: #6c757d; font-style: italic; border-top: 1px solid #dee2e6; padding-top: 15px; text-align: center; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INGÖ STORE - REPORTE DE ENTREGAS</h1>
            <p>Historial y Registro de Órdenes Completadas por el Repartidor</p>
          </div>
          <div class="profile-box">
            <p><strong>Repartidor:</strong> ${fullName}</p>
            <p><strong>Correo Electrónico:</strong> ${email}</p>
            <p><strong>Rango de Fechas:</strong> ${startDate ? new Date(startDate).toLocaleDateString() : 'Inicio'} al ${endDate ? new Date(endDate).toLocaleDateString() : 'Hoy'}</p>
            <p><strong>Fecha del Reporte:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Entregas Completadas</h3>
              <p>${filteredDeliveries.length}</p>
            </div>
            <div class="stat-card">
              <h3>Ganancia Estimada de Envíos (50%)</h3>
              <p>$${totalEarnings.toFixed(2)}</p>
            </div>
          </div>
          <h3>Detalle de Entregas</h3>
          <table>
            <thead>
              <tr>
                <th>Nº Orden</th>
                <th>Fecha</th>
                <th>Comercio</th>
                <th>Dirección de Destino</th>
                <th>Tipo Envío</th>
                <th>Mi Ganancia (50%)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredDeliveries.map(o => `
                <tr>
                  <td>#${String(o.orderNumber).padStart(4, '0')}</td>
                  <td>${new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${o.business?.name || 'Servicio IGO (Favor/Taxi)'}</td>
                  <td>${o.deliveryAddress}</td>
                  <td>${o.shippingType || 'Moto'}</td>
                  <td>$${((o.deliveryFee || 0) * 0.50).toFixed(2)}</td>
                </tr>
              `).join('')}
              ${filteredDeliveries.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; font-style: italic; color: #6c757d;">No se registran entregas completadas en este período.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          <div class="footer-notes">
            *Este reporte contiene información laboral oficial y confidencial del repartidor en la plataforma Igo.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Box m="20px">
      <Header title="MI PERFIL" subtitle="Edita tus datos personales y visualiza tu historial" />

      <Box display="flex" flexWrap="wrap" gap="20px" mt="20px">
        {/* PROFILE CARD */}
        <Paper elevation={3} sx={{ p: "30px", flex: "1 1 400px", bgcolor: colors.primary[400], border: `1px solid ${colors.grey[700]}` }}>
          <form onSubmit={handleUpdateProfile}>
            <Box display="flex" flexDirection="column" alignItems="center" mb="25px">
              <Box position="relative">
                <Avatar 
                  src={avatarUrl} 
                  sx={{ 
                    width: 110, 
                    height: 110, 
                    mb: "15px", 
                    bgcolor: colors.greenAccent[500],
                    color: "#000000",
                    fontSize: "36px",
                    fontWeight: "bold",
                    textTransform: "uppercase"
                  }}
                >
                  {fullName.charAt(0)}
                </Avatar>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  style={{ display: "none" }} 
                  id="profile-upload" 
                />
                <label htmlFor="profile-upload">
                  <Button 
                    component="span"
                    variant="contained" 
                    color="secondary"
                    disabled={uploading}
                    sx={{ 
                      position: "absolute", 
                      bottom: 10, 
                      right: 0, 
                      borderRadius: "50%", 
                      minWidth: 0, 
                      width: 36, 
                      height: 36, 
                      p: 0,
                      backgroundColor: colors.greenAccent[500],
                      color: "#000",
                      "&:hover": { backgroundColor: colors.greenAccent[600] }
                    }}
                  >
                    {uploading ? <CircularProgress size={18} color="inherit" /> : <PhotoCameraIcon size="small" />}
                  </Button>
                </label>
              </Box>

              <Typography variant="h3" fontWeight="bold">{fullName}</Typography>
              <Typography variant="h5" color={colors.greenAccent[500]} sx={{ mt: 1, textTransform: "capitalize" }}>
                {roles[0] || "Usuario"}
              </Typography>
            </Box>

            {success && <Alert severity="success" sx={{ mb: 2, bgcolor: "#1b2c1b", color: "#88ff88" }}>{success}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2, bgcolor: "#2a1515", color: "#ff8888" }}>{error}</Alert>}

            <Box display="flex" flexDirection="column" gap="20px">
              <TextField
                label="Nombre Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Nueva Contraseña (Opcional)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Escribe para cambiar la actual"
                fullWidth
              />

              <Button 
                type="submit" 
                variant="contained" 
                color="secondary"
                disabled={loading}
                sx={{ 
                  backgroundColor: colors.greenAccent[500], 
                  color: "#000", 
                  fontWeight: "bold",
                  py: 1.5,
                  fontSize: "14px",
                  "&:hover": { backgroundColor: colors.greenAccent[600] }
                }}
              >
                {loading ? "Guardando Cambios..." : "Guardar Cambios"}
              </Button>
            </Box>
          </form>
        </Paper>

        {/* DRIVER STATS CARD (FOR EMPLOYEE/WORKER) */}
        {isEmployee && (
          <Paper elevation={3} sx={{ p: "30px", flex: "2 1 600px", bgcolor: colors.primary[400], border: `1px solid ${colors.grey[700]}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
              <Typography variant="h4" fontWeight="bold" color={colors.grey[100]} display="flex" alignItems="center" gap="10px">
                <BadgeIcon sx={{ color: colors.greenAccent[500] }} />
                Registro de Entregas de Reparto
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdfIcon />}
                onClick={handlePrintEmployeePDF}
                disabled={loadingStats || filteredDeliveries.length === 0}
                sx={{ backgroundColor: colors.greenAccent[500], color: "#000", fontWeight: "bold" }}
              >
                Imprimir Reporte PDF
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Filtros de Fecha */}
            <Box display="flex" flexWrap="wrap" gap="15px" alignItems="center" mb="20px" p="15px" bgcolor="rgba(0,0,0,0.1)" borderRadius="8px">
              <TextField
                label="Desde"
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Hasta"
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="outlined" onClick={handleSetThisMonth} sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "35px" }}>
                Este Mes
              </Button>
              <Button variant="outlined" onClick={handleSetLastMonth} sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "35px" }}>
                Mes Pasado
              </Button>
              <Button variant="outlined" onClick={handleSetAll} sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "35px" }}>
                Todo
              </Button>
            </Box>

            {/* Statistics summary */}
            <Box display="flex" gap="20px" mb="25px">
              <Box 
                flex={1} 
                p="20px" 
                bgcolor="rgba(0,0,0,0.15)" 
                borderRadius="8px" 
                textAlign="center"
                border={`1px solid ${colors.grey[600]}`}
              >
                <LocalShippingIcon sx={{ fontSize: 32, color: colors.greenAccent[500], mb: 1 }} />
                <Typography color={colors.grey[300]} variant="h6">Entregas Completadas</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>{filteredDeliveries.length}</Typography>
              </Box>

              <Box 
                flex={1} 
                p="20px" 
                bgcolor="rgba(0,0,0,0.15)" 
                borderRadius="8px" 
                textAlign="center"
                border={`1px solid ${colors.grey[600]}`}
              >
                <MonetizationOnIcon sx={{ fontSize: 32, color: colors.greenAccent[500], mb: 1 }} />
                <Typography color={colors.grey[300]} variant="h6">Mis Ganancias Estimadas (50%)</Typography>
                <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]} sx={{ mt: 1 }}>
                  ${totalEarnings.toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Typography variant="h5" color={colors.grey[200]} gutterBottom fontWeight="bold">Últimos Envíos Completados</Typography>
            <TableContainer component={Box} sx={{ maxHeight: 250, overflow: "auto", border: `1px solid ${colors.grey[700]}`, borderRadius: "6px" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ backgroundColor: colors.primary[500], color: colors.grey[100] }}>Orden</TableCell>
                    <TableCell style={{ backgroundColor: colors.primary[500], color: colors.grey[100] }}>Fecha</TableCell>
                    <TableCell style={{ backgroundColor: colors.primary[500], color: colors.grey[100] }}>Comercio</TableCell>
                    <TableCell style={{ backgroundColor: colors.primary[500], color: colors.grey[100] }}>Destino</TableCell>
                    <TableCell style={{ backgroundColor: colors.primary[500], color: colors.grey[100] }}>Mi Ganancia (50%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell fontWeight="bold">#{String(delivery.orderNumber).padStart(4, "0")}</TableCell>
                      <TableCell>{new Date(delivery.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{delivery.business?.name || "Servicio IGO (Favor/Taxi)"}</TableCell>
                      <TableCell>{delivery.deliveryAddress}</TableCell>
                      <TableCell color={colors.greenAccent[500]}>${((delivery.deliveryFee || 0) * 0.50).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  {filteredDeliveries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" style={{ fontStyle: "italic", padding: "20px" }}>
                        No hay entregas completadas en este período.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;
