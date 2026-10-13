import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

export default function OrderChatViewerModal({ open, onClose, order }) {
  if (!order) return null;

  const messages = Array.isArray(order.chatMessages) ? order.chatMessages : [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ChatIcon color="primary" />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Chat en Vivo del Pedido #{String(order.orderNumber).padStart(4, "0")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cliente: {order.user?.fullName || order.userIdTemp || "Cliente"} | Repartidor: {order.deliveryUser?.fullName || "Sin asignar"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ minHeight: "300px", maxHeight: "500px", bgcolor: "#f8fafc" }}>
        {messages.length === 0 ? (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="250px">
            <ChatIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight="bold">
              Sin mensajes registrados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              El cliente y el repartidor no han intercambiado mensajes en esta orden.
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.5} py={1}>
            {messages.map((msg, index) => {
              const isDriver = msg.senderRole === "driver" || msg.senderRole === "empleado";
              const isSystem = msg.senderRole === "system";

              if (isSystem) {
                return (
                  <Box key={msg.id || index} display="flex" justifyContent="center" my={1}>
                    <Box sx={{ bgcolor: "#e2e8f0", px: 2, py: 0.5, borderRadius: "12px" }}>
                      <Typography variant="caption" color="text.secondary">
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              }

              return (
                <Box
                  key={msg.id || index}
                  display="flex"
                  flexDirection="column"
                  alignItems={isDriver ? "flex-start" : "flex-end"}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 0.2 }}>
                    {isDriver ? `🛵 ${msg.senderName || "Repartidor"}` : `👤 ${msg.senderName || "Cliente"}`} •{" "}
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </Typography>
                  <Box
                    sx={{
                      maxWidth: "75%",
                      p: 1.5,
                      borderRadius: isDriver ? "12px 12px 12px 2px" : "12px 12px 2px 12px",
                      bgcolor: isDriver ? "#ffffff" : "#4F46E5",
                      color: isDriver ? "#1e293b" : "#ffffff",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      border: isDriver ? "1px solid #e2e8f0" : "none",
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
