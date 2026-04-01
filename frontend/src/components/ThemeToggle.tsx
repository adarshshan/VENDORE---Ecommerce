import React from "react";
import { useStore } from "../store/useStore";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useStore();

  return (
    <Tooltip title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
      <IconButton
        onClick={toggleTheme}
        className="!text-text-secondary hover:!text-accent transition-colors"
        aria-label="toggle theme"
      >
        {theme === "dark" ? (
          <LightModeIcon fontSize="small" />
        ) : (
          <DarkModeIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
