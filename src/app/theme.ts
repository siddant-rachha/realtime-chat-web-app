"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "var(--font-roboto)",
  },
  palette: {
    primary: {
      main: "#21303f",
    },
    secondary: {
      main: "#c3d5db8c",
    },
  },
});

export default theme;
