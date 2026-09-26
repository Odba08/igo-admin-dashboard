import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PaymentIcon from "@mui/icons-material/Payment";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { tokens } from "../theme";

export default function PaymentVerificationModal({
  open,
  onClose,
  order,
  onVerifyPayment,
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!order) return null;

  const totalAmount = parseFloat(order.totalAmount || 0).toFixed(2);
  const itemsAmount = parseFloat(order.totalItems || 0).toFixed(2);
  const deliveryFee = parseFloat(order.deliveryFee || 0).toFixed(2);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: colors.primary[400],
          color: colors.grey[100],
          borderRadius: "12px",
          border: `1px solid ${colors.grey[700]}`,
        },
      }}
    >
      <DialogTitle sx={{ borderBottom: `1px solid ${colors.grey[700]}`, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap="10px">
            <PaymentIcon sx={{ color: colors.greenAccent[400], fontSize: "28px" }} />
            <Typography variant="h4" fontWeight="bold">
              Verificar Pago Móvil - Pedido #{String(order.orderNumber).padStart(4, "0")}
            </Typography>
          </Box>
          <Chip
            label={order.isPaid ? "Ya Verificado (Pagado)" : "Pendiente de Verificación"}
            color={order.isPaid ? "success" : "warning"}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap="20px">
          {/* Columna Izquierda: Datos del Pago y Tienda */}
          <Box display="flex" flexDirection="column" gap="15px">
            {/* Tarjeta de Datos de Pago Móvil del Comercio */}
            <Box
              sx={{
                p: "15px",
                borderRadius: "8px",
                bgcolor: colors.primary[500],
                border: `1px solid ${colors.grey[600]}`,
              }}
            >
              <Box display="flex" alignItems="center" gap="8px" mb="10px">
                <StorefrontIcon sx={{ color: colors.blueAccent[400] }} />
                <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
                  Datos de Pago de la Tienda
                </Typography>
              </Box>

              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Comercio:</strong> {order.business?.name || "Sin tienda asignada"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Razón Social:</strong> {order.business?.legalName || order.business?.name || "N/A"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>RIF:</strong> {order.business?.rif || "N/A"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Banco Destino:</strong> {order.business?.paymentBank || "No especificado"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Teléfono Pago Móvil:</strong> {order.business?.paymentPhone || "No especificado"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Cédula / RIF Pago:</strong> {order.business?.paymentId || "No especificado"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Titular:</strong> {order.business?.paymentAccountName || "No especificado"}
              </Typography>
            </Box>

            {/* Referencia reportada por el cliente */}
            <Box
              sx={{
                p: "15px",
                borderRadius: "8px",
                bgcolor: "rgba(76, 206, 172, 0.1)",
                border: `1px solid ${colors.greenAccent[500]}`,
              }}
            >
              <Typography variant="caption" color={colors.greenAccent[400]} fontWeight="bold">
                NÚMERO DE REFERENCIA REPORTADO POR CLIENTE:
              </Typography>
              <Typography
                variant="h3"
                fontWeight="900"
                sx={{ letterSpacing: "2px", color: "#fff", my: 1, fontFamily: "monospace" }}
              >
                {order.paymentReference || "Sin referencia ingresada"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Cliente:</strong> {order.user?.fullName || order.userIdTemp || "Cliente Anónimo"}
              </Typography>
              <Typography variant="body2" color={colors.grey[300]}>
                <strong>Teléfono Cliente:</strong> {order.user?.phoneNumber || "N/A"}
              </Typography>
            </Box>

            {/* Resumen de Montos */}
            <Box sx={{ p: "15px", borderRadius: "8px", bgcolor: colors.primary[500] }}>
              <Box display="flex" justifyContent="space-between" mb="5px">
                <Typography variant="body2" color={colors.grey[300]}>Subtotal Productos (Tienda):</Typography>
                <Typography variant="body2" fontWeight="bold">${itemsAmount}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb="5px">
                <Typography variant="body2" color={colors.grey[300]}>Delivery (IGO):</Typography>
                <Typography variant="body2" fontWeight="bold">${deliveryFee}</Typography>
              </Box>
              <Divider sx={{ my: 1, borderColor: colors.grey[600] }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h5" fontWeight="bold" color={colors.greenAccent[400]}>TOTAL DEL PAGO:</Typography>
                <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[400]}>${totalAmount}</Typography>
              </Box>
            </Box>
          </Box>

          {/* Columna Derecha: Comprobante / Capture de Pago */}
          <Box display="flex" flexDirection="column" gap="10px">
            <Typography variant="h5" fontWeight="bold" color={colors.grey[100]}>
              📸 Capture / Comprobante Bancario
            </Typography>

            {order.paymentCaptureUrl ? (
              <Box
                sx={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: `2px solid ${colors.greenAccent[500]}`,
                  bgcolor: "#000",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  maxHeight: "420px",
                }}
              >
                <img
                  src={order.paymentCaptureUrl}
                  alt="Capture de Pago Móvil"
                  style={{ width: "100%", maxHeight: "420px", objectFit: "contain" }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: "250px",
                  borderRadius: "8px",
                  border: "2px dashed rgba(255,255,255,0.2)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  p: 3,
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" color={colors.grey[400]}>
                  El cliente aún no ha subido imagen del capture para este pedido.
                </Typography>
              </Box>
            )}

            {order.paymentCaptureUrl && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.open(order.paymentCaptureUrl, "_blank")}
                sx={{ color: colors.blueAccent[400], borderColor: colors.blueAccent[400] }}
              >
                Ver Imagen en Tamaño Completo ↗
              </Button>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: "20px", borderTop: `1px solid ${colors.grey[700]}`, gap: "10px" }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cerrar
        </Button>

        <Button
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => onVerifyPayment(order.id, false)}
          sx={{ fontWeight: "bold" }}
        >
          Rechazar / No Pagado
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => onVerifyPayment(order.id, true)}
          sx={{
            fontWeight: "bold",
            px: "25px",
            bgcolor: colors.greenAccent[500],
            color: "#000",
            "&:hover": { bgcolor: colors.greenAccent[600] },
          }}
        >
          {order.isPaid ? "Re-Confirmar Pago" : "✅ Confirmar Pago y Habilitar Despacho"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
