import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StorefrontIcon from "@mui/icons-material/Storefront";
import Header from "../../components/Header";
import StatBox from "../../components/StatBox";
import { getOrders, getUsers, getBusinesses, getProducts } from "../../services/api";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [orders, setOrders] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [businessesCount, setBusinessesCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, usersRes, bizRes] = await Promise.allSettled([
        getOrders(),
        getUsers(),
        getBusinesses(),
        getProducts()
      ]);

      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value.data || []);
      if (usersRes.status === "fulfilled") setUsersCount(usersRes.value.data?.length || 0);
      if (bizRes.status === "fulfilled") setBusinessesCount(bizRes.value.data?.length || 0);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Refresco automático de ventas y estado de órdenes cada 10s
    return () => clearInterval(interval);
  }, []);

  const totalSales = orders.reduce((sum, o) => sum + (parseFloat(o.totalAmount) || 0), 0);

  // Calcular rendimiento por comercio
  const businessEarnings = orders.reduce((acc, o) => {
    if (!o.isPaid || !o.business) return acc;
    const bizId = o.business.id;
    const bizName = o.business.name;
    const itemsTotal = parseFloat(o.totalItems) || 0;
    const commissionPct = parseFloat(o.business.commissionPercentage) || 10.0;
    const commissionEarned = itemsTotal * (commissionPct / 100);
    
    if (!acc[bizId]) {
      acc[bizId] = {
        id: bizId,
        name: bizName,
        totalSales: 0,
        netProductSales: 0,
        commissionPaid: 0,
        orderCount: 0
      };
    }
    acc[bizId].totalSales += parseFloat(o.totalAmount) || 0;
    acc[bizId].netProductSales += itemsTotal;
    acc[bizId].commissionPaid += commissionEarned;
    acc[bizId].orderCount += 1;
    return acc;
  }, {});

  const businessEarningsList = Object.values(businessEarnings).sort((a, b) => b.totalSales - a.totalSales);

  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PANEL PRINCIPAL" subtitle="Métricas en vivo de Igo Lat" />
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 STATS */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`$${totalSales.toFixed(2)}`}
            subtitle="Ventas Totales"
            progress="0.80"
            increase="Global"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={String(orders.length)}
            subtitle="Órdenes Creadas"
            progress="0.75"
            increase="Total"
            icon={
              <ShoppingBagIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={String(usersCount)}
            subtitle="Usuarios / Trabajadores"
            progress="0.50"
            increase="Registrados"
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={String(businessesCount)}
            subtitle="Comercios Locales"
            progress="0.90"
            increase="Activos"
            icon={
              <StorefrontIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* RENDIMIENTO FINANCIERO POR NEGOCIO */}
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
          p="20px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Rendimiento Financiero por Comercio (Pagos)
            </Typography>
          </Box>
          {businessEarningsList.map((biz) => (
            <Box
              key={biz.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`1px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="600">
                  {biz.name}
                </Typography>
                <Typography color={colors.grey[300]} variant="body2">
                  {biz.orderCount} Pedidos Pago • Prod: ${biz.netProductSales.toFixed(2)}
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography color={colors.grey[100]} fontWeight="bold">
                  Total Brut: ${biz.totalSales.toFixed(2)}
                </Typography>
                <Typography color={colors.greenAccent[600]} variant="body2">
                  Comisión: ${biz.commissionPaid.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          ))}
          {businessEarningsList.length === 0 && (
            <Box p="30px" textAlign="center">
              <Typography color={colors.grey[300]} variant="h6" sx={{ fontStyle: "italic" }}>
                No se registran transacciones pagas aún.
              </Typography>
            </Box>
          )}
        </Box>

        {/* ROW 2 RECENT TRANSACTIONS */}
        <Box
          gridColumn="span 6"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
          overflow="auto"
          p="20px"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Últimas Órdenes de Compra Realizadas
            </Typography>
          </Box>
          {orders.map((transaction, i) => (
            <Box
              key={transaction.id || i}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`1px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  Orden #{String(transaction.orderNumber).padStart(4, "0")} - {transaction.status}
                </Typography>
                <Typography color={colors.grey[100]}>
                  {transaction.user?.fullName || transaction.userIdTemp || "Cliente Igo"}
                  {transaction.deliveryUser && ` • Motorizado: ${transaction.deliveryUser.fullName}`}
                </Typography>
              </Box>
              <Box color={colors.grey[100]}>
                {new Date(transaction.createdAt).toLocaleDateString()}
              </Box>
              <Box
                backgroundColor={colors.greenAccent[500]}
                p="5px 10px"
                borderRadius="4px"
                fontWeight="bold"
              >
                ${parseFloat(transaction.totalAmount).toFixed(2)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
