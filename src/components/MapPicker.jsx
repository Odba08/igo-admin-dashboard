import React, { useState, useEffect } from "react";
import { Box, Typography, Button, TextField } from "@mui/material";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";

// Corregir icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Componente para capturar clics en el mapa
function LocationMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
        },
      }}
    />
  );
}

// Componente para centrar el mapa cuando cambia la posición externamente
function RecenterMap({ position }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);
  return null;
}

export default function MapPicker({ latitude, longitude, onChange, height = "320px" }) {
  // Coordenadas por defecto (Maracaibo / Venezuela si no hay)
  const defaultLat = latitude ? parseFloat(latitude) : 10.6596;
  const defaultLng = longitude ? parseFloat(longitude) : -71.6092;

  const [position, setPosition] = useState([defaultLat, defaultLng]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([parseFloat(latitude), parseFloat(longitude)]);
    }
  }, [latitude, longitude]);

  const handlePositionChange = (newPos) => {
    setPosition(newPos);
    if (onChange) {
      onChange({
        latitude: parseFloat(newPos[0].toFixed(6)),
        longitude: parseFloat(newPos[1].toFixed(6)),
      });
    }
  };

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const current = [pos.coords.latitude, pos.coords.longitude];
          handlePositionChange(current);
        },
        (err) => {
          console.warn("Error obteniendo geolocalización:", err);
          alert("No se pudo obtener la ubicación GPS automática. Puedes hacer clic en el mapa para marcarla.");
        }
      );
    }
  };

  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const first = data[0];
        const newPos = [parseFloat(first.lat), parseFloat(first.lon)];
        handlePositionChange(newPos);
      } else {
        alert("No se encontraron resultados para esa dirección. Intenta con otra o haz clic directo en el mapa.");
      }
    } catch (err) {
      console.error("Error buscando dirección:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <Box sx={{ width: "100%", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
      {/* Barra superior de ayuda y búsqueda */}
      <Box
        sx={{
          p: "10px 15px",
          bgcolor: "#1a202c",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <Typography variant="body2" color="#a0aec0" fontWeight="500">
          📍 Haz clic o arrastra el marcador rojo al punto exacto de tu local
        </Typography>

        <Box display="flex" gap="10px" alignItems="center">
          <Button
            size="small"
            variant="contained"
            color="secondary"
            startIcon={<MyLocationIcon />}
            onClick={handleGetCurrentLocation}
            sx={{ textTransform: "none", fontSize: "0.8rem", fontWeight: "bold" }}
          >
            Mi Ubicación GPS
          </Button>
        </Box>
      </Box>

      {/* Buscador de dirección */}
      <Box
        component="form"
        onSubmit={handleSearchAddress}
        sx={{
          p: "8px 15px",
          bgcolor: "#242d3d",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Buscar calle, avenida, ciudad o referencia..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
          sx={{
            "& .MuiInputBase-input": { color: "#fff", fontSize: "0.85rem", py: "6px" },
            "& .MuiOutlinedInput-root": { bgcolor: "#171f2a" },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={searching}
          startIcon={<SearchIcon />}
          sx={{ textTransform: "none", py: "5px", px: "15px", whiteSpace: "nowrap" }}
        >
          {searching ? "Buscando..." : "Buscar"}
        </Button>
      </Box>

      {/* Mapa interactivo */}
      <Box sx={{ height, width: "100%", position: "relative" }}>
        <MapContainer
          center={position}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={handlePositionChange} />
          <RecenterMap position={position} />
        </MapContainer>
      </Box>

      {/* Coordenadas en tiempo real */}
      <Box sx={{ p: "8px 15px", bgcolor: "#1a202c", display: "flex", justifyContent: "space-between" }}>
        <Typography variant="caption" color="#718096">
          Latitud: <strong style={{ color: "#48bb78" }}>{position[0]?.toFixed(6)}</strong> | Longitud:{" "}
          <strong style={{ color: "#48bb78" }}>{position[1]?.toFixed(6)}</strong>
        </Typography>
        <Typography variant="caption" color="#a0aec0">
          Ubicación guardada automáticamente
        </Typography>
      </Box>
    </Box>
  );
}
