import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PersonIcon from "@mui/icons-material/Person";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import ChatIcon from "@mui/icons-material/Chat";
import { updateOrder } from "../services/api";

export default function SupportTicketModal({
  open,
  onClose,
  order,
  onResolved,
  onOpenChat,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!order) return null;

  const isResolved = order.supportTicketStatus === "RESOLVED";

  const handleResolve = async () => {
    setLoading(true);
    setError("");
    try {
      await updateOrder(order.id, {
        supportTicketStatus: "RESOLVED",
      });
      if (onResolved) onResolved(order.id);
      onClose();
    } catch (err) {
      console.error("Error resolving ticket:", err);
      setError("No se pudo marcar como resuelto. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: "10px", bgcolor: isResolved ? "rgba(76, 206, 172, 0.1)" : "rgba(235, 87, 87, 0.1)" }}>
        {isResolved ? (
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 28 }} />
        ) : (
          <WarningAmberIcon color="error" sx={{ fontSize: 28 }} />
        )}
        <Box>
          <Typography variant="h6" fontWeight="bold">
            {isResolved ? "Caso Resuelto" : "🚨 Reclamo / Incidencia Activa"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Orden #{String(order.orderNumber).padStart(4, "0")} — {order.business?.name || order.category || "Tienda"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="subtitle2" color="text.secondary">Estado del Reclamo:</Typography>
          <Chip
            label={isResolved ? "RESUELTO" : "PENDIENTE DE RESOLUCIÓN"}
            color={isResolved ? "success" : "error"}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Box>

        <Box sx={{ bgcolor: "rgba(0,0,0,0.04)", p: 2, borderRadius: 2, mb: 2 }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold">
            MOTIVO SELECCIONADO POR EL CLIENTE:
          </Typography>
          <Typography variant="body1" fontWeight="bold" sx={{ mt: 0.5, color: "#e53e3e" }}>
            {order.supportTicketReason || "No especificado"}
          </Typography>

          {order.supportTicketComment ? (
            <Box mt={1.5} pt={1} borderTop="1px dashed rgba(0,0,0,0.1)">
              <Typography variant="caption" color="text.secondary">
                Detalles adicionales del usuario:
              </Typography>
              <Typography variant="body2" sx={{ fontStyle: "italic", mt: 0.5 }}>
                "{order.supportTicketComment}"
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <PersonIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Cliente</Typography>
              <Typography variant="body2" fontWeight="bold">
                {order.user?.fullName || order.userIdTemp || "Anónimo"}
              </Typography>
              <Typography variant="caption" color="text.secondary">{order.user?.email || ""}</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <TwoWheelerIcon color="action" />
            <Box>
              <Typography variant="caption" color="text.secondary">Repartidor Asignado</Typography>
              <Typography variant="body2" fontWeight="bold">
                {order.deliveryUser?.fullName || "Sin asignar"}
              </Typography>
              <Typography variant="caption" color="text.secondary">{order.deliveryUser?.email || ""}</Typography>
            </Box>
          </Box>
        </Box>

        {order.chatMessages && order.chatMessages.length > 0 && (
          <Box mt={2.5}>
            <Button
              variant="outlined"
              color="info"
              fullWidth
              startIcon={<ChatIcon />}
              onClick={() => {
                if (onOpenChat) onOpenChat(order);
              }}
            >
              Ver Chat del Pedido ({order.chatMessages.length} mensajes)
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cerrar
        </Button>
        {!isResolved && (
          <Button
            onClick={handleResolve}
            variant="contained"
            color="success"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={18} /> : <CheckCircleOutlineIcon />}
          >
            {loading ? "Resolviendo..." : "Marcar como Resuelto"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
