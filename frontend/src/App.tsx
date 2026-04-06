import { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Loading from "./components/Loading";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load pages
const HomePage = lazy(() => import("./pages/user/HomePage"));
const Cart = lazy(() => import("./pages/user/Cart"));
const ProductList = lazy(() => import("./pages/user/ProductList"));
const ProductDetails = lazy(() => import("./pages/user/ProductDetails"));
const Login = lazy(() => import("./pages/user/Login"));
const Checkout = lazy(() => import("./pages/user/Checkout"));
const MyOrders = lazy(() => import("./pages/user/MyOrders"));
const OrderDetails = lazy(() => import("./pages/user/OrderDetails"));
const ContactUs = lazy(() => import("./pages/user/ContactUs"));
const Wishlist = lazy(() => import("./pages/user/Wishlist"));
const ReturnAndExchange = lazy(() => import("./pages/user/ReturnAndExchange"));
const Profile = lazy(() => import("./pages/user/Profile"));

// Admin pages
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard"));
const ProductManagement = lazy(() => import("./pages/admin/ProductManagement"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const OrderManagement = lazy(() => import("./pages/admin/OrderManagement"));
const CategoryManagement = lazy(
  () => import("./pages/admin/CategoryManagement"),
);
const ContactManagement = lazy(() => import("./pages/admin/ContactManagement"));

// Seller pages
const SellerLayout = lazy(() => import("./pages/seller/SellerLayout"));
const SellerLogin = lazy(() => import("./pages/seller/Login"));
const SellerInventory = lazy(() => import("./pages/seller/Inventory"));
const SellerOrders = lazy(() => import("./pages/seller/Orders"));

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "/products",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductList />
          </Suspense>
        ),
      },
      {
        path: "/product/:id",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductDetails />
          </Suspense>
        ),
      },
      {
        path: "/cart",
        element: (
          <Suspense fallback={<Loading />}>
            <Cart />
          </Suspense>
        ),
      },
      {
        path: "/wishlist",
        element: (
          <Suspense fallback={<Loading />}>
            <Wishlist />
          </Suspense>
        ),
      },
      {
        path: "/contact",
        element: (
          <Suspense fallback={<Loading />}>
            <ContactUs />
          </Suspense>
        ),
      },
      {
        path: "/return&exchange",
        element: (
          <Suspense fallback={<Loading />}>
            <ReturnAndExchange />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={<Loading />}>
            <Profile />
          </Suspense>
        ),
      },
      // Protected User Routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/checkout",
            element: (
              <Suspense fallback={<Loading />}>
                <Checkout />
              </Suspense>
            ),
          },
          {
            path: "/orders",
            element: (
              <Suspense fallback={<Loading />}>
                <MyOrders />
              </Suspense>
            ),
          },
          {
            path: "/orders/:id",
            element: (
              <Suspense fallback={<Loading />}>
                <OrderDetails />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <Suspense fallback={<Loading />}>
        <AdminLayout />
      </Suspense>
    ),
    children: [
      {
        path: "",
        element: (
          <Suspense fallback={<Loading />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: "product-management",
        element: (
          <Suspense fallback={<Loading />}>
            <ProductManagement />
          </Suspense>
        ),
      },
      {
        path: "user-management",
        element: (
          <Suspense fallback={<Loading />}>
            <UserManagement />
          </Suspense>
        ),
      },
      {
        path: "order-management",
        element: (
          <Suspense fallback={<Loading />}>
            <OrderManagement />
          </Suspense>
        ),
      },
      {
        path: "category-management",
        element: (
          <Suspense fallback={<Loading />}>
            <CategoryManagement />
          </Suspense>
        ),
      },
      {
        path: "contact-management",
        element: (
          <Suspense fallback={<Loading />}>
            <ContactManagement />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: "/seller-login",
    element: (
      <Suspense fallback={<Loading />}>
        <SellerLogin />
      </Suspense>
    ),
  },
  {
    path: "/seller",
    element: (
      <Suspense fallback={<Loading />}>
        <SellerLayout />
      </Suspense>
    ),
    children: [
      {
        path: "inventory",
        element: (
          <Suspense fallback={<Loading />}>
            <SellerInventory />
          </Suspense>
        ),
      },
      {
        path: "orders",
        element: (
          <Suspense fallback={<Loading />}>
            <SellerOrders />
          </Suspense>
        ),
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
            background: "var(--color-surface)",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
