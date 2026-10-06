import React, { useEffect, useRef, useState, useMemo } from "react";
import { Box, Typography, Button, Chip, Paper, useTheme } from "@mui/material";
import { tokens } from "../theme";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TwoWheelerIcon from "@mui/icons-material/TwoWheeler";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix standard Leaflet icon paths in React build
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Haversine distance calculator
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

const createCustomIcon = (bgColor, iconText) => {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background-color: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 3px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
      ">
        ${iconText}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -20],
  });
};

export default function OrderLocationMap({
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng,
  pickupAddress,
  deliveryAddress,
  activeDrivers = [],
  isEditable = false,
  onLocationChange,
  height = "320px",
}) {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

  const [currentDeliveryPos, setCurrentDeliveryPos] = useState({
    lat: parseFloat(deliveryLat) || 10.6596,
    lng: parseFloat(deliveryLng) || -71.6092,
  });

  useEffect(() => {
    if (deliveryLat && deliveryLng) {
      setCurrentDeliveryPos({
        lat: parseFloat(deliveryLat),
        lng: parseFloat(deliveryLng),
      });
    }
  }, [deliveryLat, deliveryLng]);

  // Compute nearest driver distance to pickup point or delivery point
  const referenceLat = parseFloat(pickupLat) || currentDeliveryPos.lat;
  const referenceLng = parseFloat(pickupLng) || currentDeliveryPos.lng;

  const driversWithDistance = useMemo(() => {
    return activeDrivers
      .map((d) => {
        const dist = (d.latitude && d.longitude)
          ? calculateDistanceKm(referenceLat, referenceLng, d.latitude, d.longitude)
          : null;
        return { ...d, distanceKm: dist };
      })
      .sort((a, b) => {
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
  }, [activeDrivers, referenceLat, referenceLng]);

  const nearestDriver = driversWithDistance.find((d) => d.distanceKm !== null);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = currentDeliveryPos.lat || parseFloat(pickupLat) || 10.6596;
    const initialLng = currentDeliveryPos.lng || parseFloat(pickupLng) || -71.6092;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;

      if (isEditable) {
        map.on("click", (e) => {
          const { lat, lng } = e.latlng;
          const newPos = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
          setCurrentDeliveryPos(newPos);
          if (onLocationChange) {
            onLocationChange(newPos);
          }
        });
      }
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();
    const bounds = L.latLngBounds([]);

    // 1. Pickup Marker (Punto A - Tienda / Origen)
    const validPickupLat = parseFloat(pickupLat);
    const validPickupLng = parseFloat(pickupLng);
    if (!isNaN(validPickupLat) && !isNaN(validPickupLng) && validPickupLat !== 0) {
      const pickupMarker = L.marker([validPickupLat, validPickupLng], {
        icon: createCustomIcon("#10B981", "A"),
      }).addTo(markersGroup);

      pickupMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #10B981;">🏪 Punto A (Recogida / Negocio)</strong><br/>
          <span style="font-size: 12px;">${pickupAddress || "Dirección de Origen"}</span><br/>
          <small style="color: #666;">Lat: ${validPickupLat.toFixed(5)}, Lng: ${validPickupLng.toFixed(5)}</small>
        </div>
      `);
      bounds.extend([validPickupLat, validPickupLng]);
    }

    // 2. Delivery Marker (Punto B - Destino / Cliente)
    const validDeliveryLat = currentDeliveryPos.lat;
    const validDeliveryLng = currentDeliveryPos.lng;
    if (!isNaN(validDeliveryLat) && !isNaN(validDeliveryLng) && validDeliveryLat !== 0) {
      const deliveryMarker = L.marker([validDeliveryLat, validDeliveryLng], {
        icon: createCustomIcon("#EF4444", "B"),
        draggable: Boolean(isEditable),
      }).addTo(markersGroup);

      if (isEditable) {
        deliveryMarker.on("dragend", (e) => {
          const { lat, lng } = e.target.getLatLng();
          const newPos = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
          setCurrentDeliveryPos(newPos);
          if (onLocationChange) {
            onLocationChange(newPos);
          }
        });
      }

      deliveryMarker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="color: #EF4444;">📍 Punto B (Entrega / Cliente)</strong><br/>
          <span style="font-size: 12px;">${deliveryAddress || "Dirección de Destino"}</span><br/>
          <small style="color: #666;">Lat: ${validDeliveryLat.toFixed(5)}, Lng: ${validDeliveryLng.toFixed(5)}</small>
          ${isEditable ? "<br/><b style='color: #F59E0B;'>ℹ️ Arrastra este marcador o haz clic en el mapa para corregir la ubicación.</b>" : ""}
        </div>
      `);
      bounds.extend([validDeliveryLat, validDeliveryLng]);
    }

    // 3. Polyline between Point A and Point B
    if (
      !isNaN(validPickupLat) && !isNaN(validPickupLng) && validPickupLat !== 0 &&
      !isNaN(validDeliveryLat) && !isNaN(validDeliveryLng) && validDeliveryLat !== 0
    ) {
      L.polyline(
        [
          [validPickupLat, validPickupLng],
          [validDeliveryLat, validDeliveryLng],
        ],
        { color: "#3B82F6", weight: 4, opacity: 0.8, dashArray: "6, 8" }
      ).addTo(markersGroup);
    }

    // 4. Active Drivers Markers
    driversWithDistance.forEach((driver) => {
      if (driver.latitude && driver.longitude) {
        const driverMarker = L.marker([driver.latitude, driver.longitude], {
          icon: createCustomIcon("#FCD116", "🛵"),
        }).addTo(markersGroup);

        const distText = driver.distanceKm !== null ? `A <strong>${driver.distanceKm} km</strong> del pedido` : "Posición en vivo";

        driverMarker.bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong style="color: #111;">🛵 ${driver.name || driver.fullName || "Repartidor"}</strong><br/>
            <span style="font-size: 12px; color: #10B981; font-weight: bold;">${distText}</span><br/>
            <small style="color: #666;">Vehículo: ${driver.vehicle || "Moto"}</small><br/>
            <small style="color: #888;">Tel: ${driver.phone || driver.phoneNumber || "N/A"}</small>
          </div>
        `);
        bounds.extend([driver.latitude, driver.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [currentDeliveryPos, pickupLat, pickupLng, pickupAddress, deliveryAddress, driversWithDistance, isEditable, onLocationChange]);

  const handleCenterOrigin = () => {
    if (mapInstanceRef.current && pickupLat && pickupLng) {
      mapInstanceRef.current.setView([parseFloat(pickupLat), parseFloat(pickupLng)], 16);
    }
  };

  const handleCenterDestination = () => {
    if (mapInstanceRef.current && currentDeliveryPos.lat && currentDeliveryPos.lng) {
      mapInstanceRef.current.setView([currentDeliveryPos.lat, currentDeliveryPos.lng], 16);
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${pickupLat || currentDeliveryPos.lat},${pickupLng || currentDeliveryPos.lng}&destination=${currentDeliveryPos.lat},${currentDeliveryPos.lng}`;

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Map Header Toolbar with Coordinates & Proximity Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="8px">
        <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
          <Chip
            icon={<StorefrontIcon sx={{ fontSize: "16px !important", color: "#10B981 !important" }} />}
            label={`Punto A: ${pickupAddress?.substring(0, 25) || "Origen"}`}
            size="small"
            sx={{ bgcolor: "rgba(16, 185, 129, 0.15)", color: colors.grey[100], fontWeight: "bold" }}
          />
          <Chip
            icon={<LocationOnIcon sx={{ fontSize: "16px !important", color: "#EF4444 !important" }} />}
            label={`Punto B: Lat ${currentDeliveryPos.lat?.toFixed(4)}, Lng ${currentDeliveryPos.lng?.toFixed(4)}`}
            size="small"
            sx={{ bgcolor: "rgba(239, 68, 68, 0.15)", color: colors.grey[100], fontWeight: "bold" }}
          />
          {nearestDriver && (
            <Chip
              icon={<TwoWheelerIcon sx={{ fontSize: "16px !important", color: "#FCD116 !important" }} />}
              label={`Motorizado más cercano: ${nearestDriver.name?.split(" ")[0]} (${nearestDriver.distanceKm} km)`}
              size="small"
              sx={{ bgcolor: "rgba(252, 209, 22, 0.2)", color: "#FCD116", fontWeight: "bold" }}
            />
          )}
        </Box>

        <Box display="flex" gap="6px">
          {pickupLat && pickupLng && (
            <Button
              size="small"
              variant="outlined"
              onClick={handleCenterOrigin}
              sx={{ fontSize: "11px", py: "2px", px: "8px", textTransform: "none", color: "#10B981", borderColor: "#10B981" }}
            >
              Ver Origen
            </Button>
          )}
          <Button
            size="small"
            variant="outlined"
            onClick={handleCenterDestination}
            sx={{ fontSize: "11px", py: "2px", px: "8px", textTransform: "none", color: colors.blueAccent[400], borderColor: colors.blueAccent[400] }}
          >
            Ver Destino
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => window.open(googleMapsUrl, "_blank")}
            startIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
            sx={{ fontSize: "11px", py: "2px", px: "8px", textTransform: "none", bgcolor: colors.grey[700], color: "#fff" }}
          >
            Google Maps
          </Button>
        </Box>
      </Box>

      {/* Map Container */}
      <Box
        sx={{
          width: "100%",
          height: height,
          borderRadius: "8px",
          overflow: "hidden",
          border: `1px solid ${colors.grey[700]}`,
          position: "relative",
        }}
      >
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
        {isEditable && (
          <Paper
            elevation={3}
            sx={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              zIndex: 1000,
              p: "6px 12px",
              bgcolor: "rgba(0,0,0,0.85)",
              color: "#fff",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography variant="caption" fontWeight="bold" color={colors.greenAccent[400]}>
              💡 Haz clic en cualquier calle o arrastra el marcador rojo <b>(B)</b> para reubicar la entrega.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
