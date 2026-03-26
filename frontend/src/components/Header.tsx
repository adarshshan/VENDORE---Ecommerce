import { Link, useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Settings from "@mui/icons-material/Settings";
import Logout from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import LocalMall from "@mui/icons-material/LocalMall";
import { Fragment, useState } from "react";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useStore((state) => state.cart);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Contact", path: "/contact" },
  ];

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{
        textAlign: "center",
        height: "100%",
        bgcolor: "var(--color-surface)",
      }}
    >
      <div className="h-full flex flex-col justify-between">
        <div>
          <div className="py-6 border-b border-border">
            <h2 className="text-2xl font-serif font-bold text-white tracking-widest">
              KIDS-OWN
            </h2>
          </div>
          <List className="!ps-4">
            {navItems?.map((item) => (
              <ListItem key={item?.label} disablePadding>
                <ListItemButton
                  sx={{ textAlign: "left", py: 2 }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      style: {
                        color: "var(--color-text-primary)",
                        fontWeight: 600,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem onClick={() => navigate("/orders")} className="gap-2">
              <LocalMall fontSize="small" className="text-white" />
              <ListItemText
                primary={"My Orders"}
                primaryTypographyProps={{
                  style: {
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                  },
                }}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                sx={{ textAlign: "left", py: 2 }}
                onClick={() => navigate("/cart")}
              >
                <ListItemText
                  primary={`Cart (${cart.length})`}
                  primaryTypographyProps={{
                    style: {
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          </List>
        </div>
        <div className="px-4 flex justify-between items-center">
          <Avatar>A</Avatar>
          <MenuItem sx={{ color: "var(--color-error) !important" }}>
            <ListItemIcon sx={{ color: "var(--color-error) !important" }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </div>
      </div>
    </Box>
  );

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 transition-all duration-300 px-[1rem] sm:px-[2rem]">
      <div className="container-custom py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="!text-white"
            >
              <MenuIcon />
            </IconButton>
          </div>
          <Link
            to="/"
            className="text-2xl md:text-3xl font-serif font-black tracking-tighter text-white hover:text-accent transition-colors"
          >
            KIDS-OWN
          </Link>
        </div>

        <nav className="flex items-center gap-8">
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item?.label}
                to={item?.path}
                className={`text-sm font-bold uppercase tracking-wider transition-all duration-200 hover:text-accent ${
                  location.pathname === item?.path
                    ? "text-accent"
                    : "text-text-secondary"
                }`}
              >
                {item?.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <IconButton
              onClick={() => navigate("/cart")}
              className="text-text-secondary hover:text-accent transition-colors relative"
            >
              <ShoppingCartIcon />
              {cart?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cart?.length}
                </span>
              )}
            </IconButton>
            <div className="w-px h-6 bg-border hidden md:block"></div>
            <div className="hidden md:block">
              <DropdownMenu />
            </div>
          </div>
        </nav>
      </div>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            bgcolor: "var(--color-surface)",
            borderRight: "1px solid var(--color-border)",
          },
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

  const user = useStore((state) => state?.user);
  const setUser = useStore((state) => state.setUser);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (action: string) => {
    handleClose();
    switch (action) {
      case "logout":
        setUser(null);
        localStorage.clear();
        navigate("/login");
        break;
      case "settings":
        break;
      case "profile":
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
            sx={{ ml: 0.5 }}
            aria-controls={open ? "account-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            {user ? (
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "var(--color-accent)",
                  color: "black",
                  fontWeight: "bold",
                  fontSize: "0.9rem",
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
            ) : (
              <button
                className="btn-primary btn-sm rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/login");
                }}
              >
                Login
              </button>
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
                filter: "drop-shadow(0px 10px 30px rgba(0,0,0,0.5))",
                mt: 1.5,
                bgcolor: "var(--color-surface-light)",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                "& .MuiMenuItem-root": {
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  "&:hover": {
                    bgcolor: "var(--color-surface-hover)",
                  },
                },
                "& .MuiListItemIcon-root": {
                  color: "var(--color-text-secondary)",
                  minWidth: "32px",
                },
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "var(--color-surface-light)",
                  borderTop: "1px solid var(--color-border)",
                  borderLeft: "1px solid var(--color-border)",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <div className="px-4 py-2 border-b border-border mb-2">
            <p className="text-sm font-bold text-white">{user.name}</p>
            <p className="text-xs text-text-muted truncate max-w-[150px]">
              {user.email}
            </p>
          </div>

          <MenuItem onClick={() => handleItemClick("profile")}>
            <Avatar sx={{ width: 24, height: 24, mr: 1 }} /> Profile
          </MenuItem>
          <MenuItem onClick={() => handleItemClick("myorders")}>
            <ListItemIcon>
              <LocalMall fontSize="small" />
            </ListItemIcon>
            My Orders
          </MenuItem>
          <div className="my-1 border-t border-border"></div>
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
          <MenuItem
            onClick={() => handleItemClick("logout")}
            sx={{ color: "var(--color-error) !important" }}
          >
            <ListItemIcon sx={{ color: "var(--color-error) !important" }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      )}
    </Fragment>
  );
};
