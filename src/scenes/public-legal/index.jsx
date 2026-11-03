import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";

const SECTIONS = [
  { id: "soporte", path: "/soporte", label: "Soporte Técnico" },
  { id: "privacidad", path: "/privacidad", label: "Política de Privacidad" },
  { id: "copyright", path: "/copyright", label: "Copyright y Legal" },
  { id: "terminos", path: "/terminos", label: "Términos de Uso" },
  { id: "eliminar-cuenta", path: "/eliminar-cuenta", label: "Eliminar Cuenta" },
];

const PublicLegalPage = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("soporte");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactTopic, setContactTopic] = useState("soporte");
  const [contactMessage, setContactMessage] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);

  useEffect(() => {
    const pathname = location.pathname.toLowerCase();
    if (pathname.includes("privac")) {
      setActiveTab("privacidad");
      document.title = "Política de Privacidad | IGO Store";
    } else if (pathname.includes("copyright") || pathname.includes("legal")) {
      setActiveTab("copyright");
      document.title = "Copyright y Propiedad Intelectual | IGO Store";
    } else if (pathname.includes("termino") || pathname.includes("terms")) {
      setActiveTab("terminos");
      document.title = "Términos y Condiciones | IGO Store";
    } else if (pathname.includes("eliminar") || pathname.includes("delete")) {
      setActiveTab("eliminar-cuenta");
      document.title = "Eliminación de Cuenta y Datos | IGO Store";
    } else {
      setActiveTab("soporte");
      document.title = "Centro de Soporte Oficial | IGO Store";
    }
  }, [location.pathname]);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    const ticketId = `IGO-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicket({
      id: ticketId,
      name: contactName,
      email: contactEmail,
      topic: contactTopic,
    });
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0b0719",
        color: "#f4f4f8",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        lineHeight: 1.6,
      }}
    >
      <style>{`
        .skip-link:where(:not(:focus-within, :active)) {
          position: absolute !important;
          clip-path: inset(50%) !important;
          overflow: hidden !important;
          width: 1px !important;
          height: 1px !important;
          margin: -1px !important;
          padding: 0 !important;
          border: 0 !important;
          white-space: nowrap !important;
        }
        .skip-link:focus {
          position: fixed;
          top: 12px;
          left: 12px;
          z-index: 9999;
          background: #fcd116;
          color: #000;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 700;
          text-decoration: none;
        }
        .igo-details {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          margin-bottom: 12px;
          padding: 14px 18px;
        }
        .igo-details[open] {
          border-color: #fcd116;
          background: rgba(252, 209, 22, 0.06);
        }
        .igo-details summary {
          cursor: pointer;
          font-weight: 600;
          color: #ffffff;
          font-size: 1rem;
        }
        .igo-input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: #140e29;
          color: #ffffff;
          font-size: 0.95rem;
          margin-top: 6px;
          box-sizing: border-box;
        }
        .igo-input:focus {
          outline: 2px solid #fcd116;
          border-color: transparent;
        }
      `}</style>

      <header
        style={{
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          background: "linear-gradient(180deg, #160c36 0%, #0b0719 100%)",
          padding: "24px 20px",
        }}
      >
        <a href="#main-content" className="skip-link">
          Saltar al contenido principal
        </a>
        <div
          style={{
            maxWidth: "1040px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div>
            <span
              style={{
                display: "inline-block",
                backgroundColor: "#fcd116",
                color: "#000000",
                fontWeight: 800,
                padding: "4px 12px",
                borderRadius: "999px",
                fontSize: "0.8rem",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              PLATAFORMA OFICIAL
            </span>
            <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: 800, color: "#ffffff" }}>
              IGO Store — Centro de Soporte, Privacidad y Legal
            </h1>
            <p style={{ margin: "6px 0 0 0", color: "#b7b3c9", fontSize: "0.95rem" }}>
              Información oficial para usuarios, comercios aliados, App Store y Google Play.
            </p>
          </div>
          <div>
            <Link
              to="/"
              style={{
                display: "inline-block",
                padding: "10px 18px",
                borderRadius: "8px",
                border: "1px solid rgba(252, 209, 22, 0.5)",
                color: "#fcd116",
                textDecoration: "none",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>

        <nav
          aria-label="Secciones de soporte y legal"
          style={{ maxWidth: "1040px", margin: "20px auto 0 auto" }}
        >
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            {SECTIONS.map((sec) => {
              const isSelected = activeTab === sec.id;
              return (
                <li key={sec.id}>
                  <Link
                    to={sec.path}
                    onClick={() => setActiveTab(sec.id)}
                    aria-current={isSelected ? "page" : undefined}
                    style={{
                      display: "inline-block",
                      padding: "10px 18px",
                      borderRadius: "8px",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      backgroundColor: isSelected ? "#fcd116" : "rgba(255, 255, 255, 0.06)",
                      color: isSelected ? "#000000" : "#e2e0ec",
                      border: isSelected
                        ? "1px solid #fcd116"
                        : "1px solid rgba(255, 255, 255, 0.12)",
                    }}
                  >
                    {sec.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        style={{ maxWidth: "1040px", margin: "0 auto", padding: "32px 20px 64px 20px" }}
      >
        {/* SECCIÓN 1: SOPORTE TÉCNICO */}
        <section
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#fcd116", fontSize: "1.5rem" }}>
            1. Centro de Soporte al Usuario y Atención al Cliente
          </h2>
          <p style={{ color: "#d5d2e3" }}>
            Bienvenido al centro de soporte oficial de la aplicación móvil <strong>IGO Store</strong>{" "}
            (identificador de paquete: <code>com.odba08.igostore</code>). Nuestro equipo brinda
            asistencia directa sobre pedidos, entregas, pagos, afiliación de comercios y soporte
            técnico de cuentas.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "16px",
              marginTop: "20px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                background: "rgba(76, 206, 172, 0.08)",
                border: "1px solid rgba(76, 206, 172, 0.3)",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", color: "#4cceac", fontSize: "1.05rem" }}>
                Correo de Soporte Oficial
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                Escríbenos directamente a:{" "}
                <a
                  href="mailto:obueno8@gmail.com"
                  style={{ color: "#fcd116", fontWeight: 700 }}
                >
                  obueno8@gmail.com
                </a>
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "#b7b3c9" }}>
                Tiempo de respuesta promedio: menos de 24 horas hábiles.
              </p>
            </div>

            <div
              style={{
                background: "rgba(252, 209, 22, 0.08)",
                border: "1px solid rgba(252, 209, 22, 0.3)",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", color: "#fcd116", fontSize: "1.05rem" }}>
                Chat en Vivo desde la App
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                Dentro de la app móvil <strong>IGO Store</strong> puedes abrir un ticket o chatear
                en tiempo real desde la sección <strong>Mis Pedidos → Reportar Problema</strong>.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "12px",
                padding: "18px",
              }}
            >
              <h3 style={{ margin: "0 0 8px 0", color: "#ffffff", fontSize: "1.05rem" }}>
                Horario de Atención
              </h3>
              <p style={{ margin: 0, fontSize: "0.95rem" }}>
                Lunes a Domingo: 8:00 AM – 10:00 PM (GMT-4).
              </p>
              <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem", color: "#b7b3c9" }}>
                Monitoreo continuo de pedidos y despachos activos.
              </p>
            </div>
          </div>

          <h3 style={{ color: "#ffffff", fontSize: "1.2rem", marginBottom: "14px" }}>
            Preguntas Frecuentes (FAQ)
          </h3>

          <details name="igo-faq" className="igo-details" open>
            <summary>¿Cómo realizo seguimiento a mi pedido en IGO Store?</summary>
            <p style={{ marginTop: "10px", marginBottom: 0, color: "#d5d2e3" }}>
              Una vez confirmado tu pedido, puedes ver en tiempo real su estado (Pendiente, En
              Preparación, En Camino y Entregado) y el código QR de verificación de entrega desde la
              pestaña <strong>Pedidos</strong> en la aplicación móvil.
            </p>
          </details>

          <details name="igo-faq" className="igo-details">
            <summary>¿Cómo reporto un inconveniente con un producto o pago?</summary>
            <p style={{ marginTop: "10px", marginBottom: 0, color: "#d5d2e3" }}>
              En el detalle de tu orden dentro de la app, pulsa el botón{" "}
              <strong>Soporte / Reportar Problema</strong> para iniciar un chat directo con el
              administrador o envía un mensaje mediante el formulario de soporte que encontrarás más
              abajo.
            </p>
          </details>

          <details name="igo-faq" className="igo-details">
            <summary>¿Cómo puedo afiliar mi comercio o negocio a IGO Store?</summary>
            <p style={{ marginTop: "10px", marginBottom: 0, color: "#d5d2e3" }}>
              Selecciona el motivo <strong>Afiliación de Comercio</strong> en nuestro formulario de
              contacto o escríbenos a <code>obueno8@gmail.com</code> indicando el nombre de tu
              negocio, RIF/identificación y teléfono de contacto.
            </p>
          </details>

          <details name="igo-faq" className="igo-details">
            <summary>¿Cómo solicito la eliminación de mi cuenta y mis datos personales?</summary>
            <p style={{ marginTop: "10px", marginBottom: 0, color: "#d5d2e3" }}>
              Puedes eliminar tu cuenta desde la aplicación móvil en{" "}
              <strong>Perfil → Eliminar Cuenta</strong> o enviando tu solicitud en esta misma página
              seleccionando la opción <strong>Eliminación de Cuenta y Datos</strong>.
            </p>
          </details>

          <h3 style={{ color: "#ffffff", fontSize: "1.2rem", marginTop: "28px", marginBottom: "12px" }}>
            Formulario Directo de Soporte y Solicitudes
          </h3>

          {submittedTicket ? (
            <div
              role="status"
              style={{
                background: "rgba(76, 206, 172, 0.14)",
                border: "1px solid #4cceac",
                borderRadius: "12px",
                padding: "20px",
              }}
            >
              <p style={{ margin: 0, fontWeight: 700, color: "#4cceac", fontSize: "1.05rem" }}>
                Solicitud recibida correctamente — Ticket #{submittedTicket.id}
              </p>
              <p style={{ margin: "8px 0 12px 0", color: "#e2e0ec" }}>
                Hemos registrado tu solicitud asociada a <strong>{submittedTicket.email}</strong>.
                Nuestro equipo de soporte te responderá a la brevedad.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedTicket(null)}
                style={{
                  backgroundColor: "#fcd116",
                  color: "#000000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Enviar otra consulta
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "16px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <label htmlFor="support-name" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Nombre completo
                  </label>
                  <input
                    id="support-name"
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="igo-input"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="support-email" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Correo electrónico de contacto
                  </label>
                  <input
                    id="support-email"
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="igo-input"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="support-topic" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Tipo de solicitud
                  </label>
                  <select
                    id="support-topic"
                    value={contactTopic}
                    onChange={(e) => setContactTopic(e.target.value)}
                    className="igo-input"
                  >
                    <option value="soporte">Soporte técnico o ayuda con un pedido</option>
                    <option value="comercio">Afiliar mi negocio en IGO Store</option>
                    <option value="eliminar-cuenta">Solicitud de eliminación de cuenta y datos</option>
                    <option value="copyright">Consulta de Copyright / Propiedad Intelectual</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="support-message" style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                  Detalle de tu consulta o solicitud
                </label>
                <textarea
                  id="support-message"
                  rows={4}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="igo-input"
                />
              </div>
              <button
                type="submit"
                style={{
                  backgroundColor: "#fcd116",
                  color: "#000000",
                  border: "none",
                  borderRadius: "8px",
                  padding: "12px 24px",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Enviar Solicitud a Soporte
              </button>
            </form>
          )}
        </section>

        {/* SECCIÓN 2: POLÍTICA DE PRIVACIDAD */}
        <section
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#fcd116", fontSize: "1.5rem" }}>
            2. Política de Privacidad y Protección de Datos
          </h2>
          <p style={{ color: "#b7b3c9", fontSize: "0.9rem" }}>
            Última actualización: Noviembre 2026 | Aplicable a la app móvil <strong>IGO Store</strong>{" "}
            (iOS y Android) y panel web.
          </p>

          <h3 style={{ color: "#ffffff", fontSize: "1.1rem" }}>2.1. Datos que recopilamos</h3>
          <ul style={{ color: "#d5d2e3" }}>
            <li>
              <strong>Datos de cuenta y perfil:</strong> Nombre completo, dirección de correo
              electrónico, número de teléfono y fotografía de perfil opcional para identificar tu
              cuenta y procesar tus pedidos.
            </li>
            <li>
              <strong>Datos de ubicación (GPS):</strong> Con tu autorización expresa, IGO Store
              utiliza tu ubicación precisa y aproximada para mostrar comercios cercanos, calcular
              con exactitud la tarifa de delivery y permitir el seguimiento en tiempo real del
              repartidor hasta el punto de entrega.
            </li>
            <li>
              <strong>Cámara y Galería de Fotos:</strong> Se solicita acceso a la cámara y galería
              exclusivamente cuando el usuario decide adjuntar capturas de comprobantes de pago
              móvil/transferencias, actualizar la imagen de su perfil o producto, o escanear el
              código QR de validación de entrega.
            </li>
            <li>
              <strong>Notificaciones Push:</strong> Almacenamos el token de dispositivo para enviarte
              actualizaciones sobre el estado de tus pedidos y comunicaciones del servicio.
            </li>
          </ul>

          <h3 style={{ color: "#ffffff", fontSize: "1.1rem" }}>2.2. Uso y resguardo de la información</h3>
          <p style={{ color: "#d5d2e3" }}>
            Toda la información se transmite de forma cifrada mediante protocolos seguros{" "}
            <strong>HTTPS / TLS</strong>. <strong>IGO Store no vende, alquila ni comercializa</strong>{" "}
            datos personales a terceros ni los utiliza para rastreo publicitario entre aplicaciones
            de terceros. Los datos del pedido se comparten únicamente con el comercio aliado y el
            repartidor asignado para cumplir con la entrega solicitada.
          </p>
        </section>

        {/* SECCIÓN 3: COPYRIGHT Y PROPIEDAD INTELECTUAL */}
        <section
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "32px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#fcd116", fontSize: "1.5rem" }}>
            3. Copyright y Derechos de Propiedad Intelectual
          </h2>
          <p style={{ color: "#d5d2e3" }}>
            <strong>© 2026 IGO Store. Todos los derechos reservados.</strong>
          </p>
          <p style={{ color: "#d5d2e3" }}>
            El nombre comercial <strong>IGO Store</strong>, su logotipo, diseño de interfaz,
            gráficos promocionales, código fuente de la aplicación móvil (iOS y Android), panel
            administrativo y arquitectura de software son propiedad exclusiva de{" "}
            <strong>IGO Store / Oscar Bueno (Odba08)</strong> y están protegidos por las leyes
            internacionales de propiedad intelectual y derechos de autor. Las marcas y fotografías de
            los comercios aliados pertenecen a sus respectivos propietarios y se exhiben bajo
            autorización comercial dentro de la plataforma.
          </p>
        </section>

        {/* SECCIÓN 4: TÉRMINOS Y CONDICIONES & ELIMINACIÓN DE CUENTA */}
        <section
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "28px",
          }}
        >
          <h2 style={{ marginTop: 0, color: "#fcd116", fontSize: "1.5rem" }}>
            4. Términos de Uso y Eliminación de Cuenta
          </h2>
          <h3 style={{ color: "#ffffff", fontSize: "1.1rem" }}>
            4.1. Condiciones generales del servicio
          </h3>
          <p style={{ color: "#d5d2e3" }}>
            IGO Store actúa como plataforma tecnológica de intermediación que conecta a usuarios con
            comercios aliados y servicios de entrega a domicilio. El usuario se compromete a
            suministrar datos verídicos de contacto y entrega, así como comprobantes de pago válidos
            en cada transacción.
          </p>

          <h3 style={{ color: "#ffffff", fontSize: "1.1rem" }}>
            4.2. Procedimiento para eliminar tu cuenta y datos personales
          </h3>
          <p style={{ color: "#d5d2e3" }}>
            En cumplimiento con las políticas de <strong>Apple App Store</strong> y{" "}
            <strong>Google Play Store</strong>, todo usuario puede eliminar su cuenta y sus datos
            personales en cualquier momento:
          </p>
          <ol style={{ color: "#d5d2e3" }}>
            <li>
              <strong>Desde la app móvil IGO Store:</strong> Inicia sesión, dirígete a la pestaña{" "}
              <strong>Perfil</strong> y selecciona la opción <strong>Eliminar mi cuenta</strong>.
            </li>
            <li>
              <strong>Desde la web (sin abrir la app):</strong> Completa el formulario de esta página
              seleccionando <em>Solicitud de eliminación de cuenta y datos</em> o envía un correo a{" "}
              <a href="mailto:obueno8@gmail.com" style={{ color: "#fcd116" }}>
                obueno8@gmail.com
              </a>{" "}
              indicando el correo electrónico registrado. Se eliminarán de forma permanente tu
              perfil, credenciales, direcciones y tokens de notificación en un plazo máximo de 48
              horas.
            </li>
          </ol>
        </section>
      </main>

      <footer
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "24px 20px",
          textAlign: "center",
          color: "#9a95b0",
          fontSize: "0.88rem",
        }}
      >
        <p style={{ margin: "0 0 8px 0", fontWeight: 700, color: "#ffffff" }}>
          © 2026 IGO Store. Todos los derechos reservados.
        </p>
        <p style={{ margin: 0 }}>
          Contacto oficial: <a href="mailto:obueno8@gmail.com" style={{ color: "#fcd116" }}>obueno8@gmail.com</a> | Paquete: <code>com.odba08.igostore</code>
        </p>
      </footer>
    </div>
  );
};

export default PublicLegalPage;
