"use client";

import { Box, Button, SwipeableDrawer, Typography, TextField } from "@mui/material";

export default function ImageSearchDrawer({
  open,
  onClose,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
      PaperProps={{
        sx: { height: "80%", borderTopLeftRadius: 16, borderTopRightRadius: 16 },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Image Search
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextField fullWidth size="small" placeholder="Search for images..." sx={{ mr: 1 }} />
          <Button variant="contained">Search</Button>
        </Box>

        {/* You can later show search results here */}
      </Box>
    </SwipeableDrawer>
  );
}
