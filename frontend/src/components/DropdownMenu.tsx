import { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import {
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Typography,
} from "@mui/material";
import {
  LocalMall,
  Logout,
  Dashboard,
  ContactSupport,
  SwapHoriz,
} from "@mui/icons-material";

const DropdownMenu = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const user = useStore((state) => state.user);
  const logout = useStore((state) => state.logout);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (path: string) => {
    handleClose();
    if (path === "logout") {
      logout();
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  return (
    <Fragment>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {user ? (
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{
                ml: 1,
                p: 0.5,
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  bgcolor: "rgba(56, 189, 248, 0.1)",
                },
              }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                sx={{
                  width: 38,
                  height: 38,
                  bgcolor: "var(--color-accent)",
                  color: "var(--color-background)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  border: "2px solid var(--color-border)",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        ) : (
          <button
            className="bg-accent hover:bg-accent-hover text-background px-6 py-2 rounded-full font-bold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg active:scale-95"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        )}
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
                filter:
                  "drop-shadow(0px 8px 32px rg--color-borderba(0,0,0,0.8))",
                mt: 1.5,
                minWidth: 240,
                bgcolor: "var(--color-surface-light)",
                backgroundImage: "none",
                border: "1px solid var(--color-border)",
                color: "var(--color-text-primary)",
                borderRadius: "12px",
                "& .MuiMenuItem-root": {
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  px: 2,
                  py: 1.2,
                  mx: 1,
                  borderRadius: "8px",
                  gap: 1.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: "var(--color-surface-hover)",
                    color: "var(--color-accent)",
                    "& .MuiListItemIcon-root": {
                      color: "var(--color-accent)",
                    },
                  },
                },
                "& .MuiListItemIcon-root": {
                  color: "var(--color-text-secondary)",
                  minWidth: "auto",
                  transition: "all 0.2s ease",
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
          <Box
            sx={{
              px: 0.5,
              py: 0.1,
              mb: 1,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: "var(--color-surface-hover)",
                color: "var(--color-accent)",
                border: "1px solid var(--color-border)",
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ fontWeight: 700, color: "var(--color-text-primary)" }}
              >
                {user.name}
              </Typography>
              <Typography
                variant="caption"
                noWrap
                sx={{
                  color: "var(--color-text-muted)",
                  display: "block",
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>

          <Divider
            sx={{
              my: 1,
              borderColor: "var(--color-border-light)",
              opacity: 0.6,
            }}
          />

          {user.role === "admin" && (
            <MenuItem onClick={() => handleItemClick("/admin")}>
              <ListItemIcon>
                <Dashboard fontSize="small" />
              </ListItemIcon>
              Admin Dashboard
            </MenuItem>
          )}

          <MenuItem onClick={() => handleItemClick("/orders")}>
            <ListItemIcon>
              <LocalMall fontSize="small" />
            </ListItemIcon>
            My Orders
          </MenuItem>

          <MenuItem onClick={() => handleItemClick("/contact")}>
            <ListItemIcon>
              <ContactSupport fontSize="small" />
            </ListItemIcon>
            Contact Support
          </MenuItem>

          <MenuItem onClick={() => handleItemClick("/return&exchange")}>
            <ListItemIcon>
              <SwapHoriz fontSize="small" />
            </ListItemIcon>
            Returns & Exchanges
          </MenuItem>

          <Divider
            sx={{ my: 1, borderColor: "var(--color-border)", opacity: 0.6 }}
          />

          <MenuItem
            onClick={() => handleItemClick("logout")}
            sx={{
              color: "var(--color-error) !important",
              "&:hover": {
                bgcolor: "rgba(239, 68, 68, 0.1) !important",
              },
            }}
          >
            <ListItemIcon sx={{ color: "inherit" }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      )}
    </Fragment>
  );
};

export default DropdownMenu;
