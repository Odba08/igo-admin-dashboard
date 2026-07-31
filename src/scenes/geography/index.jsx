import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, useTheme, Paper, Grid, Divider, Card, CardContent, Button } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getBusinesses } from "../../services/api";

const Geography = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // States
  const [selectedRegion, setSelectedRegion] = useState("maracaibo");
  const [businesses, setBusinesses] = useState([]);
  const [leafletReady, setLeafletReady] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  // Regional simulated stats & coordinates
  const regionalData = {
    maracaibo: {
      name: "Maracaibo (Zulia)",
      coords: [10.6596, -71.6092],
      zoom: 13,
      orders: 1420,
      activeDrivers: 24,
      avgTicket: "$12.50",
      revenue: "$17,750",
      percentage: "65%",
      description: "Zona metropolitana norte, principal flujo de pedidos y restaurantes afiliados."
    },
    sanfrancisco: {
      name: "San Francisco (Zulia)",
      coords: [10.6272, -71.6425],
      zoom: 13,
      orders: 680,
      activeDrivers: 12,
      avgTicket: "$9.80",
      revenue: "$6,664",
      percentage: "31%",
      description: "Zona metropolitana sur, crecimiento constante en tiendas y farmacias."
    },
    cojedes: {
      name: "San Carlos (Cojedes)",
      coords: [9.6612, -68.5827],
      zoom: 12,
      orders: 90,
      activeDrivers: 3,
      avgTicket: "$15.20",
      revenue: "$1,368",
      percentage: "4%",
      description: "Expansión regional reciente, despachos consolidados de víveres."
    }
  };

  // 1. Fetch businesses & Load Leaflet CDN dynamically
  useEffect(() => {
    // Fetch businesses
    getBusinesses()
      .then(res => setBusinesses(res.data))
      .catch(err => console.error("Error loading businesses for map:", err));

    // Inject Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Inject Leaflet JS
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletReady(true);
      document.body.appendChild(script);
    } else {
      setLeafletReady(true);
    }

    return () => {
      // Cleanup map instance on unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 2. Initialize Leaflet Map once script is ready and element is loaded
  useEffect(() => {
    if (!leafletReady || !window.L || !mapRef.current || mapInstance.current) return;

    const L = window.L;

    // Standard Leaflet Icon fix to load correctly from CDN
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Set initial view to Maracaibo
    const initialCoords = regionalData.maracaibo.coords;
    const initialZoom = regionalData.maracaibo.zoom;

    const map = L.map(mapRef.current).setView(initialCoords, initialZoom);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leafletReady]);

  // 3. Render real business markers on the map when businesses change
  useEffect(() => {
    if (!mapInstance.current || !window.L || businesses.length === 0) return;

    const L = window.L;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Place business markers
    businesses.forEach(biz => {
      if (biz.latitude && biz.longitude) {
        const marker = L.marker([biz.latitude, biz.longitude])
          .addTo(mapInstance.current)
          .bindPopup(`
            <div style="color: #000000; font-family: sans-serif; padding: 5px;">
              <h4 style="margin: 0 0 5px 0; font-weight: bold; color: #ffb300; font-size: 14px;">${biz.name}</h4>
              <p style="margin: 0 0 4px 0; font-size: 11px;"><b>Categoría:</b> ${biz.category?.name || "Sin Categoría"}</p>
              <p style="margin: 0; font-size: 11px;"><b>Horario:</b> ${biz.openTime} - ${biz.closeTime}</p>
            </div>
          `);
        markersRef.current.push(marker);
      }
    });

  }, [businesses, leafletReady]);

  // 4. Center/Fly map to the selected region
  const handleRegionChange = (regionKey) => {
    setSelectedRegion(regionKey);
    const region = regionalData[regionKey];
    if (mapInstance.current && window.L) {
      mapInstance.current.flyTo(region.coords, region.zoom, {
        animate: true,
        duration: 1.5
      });
    }
  };

  const activeStats = regionalData[selectedRegion];

  return (
    <Box m="20px">
      <Header title="GEOLOCALIZACIÓN" subtitle="Pedidos y actividad por zonas geográficas de cobertura" />

      <Grid container spacing={3} mt="10px">
        {/* INTERACTIVE LEAFLET MAP PANEL */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={3}
            sx={{
              p: "15px",
              bgcolor: colors.primary[400],
              border: `1px solid ${colors.grey[700]}`,
              height: "65vh",
              display: "flex",
              flexDirection: "column",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb="10px" px="5px">
              <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                Mapa en Tiempo Real
              </Typography>
              <Box display="flex" gap="5px">
                <Button 
                  size="small" 
                  variant={selectedRegion === "maracaibo" ? "contained" : "outlined"} 
                  onClick={() => handleRegionChange("maracaibo")}
                  sx={{ 
                    bgcolor: selectedRegion === "maracaibo" ? colors.greenAccent[500] : "transparent",
                    color: selectedRegion === "maracaibo" ? "#000" : colors.grey[100],
                    borderColor: colors.greenAccent[500],
                    fontWeight: "bold",
                    fontSize: "11px",
                    textTransform: "none",
                    "&:hover": { bgcolor: colors.greenAccent[600] }
                  }}
                >
                  Maracaibo
                </Button>
                <Button 
                  size="small" 
                  variant={selectedRegion === "sanfrancisco" ? "contained" : "outlined"} 
                  onClick={() => handleRegionChange("sanfrancisco")}
                  sx={{ 
                    bgcolor: selectedRegion === "sanfrancisco" ? colors.greenAccent[500] : "transparent",
                    color: selectedRegion === "sanfrancisco" ? "#000" : colors.grey[100],
                    borderColor: colors.greenAccent[500],
                    fontWeight: "bold",
                    fontSize: "11px",
                    textTransform: "none",
                    "&:hover": { bgcolor: colors.greenAccent[600] }
                  }}
                >
                  San Francisco
                </Button>
                <Button 
                  size="small" 
                  variant={selectedRegion === "cojedes" ? "contained" : "outlined"} 
                  onClick={() => handleRegionChange("cojedes")}
                  sx={{ 
                    bgcolor: selectedRegion === "cojedes" ? colors.greenAccent[500] : "transparent",
                    color: selectedRegion === "cojedes" ? "#000" : colors.grey[100],
                    borderColor: colors.greenAccent[500],
                    fontWeight: "bold",
                    fontSize: "11px",
                    textTransform: "none",
                    "&:hover": { bgcolor: colors.greenAccent[600] }
                  }}
                >
                  Cojedes
                </Button>
              </Box>
            </Box>

            {/* Div for Map rendering */}
            <Box 
              ref={mapRef} 
              sx={{ 
                width: "100%", 
                flex: 1, 
                borderRadius: "8px", 
                border: `1px solid ${colors.grey[800]}`,
                zIndex: 1,
                bgcolor: "#000"
              }} 
            />
          </Paper>
        </Grid>

        {/* DETAILS PANEL */}
        <Grid item xs={12} md={5}>
          <Card
            elevation={3}
            sx={{
              bgcolor: colors.primary[400],
              border: `1px solid ${colors.greenAccent[500]}`,
              height: "65vh",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <CardContent sx={{ p: "30px", display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between" }}>
              <Box>
                <Box display="flex" alignItems="center" gap="10px" mb="15px">
                  <LocationOnIcon sx={{ color: colors.greenAccent[500], fontSize: "28px" }} />
                  <Typography variant="h3" color={colors.grey[100]} fontWeight="bold">
                    {activeStats.name}
                  </Typography>
                </Box>
                <Divider sx={{ mb: "20px", borderColor: colors.grey[700] }} />

                <Typography variant="body1" color={colors.grey[300]} paragraph>
                  {activeStats.description}
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap="15px" my="20px">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="10px">
                    <ShoppingCartIcon sx={{ color: colors.grey[300] }} />
                    <Typography variant="h5" color={colors.grey[300]}>Total Pedidos</Typography>
                  </Box>
                  <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                    {activeStats.orders} ({activeStats.percentage})
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="10px">
                    <GroupIcon sx={{ color: colors.grey[300] }} />
                    <Typography variant="h5" color={colors.grey[300]}>Repartidores Activos</Typography>
                  </Box>
                  <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                    {activeStats.activeDrivers} motorizados
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap="10px">
                    <ShowChartIcon sx={{ color: colors.grey[300] }} />
                    <Typography variant="h5" color={colors.grey[300]}>Promedio de Compra</Typography>
                  </Box>
                  <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                    {activeStats.avgTicket}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  bgcolor: "#1a1a1a",
                  p: "15px 20px",
                  borderRadius: "8px",
                  borderLeft: `5px solid ${colors.greenAccent[500]}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <Typography variant="h5" color={colors.grey[300]} fontWeight="bold">Ingresos Estimados</Typography>
                <Typography variant="h3" color={colors.greenAccent[500]} fontWeight="bold">
                  {activeStats.revenue}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Geography;
