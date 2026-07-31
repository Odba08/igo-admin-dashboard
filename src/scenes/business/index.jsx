import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, useTheme, Paper, MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getBusinesses, createBusiness, updateBusiness, getCategories, getBusinessByOwner, uploadBusinessImage, getUsers, deleteBusiness } from "../../services/api";

const BusinessManage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || "default";
  const storageKey = `myBusinessId_${userId}`;

  const [businessId, setBusinessId] = useState(localStorage.getItem(storageKey) || "");
  const [businessesList, setBusinessesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Business fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [latitude, setLatitude] = useState(10.6596);
  const [longitude, setLongitude] = useState(-71.6092);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [imageUrl, setImageUrl] = useState("");
  const [ownerId, setOwnerId] = useState("");

  const isAdmin = user?.roles?.includes("admin");
  const isBusiness = user?.roles?.includes("bussiness") || user?.roles?.includes("business");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    setError("");
    setSuccess("");
    try {
      const res = await uploadBusinessImage(formData);
      setImageUrl(res.data.secureUrl);
      setSuccess("Imagen del comercio subida correctamente.");
    } catch (err) {
      setError("Error al subir la imagen del comercio.");
    } finally {
      setUploadingImage(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catsRes] = await Promise.all([
          getCategories().catch(() => ({ data: [] }))
        ]);
        
        setCategories(catsRes.data);

        if (isBusiness) {
          // Si es comerciante, cargamos estrictamente su negocio por ownerId
          const ownerBizRes = await getBusinessByOwner(user.id).catch(() => null);
          if (ownerBizRes && ownerBizRes.data) {
            const biz = ownerBizRes.data;
            localStorage.setItem(storageKey, biz.id);
            setBusinessId(biz.id);
            populateFields(biz);
          } else {
            localStorage.removeItem(storageKey);
            setBusinessId("");
          }
        } else {
          // Administrador ve todos los comercios y carga usuarios
          const [bizsRes, usersRes] = await Promise.all([
            getBusinesses().catch(() => ({ data: [] })),
            getUsers().catch(() => ({ data: [] }))
          ]);
          setBusinessesList(bizsRes.data);
          setUsers(usersRes.data);

          if (businessId) {
            const activeBiz = bizsRes.data.find(b => b.id === businessId);
            if (activeBiz) {
              populateFields(activeBiz);
            } else {
              localStorage.removeItem(storageKey);
              setBusinessId("");
            }
          }
        }
      } catch (err) {
        console.error("Error fetching business data:", err);
        setError("Error al cargar la información.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const populateFields = (biz) => {
    setName(biz.name || "");
    setCategoryId(biz.category?.id || "");
    setLatitude(biz.latitude || 10.6596);
    setLongitude(biz.longitude || -71.6092);
    setOpenTime(biz.openTime || "08:00");
    setCloseTime(biz.closeTime || "22:00");
    setOwnerId(biz.ownerId || "");
    if (biz.images && biz.images.length > 0) {
      setImageUrl(biz.images[0].url || "");
    } else {
      setImageUrl("");
    }
  };

  const handleSelectBusiness = (id) => {
    const selected = businessesList.find(b => b.id === id);
    if (selected) {
      localStorage.setItem(storageKey, id);
      setBusinessId(id);
      populateFields(selected);
      setSuccess("Comercio seleccionado correctamente.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    const payload = {
      name,
      categoryId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      openTime,
      closeTime,
      images: imageUrl ? [imageUrl] : [],
      ownerId: ownerId || null
    };

    if (isBusiness) {
      payload.ownerId = user.id;
    }

    try {
      if (businessId) {
        // Update existing business
        const res = await updateBusiness(businessId, payload);
        populateFields(res.data);
        setSuccess("Comercio actualizado correctamente.");
      } else {
        // Create new business
        const res = await createBusiness(payload);
        const newId = res.data.id;
        localStorage.setItem(storageKey, newId);
        setBusinessId(newId);
        populateFields(res.data);
        setSuccess("Comercio registrado y configurado correctamente.");
      }
    } catch (err) {
      console.error("Error saving business:", err);
      setError(err.response?.data?.message || "Error al guardar el comercio.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(storageKey);
    setBusinessId("");
    setName("");
    setCategoryId("");
    setLatitude(10.6596);
    setLongitude(-71.6092);
    setOpenTime("08:00");
    setCloseTime("22:00");
    setImageUrl("");
    setOwnerId("");
    setSuccess("Se ha desvinculado el comercio activo.");
  };

  const handleDeleteBusiness = async () => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este comercio permanentemente? Esto también eliminará todos sus productos asociados.")) return;
    try {
      setSubmitting(true);
      await deleteBusiness(businessId);
      localStorage.removeItem(storageKey);
      setBusinessId("");
      setName("");
      setCategoryId("");
      setLatitude(10.6596);
      setLongitude(-71.6092);
      setOpenTime("08:00");
      setCloseTime("22:00");
      setImageUrl("");
      setOwnerId("");
      setSuccess("Comercio eliminado con éxito.");
      
      // Refresh business list
      const bizsRes = await getBusinesses().catch(() => ({ data: [] }));
      setBusinessesList(bizsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al eliminar el comercio.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="70vh">
        <CircularProgress sx={{ color: colors.greenAccent[500] }} />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header 
        title="MI COMERCIO" 
        subtitle={businessId ? "Gestiona los detalles de tu establecimiento" : "Asocia o registra tu comercio"} 
      />

      <Box display="flex" flexDirection="column" gap="20px" maxWidth="800px" mt="20px">
        {success && <Alert severity="success" sx={{ bgcolor: "#1b2c1b", color: "#88ff88" }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ bgcolor: "#2a1515", color: "#ff8888" }}>{error}</Alert>}

        {/* Selection panel if no business is linked */}
        {!businessId && isAdmin && (
          <Paper elevation={3} sx={{ p: "20px", bgcolor: colors.primary[400], mb: "20px", border: `1px solid ${colors.grey[700]}` }}>
            <Typography variant="h5" color={colors.grey[100]} gutterBottom fontWeight="bold">
              Seleccionar Comercio Existente
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} sx={{ mb: "15px" }}>
              Si tu comercio ya fue creado por un administrador, selecciónalo aquí para empezar a gestionarlo:
            </Typography>
            
            <Box display="flex" gap="15px" alignItems="center">
              <FormControl fullWidth size="small">
                <InputLabel sx={{ color: colors.grey[300] }}>Seleccionar Establecimiento</InputLabel>
                <Select
                  value=""
                  onChange={(e) => handleSelectBusiness(e.target.value)}
                  label="Seleccionar Establecimiento"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.grey[600] },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.greenAccent[500] },
                  }}
                >
                  {businessesList.map((b) => (
                    <MenuItem key={b.id} value={b.id}>
                      {b.name} ({b.category?.name || "Sin Categoría"})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        )}

        {/* Main form to create or edit business */}
        <Paper elevation={3} sx={{ p: "30px", bgcolor: colors.primary[400], border: `1px solid ${colors.greenAccent[600]}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
            <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
              {businessId ? "Detalles del Comercio" : "Registrar Nuevo Comercio"}
            </Typography>
            {businessId && isAdmin && (
              <Box display="flex" gap="10px">
                <Button 
                  variant="outlined" 
                  color="error" 
                  onClick={handleDeleteBusiness}
                  sx={{ border: `1px solid ${colors.redAccent[500]}`, color: colors.redAccent[400] }}
                >
                  Eliminar Comercio
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  onClick={handleDisconnect}
                  sx={{ border: `1px solid ${colors.grey[500]}`, color: colors.grey[300] }}
                >
                  Desvincular
                </Button>
              </Box>
            )}
          </Box>

          <form onSubmit={handleSave}>
            <Box display="grid" gap="20px" gridTemplateColumns="repeat(2, 1fr)">
              <TextField
                label="Nombre del Comercio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                sx={{ gridColumn: "span 2" }}
              />

              {isAdmin && (
                <FormControl fullWidth sx={{ gridColumn: "span 2" }}>
                  <InputLabel>Asociar Propietario (Comerciante)</InputLabel>
                  <Select
                    value={ownerId}
                    onChange={(e) => setOwnerId(e.target.value)}
                    label="Asociar Propietario (Comerciante)"
                  >
                    <MenuItem value=""><em>Ninguno (Sin propietario asignado)</em></MenuItem>
                    {users
                      .filter(u => u.roles?.includes("business") || u.roles?.includes("bussiness"))
                      .map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}

              <FormControl fullWidth required>
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  label="Categoría"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="URL de Imagen de Portada"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="ej: nombre_comercio.png"
                fullWidth
              />

              <Box display="flex" gap="15px" alignItems="center">
                <input
                  type="file"
                  accept="image/*"
                  id="biz-image-upload"
                  style={{ display: "none" }}
                  onChange={handleImageUpload}
                />
                <label htmlFor="biz-image-upload">
                  <Button
                    component="span"
                    variant="contained"
                    disabled={uploadingImage}
                    sx={{ backgroundColor: colors.blueAccent[600], color: "#fff", fontWeight: "bold", "&:hover": { backgroundColor: colors.blueAccent[700] } }}
                  >
                    {uploadingImage ? "Subiendo..." : "Subir Logotipo/Imagen"}
                  </Button>
                </label>
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    sx={{ width: 60, height: 60, borderRadius: "6px", objectFit: "cover", border: `2px solid ${colors.greenAccent[500]}` }}
                  />
                ) : (
                  <Typography variant="body2" color={colors.grey[300]}>Sin imagen de portada</Typography>
                )}
              </Box>

              <TextField
                label="Hora de Apertura"
                type="text"
                placeholder="08:00"
                value={openTime}
                onChange={(e) => setOpenTime(e.target.value)}
                required
              />

              <TextField
                label="Hora de Cierre"
                type="text"
                placeholder="22:00"
                value={closeTime}
                onChange={(e) => setCloseTime(e.target.value)}
                required
              />

              <TextField
                label="Latitud"
                type="number"
                inputProps={{ step: "any" }}
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
              />

              <TextField
                label="Longitud"
                type="number"
                inputProps={{ step: "any" }}
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
              />

              <Box sx={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", mt: "10px" }}>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="contained"
                  sx={{
                    bgcolor: colors.greenAccent[500],
                    color: "#000",
                    fontWeight: "bold",
                    px: "30px",
                    py: "10px",
                    "&:hover": { bgcolor: colors.greenAccent[600] }
                  }}
                >
                  {submitting ? "Guardando..." : businessId ? "Actualizar Comercio" : "Crear Comercio"}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default BusinessManage;
