import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  Avatar,
  Chip,
  Button,
  useTheme,
  Badge,
  Switch,
  FormControlLabel,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NearMeIcon from "@mui/icons-material/NearMe";
import StarIcon from "@mui/icons-material/Star";
import { tokens } from "../theme";
import getSocket from "../services/socket";
import { getUsers, getActiveDrivers, updateUserStatus, updateEmployeeStatus } from "../services/api";
import { calculateDistanceKm } from "./OrderLocationMap";

export default function ActiveDriversDrawer({ open, onClose, onAssignOrder, selectedOrder }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [drivers, setDrivers] = useState([]);
  const [activeSocketDrivers, setActiveSocketDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, activeRes] = await Promise.allSettled([
        getUsers(),
        getActiveDrivers(),
      ]);

      if (usersRes.status === "fulfilled") {
        const list = usersRes.value.data || [];
        const filtered = list.filter(
          (u) => u.roles?.includes("empleado") || u.roles?.includes("worker")
        );
        setDrivers(filtered);
      }

      if (activeRes.status === "fulfilled") {
        setActiveSocketDrivers(activeRes.value.data || []);
      }
    } catch (err) {
      console.error("Error fetching drivers list:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchDrivers();
    }

    const socket = getSocket();
    if (socket) {
      socket.emit("drivers:get_active");
      const handleActiveList = (activeList) => {
        setActiveSocketDrivers(activeList || []);
      };
      socket.on("drivers:active_list", handleActiveList);

      return () => {
        socket.off("drivers:active_list", handleActiveList);
      };
    }
  }, [open, fetchDrivers]);

  const handleToggleActive = async (driver) => {
    const nextActive = driver.isActive === false ? true : false;
    const nextEmployeeStatus = nextActive ? "active" : "inactive";
    setUpdatingId(driver.id);
    try {
      await Promise.all([
        updateUserStatus(driver.id, nextActive),
        updateEmployeeStatus(driver.id, nextEmployeeStatus),
      ]);
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === driver.id
            ? { ...d, isActive: nextActive, employeeStatus: nextEmployeeStatus }
            : d
        )
      );
    } catch (err) {
      console.error("Error toggling driver status:", err);
      alert("Error al actualizar estado del repartidor: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  // Calculate distance for all drivers if an order is selected
  const refLat = parseFloat(selectedOrder?.pickupLat) || parseFloat(selectedOrder?.deliveryLat);
  const refLng = parseFloat(selectedOrder?.pickupLong) || parseFloat(selectedOrder?.deliveryLong);

  const sortedDrivers = useMemo(() => {
    return drivers.map((driver) => {
      const socketData = activeSocketDrivers.find((d) => d.userId === driver.id);
      const online = Boolean(socketData);
      let distanceKm = null;

      if (socketData?.latitude && socketData?.longitude && refLat && refLng) {
        distanceKm = calculateDistanceKm(refLat, refLng, socketData.latitude, socketData.longitude);
      }

      return {
        ...driver,
        online,
        socketData,
        distanceKm,
      };
    }).sort((a, b) => {
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      return 0;
    });
  }, [drivers, activeSocketDrivers, refLat, refLng]);

  const minDistance = useMemo(() => {
    const distances = sortedDrivers.map(d => d.distanceKm).filter(d => d !== null);
    return distances.length > 0 ? Math.min(...distances) : null;
  }, [sortedDrivers]);

  const onlineCount = activeSocketDrivers.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "320px", sm: "440px" },
          bgcolor: colors.primary[400],
          color: colors.grey[100],
          p: "20px",
          borderLeft: `1px solid ${colors.grey[700]}`,
        },
      }}
    >
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="15px">
        <Box display="flex" alignItems="center" gap="10px">
          <TwoWheelerIcon sx={{ color: colors.greenAccent[400], fontSize: "28px" }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Repartidores
            </Typography>
            <Typography variant="caption" color={colors.grey[300]}>
              {onlineCount} conectados en vivo • {drivers.length} registrados
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" gap="5px">
          <IconButton onClick={fetchDrivers} size="small" sx={{ color: colors.grey[300] }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon fontSize="small" />}
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: colors.grey[300] }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Info Contextual si hay una orden seleccionada para asignar */}
      {selectedOrder && (
        <Box
          sx={{
            p: "14px",
            mb: "15px",
            borderRadius: "8px",
            bgcolor: "rgba(76, 206, 172, 0.15)",
            border: `1px solid ${colors.greenAccent[500]}`,
          }}
        >
          <Typography variant="caption" color={colors.greenAccent[400]} fontWeight="bold">
            PEDIDO A ASIGNAR:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            #{String(selectedOrder.orderNumber).padStart(4, "0")} - {selectedOrder.deliveryAddress}
          </Typography>
          <Typography variant="caption" color={colors.grey[300]} display="block" mt="2px">
            Vehículo: <strong>{selectedOrder.shippingType || "Moto"}</strong> • Total: $
            {selectedOrder.totalAmount?.toFixed(2)}
          </Typography>
        </Box>
      )}

      <Typography variant="body2" color={colors.grey[400]} mb="10px">
        {selectedOrder ? "Repartidores ordenados por cercanía al pedido:" : "Controla los repartidores activos/inactivos en tiempo real:"}
      </Typography>

      <Divider sx={{ mb: "15px", borderColor: colors.grey[700] }} />

      {/* Lista de Repartidores */}
      <List sx={{ width: "100%", p: 0 }}>
        {sortedDrivers.map((driver) => {
          const online = driver.online;
          const vehicle = driver.vehicle || "Moto";
          const isEnabled = driver.isActive !== false;
          const isBusy = driver.employeeStatus === "busy";
          const isUpdating = updatingId === driver.id;
          const isNearest = driver.distanceKm !== null && minDistance !== null && driver.distanceKm === minDistance;

          return (
            <ListItem
              key={driver.id}
              alignItems="flex-start"
              sx={{
                mb: "12px",
                p: "12px",
                borderRadius: "8px",
                bgcolor: isNearest ? "rgba(76, 206, 172, 0.1)" : colors.primary[500],
                border: isNearest
                  ? `2px solid ${colors.greenAccent[400]}`
                  : `1px solid ${online ? colors.greenAccent[600] : colors.grey[700]}`,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                transition: "all 0.2s ease",
              }}
            >
              {/* Header row with Avatar, Name, and Status */}
              <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="10px">
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    variant="dot"
                    sx={{
                      "& .MuiBadge-badge": {
                        backgroundColor: online ? "#44b700" : "#718096",
                        color: online ? "#44b700" : "#718096",
                        width: "12px",
                        height: "12px",
                        borderRadius: "50%",
                        border: "2px solid #141b2d",
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: online ? colors.greenAccent[700] : colors.blueAccent[700] }}>
                      {vehicle === "Carro" || vehicle === "Pickups" ? (
                        <DirectionsCarIcon fontSize="small" />
                      ) : (
                        <TwoWheelerIcon fontSize="small" />
                      )}
                    </Avatar>
                  </Badge>

                  <Box>
                    <Box display="flex" alignItems="center" gap="6px">
                      <Typography fontWeight="bold" variant="body1">
                        {driver.fullName || "Repartidor"}
                      </Typography>
                      {isNearest && (
                        <Chip
                          icon={<StarIcon style={{ fontSize: "12px", color: "#000" }} />}
                          label="Más cercano"
                          size="small"
                          sx={{
                            fontSize: "10px",
                            height: "20px",
                            bgcolor: colors.greenAccent[400],
                            color: "#000",
                            fontWeight: "bold",
                          }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color={colors.grey[300]}>
                      {driver.email}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" alignItems="flex-end" gap="4px">
                  <Chip
                    label={online ? "En Línea" : "Desconectado"}
                    size="small"
                    color={online ? "success" : "default"}
                    icon={<FiberManualRecordIcon style={{ fontSize: "10px" }} />}
                    sx={{ fontSize: "10px", height: "20px" }}
                  />
                  {isBusy && (
                    <Chip
                      label="En Ruta"
                      size="small"
                      sx={{ fontSize: "9px", height: "18px", bgcolor: colors.redAccent[500], color: "#fff" }}
                    />
                  )}
                </Box>
              </Box>

              {/* Distance Proximity Indicator (if calculated) */}
              {driver.distanceKm !== null && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap="6px"
                  p="4px 8px"
                  borderRadius="4px"
                  bgcolor="rgba(46, 204, 113, 0.15)"
                >
                  <NearMeIcon sx={{ fontSize: "15px", color: colors.greenAccent[400] }} />
                  <Typography variant="caption" fontWeight="bold" color={colors.greenAccent[300]}>
                    A {driver.distanceKm.toFixed(2)} km del pedido
                  </Typography>
                </Box>
              )}

              {/* Status Toggle & Details Row */}
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                p="6px 10px"
                borderRadius="6px"
                bgcolor={colors.primary[600] || "rgba(0,0,0,0.2)"}
              >
                <Box display="flex" alignItems="center" gap="8px">
                  <PhoneIcon sx={{ fontSize: "14px", color: colors.grey[400] }} />
                  <Typography variant="caption" color={colors.grey[200]}>
                    {driver.phoneNumber || "Sin teléfono"}
                  </Typography>
                  <Chip
                    label={vehicle}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "10px", height: "18px" }}
                  />
                </Box>

                <Tooltip title={isEnabled ? "Desactivar repartidor" : "Activar repartidor"}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={isEnabled}
                        disabled={isUpdating}
                        onChange={() => handleToggleActive(driver)}
                        color="success"
                      />
                    }
                    label={
                      <Typography variant="caption" fontWeight="bold" color={isEnabled ? colors.greenAccent[400] : colors.grey[400]}>
                        {isEnabled ? "Habilitado" : "Inactivo"}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                </Tooltip>
              </Box>

              {/* Action Button for Assigning Order */}
              {selectedOrder && onAssignOrder && (
                <Box width="100%" display="flex" justifyContent="flex-end" mt="2px">
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    onClick={() => onAssignOrder(selectedOrder.id, driver.id)}
                    startIcon={<CheckCircleIcon />}
                    sx={{
                      bgcolor: isNearest ? colors.greenAccent[400] : colors.greenAccent[500],
                      color: "#000",
                      fontWeight: "bold",
                      fontSize: "12px",
                      py: "6px",
                      textTransform: "none",
                      "&:hover": { bgcolor: colors.greenAccent[600] },
                    }}
                  >
                    Asignar a {driver.fullName?.split(" ")[0]} {driver.distanceKm !== null ? `(${driver.distanceKm.toFixed(1)} km)` : ""}
                  </Button>
                </Box>
              )}
            </ListItem>
          );
        })}

        {drivers.length === 0 && !loading && (
          <Typography variant="body2" color={colors.grey[400]} sx={{ textAlign: "center", py: 4 }}>
            No hay repartidores registrados en el sistema.
          </Typography>
        )}
      </List>
    </Drawer>
  );
}

