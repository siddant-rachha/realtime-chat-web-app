import { Box, CircularProgress, Typography } from "@mui/material";

export const LoadingText = ({ text }: { text: string }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 12 }}>
      <Typography variant="h6" fontFamily="monospace">
        {text}
      </Typography>
      <CircularProgress />
    </Box>
  );
};
