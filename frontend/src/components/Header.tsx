import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import LocalMall from "@mui/icons-material/LocalMall";
import { Fragment, useState } from "react";

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Contact", path: "/contacts" },
    { label: "Cart", path: "/cart" },
  ];

  const navigate = useNavigate();

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        KIDS-OWN
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <header className="bg-pink-500 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Link to="/" className="text-2xl font-bold">
            KIDS-OWN
          </Link>
        </div>

        <nav className="flex items-center space-x-4">
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {navItems.map((item) => (
                <Typography
                  key={item.label}
                  sx={{
                    cursor: "pointer",
                    "&:hover": { color: "rgba(255,255,255,0.8)" },
                  }}
                  onClick={() => navigate(item.path)}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          )}
          <DropdownMenu />
        </nav>
      </div>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </header>
  );
};

export default Header;

const DropdownMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (action: string) => {
    switch (action) {
      case "logout":
        setUser(null);
        localStorage.clear();
        console.log("the log out option clicked");
        break;
      case "settings":
        console.log("settings option clicked!");
        break;
      case "profile":
        console.log("profile option clicked");
        break;
      case "myorders":
        navigate("/orders");
        break;

      default:
        break;
    }
  };

  return (
    <Fragment>
      <Box sx={{ display: "flex", alignItems: "center", textAlign: "center" }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2, color: "inherit" }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            {user ? (
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.name.charAt(0)}
              </Avatar>
            ) : (
              <Typography
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
              >
                Login
              </Typography>
            )}
          </IconButton>
        </Tooltip>
      </Box>
      {user && (
        <Menu
          anchorEl={anchorEl}
          id="account-menu"
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          slotProps={{
            paper: {
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem onClick={() => handleItemClick("profile")}>
            <Avatar /> Profile
          </MenuItem>
          <MenuItem onClick={() => handleItemClick("myorders")}>
            <ListItemIcon>
              <LocalMall fontSize="small" />
            </ListItemIcon>
            My Orders
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleItemClick("another")}>
            <ListItemIcon>
              <PersonAdd fontSize="small" />
            </ListItemIcon>
            Add another account
          </MenuItem>
          <MenuItem onClick={() => handleItemClick("settings")}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            Settings
          </MenuItem>
          <MenuItem onClick={() => handleItemClick("logout")}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      )}
    </Fragment>
  );
};
