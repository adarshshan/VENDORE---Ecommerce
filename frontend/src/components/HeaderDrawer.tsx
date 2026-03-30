import { LocalMall, Logout } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
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
  const user = useStore((state) => state?.user);
  const cart = useStore((state) => state.cart);
  const navigate = useNavigate();
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
        <div className="">
          <div className="py-6 border-b border-border">
            <h2 className="text-2xl font-serif font-bold text-white tracking-widest">
              VENDORA
            </h2>
          </div>
          <List className="!bg-transparent !ps-4">
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
          {user && (
            <div className="flex gap-1 items-center">
              <Avatar>{user?.name?.charAt(0)}</Avatar>
            </div>
          )}

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
  );
};

export default HeaderDrawer;
