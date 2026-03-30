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
} from "@mui/material";
import { LocalMall, Logout } from "@mui/icons-material";

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
          <div className="flex items-center x 4 border-b border-border mb-2">
            <Avatar>{user?.name?.charAt(0)}</Avatar>

            <div className="flex flex-col gap-0">
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          </div>

          <MenuItem onClick={() => handleItemClick("myorders")}>
            <ListItemIcon>
              <LocalMall fontSize="small" />
            </ListItemIcon>
            My Orders
          </MenuItem>
          <div className="my-1 border-t border-border"></div>
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
export default DropdownMenu;
