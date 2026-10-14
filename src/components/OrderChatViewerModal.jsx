import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  IconButton,
  Chip,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import SecurityIcon from "@mui/icons-material/Security";
import { getSocket } from "../services/socket";
import { sendOrderChatMessage } from "../services/api";

export default function OrderChatViewerModal({ open, onClose, order }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const orderId = order?.id;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!open || !order) return;

    setMessages(Array.isArray(order.chatMessages) ? order.chatMessages : []);
    setTimeout(scrollToBottom, 150);

    const socket = getSocket();
    if (!socket || !orderId) return;

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(scrollToBottom, 100);
    };

    socket.on(`order:${orderId}:message`, handleNewMessage);

    return () => {
      socket.off(`order:${orderId}:message`, handleNewMessage);
    };
  }, [open, orderId, order]);

  const handleSendMessage = async (textToSend) => {
    const text = (typeof textToSend === "string" ? textToSend : inputText).trim();
    if (!text || !orderId || isSending) return;

    setIsSending(true);
    setInputText("");

    const newMsg = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      senderId: "admin-support",
      senderName: "Soporte IGO",
      senderRole: "soporte",
      text,
      timestamp: new Date().toISOString(),
    };

    // Actualización optimista de UI
    setMessages((prev) => [...prev, newMsg]);
    setTimeout(scrollToBottom, 100);

    try {
      // 1. Guardar en Base de Datos via Backend HTTP
      await sendOrderChatMessage(orderId, newMsg);

      // 2. Emitir por Socket para notificación inmediata en vivo a Cliente y Conductor
      const socket = getSocket();
      if (socket) {
        socket.emit("order:send_message", {
          orderId,
          ...newMsg,
        });
      }
    } catch (err) {
      console.error("Error enviando mensaje de chat desde panel admin:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const supportQuickReplies = [
    "👋 Hola, estamos atendiendo tu orden desde Soporte IGO.",
    "🛵 Repartidor, por favor infórmanos tu estatus o si necesitas apoyo con la ruta.",
    "📍 Estimado cliente, tu repartidor se encuentra en camino a tu ubicación.",
    "✅ Hemos verificado tu pago móvil exitosamente. El pedido continúa en marcha.",
  ];

  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: "10px", pb: 1 }}>
        <ChatIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            Chat en Vivo del Pedido #{String(order.orderNumber || "").padStart(4, "0")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cliente: {order.user?.fullName || order.userIdTemp || "Cliente"} | Repartidor:{" "}
            {order.deliveryUser?.fullName || "Sin asignar"}
          </Typography>
        </Box>
        <Chip
          icon={<SecurityIcon style={{ fontSize: 16 }} />}
          label="Modo Soporte"
          color="warning"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          minHeight: "350px",
          maxHeight: "480px",
          bgcolor: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          p: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="250px"
          >
            <ChatIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight="bold">
              Sin mensajes registrados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Escribe un mensaje para iniciar la conversación con el cliente y el repartidor.
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={1.5}>
            {messages.map((msg, index) => {
              const isSupport = msg.senderRole === "soporte" || msg.senderRole === "admin";
              const isDriver = msg.senderRole === "driver" || msg.senderRole === "empleado" || msg.senderRole === "motorizado";
              const isSystem = msg.senderRole === "system";

              if (isSystem) {
                return (
                  <Box key={msg.id || index} display="flex" justifyContent="center" my={0.5}>
                    <Box sx={{ bgcolor: "#e2e8f0", px: 2, py: 0.5, borderRadius: "12px" }}>
                      <Typography variant="caption" color="text.secondary">
                        {msg.text}
                      </Typography>
                    </Box>
                  </Box>
                );
              }

              // Estilos según rol
              let align = "flex-start";
              let bgColor = "#ffffff";
              let textColor = "#1e293b";
              let borderColor = "#e2e8f0";
              let senderPrefix = "👤";

              if (isSupport) {
                align = "flex-end";
                bgColor = "#FEF3C7";
                textColor = "#78350F";
                borderColor = "#F59E0B";
                senderPrefix = "🛡️";
              } else if (isDriver) {
                align = "flex-start";
                bgColor = "#EFF6FF";
                textColor = "#1E3A8A";
                borderColor = "#93C5FD";
                senderPrefix = "🛵";
              }

              return (
                <Box
                  key={msg.id || index}
                  display="flex"
                  flexDirection="column"
                  alignItems={align}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ px: 1, mb: 0.2 }}>
                    {senderPrefix} {isSupport ? "Soporte IGO (Tú)" : msg.senderName || (isDriver ? "Repartidor" : "Cliente")} •{" "}
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </Typography>
                  <Box
                    sx={{
                      maxWidth: "80%",
                      p: 1.5,
                      borderRadius: isSupport
                        ? "14px 14px 2px 14px"
                        : isDriver
                        ? "14px 14px 14px 2px"
                        : "14px 14px 14px 2px",
                      bgcolor: bgColor,
                      color: textColor,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.text}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </DialogContent>

      {/* Respuestas rápidas de Soporte */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: "#f1f5f9",
          display: "flex",
          gap: 0.8,
          overflowX: "auto",
          whiteSpace: "nowrap",
        }}
      >
        {supportQuickReplies.map((qr, idx) => (
          <Chip
            key={idx}
            label={qr}
            size="small"
            onClick={() => handleSendMessage(qr)}
            sx={{
              cursor: "pointer",
              fontSize: "11px",
              bgcolor: "white",
              border: "1px solid #cbd5e1",
              "&:hover": { bgcolor: "#e2e8f0" },
            }}
          />
        ))}
      </Box>

      {/* Barra de entrada de texto */}
      <Box sx={{ p: 1.5, display: "flex", gap: 1, alignItems: "center", bgcolor: "#ffffff" }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Escribir mensaje como Soporte IGO al cliente y repartidor..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={3}
          disabled={isSending}
        />
        <Tooltip title="Enviar mensaje">
          <span>
            <IconButton
              color="primary"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              sx={{
                bgcolor: "#4F46E5",
                color: "white",
                "&:hover": { bgcolor: "#4338CA" },
                "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" },
              }}
            >
              {isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon fontSize="small" />}
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <DialogActions sx={{ px: 2, pb: 1.5, pt: 0, justifyContent: "space-between" }}>
        <Typography variant="caption" color="text.secondary">
          Presiona Enter para enviar. Los mensajes son visibles para el Cliente y el Repartidor.
        </Typography>
        <Button onClick={onClose} variant="outlined" color="secondary" size="small">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
