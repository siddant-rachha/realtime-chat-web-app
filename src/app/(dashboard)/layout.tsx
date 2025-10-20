"use client";

import { ReactNode, useEffect, useState } from "react";
import { Box, BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (pathname === "/chats") setValue(0);
    else if (pathname === "/add-friend") setValue(1);
    else if (pathname === "/profile") setValue(2);
  }, [pathname]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (_: any, newValue: number) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        router.push("/chats");
        break;
      case 1:
        router.push("/add-friend");
        break;
      case 2:
        router.push("/profile");
        break;
    }
  };

  return (
    <Box sx={{ pb: 7 }}>
      {children}
      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation value={value} onChange={handleChange}>
          <BottomNavigationAction label="Chats" icon={<ChatIcon />} />
          <BottomNavigationAction label="Add Friend" icon={<PersonAddIcon />} />
          <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
