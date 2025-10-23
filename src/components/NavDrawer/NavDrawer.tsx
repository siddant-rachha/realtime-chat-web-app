import { useAuthContext } from "@/store/Auth/useAuthContext";
import { useNavContext } from "@/store/NavDrawer/useNavContext";
import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  Toolbar,
  Typography,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Logout from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { NavBackBtn } from "./components/NavBackBtn";
import { NavLogo } from "./components/NavLogo";
import { NavDivider } from "./components/NavDivider";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -drawerWidth,
  /**
   * This is necessary to enable the selection of content. In the DOM, the stacking order is determined
   * by the order of appearance. Following this rule, elements appearing later in the markup will overlay
   * those that appear earlier. Since the Drawer comes after the Main content, this adjustment ensures
   * proper interaction with the underlying content.
   */
  position: "relative",
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create("margin", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: 0,
      },
    },
  ],
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginRight: drawerWidth,
      },
    },
  ],
}));

export default function NavDrawer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const {
    selectors: { navTitle, isBackBtnEnabled, navSubTitle },
  } = useNavContext();
  const {
    selectors: { user },
    actions: { signOutUser },
  } = useAuthContext();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const logoutHandler = async () => {
    signOutUser();
  };

  const navItems = [
    { label: "Chats", icon: <ChatIcon />, path: "/chats" },
    { label: "Add friend", icon: <GroupAddIcon />, path: "/add-friend" },
    { label: "My profile", icon: <PersonIcon />, path: "/profile" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        open={open}
        sx={{ height: 64, display: "flex", justifyContent: "center" }}
      >
        <Toolbar sx={{ userSelect: "none" }}>
          {/* back button */}
          {isBackBtnEnabled ? <NavBackBtn /> : <NavLogo />}

          <NavDivider />

          {/* Title */}
          <Typography
            component="div"
            sx={{ textAlign: "start", flexGrow: 1, marginLeft: 1, fontFamily: "monospace" }}
          >
            {navTitle}
          </Typography>

          <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: 8 }}>
            {navSubTitle}
          </Typography>

          <NavDivider />

          <Typography
            fontSize={10}
            component="div"
            sx={{ textAlign: "center", fontFamily: "fantasy" }}
          >
            {user ? (
              <>
                Logged in as:
                <br />
                {user.displayName}
              </>
            ) : (
              <>Not logged in</>
            )}
          </Typography>

          <NavDivider />

          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerOpen}
            sx={[open && { display: "none" }]}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Main open={open} sx={{ p: 0, px: 1, height: "100vh", width: "100vw" }}>
        <Box
          sx={{
            maxWidth: "900px",
            margin: "auto",
            height: `calc(100vh - 64px)`,
            marginTop: "64px",
          }}
        >
          {children}
        </Box>
      </Main>

      <Drawer
        sx={{
          userSelect: "none",
          width: drawerWidth,
          // width: "100vw",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            // width: drawerWidth,
            width: "90%",
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <Box sx={{ display: "flex", alignItems: "center", m: 2 }}>
          <Typography
            ml={1}
            sx={{ cursor: "pointer", fontWeight: "bold", fontSize: 18, fontFamily: "monospace" }}
            onClick={handleDrawerClose}
          >
            Close
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? (
              <ChevronLeftIcon color="primary" />
            ) : (
              <ChevronRightIcon color="primary" />
            )}{" "}
          </IconButton>
        </Box>
        <Divider />

        {/* Favicon Logo and title */}
        <List>
          <ListItem>
            <ListItemText
              primary={
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                  <Image src="/favicon.ico" alt="DiHola.Vercel.App" width="32" height="32" />

                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ marginLeft: 1, fontFamily: "fantasy" }}
                    fontStyle={"italic"}
                  >
                    DiHola.Vercel.App
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        </List>

        <Divider />

        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => {
                  router.replace(item.path);
                  handleDrawerClose();
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider />
        {/* Logout button */}
        <List>
          {user && (
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  logoutHandler();
                  handleDrawerClose();
                }}
              >
                <ListItemIcon>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary={"Logout"} sx={{ color: "red" }} />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Drawer>
    </Box>
  );
}
