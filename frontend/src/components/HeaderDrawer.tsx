import React from "react";
import {
  Logout,
  Close,
  Home,
  ShoppingBag,
  ContactSupport,
  SwapHoriz,
  Favorite,
  ShoppingCart,
  Dashboard,
  Login,
  Person,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useStore } from "../store/useStore";

interface HeaderDrawerInterface {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  navItems: {
    label: string;
    path: string;
  }[];
}

const HeaderDrawer: React.FC<HeaderDrawerInterface> = ({
  navItems,
  handleDrawerToggle,
  mobileOpen,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, cart, wishlist, theme, toggleTheme } = useStore();

  const handleNavigation = (path: string) => {
    handleDrawerToggle();
    navigate(path);
  };

  const handleLogout = () => {
    handleDrawerToggle();
    logout();
    navigate("/login");
  };

  const getIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case "home":
        return <Home />;
      case "products":
        return <ShoppingBag />;
      case "contact support":
        return <ContactSupport />;
      case "returns & exchanges":
        return <SwapHoriz />;
      default:
        return <ShoppingBag />;
    }
  };

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "var(--color-surface)",
        color: "var(--color-text-primary)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-serif)",
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: "var(--color-text-primary)",
          }}
        >
          VENDORA
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={toggleTheme}
            sx={{ color: "var(--color-text-secondary)" }}
          >
            {theme === "dark" ? <LightMode /> : <DarkMode />}
          </IconButton>
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ color: "var(--color-text-secondary)" }}
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation List */}
      <Box sx={{ flex: 1, overflowY: "auto", py: 2 }}>
        <List sx={{ px: 1 }} className="!bg-transparent">
          {navItems.map((item: any) => (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={location.pathname === item.path}
                sx={{
                  borderRadius: "8px",
                  "&.Mui-selected": {
                    bgcolor: "rgba(56, 189, 248, 0.1)",
                    color: "var(--color-accent)",
                    "& .MuiListItemIcon-root": { color: "var(--color-accent)" },
                  },
                  "&:hover": { bgcolor: "var(--color-surface-hover)" },
                }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  {getIcon(item.label)}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider
            sx={{
              my: 2,
              mx: 1,
              borderColor: "var(--color-border)",
              opacity: 0.5,
            }}
          />

          {/* User Specific Items */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation("/wishlist")}
              selected={location.pathname === "/wishlist"}
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Favorite />
              </ListItemIcon>
              <ListItemText
                primary={`Wishlist (${wishlist.length})`}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              onClick={() => handleNavigation("/cart")}
              selected={location.pathname === "/cart"}
              sx={{ borderRadius: "8px" }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <ShoppingCart />
              </ListItemIcon>
              <ListItemText
                primary={`My Cart (${cart.length})`}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </ListItem>

          {user && (
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation("/orders")}
                selected={location.pathname === "/orders"}
                sx={{ borderRadius: "8px" }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  <Person />
                </ListItemIcon>
                <ListItemText
                  primary="My Orders"
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}

          {user?.role === "admin" && (
            <ListItem disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation("/admin")}
                sx={{ borderRadius: "8px", color: "var(--color-accent)" }}
              >
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText
                  primary="Admin Dashboard"
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                />
              </ListItemButton>
            </ListItem>
          )}
        </List>
      </Box>

      {/* Footer / User Section */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid var(--color-border)",
          bgcolor: "var(--color-surface-light)",
        }}
      >
        {user ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 2,
                px: 1,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "var(--color-accent)",
                  color: "var(--color-background)",
                  fontWeight: 700,
                  width: 40,
                  height: 40,
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "white" }}
                  noWrap
                >
                  {user.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "var(--color-text-muted)" }}
                  noWrap
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                color: "var(--color-error)",
                "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              />
            </ListItemButton>
          </Box>
        ) : (
          <ListItemButton
            onClick={() => handleNavigation("/login")}
            sx={{
              borderRadius: "8px",
              bgcolor: "var(--color-accent)",
              color: "var(--color-background)",
              "&:hover": {
                bgcolor: "var(--color-accent-hover)",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
              <Login />
            </ListItemIcon>
            <ListItemText
              primary="Login / Register"
              primaryTypographyProps={{ fontWeight: 700, fontSize: "0.95rem" }}
            />
          </ListItemButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: "block", md: "none" },
        "& .MuiDrawer-paper": {
          boxSizing: "border-box",
          width: 300,
          bgcolor: "transparent",
          border: "none",
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default HeaderDrawer;
