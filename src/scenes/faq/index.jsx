import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { tokens } from "../../theme";

const FAQ = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  return (
    <Box m="20px">
      <Header title="PREGUNTAS FRECUENTES (FAQ)" subtitle="Guía de Funcionamiento de IGO Delivery" />

      <Box mt="20px">
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="bold">
              1. ¿Cómo funciona la aplicación móvil para Clientes?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: "1.7", color: colors.grey[200] }}>
              Los clientes utilizan la app móvil para explorar establecimientos ordenados por categorías (Comida, Mercado, Compras, Envíos, Salud).
              Al seleccionar productos de un comercio, pueden agregarlos al carrito y proceder a solicitar el pedido. En el mapa exploratorio
              definen su ubicación exacta, y seleccionan el tipo de vehículo de reparto (Moto, Carro o Pickup). La plataforma calcula de manera
              automática la ruta más óptima mediante OSRM y aplica la tarifa vial correspondiente a la distancia. El cliente selecciona su canal de pago
              (Pago IGO si paga a la plataforma, Pago Negocio si liquida directamente en el comercio, o Mix si es mixto) y crea la orden.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="bold">
              2. ¿Cómo funciona la aplicación móvil para Repartidores (Empleados)?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: "1.7", color: colors.grey[200] }}>
              Los empleados o repartidores inician sesión en la app móvil. Cuentan con un switch de estado de servicio (Trabajando, De descanso, Fuera de Servicio).
              Cuando su estado es activo ("Trabajando"), la app les muestra los pedidos pendientes de reparto cuyo tipo de envío coincide
              estrictamente con su vehículo registrado (por ejemplo, a un empleado con Moto solo le aparecerán pedidos de Moto; a uno con Carro, pedidos de Carro).
              El repartidor puede reclamar una orden, ver la ruta exacta en su mapa en tiempo real, recoger los productos en el local y, tras entregarlos,
              marcar el pedido como completado.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="bold">
              3. ¿Cómo funciona el Panel de Administrador para los Administradores?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: "1.7", color: colors.grey[200] }}>
              Los administradores tienen control total sobre la plataforma. Pueden registrar y gestionar empleados (modificando sus estados y asignándoles vehículos),
              crear y modificar categorías y negocios, y asociar cuentas de usuarios comerciantes (dueños de negocios) con sus respectivos locales comerciales.
              Adicionalmente, disponen de una pestaña de "Gestión de Pedidos" para monitorear y corregir todos los pedidos del sistema, y la sección de "Liquidación
              Financiera" para generar cierres de caja y descargar reportes PDF de conciliación de deudas por rangos de fecha y negocio.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="bold">
              4. ¿Cómo funciona el Panel de Administrador para los Comercios Aliados (Comerciantes)?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: "1.7", color: colors.grey[200] }}>
              Cuando un comerciante inicia sesión en el panel de control, la plataforma identifica su cuenta y carga exclusivamente la información de su establecimiento.
              El comerciante puede modificar el logotipo o imagen de portada, horarios de apertura y cierre, y coordenadas geográficas.
              Además, cuenta con acceso completo a "Mis Productos" para agregar nuevos productos a su menú digital, editar inventario (stock), actualizar precios,
              activar descuentos promocionales y definir categorías internas del menú.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography color={colors.greenAccent[500]} variant="h5" fontWeight="bold">
              5. ¿Cómo se calculan los balances de dinero (Conciliación Financiera)?
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: "1.7", color: colors.grey[200] }}>
              La conciliación financiera se calcula orden por orden según el receptor del dinero:
              <ul>
                <li><strong>Pago IGO:</strong> IGO cobra el monto completo del pedido. Por lo tanto, IGO le debe al negocio el valor de los productos (subtotal de productos).</li>
                <li><strong>Pago Negocio:</strong> El negocio cobra el monto completo del pedido. Por lo tanto, el negocio le debe a IGO el costo de envío (delivery fee).</li>
                <li><strong>Mix (Mixto):</strong> IGO cobra el costo de delivery y el negocio cobra el subtotal de productos. Como cada parte recibió lo que le correspondía, nadie debe nada por este pedido (saldo neto 0).</li>
              </ul>
              Al final del período, se restan ambos saldos: <code>Saldo Neto = (Deuda IGO al Negocio) - (Deuda Negocio a IGO)</code>. Si el resultado es positivo, IGO realiza una transferencia bancaria al negocio; de lo contrario, el negocio transfiere la diferencia a IGO.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default FAQ;
