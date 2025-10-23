import { Box, Typography } from "@mui/material";
import Image from "next/image";

export const NavLogo = () => {
  return (
    <>
      <Image
        src="/favicon.ico"
        alt="DiHola.Vercel.App"
        width="18"
        height="18"
        style={{ marginRight: "4px" }}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontFamily: "fantasy" }} fontSize={12}>
          DiHola.
          <br />
          Vercel.
          <br />
          App
        </Typography>
      </Box>
    </>
  );
};
