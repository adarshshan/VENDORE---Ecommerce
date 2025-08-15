import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./components/HomePage";
import ProductList from "./components/ProductList";
import ProductDetails from "./components/ProductDetails";
import Cart from "./components/Cart";
import Login from "./components/Login";
import AppLayout from "./layouts/AppLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminPanel from "./pages/AdminPanel";

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
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminLayout>
        <AdminPanel />
      </AdminLayout>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
