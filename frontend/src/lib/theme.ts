import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#10b981", // Dark Blue
      light: "#f59e0b",
      contrastText: "#000000",
    },
    secondary: {
      main: "#3b82f6",
      contrastText: "#000000",
    },
    background: {
      default: "#ffffff", // Black
      paper: "#10b981", // Gray-900
    },
    text: {
      primary: "#000000",
      secondary: "#9ca3af",
    },
    divider: "#1f2937",
    success: {
      main: "#10b981",
    },
    error: {
      main: "#ef4444",
    },
    warning: {
      main: "#f59e0b",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          padding: "8px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});
