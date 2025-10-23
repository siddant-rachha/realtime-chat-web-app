import { Box, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export const NavBackBtn = () => {
  const router = useRouter();
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
      onClick={() => {
        router.replace("/chats");
      }}
    >
      <ArrowBackIcon sx={{ width: 16, height: 16 }} />
      <Typography sx={{ fontFamily: "monospace", fontSize: 14 }}>Back</Typography>
    </Box>
  );
};
