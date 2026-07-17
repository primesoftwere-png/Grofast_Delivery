'use client';

import { DollarSign, TrendingDown, Wallet, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deliveryWalletAPI } from "@/lib/api";
import DeliveryCyclistLoader from "@/components/common/DeliveryCyclistLoader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Income = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // Date filter states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchIncomeData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      
      const response = await deliveryWalletAPI.getIncome(params);
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.message || "Failed to load income data");
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, [startDate, endDate]);

  if (loading) {
    return <DeliveryCyclistLoader />;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  const { cashFlow, onlineFlow } = data || {};

  // For chart, we might not have historical week data from this API, 
  // so we can fallback to static or remove it. Let's just create a simple chart comparing today vs total
  const chartData = [
    { name: "Period Earnings", value: onlineFlow?.periodEarnings || 0 },
    { name: "Total Earnings", value: onlineFlow?.totalEarnings || 0 },
  ];

  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Income
          </h1>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border rounded-xl text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Earnings */}
          <div className="border border-border/50 rounded-xl">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Total Earnings
                </p>
                <p className="text-lg font-bold text-foreground">
                  ₹{onlineFlow?.totalEarnings?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Today Earnings */}
          <div className="border border-border/50 rounded-xl">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Period Earnings
                </p>
                <p className="text-lg font-bold text-foreground">
                  ₹{onlineFlow?.periodEarnings?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Pending COD to Settle */}
          <div className="border border-border/50 border-primary/30 bg-primary/5 rounded-xl">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Pending COD to Settle
                </p>
                <p className="text-lg font-bold text-primary">
                  ₹{cashFlow?.pendingCodToSettle?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-2">
            <p className="text-base font-semibold">
              Earnings Breakdown
            </p>
          </div>

          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  name="Amount (₹)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>



      </div>
    </div>
  );
};

export default Income;