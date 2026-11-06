import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Paper,
  Snackbar,
  Grid,
} from "@mui/material";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Header from "../../components/Header";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  seedBanners,
  uploadBannerImage,
} from "../../services/api";

const Banners = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    actionType: "NONE",
    actionUrl: "",
    infoTitle: "",
    infoContent: "",
    isActive: true,
    order: 0,
  });

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await getBanners();
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error al cargar banners:", err);
      setNotification({
        open: true,
        message: "Error al cargar la lista de banners",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleOpenCreate = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      imageUrl: "",
      actionType: "NONE",
      actionUrl: "",
      infoTitle: "",
      infoContent: "",
      isActive: true,
      order: banners.length,
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      imageUrl: banner.imageUrl || "",
      actionType: banner.actionType || "NONE",
      actionUrl: banner.actionUrl || "",
      infoTitle: banner.infoTitle || "",
      infoContent: banner.infoContent || "",
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      order: banner.order || 0,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingBanner(null);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await uploadBannerImage(uploadData);
      const secureUrl = res.data?.secureUrl || res.data?.url;

      if (secureUrl) {
        setFormData((prev) => ({ ...prev, imageUrl: secureUrl }));
        setNotification({
          open: true,
          message: "Imagen subida exitosamente",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("Error subiendo imagen de banner:", err);
      setNotification({
        open: true,
        message: "Error al subir la imagen. Intenta con otra imagen o pega una URL.",
        severity: "error",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async () => {
    if (!formData.title.trim()) {
      setNotification({
        open: true,
        message: "El título del banner es obligatorio",
        severity: "warning",
      });
      return;
    }
    if (!formData.imageUrl.trim()) {
      setNotification({
        open: true,
        message: "Debes subir una imagen o proporcionar la URL del banner",
        severity: "warning",
      });
      return;
    }

    try {
      if (editingBanner) {
        await updateBanner(editingBanner.id, formData);
        setNotification({
          open: true,
          message: "Banner actualizado exitosamente",
          severity: "success",
        });
      } else {
        await createBanner(formData);
        setNotification({
          open: true,
          message: "Banner creado exitosamente",
          severity: "success",
        });
      }
      handleCloseModal();
      loadBanners();
    } catch (err) {
      console.error("Error al guardar banner:", err);
      setNotification({
        open: true,
        message: "Ocurrió un error al guardar el banner",
        severity: "error",
      });
    }
  };

  const handleDeleteBanner = async (id, title) => {
    if (window.confirm(`¿Estás seguro de eliminar el banner "${title}"?`)) {
      try {
        await deleteBanner(id);
        setNotification({
          open: true,
          message: "Banner eliminado correctamente",
          severity: "success",
        });
        loadBanners();
      } catch (err) {
        console.error("Error al eliminar banner:", err);
        setNotification({
          open: true,
          message: "No se pudo eliminar el banner",
          severity: "error",
        });
      }
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      await updateBanner(banner.id, { isActive: !banner.isActive });
      loadBanners();
    } catch (err) {
      console.error("Error al cambiar estado:", err);
    }
  };

  const handleSeedDefaults = async () => {
    if (
      window.confirm(
        "¿Deseas restaurar los banners oficiales por defecto (IGO Store, Instagram, Tu Negocio en IGO)?"
      )
    ) {
      try {
        setLoading(true);
        await seedBanners();
        setNotification({
          open: true,
          message: "Banners oficiales restaurados exitosamente",
          severity: "success",
        });
        loadBanners();
      } catch (err) {
        console.error("Error al restaurar banners:", err);
        setNotification({
          open: true,
          message: "No se pudieron sembrar los banners por defecto",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderActionBadge = (type) => {
    switch (type) {
      case "EXTERNAL_URL":
        return (
          <Chip
            icon={<OpenInNewIcon style={{ fontSize: 16 }} />}
            label="Redirige a Enlace / Instagram"
            color="success"
            size="small"
            variant="outlined"
          />
        );
      case "INFO_MODAL":
        return (
          <Chip
            icon={<InfoOutlinedIcon style={{ fontSize: 16 }} />}
            label="Muestra Información en App"
            color="warning"
            size="small"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip
            icon={<VisibilityOffIcon style={{ fontSize: 16 }} />}
            label="Solo Mostrar (Sin Acción)"
            size="small"
            variant="outlined"
          />
        );
    }
  };

  return (
    <Box m="20px">
      {/* HEADER & TOP ACTIONS */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header
          title="BANNERS PUBLICITARIOS"
          subtitle="Administra los anuncios del slider principal en IGO Store"
        />

        <Box display="flex" gap="10px">
          <Button
            variant="outlined"
            onClick={loadBanners}
            startIcon={<RefreshIcon />}
            sx={{
              color: colors.grey[100],
              borderColor: colors.grey[400],
              "&:hover": { borderColor: colors.grey[100] },
            }}
          >
            Refrescar
          </Button>

          <Button
            variant="outlined"
            onClick={handleSeedDefaults}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              color: colors.greenAccent[300],
              borderColor: colors.greenAccent[400],
              "&:hover": { borderColor: colors.greenAccent[300] },
            }}
          >
            Restaurar Oficiales
          </Button>

          <Button
            variant="contained"
            onClick={handleOpenCreate}
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: "#fff",
              fontWeight: "bold",
              "&:hover": { backgroundColor: colors.greenAccent[700] },
            }}
          >
            Nuevo Banner
          </Button>
        </Box>
      </Box>

      {/* BANNER LIST */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="300px">
          <CircularProgress color="secondary" />
        </Box>
      ) : banners.length === 0 ? (
        <Paper
          sx={{
            p: "40px",
            textAlign: "center",
            backgroundColor: colors.primary[400],
            borderRadius: "12px",
          }}
        >
          <Typography variant="h5" color={colors.grey[100]} mb="10px">
            No hay banners registrados
          </Typography>
          <Typography variant="body2" color={colors.grey[300]} mb="20px">
            Cuando la cantidad de banners es 0, el slider se oculta automáticamente en la aplicación
            móvil. Puedes crear uno nuevo o restaurar los banners oficiales.
          </Typography>
          <Button
            variant="contained"
            onClick={handleSeedDefaults}
            startIcon={<AutoAwesomeIcon />}
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: "#fff",
              mr: "10px",
            }}
          >
            Restaurar Banners Oficiales
          </Button>
          <Button
            variant="outlined"
            onClick={handleOpenCreate}
            startIcon={<AddIcon />}
            sx={{ color: colors.grey[100] }}
          >
            Crear Banner Personalizado
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {banners.map((b) => (
            <Grid item xs={12} sm={6} md={4} key={b.id}>
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: colors.primary[400],
                  borderRadius: "16px",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  border: b.isActive ? `1px solid ${colors.greenAccent[500]}` : "1px solid #475569",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                {/* PREVIEW DE LA IMAGEN */}
                <Box
                  sx={{
                    width: "100%",
                    height: "170px",
                    backgroundColor: "#0F172A",
                    position: "relative",
                  }}
                >
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/600x300?text=Error+cargando+banner";
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(0,0,0,0.65)",
                      borderRadius: "10px",
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    <Typography variant="caption" sx={{ color: "#fff", fontWeight: "bold" }}>
                      Orden: #{b.order || 0}
                    </Typography>
                  </Box>
                </Box>

                {/* DETALLES DEL BANNER */}
                <Box p="16px" flex={1} display="flex" flexDirection="column">
                  <Typography variant="h5" fontWeight="bold" color={colors.grey[100]} mb="8px">
                    {b.title}
                  </Typography>

                  <Box mb="12px">{renderActionBadge(b.actionType)}</Box>

                  {b.actionType === "EXTERNAL_URL" && b.actionUrl && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.greenAccent[300],
                        wordBreak: "break-all",
                        mb: 1,
                        display: "block",
                      }}
                    >
                      🔗 {b.actionUrl}
                    </Typography>
                  )}

                  {b.actionType === "INFO_MODAL" && (
                    <Box
                      sx={{
                        backgroundColor: colors.primary[500],
                        p: 1.5,
                        borderRadius: "8px",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" color={colors.grey[100]}>
                        {b.infoTitle || "Sin título informativo"}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={colors.grey[300]}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {b.infoContent || "Sin contenido descriptivo"}
                      </Typography>
                    </Box>
                  )}

                  <Box mt="auto" pt="12px" display="flex" justifyContent="space-between" alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={b.isActive}
                          onChange={() => handleToggleActive(b)}
                          color="success"
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="caption" color={b.isActive ? colors.greenAccent[400] : colors.grey[400]}>
                          {b.isActive ? "Activo" : "Pausado"}
                        </Typography>
                      }
                    />

                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(b)}
                        sx={{ color: colors.blueAccent[300], mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteBanner(b.id, b.title)}
                        sx={{ color: "#ef4444" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* MODAL CREAR / EDITAR BANNER */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: colors.primary[400],
            borderRadius: "16px",
          },
        }}
      >
        <DialogTitle>
          <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>
            {editingBanner ? "Editar Banner Publicitario" : "Nuevo Banner Publicitario"}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.grey[700] }}>
          <Box display="flex" flexDirection="column" gap="16px" mt="8px">
            {/* Título */}
            <TextField
              label="Título del Banner (Para referencia y encabezado)"
              variant="outlined"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            {/* Subir Imagen o Pegar URL */}
            <Box>
              <Typography variant="subtitle2" color={colors.grey[200]} mb="8px">
                Imagen del Banner (Formato recomendado: 972x450 o proporción 2:1)
              </Typography>

              <Box display="flex" gap="12px" alignItems="center" mb="8px">
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={uploadingImage ? <CircularProgress size={18} /> : <CloudUploadIcon />}
                  disabled={uploadingImage}
                  sx={{
                    color: colors.grey[100],
                    borderColor: colors.grey[400],
                  }}
                >
                  {uploadingImage ? "Subiendo..." : "Subir Foto desde Equipo"}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleImageFileChange}
                  />
                </Button>

                <Typography variant="caption" color={colors.grey[400]}>
                  o ingresa la URL directa abajo:
                </Typography>
              </Box>

              <TextField
                label="URL de la Imagen"
                variant="outlined"
                fullWidth
                size="small"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />

              {/* Vista previa de la imagen */}
              {formData.imageUrl ? (
                <Box mt="12px" textAlign="center">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    style={{
                      maxHeight: "140px",
                      maxWidth: "100%",
                      borderRadius: "10px",
                      objectFit: "cover",
                      border: "1px solid #475569",
                    }}
                  />
                </Box>
              ) : null}
            </Box>

            {/* Acción al presionar el Banner */}
            <FormControl fullWidth variant="outlined">
              <InputLabel id="action-type-label">¿Qué hace el banner al tocarlo?</InputLabel>
              <Select
                labelId="action-type-label"
                value={formData.actionType}
                onChange={(e) => setFormData({ ...formData, actionType: e.target.value })}
                label="¿Qué hace el banner al tocarlo?"
              >
                <MenuItem value="NONE">
                  ⚪ Solo mostrar (Sin acción / No hace nada al tocarlo)
                </MenuItem>
                <MenuItem value="EXTERNAL_URL">
                  🟢 Redirigir a Instagram o Enlace Web Externo
                </MenuItem>
                <MenuItem value="INFO_MODAL">
                  🟡 Abrir pantalla con información descriptiva en la app
                </MenuItem>
              </Select>
            </FormControl>

            {/* Campo si la acción es EXTERNAL_URL */}
            {formData.actionType === "EXTERNAL_URL" && (
              <TextField
                label="Enlace de Destino (Instagram, Sitio Web, WhatsApp)"
                variant="outlined"
                fullWidth
                value={formData.actionUrl}
                onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                placeholder="https://instagram.com/tu_cuenta"
                helperText="Ejemplo: https://www.instagram.com/igostore.ve"
              />
            )}

            {/* Campos si la acción es INFO_MODAL */}
            {formData.actionType === "INFO_MODAL" && (
              <Box display="flex" flexDirection="column" gap="14px">
                <TextField
                  label="Título de la Información (Ej: Gran Oferta de Inauguración)"
                  variant="outlined"
                  fullWidth
                  value={formData.infoTitle}
                  onChange={(e) => setFormData({ ...formData, infoTitle: e.target.value })}
                />
                <TextField
                  label="Contenido Informativo / Descripción detallada"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  value={formData.infoContent}
                  onChange={(e) => setFormData({ ...formData, infoContent: e.target.value })}
                  placeholder="Escribe aquí las condiciones, detalles de la promoción o instrucciones para los clientes..."
                />
                <TextField
                  label="Enlace opcional dentro de la información (Opcional)"
                  variant="outlined"
                  fullWidth
                  value={formData.actionUrl}
                  onChange={(e) => setFormData({ ...formData, actionUrl: e.target.value })}
                  placeholder="https://..."
                  helperText="Si lo agregas, el modal incluirá un botón 'Abrir Enlace' para el usuario."
                />
              </Box>
            )}

            {/* Orden y Estado */}
            <Box display="flex" gap="16px" alignItems="center">
              <TextField
                label="Prioridad / Orden"
                type="number"
                variant="outlined"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value, 10) || 0 })}
                sx={{ width: "140px" }}
                helperText="Menor número = primero"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="success"
                  />
                }
                label="Banner Activo"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: "16px", borderColor: colors.grey[700] }}>
          <Button onClick={handleCloseModal} sx={{ color: colors.grey[300] }}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveBanner}
            variant="contained"
            sx={{
              backgroundColor: colors.greenAccent[600],
              color: "#fff",
              fontWeight: "bold",
              "&:hover": { backgroundColor: colors.greenAccent[700] },
            }}
          >
            {editingBanner ? "Guardar Cambios" : "Crear Banner"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR NOTIFICACIONES */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Banners;

