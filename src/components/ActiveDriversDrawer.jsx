import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Button,
  useTheme,
  Badge,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RefreshIcon from "@mui/icons-material/Refresh";
import { tokens } from "../theme";
import getSocket from "../services/socket";
import { getUsers } from "../services/api";

export default function ActiveDriversDrawer({ open, onClose, onAssignOrder, selectedOrder }) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [drivers, setDrivers] = useState([]);
  const [activeSocketDrivers, setActiveSocketDrivers] = useState([]);

  const fetchDrivers = async () => {
    try {
      const res = await getUsers();
      const list = res.data || [];
      const filtered = list.filter(
        (u) => u.roles?.includes("empleado") || u.roles?.includes("worker")
      );
      setDrivers(filtered);
    } catch (err) {
      console.error("Error fetching drivers list:", err);
    }
  };

  useEffect(() => {
    fetchDrivers();

    const socket = getSocket();
    if (socket) {
      socket.on("drivers:active_list", (activeList) => {
        setActiveSocketDrivers(activeList || []);
      });
    }

    return () => {
      if (socket) {
        socket.off("drivers:active_list");
      }
    };
  }, []);

  const isDriverOnline = (driverId) => {
    return activeSocketDrivers.some((d) => d.userId === driverId);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "300px", sm: "380px" },
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
          <Typography variant="h4" fontWeight="bold">
            Repartidores
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap="5px">
          <IconButton onClick={fetchDrivers} size="small" sx={{ color: colors.grey[300] }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={onClose} size="small" sx={{ color: colors.grey[300] }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Info Contextual si hay una orden seleccionada */}
      {selectedOrder && (
        <Box
          sx={{
            p: "12px",
            mb: "15px",
            borderRadius: "8px",
            bgcolor: "rgba(76, 206, 172, 0.15)",
            border: `1px solid ${colors.greenAccent[500]}`,
          }}
        >
          <Typography variant="caption" color={colors.greenAccent[400]} fontWeight="bold">
            PEDIDO SELECCIONADO:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            #{String(selectedOrder.orderNumber).padStart(4, "0")} - {selectedOrder.deliveryAddress}
          </Typography>
          <Typography variant="caption" color={colors.grey[300]}>
            Vehículo requerido: {selectedOrder.shippingType || "Moto"}
          </Typography>
        </Box>
      )}

      <Typography variant="body2" color={colors.grey[400]} mb="10px">
        Lista de motorizados y repartidores registrados. Los que tienen punto verde están conectados en tiempo real:
      </Typography>

      <Divider sx={{ mb: "15px", borderColor: colors.grey[700] }} />

      {/* Lista de Repartidores */}
      <List sx={{ width: "100%", p: 0 }}>
        {drivers.map((driver) => {
          const online = isDriverOnline(driver.id);
          const vehicle = driver.vehicle || "Moto";

          return (
            <ListItem
              key={driver.id}
              alignItems="flex-start"
              sx={{
                mb: "10px",
                p: "12px",
                borderRadius: "8px",
                bgcolor: colors.primary[500],
                border: `1px solid ${online ? colors.greenAccent[600] : colors.grey[700]}`,
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
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
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: colors.blueAccent[500] }}>
                      {vehicle === "Carro" || vehicle === "Pickups" ? (
                        <DirectionsCarIcon fontSize="small" />
                      ) : (
                        <TwoWheelerIcon fontSize="small" />
                      )}
                    </Avatar>
                  </Badge>

                  <Box>
                    <Typography fontWeight="bold" variant="body1">
                      {driver.fullName || "Repartidor"}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[300]}>
                      {driver.email}
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={online ? "En Línea" : "Desconectado"}
                  size="small"
                  color={online ? "success" : "default"}
                  icon={<FiberManualRecordIcon style={{ fontSize: "10px" }} />}
                  sx={{ fontSize: "10px", height: "20px" }}
                />
              </Box>

              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mt="4px">
                <Box display="flex" alignItems="center" gap="5px">
                  <PhoneIcon sx={{ fontSize: "14px", color: colors.grey[400] }} />
                  <Typography variant="caption" color={colors.grey[300]}>
                    {driver.phoneNumber || "Sin teléfono"}
                  </Typography>
                  <Chip
                    label={vehicle}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "10px", height: "18px", ml: 1 }}
                  />
                </Box>

                {selectedOrder && onAssignOrder && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onAssignOrder(selectedOrder.id, driver.id)}
                    sx={{
                      bgcolor: colors.greenAccent[600],
                      color: "#000",
                      fontWeight: "bold",
                      fontSize: "11px",
                      py: "2px",
                      px: "10px",
                      textTransform: "none",
                      "&:hover": { bgcolor: colors.greenAccent[500] },
                    }}
                  >
                    Asignar
                  </Button>
                )}
              </Box>
            </ListItem>
          );
        })}

        {drivers.length === 0 && (
          <Typography variant="body2" color={colors.grey[400]} sx={{ textAlign: "center", py: 3 }}>
            No hay repartidores registrados en el sistema.
          </Typography>
        )}
      </List>
    </Drawer>
  );
}
