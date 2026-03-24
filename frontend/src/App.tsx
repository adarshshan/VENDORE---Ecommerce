import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/user/HomePage";
import Cart from "./pages/user/Cart";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProductManagement from "./pages/admin/ProductManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ProductList from "./pages/user/ProductList";
import ProductDetails from "./pages/user/ProductDetails";
import Dashboard from "./pages/admin/Dashboard";
import Login from "./pages/user/Login";
import Checkout from "./pages/user/Checkout";
import MyOrders from "./pages/user/MyOrders";
import OrderDetails from "./pages/user/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute";

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
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
