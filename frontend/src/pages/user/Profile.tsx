import { useNavigate } from "react-router-dom";
import { useStore } from "../../store/useStore";
import {
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon,
  Favorite as FavoriteIcon,
  SupportAgent as SupportAgentIcon,
  Repeat as RepeatIcon,
  AdminPanelSettings as AdminIcon,
  ExitToApp as LogoutIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, wishlist } = useStore();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItems = [
    {
      label: "My Orders",
      icon: <ShoppingBagIcon className="text-blue-500" />,
      path: "/orders",
      description: "View your order history and status",
      requiresAuth: true,
    },
    {
      label: "Wishlist",
      icon: <FavoriteIcon className="text-red-500" />,
      path: "/wishlist",
      description: "Manage items you've saved for later",
      badge: wishlist.length > 0 ? wishlist.length : null,
    },
    {
      label: "Returns & Exchanges",
      icon: <RepeatIcon className="text-orange-500" />,
      path: "/return&exchange",
      description: "Track your returns and replacements",
    },
    {
      label: "Contact Support",
      icon: <SupportAgentIcon className="text-green-500" />,
      path: "/contact",
      description: "Need help? Reach out to our team",
    },
  ];

  if (user?.role === "admin") {
    menuItems.push({
      label: "Admin Panel",
      icon: <AdminIcon className="text-purple-500" />,
      path: "/admin",
      description: "Manage products, orders, and users",
    });
  }

  return (
    <div className="min-h-screen bg-background sm:pb-12">
      <div className="container-custom sm:py-8 max-w-2xl mx-auto">
        {/* Profile Header */}
        <ProfileHeader user={user} />

        {/* Menu List */}
        <div className="space-y-3 px-4 mt-6">
          {menuItems.map((item: any) => {
            const isDisabled = item.requiresAuth && !user;
            return (
              <button
                key={item.path}
                disabled={isDisabled}
                onClick={() => !isDisabled && navigate(item.path)}
                className={`w-full flex items-center gap-4 p-4 bg-surface border border-border rounded-2xl transition-all duration-300 group shadow-sm ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-surface-hover active:scale-[0.98] cursor-pointer"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-background flex items-center justify-center transition-transform ${!isDisabled && "group-hover:scale-110"}`}
                >
                  {item.icon}
                </div>
                <div className="flex-grow text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-primary">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-accent text-text-inverse text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-secondary">
                    {isDisabled
                      ? "Please login to view orders"
                      : item.description}
                  </p>
                </div>
                {!isDisabled && (
                  <ChevronRightIcon className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            );
          })}

          {/* Logout Button - Only show if user is logged in */}
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-red-500 font-bold border border-red-500/20 bg-red-500/5 hover:bg-red-500 hover:text-white rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <LogoutIcon fontSize="small" />
              Logout Account
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-6 flex items-center justify-center gap-2 p-4 text-accent font-bold border border-accent/20 bg-accent/5 hover:bg-accent hover:text-text-inverse rounded-2xl transition-all duration-300 shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <PersonIcon fontSize="small" />
              Login to Account
            </button>
          )}
        </div>

        <div className="mt-12 text-center text-text-muted">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold">
            ThreadCo Premium Apparel
          </p>
          <p className="text-[10px] mt-1 opacity-50">Version 1.0.0 (BETA)</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;

interface Props {
  user?: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
}

const ProfileHeader: React.FC<Props> = ({ user }) => {
  const getInitials = (name?: string) => {
    if (!name) return "GU";
    const words = name.split(" ");
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-background border border-[var(--color-border)] shadow-sm hover:shadow-md transition-all">
      {/* Avatar */}
      <div className="relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-accent/10 border-4 border-accent/20 flex items-center justify-center overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="user"
              className="w-full h-full object-cover"
            />
          ) : user?.name ? (
            <span className="text-xl font-bold text-accent">
              {getInitials(user.name)}
            </span>
          ) : (
            <PersonIcon sx={{ fontSize: 40 }} className="text-accent" />
          )}
        </div>

        {/* Online Indicator (optional) */}
        <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      </div>

      {/* User Info */}
      <div className="flex flex-col justify-center">
        <p className="text-xl sm:text-2xl font-serif font-black text-text-primary capitalize">
          {user?.name || "Guest User"}
        </p>

        <p className="text-text-secondary text-sm break-all">
          {user?.email || "No email provided"}
        </p>

        {/* Role Badge */}
        {user?.role === "admin" && (
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-accent to-accent/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full w-fit shadow-sm">
            Admin
          </span>
        )}
      </div>
    </div>
  );
};
