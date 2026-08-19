import React, { useState, useEffect } from "react";
import { 
  Box, Typography, useTheme, Chip, Select, MenuItem, Switch, 
  FormControlLabel, Tabs, Tab, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, FormControl, InputLabel,
  Card, CardContent, Divider, Paper, CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getOrders, updateOrder, getBusinesses, getUsers } from "../../services/api";

import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import InfoIcon from "@mui/icons-material/Info";

const Invoices = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [activeTab, setActiveTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [editDeliveryUserId, setEditDeliveryUserId] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoOrder, setInfoOrder] = useState(null);

  // States for Edit Order Modal
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editAddress, setEditAddress] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editShippingType, setEditShippingType] = useState("");
  const [editPaymentRecipient, setEditPaymentRecipient] = useState("");
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editTotalItems, setEditTotalItems] = useState(0);
  const [editDeliveryFee, setEditDeliveryFee] = useState(0);
  const [editTotalAmount, setEditTotalAmount] = useState(0);
  const [editLat, setEditLat] = useState(0);
  const [editLng, setEditLng] = useState(0);

  // States for Settlements
  const [selectedBizId, setSelectedBizId] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // 30 días atrás
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [customCommission, setCustomCommission] = useState(10);

  // States for Order Grid Filters (Tab 0)
  const [filterOrderNumber, setFilterOrderNumber] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("ALL");
  const [filterBizId, setFilterBizId] = useState("ALL");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const filteredOrders = orders.filter(o => {
    if (filterOrderNumber && !String(o.orderNumber).padStart(4, "0").includes(filterOrderNumber) && !String(o.orderNumber).includes(filterOrderNumber)) {
      return false;
    }
    if (filterStatus !== "ALL" && o.status !== filterStatus) {
      return false;
    }
    if (filterPaymentStatus !== "ALL") {
      const isPaid = o.isPaid === true;
      if (filterPaymentStatus === "PAID" && !isPaid) return false;
      if (filterPaymentStatus === "UNPAID" && isPaid) return false;
    }
    if (filterBizId !== "ALL" && o.business?.id !== filterBizId) {
      return false;
    }
    const oDate = new Date(o.createdAt);
    if (filterDateFrom) {
      const from = new Date(filterDateFrom);
      from.setHours(0, 0, 0, 0);
      if (oDate < from) return false;
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59, 999);
      if (oDate > to) return false;
    }
    return true;
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinesses = async () => {
    try {
      const res = await getBusinesses();
      setBusinesses(res.data);
      if (res.data.length > 0) {
        setSelectedBizId(res.data[0].id);
        setCustomCommission(res.data[0].commissionPercentage ?? 10);
      }
    } catch (err) {
      console.error("Error fetching businesses:", err);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await getUsers();
      const list = res.data || [];
      const filtered = list.filter(u => u.roles?.includes("empleado") || u.roles?.includes("worker"));
      setDrivers(filtered);
    } catch (err) {
      console.error("Error fetching drivers:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchBusinesses();
    fetchDrivers();
    const interval = setInterval(fetchOrders, 10000); // Polling cada 10s
    return () => clearInterval(interval);
  }, []);

  // Update commission estimate when business selection changes
  useEffect(() => {
    if (selectedBizId) {
      const biz = businesses.find(b => b.id === selectedBizId);
      if (biz) {
        setCustomCommission(biz.commissionPercentage ?? 10);
      }
    }
  }, [selectedBizId, businesses]);

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

  const handleSetLast30Days = () => {
    const d = new Date();
    const end = d.toISOString().split("T")[0];
    d.setDate(d.getDate() - 30);
    const start = d.toISOString().split("T")[0];
    setStartDate(start);
    setEndDate(end);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrder(id, { status: newStatus });
      fetchOrders();
    } catch (err) {
      alert("Error al actualizar estado de orden: " + (err.response?.data?.message || err.message));
    }
  };

  const handlePaidToggle = async (id, currentIsPaid) => {
    try {
      await updateOrder(id, { isPaid: !currentIsPaid });
      fetchOrders();
    } catch (err) {
      alert("Error al cambiar estado de pago: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenEditModal = (order) => {
    setSelectedOrder(order);
    setEditAddress(order.deliveryAddress);
    setEditCategory(order.category || "Comida");
    setEditShippingType(order.shippingType || "Moto");
    setEditPaymentRecipient(order.paymentRecipient || "Pago IGO");
    setEditIsPaid(Boolean(order.isPaid));
    setEditStatus(order.status);
    setEditTotalItems(order.totalItems || 0);
    setEditDeliveryFee(order.deliveryFee || 0);
    setEditTotalAmount(order.totalAmount || 0);
    setEditLat(order.deliveryLat || 0);
    setEditLng(order.deliveryLong || 0);
    setEditDeliveryUserId(order.deliveryUser?.id || "");
    setEditOpen(true);
  };

  const handleOpenInfoModal = (order) => {
    setInfoOrder(order);
    setInfoOpen(true);
  };

  const handleDownloadPDF = (order) => {
    const printWindow = window.open("", "_blank");
    const subtotalCalculated = parseFloat(order.totalItemsPrice || (order.totalAmount - order.deliveryFee)).toFixed(2);
    const itemsHtml = order.items?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <div style="display: flex; align-items: center; gap: 10px;">
            ${(item.product?.images?.[0]?.url || item.product?.images?.[0]) ? `<img src="${item.product?.images?.[0]?.url || item.product?.images?.[0]}" style="width: 40px; height: 40px; border-radius: 4px; object-fit: cover;" />` : ''}
            <div>
              <strong>${item.product?.title || 'Producto'}</strong>
              ${item.selectedOptionsText && item.selectedOptionsText !== 'Sin adicionales' ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">↳ Opciones: ${item.selectedOptionsText}</div>` : ''}
            </div>
          </div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join("") || `
      <tr>
        <td colspan="4" style="padding: 20px; text-align: center; color: #888;">No hay ítems en esta orden</td>
      </tr>
    `;

    const htmlContent = `
      <html>
        <head>
          <title>Pedido #${String(order.orderNumber).padStart(4, "0")}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 30px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #EDB422; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #EDB422; }
            .invoice-title { font-size: 20px; font-weight: bold; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .info-box { background: #f9f9f9; padding: 15px; border-radius: 8px; border: 1px solid #eee; }
            .info-box h3 { margin-top: 0; color: #333; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-box p { margin: 5px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f5f5f5; padding: 10px; text-align: left; font-size: 13px; border-bottom: 2px solid #ddd; }
            .totals { float: right; width: 300px; }
            .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
            .totals-row.grand { font-size: 18px; font-weight: bold; border-top: 2px solid #EDB422; padding-top: 10px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">IGO STORE</div>
              <div style="font-size: 12px; color: #666; margin-top: 4px;">Plataforma de Despacho y Logística</div>
            </div>
            <div style="text-align: right;">
              <div class="invoice-title">DETALLE DE PEDIDO</div>
              <div style="font-size: 14px; font-weight: bold; color: #666; margin-top: 4px;">#${String(order.orderNumber).padStart(4, "0")}</div>
              <div style="font-size: 12px; color: #888; margin-top: 2px;">Fecha: ${new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h3>DATOS DEL CLIENTE</h3>
              <p><strong>Nombre:</strong> ${order.user?.fullName || order.userIdTemp || 'Cliente Anónimo'}</p>
              <p><strong>Email:</strong> ${order.user?.email || 'N/A'}</p>
              <p><strong>Teléfono:</strong> ${order.user?.phoneNumber || 'N/A'}</p>
            </div>
            <div class="info-box">
              <h3>DATOS DEL COMERCIO</h3>
              <p><strong>Establecimiento:</strong> ${order.business?.name || 'N/A'}</p>
              <p><strong>Categoría:</strong> ${order.category || 'N/A'}</p>
              <p><strong>Método de Pago:</strong> ${order.paymentRecipient || 'Pago IGO'}</p>
            </div>
          </div>

          <div class="info-box" style="margin-bottom: 30px;">
            <h3>DETALLES DE LA ENTREGA</h3>
            <p><strong>Dirección de Envío:</strong> ${order.deliveryAddress || 'N/A'}</p>
            <p><strong>Tipo de Despacho:</strong> ${order.shippingType || 'Moto'}</p>
            <p><strong>Coordenadas GPS:</strong> Lat: ${order.deliveryLat}, Lng: ${order.deliveryLong}</p>
            <p><strong>Estado del Pedido:</strong> ${order.status}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Detalle del Producto</th>
                <th style="text-align: center; width: 80px;">Cant.</th>
                <th style="text-align: right; width: 100px;">Precio Unit.</th>
                <th style="text-align: right; width: 120px;">Total Ítem</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="overflow: hidden;">
            <div class="totals">
              <div class="totals-row">
                <span>Subtotal Productos:</span>
                <span>$${subtotalCalculated}</span>
              </div>
              <div class="totals-row">
                <span>Costo Delivery:</span>
                <span>$${parseFloat(order.deliveryFee).toFixed(2)}</span>
              </div>
              <div class="totals-row grand">
                <span>TOTAL A PAGAR:</span>
                <span>$${parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSaveOrderEdit = async () => {
    try {
      await updateOrder(selectedOrder.id, {
        deliveryAddress: editAddress,
        category: editCategory,
        shippingType: editShippingType,
        paymentRecipient: editPaymentRecipient,
        isPaid: editIsPaid,
        status: editStatus,
        totalItems: parseFloat(editTotalItems),
        deliveryFee: parseFloat(editDeliveryFee),
        totalAmount: parseFloat(editTotalAmount),
        deliveryLat: parseFloat(editLat),
        deliveryLong: parseFloat(editLng),
        deliveryUserId: editDeliveryUserId || null
      });
      setEditOpen(false);
      fetchOrders();
    } catch (err) {
      alert("Error al guardar edición: " + (err.response?.data?.message || err.message));
    }
  };

  // Calculate fields dynamically when item total or delivery fee changes in modal
  const handlePricingChange = (itemsVal, deliveryVal) => {
    setEditTotalItems(itemsVal);
    setEditDeliveryFee(deliveryVal);
    setEditTotalAmount(parseFloat(itemsVal) + parseFloat(deliveryVal));
  };

  // --- SETTLEMENTS CALCULATIONS ---
  const getSettlementData = () => {
    if (!selectedBizId) return {
      filteredOrders: [], totalPaidOrders: 0, itemsSubtotal: 0, deliverySubtotal: 0,
      totalAmountSum: 0, iGoTotal: 0, bizTotal: 0, mixTotal: 0,
      igoOwesBizProducts: 0, bizOwesIgoDelivery: 0, commissionAmount: 0, netOwed: 0
    };

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filtered = orders.filter(o => {
      if (!o.isPaid) return false;
      if (o.business?.id !== selectedBizId) return false;
      const oDate = new Date(o.createdAt);
      return oDate >= start && oDate <= end;
    });

    const totalPaidOrders = filtered.length;
    const itemsSubtotal = filtered.reduce((sum, o) => sum + (o.totalItems || 0), 0);
    const deliverySubtotal = filtered.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
    const totalAmountSum = filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Grouping by Recipient
    const iGo = filtered.filter(o => o.paymentRecipient === "Pago IGO");
    const biz = filtered.filter(o => o.paymentRecipient === "Pago Negocio");
    const mix = filtered.filter(o => o.paymentRecipient === "Mix");

    const iGoTotal = iGo.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const bizTotal = biz.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const mixTotal = mix.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    // Commission
    const commissionAmount = itemsSubtotal * (customCommission / 100);

    // Balances
    const igoOwesBizProducts = iGo.reduce((sum, o) => sum + (o.totalItems || 0), 0);
    const bizOwesIgoDelivery = biz.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

    const netOwed = igoOwesBizProducts - commissionAmount - bizOwesIgoDelivery;

    return {
      filteredOrders: filtered, totalPaidOrders, itemsSubtotal, deliverySubtotal, totalAmountSum,
      iGoTotal, bizTotal, mixTotal, igoOwesBizProducts, bizOwesIgoDelivery, commissionAmount, netOwed
    };
  };

  const settlement = getSettlementData();

  const handlePrintPDF = () => {
    const bizName = businesses.find(b => b.id === selectedBizId)?.name || "Comercio Aliado";
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Liquidacion - ${bizName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 30px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 3px solid #EDB422; padding-bottom: 15px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #111; font-size: 26px; text-transform: uppercase; }
            .header p { margin: 5px 0 0 0; color: #555; font-size: 15px; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e9ecef; }
            .details-grid div p { margin: 8px 0; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 35px; }
            th, td { border: 1px solid #dee2e6; padding: 12px; text-align: left; font-size: 13px; }
            th { background: #e9ecef; font-weight: bold; color: #495057; }
            .totals-section { background: #f8f9fa; border: 1px solid #dee2e6; padding: 25px; border-radius: 8px; margin-bottom: 35px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
            .totals-section h3 { margin-top: 0; color: #212529; border-bottom: 2px solid #dee2e6; padding-bottom: 10px; font-size: 16px; text-transform: uppercase; }
            .totals-section p { font-size: 14px; margin: 8px 0; }
            .highlight { font-weight: bold; font-size: 18px; color: #2e7d32; }
            .highlight-negative { font-weight: bold; font-size: 18px; color: #c62828; }
            .footer-notes { font-size: 12px; color: #6c757d; font-style: italic; border-top: 1px solid #dee2e6; padding-top: 15px; margin-top: 40px; text-align: center; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 80px; text-align: center; }
            .signatures div { border-top: 1.5px solid #212529; padding-top: 12px; font-weight: bold; font-size: 14px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INGÖ STORE - CONCILIACIÓN COMERCIAL</h1>
            <p>Reporte Oficial de Liquidación de Cuentas y Conciliación de Deliveries</p>
          </div>
          <div class="details-grid">
            <div>
              <p><strong>Establecimiento Aliado:</strong> ${bizName}</p>
              <p><strong>Período Liquidado:</strong> ${new Date(startDate).toLocaleDateString()} al ${new Date(endDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Fecha de Emisión:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
            </div>
          </div>
          
          <h3>Resumen Consolidado</h3>
          <div class="totals-section">
            <div>
              <h3>Ventas del Aliado</h3>
              <p><strong>Total Pedidos Pagados:</strong> ${settlement.totalPaidOrders}</p>
              <p><strong>Subtotal Productos:</strong> $${settlement.itemsSubtotal.toFixed(2)}</p>
              <p><strong>Comisión IGO (${customCommission}%):</strong> $${settlement.commissionAmount.toFixed(2)}</p>
              <p><strong>Subtotal Envío (Costo Delivery):</strong> $${settlement.deliverySubtotal.toFixed(2)}</p>
            </div>
            <div>
              <h3>Conciliación Neta de Caja</h3>
              <p><strong>Cobrado en Plataforma IGO (Pago IGO):</strong> $${settlement.iGoTotal.toFixed(2)}</p>
              <p><strong>Cobrado en Punto Físico (Pago Negocio):</strong> $${settlement.bizTotal.toFixed(2)}</p>
              <p><strong>Cobrado en Modelo Mixto (Mix):</strong> $${settlement.mixTotal.toFixed(2)}</p>
              <p><strong>IGO debe transferir (Ventas Pago IGO):</strong> $${settlement.igoOwesBizProducts.toFixed(2)}</p>
              <p><strong>Negocio debe transferir (Delivery Pago Negocio + Comisión):</strong> $${(settlement.bizOwesIgoDelivery + settlement.commissionAmount).toFixed(2)}</p>
              <hr style="border: none; border-top: 1px solid #dee2e6; margin: 12px 0;"/>
              ${settlement.netOwed >= 0 
                ? `<p class="highlight"><strong>Saldo a Favor del Negocio (IGO transfiere):</strong> $${settlement.netOwed.toFixed(2)}</p>` 
                : `<p class="highlight-negative"><strong>Saldo a Favor de IGO (Negocio transfiere):</strong> $${Math.abs(settlement.netOwed).toFixed(2)}</p>`}
            </div>
          </div>

          <h3>Desglose de Pedidos</h3>
          <table>
            <thead>
              <tr>
                <th>Nº Orden</th>
                <th>Fecha y Hora</th>
                <th>Receptor del Pago</th>
                <th>Subtotal (Negocio)</th>
                <th>Costo Envío (IGO)</th>
                <th>Monto Total</th>
              </tr>
            </thead>
            <tbody>
              ${settlement.filteredOrders.map(o => `
                <tr>
                  <td>#${String(o.orderNumber).padStart(4, '0')}</td>
                  <td>${new Date(o.createdAt).toLocaleDateString()} ${new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                  <td>${o.paymentRecipient || 'Pago IGO'}</td>
                  <td>$${(o.totalItems || 0).toFixed(2)}</td>
                  <td>$${(o.deliveryFee || 0).toFixed(2)}</td>
                  <td>$${(o.totalAmount || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              ${settlement.filteredOrders.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; font-style: italic; color: #6c757d;">No se registraron pedidos en este rango de fechas.</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="signatures">
            <div>
              Firma Representante IGO Store
            </div>
            <div>
              Firma Representante ${bizName}
            </div>
          </div>

          <div class="footer-notes">
            *Este documento constituye un acuerdo mutuo de conciliación de cuentas. El saldo indicado debe ser liquidado en las próximas 48 horas hábiles mediante transferencia bancaria.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Grid columns for tab 0
  const columns = [
    { 
      field: "orderNumber", 
      headerName: "Nº Orden", 
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight="bold" color={colors.greenAccent[300]}>
          #{String(params.row.orderNumber).padStart(4, "0")}
        </Typography>
      )
    },
    {
      field: "category",
      headerName: "Categoría",
      width: 130,
      renderCell: (params) => {
        const cat = params.row.category || "Comida";
        let color = "default";
        let icon = null;
        
        if (cat === "Comida") {
          color = "error"; // Rojo
          icon = <LocalFireDepartmentIcon style={{ color: "#FF3B30", fontSize: "16px" }} />;
        } else if (cat === "Mercado") {
          color = "info"; // Azul
          icon = <StorefrontIcon style={{ fontSize: "16px" }} />;
        } else if (cat === "Compras") {
          color = "warning"; // Amarillo
          icon = <ShoppingBagIcon style={{ fontSize: "16px" }} />;
        } else if (cat === "Envíos") {
          color = "success"; // Verde
          icon = <LocalShippingIcon style={{ fontSize: "16px" }} />;
        } else if (cat === "Salud") {
          color = "primary"; // Violeta/Morado
          icon = <LocalHospitalIcon style={{ fontSize: "16px" }} />;
        }

        return (
          <Box display="flex" alignItems="center" gap="5px">
            <Chip 
              icon={icon}
              label={cat} 
              color={color} 
              size="small" 
              sx={{ fontWeight: cat === "Comida" ? "bold" : "normal" }}
            />
          </Box>
        );
      }
    },
    {
      field: "customer",
      headerName: "Cliente",
      flex: 1,
      renderCell: (params) => {
        const u = params.row.user;
        return (
          <Box>
            <Typography fontWeight="bold">{u?.fullName || params.row.userIdTemp || "Cliente Anónimo"}</Typography>
            <Typography variant="body2" color={colors.grey[300]}>{u?.email || ""}</Typography>
          </Box>
        );
      }
    },
    {
      field: "business",
      headerName: "Tienda Aliada",
      flex: 1,
      renderCell: (params) => params.row.business?.name || "N/A"
    },
    {
      field: "deliveryUser",
      headerName: "Repartidor",
      flex: 1,
      renderCell: (params) => {
        const du = params.row.deliveryUser;
        if (!du) {
          return (
            <Typography variant="body2" color={colors.grey[400]} sx={{ fontStyle: 'italic' }}>
              Sin Asignar
            </Typography>
          );
        }
        return (
          <Box>
            <Typography fontWeight="bold" sx={{ color: colors.greenAccent[300] }}>
              {du.fullName}
            </Typography>
            <Typography variant="body2" color={colors.grey[300]}>
              {du.email}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "totalAmount",
      headerName: "Total",
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight="bold" color={colors.greenAccent[500]}>
          ${parseFloat(params.row.totalAmount).toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "paymentRecipient",
      headerName: "Receptor Pago",
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.row.paymentRecipient || "Pago IGO"}
          variant="outlined"
          color={params.row.paymentRecipient === "Mix" ? "secondary" : "default"}
          size="small"
        />
      )
    },
    {
      field: "isPaid",
      headerName: "Pago",
      width: 140,
      renderCell: (params) => (
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(params.row.isPaid)}
              onChange={() => handlePaidToggle(params.row.id, params.row.isPaid)}
              color="success"
              size="small"
            />
          }
          label={
            <Chip 
              label={params.row.isPaid ? "Pagado" : "Pendiente"} 
              color={params.row.isPaid ? "success" : "error"} 
              size="small" 
            />
          }
        />
      )
    },
    {
      field: "status",
      headerName: "Estado",
      width: 150,
      renderCell: (params) => (
        <Select
          value={params.row.status}
          onChange={(e) => handleStatusChange(params.row.id, e.target.value)}
          size="small"
          sx={{ fontSize: "12px", height: "30px" }}
        >
          <MenuItem value="PENDING">PENDING</MenuItem>
          <MenuItem value="PAID">PAID</MenuItem>
          <MenuItem value="PREPARING">PREPARING</MenuItem>
          <MenuItem value="ON_WAY">ON_WAY</MenuItem>
          <MenuItem value="DELIVERED">DELIVERED</MenuItem>
          <MenuItem value="CANCELLED">CANCELLED</MenuItem>
        </Select>
      )
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 220,
      renderCell: (params) => (
        <Box display="flex" gap="10px">
          <Button
            variant="contained"
            color="secondary"
            size="small"
            startIcon={<EditIcon sx={{ fontSize: "12px !important" }} />}
            onClick={() => handleOpenEditModal(params.row)}
            sx={{ backgroundColor: colors.blueAccent[600], color: "#fff", fontSize: "10px", fontWeight: "bold", "&:hover": { backgroundColor: colors.blueAccent[700] } }}
          >
            Corregir
          </Button>
          <Button
            variant="contained"
            color="info"
            size="small"
            startIcon={<InfoIcon sx={{ fontSize: "12px !important" }} />}
            onClick={() => handleOpenInfoModal(params.row)}
            sx={{ backgroundColor: colors.greenAccent[600], color: "#fff", fontSize: "10px", fontWeight: "bold", "&:hover": { backgroundColor: colors.greenAccent[700] } }}
          >
            Ver Info
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box m="20px">
      <Header title="ÓRDENES Y LIQUIDACIONES" subtitle="Gestión de Pedidos, Facturación y Cuentas de Comercios" />
      
      <Box sx={{ borderBottom: 1, borderColor: "divider", mt: "20px" }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, val) => setActiveTab(val)} 
          textColor="secondary" 
          indicatorColor="secondary"
        >
          <Tab label="Gestión de Pedidos" style={{ fontWeight: "bold", fontSize: "14px" }} />
          <Tab label="Liquidación Financiera" style={{ fontWeight: "bold", fontSize: "14px" }} />
        </Tabs>
      </Box>

      {activeTab === 0 ? (
        // PANEL 1: GESTIÓN DE PEDIDOS
        <Box m="20px 0 0 0">
          {/* Barra de Filtros de Pedidos */}
          <Card sx={{ backgroundColor: colors.primary[400], mb: "15px", p: "15px", border: `1px solid ${colors.grey[700]}` }}>
            <CardContent sx={{ p: "8px !important" }}>
              <Typography variant="h5" color={colors.greenAccent[500]} gutterBottom fontWeight="bold" sx={{ mb: 1.5 }}>
                Filtros de Pedidos
              </Typography>
              <Box display="flex" flexWrap="wrap" gap="15px" alignItems="center">
                <TextField
                  label="Nº Orden"
                  variant="outlined"
                  size="small"
                  value={filterOrderNumber}
                  onChange={(e) => setFilterOrderNumber(e.target.value)}
                  placeholder="ej: 0005"
                  sx={{ width: "120px" }}
                />
                
                <FormControl size="small" sx={{ minWidth: "150px" }}>
                  <InputLabel>Estado Pedido</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Estado Pedido"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="ALL">Todos</MenuItem>
                    <MenuItem value="CREATED">Creado</MenuItem>
                    <MenuItem value="PENDING">Pendiente</MenuItem>
                    <MenuItem value="PREPARING">En Preparación</MenuItem>
                    <MenuItem value="ON_WAY">En Camino</MenuItem>
                    <MenuItem value="DELIVERED">Entregado</MenuItem>
                    <MenuItem value="CANCELLED">Cancelado</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: "150px" }}>
                  <InputLabel>Estado Pago</InputLabel>
                  <Select
                    value={filterPaymentStatus}
                    label="Estado Pago"
                    onChange={(e) => setFilterPaymentStatus(e.target.value)}
                  >
                    <MenuItem value="ALL">Todos</MenuItem>
                    <MenuItem value="PAID">Pagado</MenuItem>
                    <MenuItem value="UNPAID">No Pagado</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: "180px" }}>
                  <InputLabel>Comercio</InputLabel>
                  <Select
                    value={filterBizId}
                    label="Comercio"
                    onChange={(e) => setFilterBizId(e.target.value)}
                  >
                    <MenuItem value="ALL">Todos</MenuItem>
                    {businesses.map(b => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Desde"
                  type="date"
                  size="small"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Hasta"
                  type="date"
                  size="small"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                
                <Button 
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setFilterOrderNumber("");
                    setFilterStatus("ALL");
                    setFilterPaymentStatus("ALL");
                    setFilterBizId("ALL");
                    setFilterDateFrom("");
                    setFilterDateTo("");
                  }}
                  sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "35px" }}
                >
                  Limpiar
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Box
            height="55vh"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
              "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
              "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
            }}
          >
            <DataGrid loading={loading} rows={filteredOrders} columns={columns} getRowId={(row) => row.id} />
          </Box>
        </Box>
      ) : (
        // PANEL 2: LIQUIDACIÓN FINANCIERA (CONCILIACIÓN)
        <Box mt="20px">
          {/* Controles de Filtro */}
          <Card sx={{ backgroundColor: colors.primary[400], mb: "25px", p: "15px", border: `1px solid ${colors.grey[700]}` }}>
            <CardContent>
              <Typography variant="h5" color={colors.greenAccent[500]} gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
                Filtros de Liquidación de Caja
              </Typography>
              <Box display="flex" flexWrap="wrap" gap="20px" alignItems="center">
                <FormControl sx={{ minWidth: "220px" }}>
                  <InputLabel>Seleccionar Comercio</InputLabel>
                  <Select
                    value={selectedBizId}
                    label="Seleccionar Comercio"
                    onChange={(e) => setSelectedBizId(e.target.value)}
                  >
                    {businesses.map(b => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Comisión (%)"
                  type="number"
                  value={customCommission}
                  onChange={(e) => setCustomCommission(parseFloat(e.target.value) || 0)}
                  sx={{ width: "120px" }}
                />
                
                <TextField
                  label="Desde"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Hasta"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />

                <Box display="flex" gap="10px">
                  <Button variant="outlined" onClick={handleSetThisMonth} sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "45px" }}>Este Mes</Button>
                  <Button variant="outlined" onClick={handleSetLastMonth} sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "45px" }}>Mes Pasado</Button>
                  <Button variant="outlined" onClick={handleSetLast30Days} sx={{ color: colors.grey[100], borderColor: colors.grey[500], height: "45px" }}>30 Días</Button>
                </Box>

                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<PictureAsPdfIcon />}
                  onClick={handlePrintPDF}
                  sx={{ 
                    backgroundColor: colors.greenAccent[500], 
                    color: "#000000", 
                    fontWeight: "bold",
                    height: "45px",
                    px: "25px",
                    "&:hover": { backgroundColor: colors.greenAccent[600] } 
                  }}
                >
                  Descargar Reporte PDF
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Tarjetas de Resumen Financiero */}
          <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="20px" mb="25px">
            <Card sx={{ backgroundColor: colors.primary[400], p: "10px", border: `1px solid ${colors.grey[700]}` }}>
              <CardContent>
                <Typography color={colors.grey[300]} variant="h6">Pedidos Pagados</Typography>
                <Typography variant="h3" fontWeight="bold" sx={{ mt: 1 }}>{settlement.totalPaidOrders}</Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: colors.primary[400], p: "10px", border: `1px solid ${colors.grey[700]}` }}>
              <CardContent>
                <Typography color={colors.grey[300]} variant="h6">Subtotal Tienda (Productos)</Typography>
                <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]} sx={{ mt: 1 }}>
                  ${settlement.itemsSubtotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: colors.primary[400], p: "10px", border: `1px solid ${colors.grey[700]}` }}>
              <CardContent>
                <Typography color={colors.grey[300]} variant="h6">Delivery Neto (IGO)</Typography>
                <Typography variant="h3" fontWeight="bold" color={colors.greenAccent[500]} sx={{ mt: 1 }}>
                  ${settlement.deliverySubtotal.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Tarjeta Detalle de Conciliación Neta */}
          <Card sx={{ backgroundColor: colors.primary[400], p: "20px", border: `1px solid ${colors.grey[700]}` }}>
            <CardContent>
              <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" mb="20px" display="flex" alignItems="center" gap="10px">
                <AccountBalanceWalletIcon sx={{ color: colors.greenAccent[500] }} />
                Conciliación y Balance General
              </Typography>
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="40px">
                <Box>
                  <Typography variant="h5" color={colors.greenAccent[500]} fontWeight="bold" gutterBottom>Distribución por Canales de Pago</Typography>
                  <Box display="flex" flexDirection="column" gap="10px" mt="15px">
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Recaudado IGO (Pago IGO):</Typography>
                      <Typography variant="body1" fontWeight="bold">${settlement.iGoTotal.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Recaudado Negocio (Pago Negocio):</Typography>
                      <Typography variant="body1" fontWeight="bold">${settlement.bizTotal.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body1">Recaudado Mixto (Mix):</Typography>
                      <Typography variant="body1" fontWeight="bold">${settlement.mixTotal.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>IGO debe transferir (Ventas Pago IGO):</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#4CD964">${settlement.igoOwesBizProducts.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Comisión retenida por IGO (${customCommission}%):</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#FF3B30">${settlement.commissionAmount.toFixed(2)}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Negocio debe transferir (Delivery Pago Negocio):</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#FF3B30">${settlement.bizOwesIgoDelivery.toFixed(2)}</Typography>
                    </Box>
                    <Divider sx={{ my: 0.5 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 'bold' }}>Negocio debe total (Delivery + Comisión):</Typography>
                      <Typography variant="body2" fontWeight="bold" color="#FF3B30">${(settlement.bizOwesIgoDelivery + settlement.commissionAmount).toFixed(2)}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Box display="flex" flexDirection="column" justifyContent="center" sx={{ bgcolor: "rgba(0,0,0,0.15)", p: "20px", borderRadius: "8px" }}>
                  <Typography variant="h5" color={colors.grey[200]} fontWeight="bold">RESULTADO CONCILIACIÓN</Typography>
                  <Divider sx={{ my: 1.5 }} />
                  {settlement.netOwed >= 0 ? (
                    <Box>
                      <Typography variant="h3" color="#4CD964" fontWeight="bold">IGO debe al Negocio</Typography>
                      <Typography variant="h2" fontWeight="900" sx={{ mt: 1 }} color="#4CD964">
                        ${settlement.netOwed.toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 1, fontStyle: 'italic' }}>
                        *IGO recaudó el dinero de tus productos. Debe transferir el saldo correspondiente al negocio.
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="h3" color="#FF3B30" fontWeight="bold">Negocio debe a IGO</Typography>
                      <Typography variant="h2" fontWeight="900" sx={{ mt: 1 }} color="#FF3B30">
                        ${Math.abs(settlement.netOwed).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color={colors.grey[300]} sx={{ mt: 1, fontStyle: 'italic' }}>
                        *El negocio cobró el costo de delivery en físico. Debe pagar dicho saldo de entregas a IGO.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* DIÁLOGO FLOTANTE: CORREGIR/EDITAR PEDIDO COMPLETO */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], fontWeight: "bold" }}>
          Corregir Detalles del Pedido #{selectedOrder && String(selectedOrder.orderNumber).padStart(4, "0")}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px" pt="15px">
            <TextField
              label="Dirección de Entrega"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Categoría de Pedido</InputLabel>
              <Select
                value={editCategory}
                label="Categoría de Pedido"
                onChange={(e) => setEditCategory(e.target.value)}
              >
                <MenuItem value="Comida">Comida</MenuItem>
                <MenuItem value="Mercado">Mercado</MenuItem>
                <MenuItem value="Compras">Compras</MenuItem>
                <MenuItem value="Envíos">Envíos</MenuItem>
                <MenuItem value="Salud">Salud</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Tipo de Envío (Vehículo)</InputLabel>
              <Select
                value={editShippingType}
                label="Tipo de Envío (Vehículo)"
                onChange={(e) => setEditShippingType(e.target.value)}
              >
                <MenuItem value="Moto">Moto (Envío estándar)</MenuItem>
                <MenuItem value="Carro">Carro (Envío mediano)</MenuItem>
                <MenuItem value="Pickup">Pickup (Envío pesado)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Canal de Recaudación (Pago)</InputLabel>
              <Select
                value={editPaymentRecipient}
                label="Canal de Recaudación (Pago)"
                onChange={(e) => setEditPaymentRecipient(e.target.value)}
              >
                <MenuItem value="Pago IGO">Pago IGO (Plataforma recibe)</MenuItem>
                <MenuItem value="Pago Negocio">Pago Negocio (Local recibe)</MenuItem>
                <MenuItem value="Mix">Mix (Pago mixto)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Subtotal Productos ($)"
              type="number"
              value={editTotalItems}
              onChange={(e) => handlePricingChange(parseFloat(e.target.value || 0), editDeliveryFee)}
              fullWidth
            />

            <TextField
              label="Costo de Delivery ($)"
              type="number"
              value={editDeliveryFee}
              onChange={(e) => handlePricingChange(editTotalItems, parseFloat(e.target.value || 0))}
              fullWidth
            />

            <TextField
              label="Monto Neto Total ($)"
              type="number"
              value={editTotalAmount}
              disabled
              fullWidth
              helperText="Autocalculado: Subtotal + Delivery"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={editIsPaid}
                  onChange={(e) => setEditIsPaid(e.target.checked)}
                  color="success"
                />
              }
              label={<Typography fontWeight="bold">¿Está pagado el pedido?</Typography>}
              sx={{ mt: 1 }}
            />

            <FormControl fullWidth>
              <InputLabel>Estado Logístico</InputLabel>
              <Select
                value={editStatus}
                label="Estado Logístico"
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <MenuItem value="PENDING">PENDING</MenuItem>
                <MenuItem value="PAID">PAID</MenuItem>
                <MenuItem value="PREPARING">PREPARING</MenuItem>
                <MenuItem value="ON_WAY">ON_WAY</MenuItem>
                <MenuItem value="DELIVERED">DELIVERED</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Motorizado Asignado</InputLabel>
              <Select
                value={editDeliveryUserId}
                label="Motorizado Asignado"
                onChange={(e) => setEditDeliveryUserId(e.target.value)}
              >
                <MenuItem value=""><em>Ninguno (Disponible para todos)</em></MenuItem>
                {drivers.map((driver) => (
                  <MenuItem key={driver.id} value={driver.id}>
                    {driver.fullName} ({driver.vehicle || "Sin Vehículo"})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Latitud de Entrega"
              type="number"
              value={editLat}
              onChange={(e) => setEditLat(parseFloat(e.target.value || 0))}
              fullWidth
            />

            <TextField
              label="Longitud de Entrega"
              type="number"
              value={editLng}
              onChange={(e) => setEditLng(parseFloat(e.target.value || 0))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], p: "15px 24px" }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSaveOrderEdit} variant="contained" color="secondary" sx={{ fontWeight: "bold" }}>
            Guardar Correcciones
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIÁLOGO FLOTANTE: DETALLES COMPLETOS DE ORDEN (INFORMACIÓN COMPLETA) */}
      <Dialog open={infoOpen} onClose={() => setInfoOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100], fontWeight: "bold", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" fontWeight="bold">
            Detalle Completo del Pedido #{infoOrder && String(infoOrder.orderNumber).padStart(4, "0")}
          </Typography>
          {infoOrder && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => handleDownloadPDF(infoOrder)}
              sx={{ fontWeight: "bold", textTransform: "none" }}
            >
              Descargar PDF
            </Button>
          )}
        </DialogTitle>
        <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
          {infoOrder ? (
            <Box display="flex" flexDirection="column" gap="20px" pt="15px">
              
              {/* Bloque Info del Cliente y Comercio */}
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
                <Paper variant="outlined" sx={{ p: "15px", bgcolor: "rgba(255,255,255,0.02)", borderColor: colors.grey[700] }}>
                  <Typography variant="h6" color={colors.greenAccent[500]} fontWeight="bold" mb="10px">
                    Datos del Cliente
                  </Typography>
                  <Typography variant="body1"><strong>Nombre:</strong> {infoOrder.user?.fullName || infoOrder.userIdTemp || "Cliente Anónimo"}</Typography>
                  <Typography variant="body1"><strong>Email:</strong> {infoOrder.user?.email || "N/A"}</Typography>
                  <Typography variant="body1"><strong>Teléfono:</strong> {infoOrder.user?.phoneNumber || "N/A"}</Typography>
                </Paper>

                <Paper variant="outlined" sx={{ p: "15px", bgcolor: "rgba(255,255,255,0.02)", borderColor: colors.grey[700] }}>
                  <Typography variant="h6" color={colors.greenAccent[500]} fontWeight="bold" mb="10px">
                    Datos de la Tienda
                  </Typography>
                  <Typography variant="body1"><strong>Nombre:</strong> {infoOrder.business?.name || "N/A"}</Typography>
                  <Typography variant="body1"><strong>Categoría:</strong> {infoOrder.category || "N/A"}</Typography>
                  <Typography variant="body1"><strong>Método Recaudación:</strong> {infoOrder.paymentRecipient || "Pago IGO"}</Typography>
                </Paper>
              </Box>

              {/* Bloque Logística de la Entrega */}
              <Paper variant="outlined" sx={{ p: "15px", bgcolor: "rgba(255,255,255,0.02)", borderColor: colors.grey[700] }}>
                <Typography variant="h6" color={colors.greenAccent[500]} fontWeight="bold" mb="10px">
                  Logística y Entrega
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Dirección de Envío:</strong> {infoOrder.deliveryAddress || "N/A"}
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="15px">
                  <Typography variant="body1"><strong>Despacho en:</strong> {infoOrder.shippingType || "Moto"}</Typography>
                  <Typography variant="body1"><strong>Estado Logístico:</strong> {infoOrder.status}</Typography>
                  <Typography variant="body1"><strong>Estado Pago:</strong> {infoOrder.isPaid ? "PAGADO" : "PENDIENTE"}</Typography>
                  <Typography variant="body1"><strong>Distancia Ruta:</strong> {infoOrder.distance || "N/A"}</Typography>
                  <Typography variant="body1"><strong>Coordenadas GPS:</strong> Lat: {infoOrder.deliveryLat}, Lng: {infoOrder.deliveryLong}</Typography>
                  <Typography variant="body1"><strong>Motorizado:</strong> {infoOrder.deliveryUser?.fullName || "No asignado / Disponible"}</Typography>
                </Box>
              </Paper>

              {/* Bloque Historial de Horarios (Timeline) */}
              <Paper variant="outlined" sx={{ p: "15px", bgcolor: "rgba(255,255,255,0.02)", borderColor: colors.grey[700] }}>
                <Typography variant="h6" color={colors.greenAccent[500]} fontWeight="bold" mb="10px">
                  Historial de Horarios (Desempeño)
                </Typography>
                <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="15px" mb="10px">
                  <Typography variant="body1">
                    <strong>1. Creado a las:</strong> <br />
                    {infoOrder.createdAt ? new Date(infoOrder.createdAt).toLocaleString("es-VE") : "N/A"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>2. Aceptado a las:</strong> <br />
                    {infoOrder.acceptedAt ? new Date(infoOrder.acceptedAt).toLocaleString("es-VE") : "Pendiente de aceptar"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>3. Entregado a las:</strong> <br />
                    {infoOrder.completedAt ? new Date(infoOrder.completedAt).toLocaleString("es-VE") : "En camino"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.05)" }} />
                <Box display="flex" flexDirection="column" gap="4px">
                  {infoOrder.createdAt && infoOrder.acceptedAt && (() => {
                    const diffMin = Math.round((new Date(infoOrder.acceptedAt) - new Date(infoOrder.createdAt)) / 60000);
                    return (
                      <Typography variant="body2" color={colors.grey[300]}>
                        ⏱️ <strong>Tiempo para ser tomado:</strong> {diffMin} minutos
                      </Typography>
                    );
                  })()}
                  {infoOrder.acceptedAt && infoOrder.completedAt && (() => {
                    const diffMin = Math.round((new Date(infoOrder.completedAt) - new Date(infoOrder.acceptedAt)) / 60000);
                    return (
                      <Typography variant="body2" color={colors.grey[300]}>
                        🛵 <strong>Tiempo de trayecto (Envío):</strong> {diffMin} minutos
                      </Typography>
                    );
                  })()}
                  {infoOrder.createdAt && infoOrder.completedAt && (() => {
                    const diffMin = Math.round((new Date(infoOrder.completedAt) - new Date(infoOrder.createdAt)) / 60000);
                    return (
                      <Typography variant="body2" color={colors.greenAccent[400]} sx={{ fontWeight: "bold" }}>
                        ✅ <strong>Tiempo total de entrega:</strong> {diffMin} minutos
                      </Typography>
                    );
                  })()}
                </Box>
              </Paper>

              {/* Bloque Foto de Entrega (Prueba de entrega) */}
              {infoOrder.photoUrl && (
                <Paper variant="outlined" sx={{ p: "15px", bgcolor: "rgba(255,255,255,0.02)", borderColor: colors.grey[700], display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Typography variant="h6" color={colors.greenAccent[500]} fontWeight="bold" mb="10px" width="100%">
                    Comprobante Fotográfico de Entrega
                  </Typography>
                  <Box 
                    component="img" 
                    src={infoOrder.photoUrl} 
                    alt="Comprobante de entrega"
                    sx={{ 
                      maxWidth: "100%", 
                      maxHeight: "350px", 
                      borderRadius: "8px", 
                      objectFit: "contain", 
                      boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
                      cursor: "pointer"
                    }}
                    onClick={() => window.open(infoOrder.photoUrl, "_blank")}
                  />
                  <Typography variant="caption" color={colors.grey[400]} sx={{ mt: 1 }}>
                    Haga clic en la imagen para verla en tamaño completo.
                  </Typography>
                </Paper>
              )}

              {/* Bloque Detalle de los Productos Comprados */}
              <Box>
                <Typography variant="h5" color={colors.grey[100]} fontWeight="bold" mb="10px">
                  Ítems del Pedido
                </Typography>
                <Box sx={{ border: `1px solid ${colors.grey[700]}`, borderRadius: "8px", overflow: "hidden" }}>
                  <Box display="flex" bgcolor="#1e1e1e" p="10px" sx={{ borderBottom: `1px solid ${colors.grey[700]}` }}>
                    <Typography flex={2} fontWeight="bold" color={colors.greenAccent[500]}>Producto</Typography>
                    <Typography width="80px" textAlign="center" fontWeight="bold" color={colors.greenAccent[500]}>Cant.</Typography>
                    <Typography width="100px" textAlign="right" fontWeight="bold" color={colors.greenAccent[500]}>Precio Unit.</Typography>
                    <Typography width="120px" textAlign="right" fontWeight="bold" color={colors.greenAccent[500]}>Subtotal</Typography>
                  </Box>
                  
                  {infoOrder.items && infoOrder.items.length > 0 ? (
                    infoOrder.items.map((item, idx) => {
                      const imageUrl = item.product?.images?.[0]?.url || item.product?.images?.[0] || "";
                      const secureUrl = typeof imageUrl === "string" ? imageUrl : imageUrl?.url || "";
                      
                      return (
                        <Box key={idx} display="flex" p="10px" alignItems="center" sx={{ borderBottom: idx < infoOrder.items.length - 1 ? `1px solid ${colors.grey[800]}` : "none", bgcolor: "rgba(255,255,255,0.01)" }}>
                          
                          <Box flex={2} display="flex" alignItems="center">
                            {secureUrl ? (
                              <Box
                                component="img"
                                src={secureUrl}
                                sx={{ width: 40, height: 40, borderRadius: "4px", objectFit: "cover", mr: 2 }}
                              />
                            ) : (
                              <Box sx={{ width: 40, height: 40, borderRadius: "4px", bgcolor: colors.primary[500], display: "flex", alignItems: "center", justifyContent: "center", mr: 2 }}>
                                <StorefrontIcon sx={{ color: colors.grey[400], fontSize: "20px" }} />
                              </Box>
                            )}
                            <Box>
                              <Typography fontWeight="bold">{item.product?.title || "Producto"}</Typography>
                              {item.selectedOptionsText && item.selectedOptionsText !== 'Sin adicionales' && (
                                <Typography variant="body2" color={colors.grey[300]} sx={{ fontStyle: "italic" }}>
                                  ↳ Opciones: {item.selectedOptionsText}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Typography width="80px" textAlign="center">{item.quantity}</Typography>
                          <Typography width="100px" textAlign="right">${parseFloat(item.price).toFixed(2)}</Typography>
                          <Typography width="120px" textAlign="right" fontWeight="bold">${(item.price * item.quantity).toFixed(2)}</Typography>
                        </Box>
                      );
                    })
                  ) : (
                    <Box p="20px" textAlign="center">
                      <Typography color={colors.grey[400]}>No hay productos en esta orden.</Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Cuadro de Totales */}
              <Box display="flex" justifyContent="flex-end" mt="10px">
                <Box width="300px" display="flex" flexDirection="column" gap="8px">
                  <Box display="flex" justifyContent="space-between">
                    <Typography color={colors.grey[300]}>Subtotal Productos:</Typography>
                    <Typography fontWeight="bold">${parseFloat(infoOrder.totalItemsPrice || (infoOrder.totalAmount - infoOrder.deliveryFee)).toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography color={colors.grey[300]}>Costo de Envío:</Typography>
                    <Typography fontWeight="bold">${parseFloat(infoOrder.deliveryFee).toFixed(2)}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" sx={{ borderTop: `1px solid ${colors.greenAccent[500]}`, pt: "8px", mt: "4px" }}>
                    <Typography variant="h5" fontWeight="bold" color={colors.greenAccent[500]}>Total a Pagar:</Typography>
                    <Typography variant="h5" fontWeight="bold" color={colors.greenAccent[500]}>${parseFloat(infoOrder.totalAmount).toFixed(2)}</Typography>
                  </Box>
                </Box>
              </Box>

            </Box>
          ) : (
            <CircularProgress />
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: colors.primary[400], pb: 3, pr: 3 }}>
          <Button onClick={() => setInfoOpen(false)} color="inherit" variant="outlined">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Invoices;
