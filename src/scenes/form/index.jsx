import React, { useState } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Alert, Paper, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { useTheme } from "@mui/material";
import { createUser, uploadUserImage } from "../../services/api";

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploadingImage(true);
    setError("");
    setSuccess("");
    try {
      const res = await uploadUserImage(formData);
      setAvatarUrl(res.data.secureUrl);
      setSuccess("Imagen subida correctamente.");
    } catch (err) {
      setError("Error al subir la imagen.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFormSubmit = async (values, { resetForm }) => {
    setError("");
    setSuccess("");
    try {
      await createUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        roles: [values.role],
        avatarUrl: avatarUrl || undefined
      });
      setSuccess("¡Usuario creado y registrado correctamente en Igo!");
      setAvatarUrl("");
      resetForm();
    } catch (err) {
      console.error("Error creating user:", err);
      const errMsg = err.response?.data?.message || "Error al crear el usuario.";
      setError(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREAR NUEVO USUARIO" subtitle="Registra un nuevo perfil de usuario con rol específico" />

      <Box display="flex" flexDirection="column" gap="20px" maxWidth="700px" mt="20px">
        {success && <Alert severity="success" sx={{ bgcolor: "#1b2c1b", color: "#88ff88" }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ bgcolor: "#2a1515", color: "#ff8888" }}>{error}</Alert>}

        <Paper elevation={3} sx={{ p: "30px", bgcolor: colors.primary[400], border: `1px solid ${colors.greenAccent[600]}` }}>
          <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
              isSubmitting,
            }) => (
              <form onSubmit={handleSubmit}>
                <Box
                  display="grid"
                  gap="20px"
                  gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                  sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                  }}
                >
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label="Nombre Completo"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.fullName}
                    name="fullName"
                    error={!!touched.fullName && !!errors.fullName}
                    helperText={touched.fullName && errors.fullName}
                    sx={{ gridColumn: "span 4" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="email"
                    label="Correo Electrónico"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.email}
                    name="email"
                    error={!!touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                    sx={{ gridColumn: "span 4" }}
                  />
                  <TextField
                    fullWidth
                    variant="filled"
                    type="password"
                    label="Contraseña"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.password}
                    name="password"
                    error={!!touched.password && !!errors.password}
                    helperText={touched.password && errors.password}
                    sx={{ gridColumn: "span 4" }}
                  />
                  
                  <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                    <InputLabel id="role-select-label">Rol del Usuario</InputLabel>
                    <Select
                      labelId="role-select-label"
                      id="role"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="client">Cliente</MenuItem>
                      <MenuItem value="empleado">Empleado / Trabajador</MenuItem>
                      <MenuItem value="bussiness">Comercio (Business)</MenuItem>
                      <MenuItem value="admin">Administrador</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Carga de Foto de Perfil */}
                  <Box sx={{ gridColumn: "span 4", display: "flex", gap: "20px", alignItems: "center", mt: 1 }}>
                    <input
                      type="file"
                      accept="image/*"
                      id="form-avatar-upload"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="form-avatar-upload">
                      <Button
                        component="span"
                        variant="contained"
                        disabled={uploadingImage}
                        sx={{ backgroundColor: colors.blueAccent[600], color: "#fff", fontWeight: "bold", "&:hover": { backgroundColor: colors.blueAccent[700] } }}
                      >
                        {uploadingImage ? "Subiendo..." : "Subir Foto de Perfil"}
                      </Button>
                    </label>
                    {avatarUrl ? (
                      <Box
                        component="img"
                        src={avatarUrl}
                        sx={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: `2px solid ${colors.greenAccent[500]}` }}
                      />
                    ) : (
                      <Typography variant="body2" color={colors.grey[300]}>Sin foto de perfil (se usará la predeterminada)</Typography>
                    )}
                  </Box>
                </Box>
                <Box display="flex" justifyContent="end" mt="20px">
                  <Button 
                    type="submit" 
                    color="secondary" 
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      backgroundColor: colors.greenAccent[500],
                      color: "#000",
                      fontWeight: "bold",
                      px: "30px",
                      py: "10px",
                      "&:hover": { backgroundColor: colors.greenAccent[600] }
                    }}
                  >
                    Registrar Usuario
                  </Button>
                </Box>
              </form>
            )}
          </Formik>
        </Paper>
      </Box>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  fullName: yup.string().min(2, "Mínimo 2 caracteres").required("El nombre completo es requerido"),
  email: yup.string().email("Correo electrónico no válido").required("El correo es requerido"),
  password: yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es requerida"),
  role: yup.string().required("El rol es requerido"),
});

const initialValues = {
  fullName: "",
  email: "",
  password: "",
  role: "client",
};

export default Form;
