import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import CssBaseline from "@mui/material/CssBaseline";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Logout from "@mui/icons-material/Logout";
import ChatIcon from "@mui/icons-material/Chat";
import PersonIcon from "@mui/icons-material/Person";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useNavContext } from "@/store/NavDrawer/useNavContext";
import { useState } from "react";
import { useAuthContext } from "@/store/Auth/useAuthContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

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

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
  height: 64,
}));

export default function NavDrawer({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const {
    selectors: { navTitle, isBackBtnEnabled },
  } = useNavContext();
  const {
    selectors: { user },
  } = useAuthContext();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const logoutHandler = async () => {
    await signOut(auth);
    router.replace("/");
  };

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
          {isBackBtnEnabled ? (
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
              onClick={() => {
                router.replace("/chats");
              }}
            >
              <ArrowBackIcon sx={{ width: 18, height: 18 }} />
              Back
            </Box>
          ) : (
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
          )}
          <Divider
            variant="middle"
            orientation="vertical"
            flexItem
            sx={{ marginLeft: 1, marginRight: 1, backgroundColor: "white" }}
          />
          {/* Title */}

          <Typography
            component="div"
            sx={{ textAlign: "start", flexGrow: 1, marginLeft: 1, fontFamily: "monospace" }}
          >
            {navTitle}
          </Typography>
          <Divider
            variant="middle"
            orientation="vertical"
            flexItem
            sx={{ marginLeft: 1, marginRight: 1, backgroundColor: "white" }}
          />
          <Typography
            fontSize={12}
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

          <Divider
            variant="middle"
            orientation="vertical"
            flexItem
            sx={{ marginLeft: 1, marginRight: 1, backgroundColor: "white" }}
          />

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
      <Main open={open} sx={{ p: 0, px: 1, height: "100vh" }}>
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
        <DrawerHeader>
          <Typography
            ml={1}
            sx={{ cursor: "pointer", fontWeight: "bold" }}
            onClick={handleDrawerClose}
          >
            Close
          </Typography>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />}{" "}
          </IconButton>
        </DrawerHeader>
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
          {/* Navigation links */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                router.replace("/chats");
                handleDrawerClose();
              }}
            >
              <ListItemIcon>
                <ChatIcon />
              </ListItemIcon>
              <ListItemText primary={"Chats"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                router.replace("/add-friend");
                handleDrawerClose();
              }}
            >
              <ListItemIcon>
                <GroupAddIcon />
              </ListItemIcon>
              <ListItemText primary={"Add friend"} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                router.replace("/profile");
                handleDrawerClose();
              }}
            >
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary={"My profile"} />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        {/* Logout button */}
        <List>
          {user ? (
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
          ) : (
            <Typography sx={{ marginLeft: 2 }}>User not logged in</Typography>
          )}
        </List>
      </Drawer>
    </Box>
  );
}
