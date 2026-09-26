import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  useTheme,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
} from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import MapPicker from "../../components/MapPicker";
import {
  getBusinesses,
  createBusiness,
  updateBusiness,
  getCategories,
  getBusinessByOwner,
  uploadBusinessImage,
  getUsers,
  deleteBusiness,
} from "../../services/api";

const VENEZUELAN_BANKS = [
  { code: "0102", name: "0102 - Banco de Venezuela" },
  { code: "0134", name: "0134 - Banesco" },
  { code: "0105", name: "0105 - Banco Mercantil" },
  { code: "0108", name: "0108 - BBVA Provincial" },
  { code: "0172", name: "0172 - Bancamiga" },
  { code: "0191", name: "0191 - Banco Nacional de Crédito (BNC)" },
  { code: "0114", name: "0114 - Bancaribe" },
  { code: "0116", name: "0116 - Banco Occidental de Descuento (BOD/BNC)" },
  { code: "0138", name: "0138 - Banco Plaza" },
  { code: "0151", name: "0151 - BFC Banco Fondo Común" },
  { code: "0156", name: "0156 - 100% Banco" },
  { code: "0171", name: "0171 - Banco Activo" },
  { code: "0175", name: "0175 - Banco Bicentenario" },
  { code: "0177", name: "0177 - BANFANB" },
];

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
  const [legalName, setLegalName] = useState("");
  const [rif, setRif] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [latitude, setLatitude] = useState(10.6596);
  const [longitude, setLongitude] = useState(-71.6092);
  const [openTime, setOpenTime] = useState("08:00");
  const [closeTime, setCloseTime] = useState("22:00");
  const [imageUrl, setImageUrl] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [commissionPercentage, setCommissionPercentage] = useState(10);
  const [isActive, setIsActive] = useState(true);

  // Pago Móvil fields
  const [paymentBank, setPaymentBank] = useState("0102 - Banco de Venezuela");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentAccountName, setPaymentAccountName] = useState("");

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
          getCategories().catch(() => ({ data: [] })),
        ]);

        setCategories(catsRes.data);

        if (isBusiness) {
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
          const [bizsRes, usersRes] = await Promise.all([
            getBusinesses().catch(() => ({ data: [] })),
            getUsers().catch(() => ({ data: [] })),
          ]);
          setBusinessesList(bizsRes.data);
          setUsers(usersRes.data);

          if (businessId) {
            const activeBiz = bizsRes.data.find((b) => b.id === businessId);
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
    setLegalName(biz.legalName || "");
    setRif(biz.rif || "");
    setCategoryId(biz.category?.id || "");
    setLatitude(biz.latitude !== undefined && biz.latitude !== null ? biz.latitude : 10.6596);
    setLongitude(biz.longitude !== undefined && biz.longitude !== null ? biz.longitude : -71.6092);
    setOpenTime(biz.openTime || "08:00");
    setCloseTime(biz.closeTime || "22:00");
    setOwnerId(biz.ownerId || "");
    setCommissionPercentage(biz.commissionPercentage !== undefined ? biz.commissionPercentage : 10);
    setIsActive(biz.isActive !== undefined ? biz.isActive : true);

    setPaymentBank(biz.paymentBank || "0102 - Banco de Venezuela");
    setPaymentPhone(biz.paymentPhone || "");
    setPaymentId(biz.paymentId || "");
    setPaymentAccountName(biz.paymentAccountName || "");

    if (biz.images && biz.images.length > 0) {
      setImageUrl(biz.images[0].url || "");
    } else {
      setImageUrl("");
    }
  };

  const handleSelectBusiness = (id) => {
    const selected = businessesList.find((b) => b.id === id);
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
      legalName,
      rif,
      categoryId,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      openTime,
      closeTime,
      images: imageUrl ? [imageUrl] : [],
      ownerId: ownerId || null,
      commissionPercentage: parseFloat(commissionPercentage),
      isActive,
      paymentBank,
      paymentPhone,
      paymentId,
      paymentAccountName,
    };

    if (isBusiness) {
      payload.ownerId = user.id;
    }

    try {
      if (businessId) {
        const res = await updateBusiness(businessId, payload);
        populateFields(res.data);
        setSuccess("Comercio y datos de pago actualizados correctamente.");
      } else {
        const res = await createBusiness(payload);
        const newId = res.data.id;
        localStorage.setItem(storageKey, newId);
        setBusinessId(newId);
        populateFields(res.data);
        setSuccess("Comercio registrado y configurado con éxito.");
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
    setLegalName("");
    setRif("");
    setCategoryId("");
    setLatitude(10.6596);
    setLongitude(-71.6092);
    setOpenTime("08:00");
    setCloseTime("22:00");
    setImageUrl("");
    setOwnerId("");
    setPaymentBank("0102 - Banco de Venezuela");
    setPaymentPhone("");
    setPaymentId("");
    setPaymentAccountName("");
    setSuccess("Se ha desvinculado el comercio activo.");
  };

  const handleDeleteBusiness = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas eliminar este comercio permanentemente? Esto también eliminará todos sus productos asociados."
      )
    )
      return;
    try {
      setSubmitting(true);
      await deleteBusiness(businessId);
      handleDisconnect();
      setSuccess("Comercio eliminado con éxito.");

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
        title="GESTIÓN DE COMERCIO"
        subtitle={businessId ? `Configuración de ${name || "Establecimiento"}` : "Registra o asocia tu comercio"}
      />

      <Box display="flex" flexDirection="column" gap="20px" maxWidth="900px" mt="20px">
        {success && <Alert severity="success" sx={{ bgcolor: "#1b2c1b", color: "#88ff88" }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ bgcolor: "#2a1515", color: "#ff8888" }}>{error}</Alert>}

        {/* Panel selector para Administradores */}
        {!businessId && isAdmin && (
          <Paper elevation={3} sx={{ p: "20px", bgcolor: colors.primary[400], mb: "20px", border: `1px solid ${colors.grey[700]}` }}>
            <Typography variant="h5" color={colors.grey[100]} gutterBottom fontWeight="bold">
              Seleccionar Comercio Existente
            </Typography>
            <Typography variant="body2" color={colors.grey[300]} sx={{ mb: "15px" }}>
              Selecciona un comercio existente para editarlo o llena el formulario siguiente para crear uno nuevo:
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
                      {b.name} ({b.legalName || "Sin razón social"}) - {b.isActive === false ? "🔴 SUSPENDIDO" : "🟢 ACTIVO"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
        )}

        {/* Formulario Principal */}
        <Paper elevation={3} sx={{ p: "30px", bgcolor: colors.primary[400], border: `1px solid ${colors.greenAccent[600]}` }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px" flexWrap="wrap" gap="10px">
            <Box>
              <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
                {businessId ? "Detalles del Comercio" : "Registrar Nuevo Comercio"}
              </Typography>
              <Typography variant="caption" color={colors.grey[400]}>
                Completa los datos jurídicos, bancarios y ubicación geográfica
              </Typography>
            </Box>

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
              {/* SECCIÓN 1: DATOS GENERALES Y JURÍDICOS */}
              <Box sx={{ gridColumn: "span 2" }}>
                <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold" sx={{ mb: 1 }}>
                  🏢 1. Datos del Comercio y Fiscales
                </Typography>
                <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />
              </Box>

              <TextField
                label="Nombre Comercial (Visible para clientes)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                placeholder="Ej: Hamburguesas El Catire"
              />

              <TextField
                label="Razón Social / Nombre Jurídico"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                fullWidth
                placeholder="Ej: Inversiones El Catire C.A."
              />

              <TextField
                label="RIF de la Empresa"
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                fullWidth
                placeholder="Ej: J-12345678-0"
              />

              <FormControl fullWidth required>
                <InputLabel>Categoría Principal</InputLabel>
                <Select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  label="Categoría Principal"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                      .filter((u) => u.roles?.includes("business") || u.roles?.includes("bussiness"))
                      .map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              )}

              {/* SECCIÓN 2: DATOS DE PAGO MÓVIL DIRECTO */}
              <Box sx={{ gridColumn: "span 2", mt: 2 }}>
                <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold" sx={{ mb: 1 }}>
                  💳 2. Datos de Pago Móvil de la Tienda (Donde pagan los clientes)
                </Typography>
                <Typography variant="body2" color={colors.grey[400]} sx={{ mb: 1 }}>
                  Los clientes pagarán directamente a esta cuenta antes de verificar su compra.
                </Typography>
                <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />
              </Box>

              <FormControl fullWidth>
                <InputLabel>Banco Destino</InputLabel>
                <Select
                  value={paymentBank}
                  onChange={(e) => setPaymentBank(e.target.value)}
                  label="Banco Destino"
                >
                  {VENEZUELAN_BANKS.map((b) => (
                    <MenuItem key={b.code} value={`${b.code} - ${b.name.split("- ")[1]}`}>
                      {b.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Teléfono para Pago Móvil"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                placeholder="Ej: 04121234567"
                fullWidth
              />

              <TextField
                label="Cédula o RIF del Pago Móvil"
                value={paymentId}
                onChange={(e) => setPaymentId(e.target.value)}
                placeholder="Ej: V-12345678 o J-123456780"
                fullWidth
              />

              <TextField
                label="Nombre del Titular de la Cuenta"
                value={paymentAccountName}
                onChange={(e) => setPaymentAccountName(e.target.value)}
                placeholder="Ej: Inversiones El Catire"
                fullWidth
              />

              {/* SECCIÓN 3: UBICACIÓN EN EL MAPA INTERACTIVO */}
              <Box sx={{ gridColumn: "span 2", mt: 2 }}>
                <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold" sx={{ mb: 1 }}>
                  🗺️ 3. Ubicación del Establecimiento (Pin en el Mapa)
                </Typography>
                <Typography variant="body2" color={colors.grey[400]} sx={{ mb: 2 }}>
                  Toca o arrastra el marcador rojo exactamente sobre el local comercial en el mapa:
                </Typography>

                <MapPicker
                  latitude={latitude}
                  longitude={longitude}
                  height="340px"
                  onChange={({ latitude: newLat, longitude: newLng }) => {
                    setLatitude(newLat);
                    setLongitude(newLng);
                  }}
                />
              </Box>

              {/* SECCIÓN 4: HORARIOS, IMÁGENES Y CONFIGURACIÓN ADMIN */}
              <Box sx={{ gridColumn: "span 2", mt: 2 }}>
                <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold" sx={{ mb: 1 }}>
                  ⚙️ 4. Horarios y Estado
                </Typography>
                <Divider sx={{ mb: 2, borderColor: "rgba(255,255,255,0.1)" }} />
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

              <Box display="flex" gap="15px" alignItems="center" sx={{ gridColumn: "span 2" }}>
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

              {isAdmin && (
                <>
                  <TextField
                    label="Comisión a Igo (%)"
                    type="number"
                    value={commissionPercentage}
                    onChange={(e) => setCommissionPercentage(e.target.value)}
                    helperText="Porcentaje de comisión que la tienda adeuda a la plataforma por cada venta"
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        color="success"
                      />
                    }
                    label={
                      <Typography fontWeight="bold" color={isActive ? colors.greenAccent[400] : colors.redAccent[400]}>
                        {isActive ? "🟢 Comercio Activo" : "🔴 Comercio Suspendido / Inactivo (Bloqueado por deuda)"}
                      </Typography>
                    }
                  />
                </>
              )}

              {/* Botón de Guardar */}
              <Box sx={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", mt: "20px" }}>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="contained"
                  sx={{
                    bgcolor: colors.greenAccent[500],
                    color: "#000",
                    fontWeight: "bold",
                    px: "35px",
                    py: "12px",
                    fontSize: "1rem",
                    "&:hover": { bgcolor: colors.greenAccent[600] },
                  }}
                >
                  {submitting ? "Guardando..." : businessId ? "Actualizar Comercio y Ubicación" : "Registrar Comercio"}
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
