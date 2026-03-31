import { useEffect, useState } from "react";
import axios from "axios";
import { Grid, Paper, Typography } from "@mui/material";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user") || "{}").token}`,
          },
        };
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/dashboard`,
          config,
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-4 text-white">Loading dashboard...</div>;
  if (!stats) return <div className="p-4 text-white">Error loading dashboard data.</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} className="p-6 !bg-surface-light border border-border rounded-xl">
            <Typography variant="subtitle2" className="!text-gray-400 uppercase tracking-wider font-bold mb-1">
              Total Users
            </Typography>
            <Typography variant="h4" className="!text-white !font-bold">{stats.totalUsers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} className="p-6 !bg-surface-light border border-border rounded-xl">
            <Typography variant="subtitle2" className="!text-gray-400 uppercase tracking-wider font-bold mb-1">
              Total Products
            </Typography>
            <Typography variant="h4" className="!text-white !font-bold">{stats.totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} className="p-6 !bg-surface-light border border-border rounded-xl">
            <Typography variant="subtitle2" className="!text-gray-400 uppercase tracking-wider font-bold mb-1">
              Total Orders
            </Typography>
            <Typography variant="h4" className="!text-white !font-bold">{stats.totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={0} className="p-6 !bg-surface-light border border-border rounded-xl">
            <Typography variant="subtitle2" className="!text-gray-400 uppercase tracking-wider font-bold mb-1">
              Total Revenue
            </Typography>
            <Typography variant="h4" className="!text-white !font-bold">
              ${stats.totalRevenue.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-light">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {stats.recentOrders.map((order: any) => (
              <tr 
                key={order._id}
                className="bg-[var(--color-surface)] hover:bg-surface-light transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-400 font-mono">
                    {order._id}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">
                    {order.user?.name || "Unknown"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-white">
                    ${order.totalPrice.toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded text-xs text-white ${order.isPaid ? "bg-green-500" : "bg-red-500"}`}
                  >
                    {order.isPaid ? "Paid" : "Unpaid"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
