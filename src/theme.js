import { createContext, useState, useMemo } from "react";
import { createTheme } from "@mui/material/styles";

// Tokens estratégicos: Obligamos a la plantilla a usar los colores de INGÖ
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#ffffff", // Textos principales en blanco puro
          200: "#e0e0e0",
          300: "#c2c2c2",
          400: "#a3a3a3",
          500: "#858585",
          600: "#666666",
          700: "#525252",
          800: "#292929",
          900: "#141414",
        },
        primary: {
          100: "#ffffff",
          200: "#f2f0f0",
          300: "#cccccc",
          // La plantilla usa primary[400] para el panel lateral (Sidebar) y las tarjetas. 
          // Lo forzamos a un gris casi negro para separar del fondo.
          400: "#111111", 
          // La plantilla usa primary[500] para el fondo general de la app.
          // Lo forzamos a negro puro.
          500: "#000000", 
          600: "#000000",
          700: "#000000",
          800: "#000000",
          900: "#000000",
        },
        greenAccent: {
          100: "#fffde7",
          200: "#fff59d",
          300: "#ffe082",
          400: "#ffd54f",
          500: "#ffc107", // Amarillo principal (Amber)
          600: "#ffb300",
          700: "#ffa000",
          800: "#ff8f00",
          900: "#ff6f00",
        },
        blueAccent: {
          100: "#fffde7",
          200: "#fff59d",
          300: "#ffe082",
          400: "#ffd54f",
          500: "#ffc107",
          600: "#ffb300",
          700: "#1e1e1e", // Fondo de cabeceras oscuro para legibilidad
          800: "#ffc107", // Texto en amarillo
          900: "#ff6f00",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
      }
    : {
        // Modo claro invertido (Blanco dominante, tarjetas grises claras, acentos amarillos)
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#f5f5f5",
        },
        primary: {
          100: "#000000",
          200: "#111111",
          300: "#333333",
          400: "#f5f5f5", // Panel lateral en modo claro
          500: "#ffffff", // Fondo general en modo claro
          600: "#e0e0e0",
          700: "#cccccc",
          800: "#a3a3a3",
          900: "#858585",
        },
        greenAccent: {
          100: "#ff6f00",
          200: "#ff8f00",
          300: "#ffa000",
          400: "#ffb300",
          500: "#ffc107", // Amarillo principal
          600: "#ffd54f",
          700: "#ffe082",
          800: "#fff59d",
          900: "#fffde7",
        },
        blueAccent: {
          100: "#ff6f00",
          200: "#ff8f00",
          300: "#ffa000",
          400: "#ffb300",
          500: "#ffc107",
          600: "#ffd54f",
          700: "#f0f0f0", // Fondo de cabecera claro en modo claro
          800: "#ffc107",
          900: "#fffde7",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
      }),
});

// Configuración del tema Material UI
export const themeSettings = (mode) => {
  const colors = tokens(mode);
  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[500],
            },
            secondary: {
              main: colors.greenAccent[500], 
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.primary[500],
            },
          }
        : {
            primary: {
              main: colors.primary[100],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#ffffff",
            },
          }),
    },
    typography: {
      fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      h1: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
      },
      h2: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
      },
      h3: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
      },
      h4: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
      },
      h5: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
      },
      h6: {
        fontFamily: ["Source Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
      },
    },
  };
};

// Contexto para el modo de color
export const ColorModeContext = createContext({
  toggleColorMode: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  return [theme, colorMode];
};