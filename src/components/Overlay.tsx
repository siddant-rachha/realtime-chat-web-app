import { Box, CircularProgress } from "@mui/material";

export const Overlay = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10,
        opacity: 0.5,
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center", // horizontal
        alignItems: "flex-start", // vertical
      }}
    >
      <CircularProgress sx={{ mt: 12 }} />
    </Box>
  );
};
