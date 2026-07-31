import React, { useState, useEffect } from "react";
import { Box, Typography, Button, useTheme, CircularProgress, Paper, IconButton, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getBusinesses, getBusinessProducts, updateBusinessProduct, updateBusiness, deleteBusiness } from "../../services/api";

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [businesses, setBusinesses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [loadingBiz, setLoadingBiz] = useState(true);
  const [loadingProd, setLoadingProd] = useState(false);

  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [tempCommission, setTempCommission] = useState(10);
  const [filterText, setFilterText] = useState("");

  const handleSaveCommission = async () => {
    try {
      const res = await updateBusiness(selectedBusiness.id, { commissionPercentage: tempCommission });
      setSelectedBusiness(res.data);
      // Actualizar en el listado local de comercios
      setBusinesses(prev => prev.map(b => b.id === selectedBusiness.id ? res.data : b));
      setIsEditingCommission(false);
    } catch (err) {
      alert("Error al actualizar la comisión: " + (err.response?.data?.message || err.message));
    }
  };

  const fetchBusinesses = async () => {
    try {
      setLoadingBiz(true);
      const res = await getBusinesses();
      setBusinesses(res.data);
    } catch (err) {
      console.error("Error fetching businesses:", err);
    } finally {
      setLoadingBiz(false);
    }
  };

  const handleDeleteBizFromList = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este comercio permanentemente? Esto también eliminará todos sus productos asociados.")) return;
    try {
      setLoadingBiz(true);
      await deleteBusiness(id);
      fetchBusinesses();
    } catch (err) {
      alert("Error al eliminar el comercio: " + (err.response?.data?.message || err.message));
    } finally {
      setLoadingBiz(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleSelectBusiness = async (business) => {
    setSelectedBusiness(business);
    try {
      setLoadingProd(true);
      const res = await getBusinessProducts(business.id);
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching business products:", err);
      setProducts([]);
    } finally {
      setLoadingProd(false);
    }
  };

  const toggleProductApproval = async (product) => {
    try {
      const nextApproved = !product.isApproved;
      await updateBusinessProduct(selectedBusiness.id, product.id, { isApproved: nextApproved });
      
      // Update local products state
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? { ...p, isApproved: nextApproved } : p)
      );
    } catch (err) {
      console.error("Error toggling product approval:", err);
      alert("No se pudo cambiar el estado de aprobación.");
    }
  };

  const businessColumns = [
    { field: "name", headerName: "Nombre del Comercio", flex: 1.5, cellClassName: "name-column--cell" },
    { 
      field: "category", 
      headerName: "Categoría", 
      flex: 1, 
      renderCell: (params) => (
        <Typography>{params.row.category?.name || "Sin Categoría"}</Typography>
      )
    },
    { field: "openTime", headerName: "Apertura", flex: 0.8 },
    { field: "closeTime", headerName: "Cierre", flex: 0.8 },
    { field: "latitude", headerName: "Latitud", type: "number", flex: 0.8 },
    { field: "longitude", headerName: "Longitud", type: "number", flex: 0.8 },
    {
      field: "actions",
      headerName: "Acciones",
      flex: 1.8,
      renderCell: (params) => (
        <Box display="flex" gap="10px">
          <Button
            variant="contained"
            size="small"
            onClick={() => handleSelectBusiness(params.row)}
            sx={{
              backgroundColor: colors.greenAccent[500],
              color: "#000",
              fontWeight: "bold",
              "&:hover": { backgroundColor: colors.greenAccent[600] }
            }}
          >
            Ver Productos
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => handleDeleteBizFromList(params.row.id)}
            sx={{
              backgroundColor: colors.redAccent[600],
              color: "#fff",
              fontWeight: "bold",
              "&:hover": { backgroundColor: colors.redAccent[700] }
            }}
          >
            Eliminar
          </Button>
        </Box>
      )
    }
  ];

  const productColumns = [
    { field: "title", headerName: "Nombre del Producto", flex: 1.5, cellClassName: "name-column--cell" },
    { 
      field: "price", 
      headerName: "Precio Base", 
      flex: 1,
      renderCell: (params) => <Typography>${params.row.price?.toFixed(2)}</Typography>
    },
    { 
      field: "isPromo", 
      headerName: "En Promo", 
      flex: 0.8,
      renderCell: (params) => (
        <Typography color={params.row.isPromo ? colors.greenAccent[500] : colors.grey[300]} fontWeight="bold">
          {params.row.isPromo ? "SÍ" : "NO"}
        </Typography>
      )
    },
    { 
      field: "discountPrice", 
      headerName: "Precio Promo", 
      flex: 1,
      renderCell: (params) => <Typography>${params.row.discountPrice?.toFixed(2) || "0.00"}</Typography>
    },
    { field: "stock", headerName: "Stock", type: "number", flex: 0.8, headerAlign: "left", align: "left" },
    { 
      field: "tags", 
      headerName: "Etiquetas", 
      flex: 1.5,
      renderCell: (params) => <Typography>{params.row.tags?.join(", ") || ""}</Typography>
    },
    { 
      field: "isApproved", 
      headerName: "Estado de Aprobación", 
      flex: 1.3,
      renderCell: (params) => {
        const isApproved = params.row.isApproved;
        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => toggleProductApproval(params.row)}
            sx={{
              borderColor: isApproved ? colors.greenAccent[500] : colors.redAccent[500],
              color: isApproved ? colors.greenAccent[500] : colors.redAccent[500],
              fontWeight: "bold",
              textTransform: "none",
              "&:hover": {
                borderColor: isApproved ? colors.greenAccent[600] : colors.redAccent[600],
                backgroundColor: isApproved ? "rgba(255, 193, 7, 0.1)" : "rgba(219, 79, 74, 0.1)"
              }
            }}
          >
            {isApproved ? "Aprobado (Activo)" : "Pendiente (Bloqueado)"}
          </Button>
        );
      }
    }
  ];

  const filteredBusinesses = businesses.filter(b => {
    if (!filterText) return true;
    const nameMatch = b.name?.toLowerCase().includes(filterText.toLowerCase());
    const catMatch = b.category?.name?.toLowerCase().includes(filterText.toLowerCase());
    return nameMatch || catMatch;
  });

  return (
    <Box m="20px">
      {!selectedBusiness ? (
        <>
          <Header title="COMERCIOS" subtitle="Administración de establecimientos afiliados" />
          
          <Box display="flex" gap="15px" alignItems="center" mt="20px" mb="10px">
            <TextField
              label="Buscar Comercio por Nombre o Categoría..."
              variant="outlined"
              size="small"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              sx={{ 
                width: "350px",
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: colors.grey[600] },
                  "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                }
              }}
            />
          </Box>

          <Box
            m="10px 0 0 0"
            height="75vh"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .name-column--cell": { color: colors.greenAccent[300] },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1e1e1e", color: colors.greenAccent[500], borderBottom: `1px solid ${colors.greenAccent[500]}` },
              "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
              "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: "#1e1e1e" },
            }}
          >
            {loadingBiz ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress sx={{ color: colors.greenAccent[500] }} />
              </Box>
            ) : (
              <DataGrid rows={filteredBusinesses} columns={businessColumns} getRowId={(row) => row.id} />
            )}
          </Box>
        </>
      ) : (
        <Box>
          <Box display="flex" alignItems="center" gap="15px" mb="20px">
            <IconButton onClick={() => setSelectedBusiness(null)} sx={{ color: colors.grey[100] }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" display="flex" alignItems="center" gap="10px">
                <StorefrontIcon sx={{ color: colors.greenAccent[500], fontSize: "32px" }} />
                {selectedBusiness.name}
              </Typography>
              <Typography variant="h5" color={colors.greenAccent[500]}>
                Detalles del Catálogo de Productos
              </Typography>
            </Box>
          </Box>

          <Paper elevation={3} sx={{ p: "25px", bgcolor: colors.primary[400], mb: "25px", border: `1px solid ${colors.grey[700]}` }}>
            <Typography variant="h4" color={colors.grey[100]} gutterBottom fontWeight="bold">
              Especificaciones de Establecimiento
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(5, 1fr)" gap="15px" mt="15px">
              <Box>
                <Typography variant="body2" color={colors.grey[400]}>ID del Comercio</Typography>
                <Typography variant="body1" color={colors.grey[100]} fontWeight="bold">{selectedBusiness.id}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color={colors.grey[400]}>Categoría</Typography>
                <Typography variant="body1" color={colors.grey[100]} fontWeight="bold">{selectedBusiness.category?.name || "Sin Categoría"}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color={colors.grey[400]}>Horario</Typography>
                <Typography variant="body1" color={colors.grey[100]} fontWeight="bold">{selectedBusiness.openTime} - {selectedBusiness.closeTime}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color={colors.grey[400]}>Coordenadas</Typography>
                <Typography variant="body1" color={colors.grey[100]} fontWeight="bold">{selectedBusiness.latitude}, {selectedBusiness.longitude}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color={colors.grey[400]}>Comisión (%)</Typography>
                {isEditingCommission ? (
                  <Box display="flex" alignItems="center" gap="10px" mt="5px">
                    <TextField
                      size="small"
                      type="number"
                      value={tempCommission}
                      onChange={(e) => setTempCommission(parseFloat(e.target.value))}
                      inputProps={{ min: 0, max: 100, step: 0.5 }}
                      sx={{ width: "80px" }}
                    />
                    <Button variant="contained" color="success" size="small" onClick={handleSaveCommission} sx={{ minWidth: "50px", fontWeight: "bold" }}>
                      Ok
                    </Button>
                    <Button variant="outlined" color="inherit" size="small" onClick={() => setIsEditingCommission(false)} sx={{ minWidth: "50px" }}>
                      X
                    </Button>
                  </Box>
                ) : (
                  <Box display="flex" alignItems="center" gap="10px" mt="5px">
                    <Typography variant="body1" color={colors.grey[100]} fontWeight="bold">
                      {selectedBusiness.commissionPercentage ?? 10}%
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={() => {
                        setTempCommission(selectedBusiness.commissionPercentage ?? 10);
                        setIsEditingCommission(true);
                      }}
                      sx={{ 
                        fontSize: "10px", 
                        padding: "2px 6px",
                        borderColor: colors.greenAccent[500],
                        color: colors.greenAccent[500],
                        "&:hover": { borderColor: colors.greenAccent[600] }
                      }}
                    >
                      Editar
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Paper>

          <Typography variant="h4" color={colors.grey[100]} sx={{ mb: "15px" }} fontWeight="bold">
            Catálogo de Productos
          </Typography>

          <Box
            height="50vh"
            sx={{
              "& .MuiDataGrid-root": { border: "none" },
              "& .MuiDataGrid-cell": { borderBottom: "none" },
              "& .name-column--cell": { color: colors.greenAccent[300] },
              "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1e1e1e", color: colors.greenAccent[500], borderBottom: `1px solid ${colors.greenAccent[500]}` },
              "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
              "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: "#1e1e1e" },
            }}
          >
            {loadingProd ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress sx={{ color: colors.greenAccent[500] }} />
              </Box>
            ) : (
              <DataGrid rows={products} columns={productColumns} getRowId={(row) => row.id} />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Contacts;
