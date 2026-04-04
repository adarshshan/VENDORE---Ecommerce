import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/user/HomePage";
import Cart from "./pages/user/Cart";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProductManagement from "./pages/admin/ProductManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import CategoryManagement from "./pages/admin/CategoryManagement";
import ProductList from "./pages/user/ProductList";
import ProductDetails from "./pages/user/ProductDetails";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/user/Login";
import Checkout from "./pages/user/Checkout";
import MyOrders from "./pages/user/MyOrders";
import OrderDetails from "./pages/user/OrderDetails";
import ContactUs from "./pages/user/ContactUs";
import Wishlist from "./pages/user/Wishlist";
import ContactManagement from "./pages/admin/ContactManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import ReturnAndExchange from "./pages/user/ReturnAndExchange";
import Profile from "./pages/user/Profile";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "/products",
        element: <ProductList />,
      },
      {
        path: "/product/:id",
        element: <ProductDetails />,
      },
      {
        path: "/cart",
        element: <Cart />,
      },
      {
        path: "/wishlist",
        element: <Wishlist />,
      },
      {
        path: "/contact",
        element: <ContactUs />,
      },
      {
        path: "/return&exchange",
        element: <ReturnAndExchange />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      // Protected User Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/checkout",
            element: <Checkout />,
          },
          {
            path: "/orders",
            element: <MyOrders />,
          },
          {
            path: "/orders/:id",
            element: <OrderDetails />,
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
      {
        path: "product-management",
        element: <ProductManagement />,
      },
      {
        path: "user-management",
        element: <UserManagement />,
      },
      {
        path: "order-management",
        element: <OrderManagement />,
      },
      {
        path: "category-management",
        element: <CategoryManagement />,
      },
      {
        path: "contact-management",
        element: <ContactManagement />,
      },
    ],
  },
]);

import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
