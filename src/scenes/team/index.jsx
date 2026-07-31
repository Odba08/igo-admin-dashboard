import React, { useState, useEffect } from "react";
import { 
  Box, Button, Typography, useTheme, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel 
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import AddIcon from "@mui/icons-material/Add";
import Header from "../../components/Header";
import { getUsers, createUser, updateUser, deleteUser } from "../../services/api";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("empleado");
  const [vehicle, setVehicle] = useState("Moto");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      // Filter list to keep ONLY users with roles "empleado" or "worker"
      const employees = res.data.filter(user => 
        user.roles?.includes("empleado") || user.roles?.includes("worker")
      );
      setUsers(employees);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este empleado permanentemente? Se le revocará el acceso inmediatamente.")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert("Error al eliminar el empleado: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000); // Refresco automático de estado de trabajadores cada 10s
    return () => clearInterval(interval);
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await createUser({
        fullName,
        email,
        password,
        roles: [role],
        vehicle: role === "empleado" ? vehicle : undefined
      });
      setOpenModal(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("empleado");
      setVehicle("Moto");
      fetchUsers();
    } catch (err) {
      alert("Error al crear usuario: " + (err.response?.data?.message || err.message));
    }
  };

  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    {
      field: "fullName",
      headerName: "Nombre Completo",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Correo Electrónico",
      flex: 1,
    },
    {
      field: "employeeStatus",
      headerName: "Estado de Servicio",
      flex: 1.5,
      renderCell: ({ row }) => {
        const currentStatus = row.employeeStatus || "inactive";
        
        let label = "Fuera de Servicio";
        let dotColor = "#FF3B30"; // rojo
        
        if (currentStatus === "active") {
          label = "Activo / Trabajando";
          dotColor = "#4CD964"; // verde
        } else if (currentStatus === "break") {
          label = "De descanso";
          dotColor = "#FFCC00"; // amarillo
        }

        return (
          <Box display="flex" alignItems="center" gap="10px">
            <Box
              width="10px"
              height="10px"
              borderRadius="50%"
              backgroundColor={dotColor}
            />
            <Typography fontSize="13px" color={colors.grey[100]}>
              {label}
            </Typography>
          </Box>
        );
      }
    },
    {
      field: "vehicle",
      headerName: "Vehículo",
      flex: 1.2,
      renderCell: ({ row }) => {
        const primaryRole = row.roles?.[0] || "empleado";
        const isWorker = primaryRole === "worker" || primaryRole === "empleado";
        if (!isWorker) return <Typography color={colors.grey[400]} sx={{ fontStyle: 'italic' }}>N/A</Typography>;
        return (
          <Select
            value={row.vehicle || "Moto"}
            onChange={async (e) => {
              try {
                await updateUser(row.id, { vehicle: e.target.value });
                fetchUsers();
              } catch (err) {
                alert("Error al actualizar vehículo: " + (err.response?.data?.message || err.message));
              }
            }}
            size="small"
            sx={{ fontSize: "12px", height: "30px", width: "100%", bgcolor: colors.primary[400] }}
          >
            <MenuItem value="Bicicleta">Bicicleta</MenuItem>
            <MenuItem value="Moto">Moto</MenuItem>
            <MenuItem value="Carro">Carro</MenuItem>
            <MenuItem value="Pickups">Pickup</MenuItem>
          </Select>
        );
      }
    },
    {
      field: "roles",
      headerName: "Rol / Nivel de Acceso",
      flex: 1,
      renderCell: ({ row }) => {
        const primaryRole = row.roles?.[0] || "empleado";
        const isWorker = primaryRole === "worker" || primaryRole === "empleado";
        return (
          <Box
            width="80%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            backgroundColor={
              primaryRole === "admin"
                ? colors.greenAccent[600]
                : isWorker
                ? colors.blueAccent[800]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {primaryRole === "admin" && <AdminPanelSettingsOutlinedIcon fontSize="small" />}
            {isWorker && <SecurityOutlinedIcon fontSize="small" sx={{ color: "#000000" }} />}
            {primaryRole === "client" && <LockOpenOutlinedIcon fontSize="small" />}
            <Typography 
              color={isWorker ? "#000000" : colors.grey[100]} 
              sx={{ ml: "5px", textTransform: "capitalize", fontWeight: isWorker ? "bold" : "normal" }}
            >
              {isWorker ? "Empleado" : primaryRole}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1.2,
      renderCell: ({ row }) => {
        const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;
        if (row.id === currentUserId) return null;

        return (
          <Box display="flex" gap="10px">
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleDeleteUser(row.id)}
              sx={{ 
                backgroundColor: colors.redAccent[600], 
                color: "#fff", 
                fontWeight: "bold", 
                fontSize: "11px",
                "&:hover": { backgroundColor: colors.redAccent[700] }
              }}
            >
              Eliminar
            </Button>
          </Box>
        );
      }
    }
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="TRABAJADORES Y EQUIPO" subtitle="Listado de empleados de la plataforma" />
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ backgroundColor: colors.greenAccent[500], color: "#000000", fontWeight: "bold", "&:hover": { backgroundColor: colors.greenAccent[600] } }}
        >
          Nuevo Empleado
        </Button>
      </Box>

      <Box
        m="20px 0 0 0"
        height="70vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: "#1e1e1e", color: colors.greenAccent[500], borderBottom: `1px solid ${colors.greenAccent[500]}` },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: "#1e1e1e" },
        }}
      >
        <DataGrid loading={loading} rows={users} columns={columns} getRowId={(row) => row.id} />
      </Box>

      {/* Modal Crear Usuario */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ backgroundColor: colors.primary[400], color: colors.grey[100] }}>
          Registrar Nuevo Empleado
        </DialogTitle>
        <form onSubmit={handleCreateUser}>
          <DialogContent sx={{ backgroundColor: colors.primary[400] }}>
            <Box display="flex" flexDirection="column" gap="20px" pt="10px">
              <TextField
                label="Nombre Completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Rol en la plataforma</InputLabel>
                <Select
                  value={role}
                  label="Rol en la plataforma"
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="empleado">Empleado / Trabajador</MenuItem>
                  <MenuItem value="admin">Administrador</MenuItem>
                </Select>
              </FormControl>
              {role === "empleado" && (
                <FormControl fullWidth sx={{ mt: 1 }}>
                  <InputLabel>Vehículo de Reparto</InputLabel>
                  <Select
                    value={vehicle}
                    label="Vehículo de Reparto"
                    onChange={(e) => setVehicle(e.target.value)}
                  >
                    <MenuItem value="Bicicleta">Bicicleta</MenuItem>
                    <MenuItem value="Moto">Moto</MenuItem>
                    <MenuItem value="Carro">Carro</MenuItem>
                    <MenuItem value="Pickups">Pickup</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: colors.primary[400], p: "15px 24px" }}>
            <Button onClick={() => setOpenModal(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" sx={{ backgroundColor: colors.greenAccent[500], color: "#000", fontWeight: "bold" }}>
              Guardar Empleado
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Team;
