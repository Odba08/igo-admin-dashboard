import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  useTheme,
  Chip,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Paper,
  IconButton,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import ActiveDriversDrawer from "../../components/ActiveDriversDrawer";
import PaymentVerificationModal from "../../components/PaymentVerificationModal";
import OrderLocationMap from "../../components/OrderLocationMap";
import {
  getOrders,
  updateOrder,
  getUsers,
  assignOrderDriver,
  verifyOrderPayment,
} from "../../services/api";
import getSocket from "../../services/socket";

import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import LocalTaxiIcon from "@mui/icons-material/LocalTaxi";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import PaymentIcon from "@mui/icons-material/Payment";
import MapIcon from "@mui/icons-material/Map";
import InfoIcon from "@mui/icons-material/Info";
import NearMeIcon from "@mui/icons-material/NearMe";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function ServicesOrders() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [activeTab, setActiveTab] = useState(0); // 0: Todos, 1: Favor, 2: Taxi
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sound alert
  const [soundAlertEnabled, setSoundAlertEnabled] = useState(true);
  const prevPendingCount = useRef(0);

  // Modals state
  const [driversDrawerOpen, setDriversDrawerOpen] = useState(false);
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState(null);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyOrder, setVerifyOrder] = useState(null);

  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [mapOrder, setMapOrder] = useState(null);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoOrder, setInfoOrder] = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPayment, setFilterPayment] = useState("ALL");

  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.3); // D6

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio not enabled yet", e);
    }
  };

  const fetchServicesOrders = async () => {
    try {
      const res = await getOrders();
      const allOrders = res.data || [];
      // Filter only IGO Favor and IGO Taxi
      const serviceOnly = allOrders.filter(
        (o) =>
          o.category === "IgoFavor" ||
          o.category === "IgoTaxi" ||
          o.category === "Envíos" ||
          !o.business ||
          o.business?.id === "00000000-0000-0000-0000-000000000000"
      );

      const pendingCount = serviceOnly.filter(
        (o) => o.status === "PENDING" || o.status === "CREATED"
      ).length;

      if (
        soundAlertEnabled &&
        pendingCount > prevPendingCount.current &&
        prevPendingCount.current >= 0
      ) {
        playChimeSound();
      }
      prevPendingCount.current = pendingCount;
      setOrders(serviceOnly);
    } catch (err) {
      console.error("Error fetching services orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await getUsers();
      const list = res.data || [];
      const filtered = list.filter(
        (u) => u.roles?.includes("empleado") || u.roles?.includes("worker")
      );
      setDrivers(filtered);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  useEffect(() => {
    fetchServicesOrders();
    fetchDrivers();

    const socket = getSocket();
    if (socket) {
      socket.on("order:created", (newOrder) => {
        fetchServicesOrders();
        if (soundAlertEnabled) {
          playChimeSound();
        }
      });

      socket.on("order:updated", () => {
        fetchServicesOrders();
      });

      socket.on("order:payment_verified", () => {
        fetchServicesOrders();
      });
    }

    const interval = setInterval(fetchServicesOrders, 8000);
    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off("order:created");
        socket.off("order:updated");
        socket.off("order:payment_verified");
      }
    };
  }, [soundAlertEnabled]);

  const handleDriverAssign = async (orderId, deliveryUserId) => {
    try {
      await assignOrderDriver(orderId, deliveryUserId || null);
      fetchServicesOrders();
    } catch (err) {
      alert("Error al asignar chofer/motorizado: " + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrder(id, { status: newStatus });
      fetchServicesOrders();
    } catch (err) {
      alert("Error al actualizar estado: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePaymentToggle = async (id, currentIsPaid) => {
    try {
      await updateOrder(id, { isPaid: !currentIsPaid });
      fetchServicesOrders();
    } catch (err) {
      alert("Error al actualizar estado de pago: " + (err.response?.data?.message || err.message));
    }
  };

  const handleVerifyPaymentDirect = async (orderId, isPaid) => {
    try {
      await verifyOrderPayment(orderId, isPaid);
      setVerifyModalOpen(false);
      fetchServicesOrders();
    } catch (err) {
      alert("Error al verificar pago: " + (err.response?.data?.message || err.message));
    }
  };

  // Metrics
  const favorsList = orders.filter((o) => o.category === "IgoFavor" || o.category === "Envíos" || o.shippingType === "Moto");
  const taxilist = orders.filter((o) => o.category === "IgoTaxi" || o.shippingType === "Carro");

  const activeFavors = favorsList.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
  const activeTaxis = taxilist.filter((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
  const pendingAssignment = orders.filter((o) => !o.deliveryUser && o.status !== "DELIVERED" && o.status !== "CANCELLED").length;
  const totalServicesRevenue = orders.filter((o) => o.isPaid).reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Filter tab
  const displayedOrders = orders.filter((o) => {
    if (activeTab === 1) {
      // Solo IGO Favor
      if (o.category === "IgoTaxi") return false;
    } else if (activeTab === 2) {
      // Solo IGO Taxi
      if (o.category !== "IgoTaxi" && o.shippingType !== "Carro") return false;
    }

    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (filterPayment !== "ALL") {
      const isPaid = o.isPaid === true;
      if (filterPayment === "PAID" && !isPaid) return false;
      if (filterPayment === "UNPAID" && isPaid) return false;
    }

    return true;
  });

  const columns = [
    {
      field: "orderNumber",
      headerName: "Nº Orden",
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight="bold" color={colors.greenAccent[300]}>
          #{String(params.row.orderNumber).padStart(4, "0")}
        </Typography>
      ),
    },
    {
      field: "category",
      headerName: "Tipo de Servicio",
      width: 140,
      renderCell: (params) => {
        const isTaxi = params.row.category === "IgoTaxi" || params.row.shippingType === "Carro";
        return (
          <Chip
            icon={isTaxi ? <LocalTaxiIcon style={{ fontSize: "16px", color: "#000" }} /> : <TwoWheelerIcon style={{ fontSize: "16px", color: "#fff" }} />}
            label={isTaxi ? "IGO Taxi" : "IGO Favor"}
            size="small"
            sx={{
              fontWeight: "bold",
              bgcolor: isTaxi ? colors.greenAccent[400] : "#6200EE",
              color: isTaxi ? "#000" : "#fff",
            }}
          />
        );
      },
    },
    {
      field: "customer",
      headerName: "Cliente / Pasajero",
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography fontWeight="bold">
            {params.row.user?.fullName || params.row.userIdTemp || "Cliente IGO"}
          </Typography>
          <Typography variant="caption" color={colors.grey[300]}>
            {params.row.user?.phoneNumber || params.row.user?.email || "Sin teléfono"}
          </Typography>
        </Box>
      ),
    },
    {
      field: "pickupAddress",
      headerName: "Origen (Punto A)",
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.pickupAddress}>
          🏢 {params.row.pickupAddress || "Punto de recogida"}
        </Typography>
      ),
    },
    {
      field: "deliveryAddress",
      headerName: "Destino (Punto B)",
      flex: 1.2,
      renderCell: (params) => (
        <Typography variant="body2" noWrap title={params.row.deliveryAddress}>
          📍 {params.row.deliveryAddress || "Punto de entrega"}
        </Typography>
      ),
    },
    {
      field: "deliveryUser",
      headerName: "Chofer / Repartidor",
      width: 220,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap="6px" width="100%">
          <Select
            value={params.row.deliveryUser?.id || ""}
            onChange={(e) => handleDriverAssign(params.row.id, e.target.value)}
            size="small"
            displayEmpty
            sx={{
              fontSize: "12px",
              height: "30px",
              flex: 1,
              bgcolor: params.row.deliveryUser ? "rgba(76, 206, 172, 0.12)" : "rgba(255,255,255,0.04)",
              borderRadius: "6px",
            }}
          >
            <MenuItem value="">
              <em style={{ color: "#a0aec0" }}>📢 Disponible (Sin Chofer)</em>
            </MenuItem>
            {drivers.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.vehicle === "Carro" ? "🚕" : "🛵"} {d.fullName || d.email}
              </MenuItem>
            ))}
          </Select>
          <Tooltip title="Ver repartidores por cercanía">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedOrderForDrawer(params.row);
                setDriversDrawerOpen(true);
              }}
              sx={{ color: colors.greenAccent[400], bgcolor: "rgba(76, 206, 172, 0.1)" }}
            >
              <NearMeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
    {
      field: "totalAmount",
      headerName: "Tarifa",
      width: 90,
      renderCell: (params) => (
        <Typography fontWeight="bold" color={colors.greenAccent[400]}>
          ${parseFloat(params.row.totalAmount || 0).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "paymentRecipient",
      headerName: "Modalidad Pago",
      width: 150,
      renderCell: (params) => {
        const isTaxi = params.row.category === "IgoTaxi" || params.row.shippingType === "Carro";
        return (
          <Chip
            label={isTaxi ? "Pago Conductor" : (params.row.paymentRecipient || "Pago IGO")}
            size="small"
            variant="outlined"
            sx={{ fontSize: "10px", borderColor: colors.grey[500] }}
          />
        );
      },
    },
    {
      field: "isPaid",
      headerName: "Pago",
      width: 130,
      renderCell: (params) => {
        const isPaid = params.row.isPaid === true;
        const isTaxi = params.row.category === "IgoTaxi";
        return (
          <Box display="flex" alignItems="center" gap="4px">
            <Chip
              label={isPaid ? "Pagado" : (isTaxi ? "Al Conductor" : "En revisión")}
              color={isPaid ? "success" : "warning"}
              size="small"
              onClick={() => handlePaymentToggle(params.row.id, isPaid)}
              sx={{ fontWeight: "bold", fontSize: "10px", cursor: "pointer" }}
            />
            {params.row.paymentCaptureUrl && (
              <Tooltip title="Ver capture de pago móvil">
                <IconButton
                  size="small"
                  onClick={() => {
                    setVerifyOrder(params.row);
                    setVerifyModalOpen(true);
                  }}
                  sx={{ color: colors.blueAccent[400], p: "2px" }}
                >
                  <PaymentIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: "status",
      headerName: "Estado",
      width: 140,
      renderCell: (params) => (
        <Select
          value={params.row.status}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          size="small"
          sx={{
            fontSize: "11px",
            height: "28px",
            fontWeight: "bold",
            borderRadius: "6px",
            color:
              params.row.status === "DELIVERED"
                ? colors.greenAccent[400]
                : params.row.status === "ON_WAY"
                ? "#b388ff"
                : params.row.status === "CANCELLED"
                ? colors.redAccent[400]
                : colors.grey[100],
          }}
        >
          <MenuItem value="PENDING">PENDING</MenuItem>
          <MenuItem value="PREPARING">PREPARING</MenuItem>
          <MenuItem value="ON_WAY">ON_WAY</MenuItem>
          <MenuItem value="DELIVERED">DELIVERED</MenuItem>
          <MenuItem value="CANCELLED">CANCELLED</MenuItem>
        </Select>
      ),
    },
    {
      field: "actions",
      headerName: "Mapa & Detalle",
      width: 130,
      renderCell: (params) => (
        <Box display="flex" gap="4px">
          <Tooltip title="Ver mapa y ruta en vivo">
            <IconButton
              size="small"
              onClick={() => {
                setMapOrder(params.row);
                setMapModalOpen(true);
              }}
              sx={{ color: colors.greenAccent[400], bgcolor: "rgba(76, 206, 172, 0.1)" }}
            >
              <MapIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Ver información completa">
            <IconButton
              size="small"
              onClick={() => {
                setInfoOrder(params.row);
                setInfoModalOpen(true);
              }}
              sx={{ color: colors.blueAccent[400], bgcolor: "rgba(41, 182, 246, 0.1)" }}
            >
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      {/* Header with sound toggle and refresh */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="10px">
        <Header
          title="IGO FAVOR & IGO TAXI"
          subtitle="Panel centralizado de traslados en taxi y encomiendas express en tiempo real"
        />

        <Box display="flex" alignItems="center" gap="10px">
          <Button
            variant="contained"
            onClick={() => setSoundAlertEnabled(!soundAlertEnabled)}
            startIcon={soundAlertEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
            sx={{
              bgcolor: soundAlertEnabled ? colors.greenAccent[500] : colors.grey[700],
              color: soundAlertEnabled ? "#000" : "#fff",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {soundAlertEnabled ? "Alerta Sonora Activa" : "Alerta Silenciada"}
          </Button>

          <Button
            variant="outlined"
            onClick={fetchServicesOrders}
            startIcon={<RefreshIcon />}
            sx={{ color: colors.grey[100], borderColor: colors.grey[600], textTransform: "none" }}
          >
            Actualizar
          </Button>

          <Button
            variant="contained"
            onClick={() => setDriversDrawerOpen(true)}
            startIcon={<TwoWheelerIcon />}
            sx={{ bgcolor: colors.blueAccent[600], color: "#fff", fontWeight: "bold", textTransform: "none" }}
          >
            Ver Repartidores Activos
          </Button>
        </Box>
      </Box>

      {/* Cards de Métricas */}
      <Box display="grid" gridTemplateColumns={{ xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap="15px" my="20px">
        <Card sx={{ bgcolor: colors.primary[400], border: `1px solid ${colors.grey[700]}` }}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color="#6200EE">
                {activeFavors}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                📦 IGO Favors Activos
              </Typography>
            </Box>
            <TwoWheelerIcon sx={{ fontSize: "40px", color: "#6200EE" }} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: colors.primary[400], border: `1px solid ${colors.grey[700]}` }}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[400]}>
                {activeTaxis}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                🚕 IGO Taxis Activos
              </Typography>
            </Box>
            <LocalTaxiIcon sx={{ fontSize: "40px", color: colors.greenAccent[400] }} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: colors.primary[400], border: `1px solid ${colors.grey[700]}` }}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color={colors.redAccent[400]}>
                {pendingAssignment}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                ⏳ Sin Conductor Asignado
              </Typography>
            </Box>
            <HourglassEmptyIcon sx={{ fontSize: "40px", color: colors.redAccent[400] }} />
          </CardContent>
        </Card>

        <Card sx={{ bgcolor: colors.primary[400], border: `1px solid ${colors.grey[700]}` }}>
          <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[400]}>
                ${totalServicesRevenue.toFixed(2)}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                💵 Recaudado en Servicios
              </Typography>
            </Box>
            <AttachMoneyIcon sx={{ fontSize: "40px", color: colors.greenAccent[400] }} />
          </CardContent>
        </Card>
      </Box>

      {/* Tabs para bifurcar Favor y Taxi */}
      <Box sx={{ borderBottom: 1, borderColor: colors.grey[700], mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newVal) => setActiveTab(newVal)}
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label={`⚡ Todos los Servicios (${orders.length})`} sx={{ fontWeight: "bold" }} />
          <Tab label={`📦 IGO Favor (${favorsList.length})`} sx={{ fontWeight: "bold" }} />
          <Tab label={`🚕 IGO Taxi (${taxilist.length})`} sx={{ fontWeight: "bold" }} />
        </Tabs>
      </Box>

      {/* DataGrid */}
      <Box
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: `1px solid ${colors.grey[800]}` },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        <DataGrid
          rows={displayedOrders}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Box>

      {/* Drawer de Repartidores Activos */}
      <ActiveDriversDrawer
        open={driversDrawerOpen}
        onClose={() => {
          setDriversDrawerOpen(false);
          setSelectedOrderForDrawer(null);
        }}
        selectedOrder={selectedOrderForDrawer}
        onAssignOrder={(orderId, driverId) => {
          handleDriverAssign(orderId, driverId);
          setDriversDrawerOpen(false);
          setSelectedOrderForDrawer(null);
        }}
      />

      {/* Modal de Verificación de Pago Móvil */}
      <PaymentVerificationModal
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        order={verifyOrder}
        onVerifyPayment={handleVerifyPaymentDirect}
      />

      {/* Modal de Mapa de Ruta y Telemetría */}
      <Dialog open={mapModalOpen} onClose={() => setMapModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary[400], borderBottom: `1px solid ${colors.grey[700]}` }}>
          <Typography variant="h4" fontWeight="bold">
            🗺️ Ruta y Telemetría - #{mapOrder && String(mapOrder.orderNumber).padStart(4, "0")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.primary[400], pt: 2 }}>
          {mapOrder && (
            <Box mt={1}>
              <OrderLocationMap
                pickupLat={mapOrder.pickupLat}
                pickupLng={mapOrder.pickupLong}
                pickupAddress={mapOrder.pickupAddress}
                deliveryLat={mapOrder.deliveryLat}
                deliveryLng={mapOrder.deliveryLong}
                deliveryAddress={mapOrder.deliveryAddress}
                isEditable={false}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: colors.primary[400], p: 2 }}>
          <Button onClick={() => setMapModalOpen(false)} variant="outlined" color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Detalle Completo de Servicio */}
      <Dialog open={infoModalOpen} onClose={() => setInfoModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: colors.primary[400], borderBottom: `1px solid ${colors.grey[700]}` }}>
          <Typography variant="h4" fontWeight="bold">
            Detalle del Servicio #{infoOrder && String(infoOrder.orderNumber).padStart(4, "0")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: colors.primary[400], pt: 2 }}>
          {infoOrder && (
            <Box display="flex" flexDirection="column" gap="15px" mt={1}>
              <Paper variant="outlined" sx={{ p: "15px", bgcolor: colors.primary[500], borderColor: colors.grey[700] }}>
                <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold" mb={1}>
                  Información del Solicitante y Servicio
                </Typography>
                <Typography variant="body1"><strong>Tipo:</strong> {infoOrder.category === "IgoTaxi" ? "🚕 IGO Taxi" : "📦 IGO Favor"}</Typography>
                <Typography variant="body1"><strong>Cliente / Pasajero:</strong> {infoOrder.user?.fullName || infoOrder.userIdTemp || "Cliente IGO"}</Typography>
                <Typography variant="body1"><strong>Teléfono:</strong> {infoOrder.user?.phoneNumber || "Sin teléfono"}</Typography>
                <Typography variant="body1"><strong>Vehículo requerido:</strong> {infoOrder.shippingType || "Carro"}</Typography>
                <Typography variant="body1"><strong>Origen (Punto A):</strong> {infoOrder.pickupAddress}</Typography>
                <Typography variant="body1"><strong>Destino (Punto B):</strong> {infoOrder.deliveryAddress}</Typography>
                <Typography variant="body1"><strong>Tarifa total:</strong> ${parseFloat(infoOrder.totalAmount || 0).toFixed(2)}</Typography>
                <Typography variant="body1"><strong>Modalidad de cobro:</strong> {infoOrder.category === "IgoTaxi" ? "Pago directo al conductor" : (infoOrder.paymentRecipient || "Pago IGO")}</Typography>
                <Typography variant="body1"><strong>Estado del pago:</strong> {infoOrder.isPaid ? "PAGADO" : "EN REVISIÓN"}</Typography>
                <Typography variant="body1"><strong>Chofer asignado:</strong> {infoOrder.deliveryUser?.fullName || "Sin asignar"}</Typography>
              </Paper>

              <Box>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  Ruta y Ubicaciones en Mapa:
                </Typography>
                <OrderLocationMap
                  pickupLat={infoOrder.pickupLat}
                  pickupLng={infoOrder.pickupLong}
                  pickupAddress={infoOrder.pickupAddress}
                  deliveryLat={infoOrder.deliveryLat}
                  deliveryLng={infoOrder.deliveryLong}
                  deliveryAddress={infoOrder.deliveryAddress}
                  isEditable={false}
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: colors.primary[400], p: 2 }}>
          <Button onClick={() => setInfoModalOpen(false)} variant="outlined" color="inherit">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
