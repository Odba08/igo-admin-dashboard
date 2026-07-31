import React, { useState, useEffect } from "react";
import { 
  Box, Button, Typography, useTheme, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, 
  CircularProgress, Alert, IconButton, Switch, FormControlLabel
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";
import { getBusinessProducts, createBusinessProduct, updateBusinessProduct, deleteBusinessProduct, getBusinessByOwner, uploadProductImage } from "../../services/api";

const BusinessProducts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userId = user?.id || "default";

  const [myBusinessId, setMyBusinessId] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isBusiness = user?.roles?.includes("bussiness") || user?.roles?.includes("business");

  useEffect(() => {
    const resolveBusiness = async () => {
      if (isBusiness) {
        const ownerBizRes = await getBusinessByOwner(user.id).catch(() => null);
        if (ownerBizRes && ownerBizRes.data) {
          setMyBusinessId(ownerBizRes.data.id);
        } else {
          setMyBusinessId("");
        }
      } else {
        const savedId = localStorage.getItem(`myBusinessId_${userId}`) || "";
        setMyBusinessId(savedId);
      }
    };
    resolveBusiness();
  }, [userId, isBusiness]);
  
  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [stock, setStock] = useState(10);
  const [isPromo, setIsPromo] = useState(false);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [weight, setWeight] = useState(0);
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState([]);

  const fetchProducts = async (targetId) => {
    const activeId = targetId || myBusinessId;
    if (!activeId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await getBusinessProducts(activeId);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error al cargar los productos de este comercio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myBusinessId) {
      fetchProducts(myBusinessId);
    } else {
      setProducts([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myBusinessId]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setTitle("");
    setPrice(0);
    setDescription("");
    setStock(10);
    setIsPromo(false);
    setDiscountPrice(0);
    setWeight(0);
    setTags("");
    setImageUrl("");
    setOptions([]);
    setOpenModal(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setTitle(product.title || "");
    setPrice(product.price || 0);
    setDescription(product.description || "");
    setStock(product.stock || 0);
    setIsPromo(product.isPromo || false);
    setDiscountPrice(product.discountPrice || 0);
    setWeight(product.weight || 0);
    setTags(product.tags ? product.tags.join(", ") : "");
    if (product.images && product.images.length > 0) {
      // images can be strings or objects. The entity shows string[] in DTO, or string in entity relations.
      const firstImg = product.images[0];
      setImageUrl(typeof firstImg === "string" ? firstImg : firstImg.url || "");
    } else {
      setImageUrl("");
    }
    setOptions(product.options || []);
    setOpenModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
    try {
      await deleteBusinessProduct(myBusinessId, productId);
      setSuccess("Producto eliminado correctamente.");
      fetchProducts(myBusinessId);
    } catch (err) {
      setError("Error al eliminar el producto.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const tagsArray = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    const imagesArray = imageUrl ? [imageUrl] : [];

    const payload = {
      title,
      price: parseFloat(price),
      description,
      stock: parseInt(stock),
      isPromo,
      discountPrice: parseFloat(discountPrice),
      weight: parseFloat(weight),
      tags: tagsArray,
      images: imagesArray,
      options: options.map(opt => ({
        title: opt.title,
        isRequired: opt.isRequired || false,
        maxAllowed: parseInt(opt.maxAllowed) || 1,
        allowRepeated: opt.maxAllowed > 1,
        choices: opt.choices.map(choice => ({
          name: choice.name,
          additionalPrice: parseFloat(choice.additionalPrice) || 0
        }))
      }))
    };

    try {
      if (editingProduct) {
        await updateBusinessProduct(myBusinessId, editingProduct.id, payload);
        setSuccess("Producto actualizado correctamente.");
      } else {
        await createBusinessProduct(myBusinessId, payload);
        setSuccess("Producto creado correctamente.");
      }
      setOpenModal(false);
      fetchProducts(myBusinessId);
    } catch (err) {
      setError(err.response?.data?.message || "Error al guardar el producto.");
    }
  };

  const columns = [
    { field: "title", headerName: "Título del Producto", flex: 1.5, cellClassName: "name-column--cell" },
    { 
      field: "price", 
      headerName: "Precio Base", 
      flex: 1, 
      renderCell: (params) => (
        <Typography>${params.row.price?.toFixed(2)}</Typography>
      )
    },
    { 
      field: "isPromo", 
      headerName: "En Promo", 
      flex: 0.8,
      renderCell: (params) => (
        <Typography color={params.row.isPromo ? colors.greenAccent[500] : colors.grey[300]}>
          {params.row.isPromo ? "Sí" : "No"}
        </Typography>
      )
    },
    { 
      field: "discountPrice", 
      headerName: "Precio Promo", 
      flex: 1,
      renderCell: (params) => (
        <Typography>${params.row.discountPrice?.toFixed(2) || "0.00"}</Typography>
      )
    },
    { field: "stock", headerName: "Stock Disponible", type: "number", flex: 1, headerAlign: "left", align: "left" },
    { 
      field: "tags", 
      headerName: "Etiquetas", 
      flex: 1.5,
      renderCell: (params) => (
        <Typography>{params.row.tags?.join(", ") || ""}</Typography>
      )
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap="5px">
          <IconButton onClick={() => handleOpenEdit(params.row)} sx={{ color: colors.greenAccent[500] }}>
            <EditIcon size="small" />
          </IconButton>
          <IconButton onClick={() => handleDeleteProduct(params.row.id)} sx={{ color: colors.redAccent[500] }}>
            <DeleteIcon size="small" />
          </IconButton>
        </Box>
      )
    }
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="PRODUCTOS" subtitle="Administra el inventario de productos de tu comercio" />
        {myBusinessId && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ backgroundColor: colors.greenAccent[500], color: "#000", fontWeight: "bold", "&:hover": { backgroundColor: colors.greenAccent[600] } }}
          >
            Nuevo Producto
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mt: 2, bgcolor: "#2a1515", color: "#ff8888" }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mt: 2, bgcolor: "#1b2c1b", color: "#88ff88" }}>{success}</Alert>}

      {!myBusinessId ? (
        <Alert severity="warning" sx={{ mt: 3, bgcolor: "#2a2215", color: "#ffe082", fontWeight: "bold", fontSize: "15px" }}>
          ⚠️ No tienes un comercio registrado aún. Dirígete a la sección "Mi Comercio" para crear tu establecimiento antes de administrar tus productos.
        </Alert>
      ) : (
        <Box
          m="20px 0 0 0"
          height="70vh"
          sx={{
            "& .MuiDataGrid-root": { border: "none" },
            "& .MuiDataGrid-cell": { borderBottom: "none" },
            "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
            "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
            "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          }}
        >
          <DataGrid loading={loading} rows={products} columns={columns} getRowId={(row) => row.id} />
        </Box>
      )}

      {/* Modal Crear/Editar */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
          {editingProduct ? "Editar Producto" : "Nuevo Producto"}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ backgroundColor: colors.primary[400], display: "flex", flexDirection: "column", gap: "20px" }}>
            <Box display="grid" gap="20px" gridTemplateColumns="repeat(2, 1fr)" pt="10px">
              <TextField
                label="URL de la Imagen"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                fullWidth
              />

              <Box display="flex" gap="15px" alignItems="center" sx={{ mt: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  id="prod-image-upload"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    setUploadingImage(true);
                    setError("");
                    try {
                      const res = await uploadProductImage(formData);
                      setImageUrl(res.data.secureUrl);
                      setSuccess("Imagen de producto subida.");
                    } catch (err) {
                      setError("Error al subir la imagen del producto.");
                    } finally {
                      setUploadingImage(false);
                    }
                  }}
                />
                <label htmlFor="prod-image-upload">
                  <Button
                    component="span"
                    variant="contained"
                    disabled={uploadingImage}
                    sx={{ backgroundColor: colors.blueAccent[600], color: "#fff", fontWeight: "bold", "&:hover": { backgroundColor: colors.blueAccent[700] } }}
                  >
                    {uploadingImage ? "Subiendo..." : "Subir Foto de Producto"}
                  </Button>
                </label>
                {imageUrl ? (
                  <Box
                    component="img"
                    src={imageUrl}
                    sx={{ width: 50, height: 50, borderRadius: "6px", objectFit: "cover", border: `2px solid ${colors.greenAccent[500]}` }}
                  />
                ) : (
                  <Typography variant="body2" color={colors.grey[300]}>Sin imagen de producto</Typography>
                )}
              </Box>

              <TextField
                label="Título del Producto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                fullWidth
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                sx={{ gridColumn: "span 2" }}
              />

              <TextField
                label="Precio Base ($)"
                type="number"
                inputProps={{ min: "0", step: "any" }}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                fullWidth
              />

              <TextField
                label="Stock Disponible"
                type="number"
                inputProps={{ min: "0" }}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={isPromo}
                    onChange={(e) => setIsPromo(e.target.checked)}
                    color="secondary"
                  />
                }
                label="¿Está en Promoción?"
                sx={{ display: "flex", alignItems: "center" }}
              />

              <TextField
                label="Precio de Oferta ($)"
                type="number"
                inputProps={{ min: "0", step: "any" }}
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                disabled={!isPromo}
                fullWidth
              />

              <TextField
                label="Peso (kg)"
                type="number"
                inputProps={{ min: "0", step: "any" }}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                fullWidth
              />

              <TextField
                label="Etiquetas (Separadas por comas)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="ej: Comida Rápida, Burger, MCD"
                fullWidth
              />

              {/* --- SECCIÓN DE OPCIONES Y EXTRAS --- */}
              <Box sx={{ gridColumn: "span 2", mt: 2, borderTop: `1px solid ${colors.grey[700]}`, pt: 2 }}>
                <Typography variant="h5" color={colors.greenAccent[500]} fontWeight="bold" mb={2}>
                  Opciones / Extras del Producto
                </Typography>
                
                {options.map((opt, optIndex) => (
                  <Box 
                    key={optIndex} 
                    sx={{ 
                      p: 2, 
                      mb: 2, 
                      borderRadius: "8px", 
                      border: `1px dashed ${colors.greenAccent[500]}`,
                      backgroundColor: "rgba(255,255,255,0.02)"
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                      <Typography variant="h6" color={colors.grey[100]} fontWeight="bold">
                        Grupo de Opción #{optIndex + 1}
                      </Typography>
                      <Button 
                        variant="outlined" 
                        color="error" 
                        size="small" 
                        onClick={() => {
                          const newOpts = [...options];
                          newOpts.splice(optIndex, 1);
                          setOptions(newOpts);
                        }}
                        sx={{ border: `1px solid ${colors.redAccent[500]}`, color: colors.redAccent[400] }}
                      >
                        Eliminar Grupo
                      </Button>
                    </Box>

                    <Box display="grid" gap="15px" gridTemplateColumns="repeat(3, 1fr)" mb={2}>
                      <TextField
                        label="Título del Grupo (ej: Sabores, Extras)"
                        size="small"
                        value={opt.title}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[optIndex].title = e.target.value;
                          setOptions(newOpts);
                        }}
                        required
                        sx={{ gridColumn: "span 2" }}
                      />
                      <TextField
                        label="Max. Selecciones"
                        type="number"
                        size="small"
                        inputProps={{ min: 1 }}
                        value={opt.maxAllowed || 1}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[optIndex].maxAllowed = parseInt(e.target.value) || 1;
                          setOptions(newOpts);
                        }}
                        required
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            size="small"
                            checked={opt.isRequired || false}
                            onChange={(e) => {
                              const newOpts = [...options];
                              newOpts[optIndex].isRequired = e.target.checked;
                              setOptions(newOpts);
                            }}
                            color="secondary"
                          />
                        }
                        label="Obligatorio"
                        sx={{ gridColumn: "span 3" }}
                      />
                    </Box>

                    <Typography variant="body2" color={colors.grey[200]} fontWeight="bold" mb={1}>
                      Opciones Seleccionables (Mínimo 1):
                    </Typography>

                    {opt.choices?.map((choice, choiceIndex) => (
                      <Box key={choiceIndex} display="flex" gap="15px" alignItems="center" mb={1}>
                        <TextField
                          label="Nombre de la opción (ej: Chocolate, Queso)"
                          size="small"
                          value={choice.name}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[optIndex].choices[choiceIndex].name = e.target.value;
                            setOptions(newOpts);
                          }}
                          required
                          fullWidth
                        />
                        <TextField
                          label="Precio Extra ($)"
                          type="number"
                          size="small"
                          inputProps={{ min: 0, step: "any" }}
                          value={choice.additionalPrice}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[optIndex].choices[choiceIndex].additionalPrice = parseFloat(e.target.value) || 0;
                            setOptions(newOpts);
                          }}
                          required
                          sx={{ width: "120px" }}
                        />
                        {opt.choices.length > 1 && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              const newOpts = [...options];
                              newOpts[optIndex].choices.splice(choiceIndex, 1);
                              setOptions(newOpts);
                            }}
                            sx={{ minWidth: "40px", px: 1 }}
                          >
                            X
                          </Button>
                        )}
                      </Box>
                    ))}

                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={() => {
                        const newOpts = [...options];
                        newOpts[optIndex].choices = newOpts[optIndex].choices || [];
                        newOpts[optIndex].choices.push({ name: "", additionalPrice: 0 });
                        setOptions(newOpts);
                      }}
                      sx={{ mt: 1, borderColor: colors.greenAccent[500], color: colors.greenAccent[400] }}
                    >
                      + Agregar Opción Seleccionable
                    </Button>
                  </Box>
                ))}

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => {
                    setOptions([...options, { title: "", isRequired: false, maxAllowed: 1, choices: [{ name: "", additionalPrice: 0 }] }]);
                  }}
                  sx={{ 
                    backgroundColor: colors.greenAccent[500], 
                    color: "#000", 
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: colors.greenAccent[600] }
                  }}
                >
                  + Añadir Nuevo Grupo de Opciones
                </Button>
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ backgroundColor: colors.primary[400], p: "15px 24px" }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: colors.greenAccent[500],
                color: "#000",
                fontWeight: "bold",
                "&:hover": { backgroundColor: colors.greenAccent[600] }
              }}
            >
              Guardar Cambios
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default BusinessProducts;
