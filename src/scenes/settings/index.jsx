import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Paper,
  Grid,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getAllSettings, updateBulkSettings } from "../../services/api";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PercentIcon from "@mui/icons-material/Percent";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Settings() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  const [settings, setSettings] = useState({
    BCV_RATE: "75.54",
    IGO_PAGO_MOVIL_BANK: "0102 - Banco de Venezuela",
    IGO_PAGO_MOVIL_PHONE: "0412-1234567",
    IGO_PAGO_MOVIL_ID: "V-12345678",
    IGO_PAGO_MOVIL_NAME: "IGO Delivery C.A.",
    COMMISSION_IGO_DELIVERY: "20",
    COMMISSION_IGO_TAXI: "15",
    COMMISSION_DRIVER: "80",
    TAXI_MAX_BALANCE_LIMIT: "50.00",
    FEE_BASE_DELIVERY: "3.00",
    FEE_KM_DELIVERY: "1.00",
    FEE_BASE_FAVOR: "3.00",
    FEE_KM_FAVOR: "1.00",
    FEE_BASE_TAXI: "5.00",
    FEE_KM_TAXI: "1.50",
    NIGHT_SHIFT_START: "22:00",
    NIGHT_SHIFT_END: "06:00",
    NIGHT_SHIFT_SURCHARGE: "1.5",
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getAllSettings();
      if (res.data) {
        setSettings((prev) => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      console.error("Error cargando configuraciones:", err);
      setNotification({
        open: true,
        message: "Error al cargar las configuraciones del servidor",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await updateBulkSettings(settings);
      setNotification({
        open: true,
        message: "¡Configuraciones y tarifas guardadas correctamente!",
        severity: "success",
      });
    } catch (err) {
      console.error("Error guardando configuraciones:", err);
      setNotification({
        open: true,
        message: "Error al guardar: " + (err.response?.data?.message || err.message),
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress sx={{ color: colors.greenAccent[500] }} />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="10px">
        <Header
          title="CONFIGURACIONES Y TARIFAS"
          subtitle="Ajusta los datos bancarios de IGO, comisiones, precios por km, horarios y límites"
        />
        <Box display="flex" gap="10px">
          <Button
            variant="outlined"
            onClick={fetchSettings}
            startIcon={<RefreshIcon />}
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": { borderColor: colors.grey[200] },
            }}
          >
            Recargar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: colors.greenAccent[500],
              color: "#000",
              fontWeight: "bold",
              px: "25px",
              "&:hover": { bgcolor: colors.greenAccent[600] },
            }}
          >
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </Box>
      </Box>

      <form onSubmit={handleSave}>
        <Grid container spacing={3} mt="10px">
          {/* 1. PAGO MÓVIL OFICIAL IGO (PARA IGO FAVOR Y TAXI) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: "25px",
                bgcolor: colors.primary[400],
                borderRadius: "10px",
                border: `1px solid ${colors.grey[700]}`,
                height: "100%",
              }}
            >
              <Box display="flex" alignItems="center" gap="10px" mb="15px">
                <AccountBalanceIcon sx={{ color: colors.greenAccent[400], fontSize: "28px" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Pago Móvil Oficial IGO
                  </Typography>
                  <Typography variant="caption" color={colors.grey[300]}>
                    Datos bancarios mostrados al cliente en IGO Favor y Taxi
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: "20px", borderColor: colors.grey[700] }} />

              <Box display="flex" flexDirection="column" gap="15px">
                <TextField
                  fullWidth
                  label="Banco"
                  variant="filled"
                  value={settings.IGO_PAGO_MOVIL_BANK || ""}
                  onChange={(e) => handleChange("IGO_PAGO_MOVIL_BANK", e.target.value)}
                  placeholder="Ej: 0102 - Banco de Venezuela"
                />
                <TextField
                  fullWidth
                  label="Teléfono Pago Móvil"
                  variant="filled"
                  value={settings.IGO_PAGO_MOVIL_PHONE || ""}
                  onChange={(e) => handleChange("IGO_PAGO_MOVIL_PHONE", e.target.value)}
                  placeholder="Ej: 0412-1234567"
                />
                <TextField
                  fullWidth
                  label="Cédula / RIF"
                  variant="filled"
                  value={settings.IGO_PAGO_MOVIL_ID || ""}
                  onChange={(e) => handleChange("IGO_PAGO_MOVIL_ID", e.target.value)}
                  placeholder="Ej: J-12345678-0"
                />
                <TextField
                  fullWidth
                  label="Titular de la Cuenta"
                  variant="filled"
                  value={settings.IGO_PAGO_MOVIL_NAME || ""}
                  onChange={(e) => handleChange("IGO_PAGO_MOVIL_NAME", e.target.value)}
                  placeholder="Ej: IGO Delivery C.A."
                />
              </Box>
            </Paper>
          </Grid>

          {/* 2. COMISIONES (%) Y LÍMITE DE TAXI */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: "25px",
                bgcolor: colors.primary[400],
                borderRadius: "10px",
                border: `1px solid ${colors.grey[700]}`,
                height: "100%",
              }}
            >
              <Box display="flex" alignItems="center" gap="10px" mb="15px">
                <PercentIcon sx={{ color: colors.blueAccent[400], fontSize: "28px" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Comisiones y Límite Taxi
                  </Typography>
                  <Typography variant="caption" color={colors.grey[300]}>
                    Porcentajes de ganancias y tope de acumulación de saldo
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: "20px", borderColor: colors.grey[700] }} />

              <Box display="flex" flexDirection="column" gap="15px">
                <TextField
                  fullWidth
                  label="% Comisión IGO (Delivery Comercios)"
                  variant="filled"
                  type="number"
                  value={settings.COMMISSION_IGO_DELIVERY || ""}
                  onChange={(e) => handleChange("COMMISSION_IGO_DELIVERY", e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Porcentaje que retiene IGO de cada pedido de restaurante/comercio"
                />
                <TextField
                  fullWidth
                  label="% Comisión IGO (Servicio Taxi)"
                  variant="filled"
                  type="number"
                  value={settings.COMMISSION_IGO_TAXI || ""}
                  onChange={(e) => handleChange("COMMISSION_IGO_TAXI", e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Porcentaje que retiene IGO de cada carrera de taxi"
                />
                <TextField
                  fullWidth
                  label="% Comisión Repartidor / Conductor"
                  variant="filled"
                  type="number"
                  value={settings.COMMISSION_DRIVER || ""}
                  onChange={(e) => handleChange("COMMISSION_DRIVER", e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  helperText="Porcentaje que recibe el repartidor/conductor por la entrega"
                />
                <TextField
                  fullWidth
                  label="Límite Máximo Acumulación de Saldo Taxi"
                  variant="filled"
                  type="number"
                  value={settings.TAXI_MAX_BALANCE_LIMIT || ""}
                  onChange={(e) => handleChange("TAXI_MAX_BALANCE_LIMIT", e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  helperText="Acumulación de saldo máxima permitida para taxi (Actualmente máx $50)"
                />
              </Box>
            </Paper>
          </Grid>

          {/* 3. PRECIO X KM Y TARIFAS BASE POR CADA SERVICIO */}
          <Grid item xs={12} md={7}>
            <Paper
              elevation={3}
              sx={{
                p: "25px",
                bgcolor: colors.primary[400],
                borderRadius: "10px",
                border: `1px solid ${colors.grey[700]}`,
              }}
            >
              <Box display="flex" alignItems="center" gap="10px" mb="15px">
                <TwoWheelerIcon sx={{ color: colors.greenAccent[400], fontSize: "28px" }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Tarifas Base y Precio por KM por Servicio
                  </Typography>
                  <Typography variant="caption" color={colors.grey[300]}>
                    Parámetros para el cálculo automático de rutas viales OSRM
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: "20px", borderColor: colors.grey[700] }} />

              <Grid container spacing={2}>
                {/* Delivery */}
                <Grid item xs={12}>
                  <Typography variant="h5" fontWeight="bold" color={colors.greenAccent[400]} mb="5px">
                    🛵 Delivery Regular (Comercios / Restaurantes)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tarifa Base Delivery"
                    variant="filled"
                    type="number"
                    value={settings.FEE_BASE_DELIVERY || ""}
                    onChange={(e) => handleChange("FEE_BASE_DELIVERY", e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    helperText="Cubre los primeros 3 KM"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio por KM adicional"
                    variant="filled"
                    type="number"
                    value={settings.FEE_KM_DELIVERY || ""}
                    onChange={(e) => handleChange("FEE_KM_DELIVERY", e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                    helperText="Cobrado por cada KM posterior a los 3 KM"
                  />
                </Grid>

                {/* IGO Favor */}
                <Grid item xs={12} mt="10px">
                  <Typography variant="h5" fontWeight="bold" color={colors.blueAccent[400]} mb="5px">
                    📦 IGO Favor (Mandados y Envíos Personales)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tarifa Base IGO Favor"
                    variant="filled"
                    type="number"
                    value={settings.FEE_BASE_FAVOR || ""}
                    onChange={(e) => handleChange("FEE_BASE_FAVOR", e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio por KM IGO Favor"
                    variant="filled"
                    type="number"
                    value={settings.FEE_KM_FAVOR || ""}
                    onChange={(e) => handleChange("FEE_KM_FAVOR", e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>

                {/* Taxi */}
                <Grid item xs={12} mt="10px">
                  <Typography variant="h5" fontWeight="bold" color="#FCD116" mb="5px">
                    🚖 Servicio Taxi
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Tarifa Base Taxi"
                    variant="filled"
                    type="number"
                    value={settings.FEE_BASE_TAXI || ""}
                    onChange={(e) => handleChange("FEE_BASE_TAXI", e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Precio por KM Taxi"
                    variant="filled"
                    type="number"
                    value={settings.FEE_KM_TAXI || ""}
                    onChange={(e) => handleChange("FEE_KM_TAXI", e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* 4. HORARIOS Y PRECIO POR HORARIO / TASA BCV */}
          <Grid item xs={12} md={5}>
            <Box display="flex" flexDirection="column" gap="20px">
              {/* Horarios Nocturnos */}
              <Paper
                elevation={3}
                sx={{
                  p: "25px",
                  bgcolor: colors.primary[400],
                  borderRadius: "10px",
                  border: `1px solid ${colors.grey[700]}`,
                }}
              >
                <Box display="flex" alignItems="center" gap="10px" mb="15px">
                  <AccessTimeIcon sx={{ color: "#E0BBE4", fontSize: "28px" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      Horarios y Recargo Nocturno
                    </Typography>
                    <Typography variant="caption" color={colors.grey[300]}>
                      Tarifa diferenciada en horarios de noche/madrugada
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: "20px", borderColor: colors.grey[700] }} />

                <Box display="flex" flexDirection="column" gap="15px">
                  <TextField
                    fullWidth
                    label="Hora Inicio Recargo"
                    variant="filled"
                    type="time"
                    value={settings.NIGHT_SHIFT_START || "22:00"}
                    onChange={(e) => handleChange("NIGHT_SHIFT_START", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Hora en que comienza a aplicar la tarifa nocturna"
                  />
                  <TextField
                    fullWidth
                    label="Hora Fin Recargo"
                    variant="filled"
                    type="time"
                    value={settings.NIGHT_SHIFT_END || "06:00"}
                    onChange={(e) => handleChange("NIGHT_SHIFT_END", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    helperText="Hora en que finaliza la tarifa nocturna"
                  />
                  <TextField
                    fullWidth
                    label="Multiplicador de Recargo"
                    variant="filled"
                    type="number"
                    step="0.1"
                    value={settings.NIGHT_SHIFT_SURCHARGE || "1.5"}
                    onChange={(e) => handleChange("NIGHT_SHIFT_SURCHARGE", e.target.value)}
                    helperText="Ej: 1.5 significa un 50% de incremento en el costo de la carrera/envío"
                  />
                </Box>
              </Paper>

              {/* Tasa BCV */}
              <Paper
                elevation={3}
                sx={{
                  p: "25px",
                  bgcolor: colors.primary[400],
                  borderRadius: "10px",
                  border: `1px solid ${colors.grey[700]}`,
                }}
              >
                <Box display="flex" alignItems="center" gap="10px" mb="15px">
                  <CurrencyExchangeIcon sx={{ color: colors.greenAccent[500], fontSize: "28px" }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      Tasa de Cambio BCV
                    </Typography>
                    <Typography variant="caption" color={colors.grey[300]}>
                      Conversión oficial en bolívares en toda la plataforma
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: "20px", borderColor: colors.grey[700] }} />

                <TextField
                  fullWidth
                  label="Tasa BCV (Bs. / USD)"
                  variant="filled"
                  type="number"
                  step="0.01"
                  value={settings.BCV_RATE || "75.54"}
                  onChange={(e) => handleChange("BCV_RATE", e.target.value)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">Bs.</InputAdornment>,
                  }}
                  helperText="Valor de 1 USD en Bolívares (Bs.)"
                />
              </Paper>
            </Box>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt="25px" mb="40px">
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{
              bgcolor: colors.greenAccent[500],
              color: "#000",
              fontWeight: "bold",
              px: "35px",
              py: "12px",
              fontSize: "15px",
              "&:hover": { bgcolor: colors.greenAccent[600] },
            }}
          >
            {saving ? "Guardando..." : "Guardar Toda la Configuración"}
          </Button>
        </Box>
      </form>

      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%", fontWeight: "bold" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
