'use client';

import { DollarSign, TrendingDown, Wallet, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { deliveryWalletAPI } from "@/lib/api";
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

  useEffect(() => {
    const fetchIncomeData = async () => {
      try {
        setLoading(true);
        const response = await deliveryWalletAPI.getIncomeDashboard();
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

    fetchIncomeData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        {error}
      </div>
    );
  }

  const { cashFlow, onlineFlow, wallet, settlement } = data || {};

  // For chart, we might not have historical week data from this API, 
  // so we can fallback to static or remove it. Let's just create a simple chart comparing today vs total
  const chartData = [
    { name: "Today Earnings", value: onlineFlow?.todayEarnings || 0 },
    { name: "Total Earnings", value: onlineFlow?.totalEarnings || 0 },
  ];

  return (
    <div className="p-4">
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-display font-bold text-foreground">
          Income
        </h1>

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
                  Today's Earnings
                </p>
                <p className="text-lg font-bold text-foreground">
                  ₹{onlineFlow?.todayEarnings?.toLocaleString() || 0}
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

        {/* Wallet Info Details */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-2">
            <p className="text-base font-semibold">
              Wallet Overview
            </p>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium text-foreground">
                  Wallet Balance
                </span>
                <span className={`font-semibold ${wallet?.balance < 0 ? 'text-destructive' : 'text-primary'}`}>
                  ₹{wallet?.balance?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium text-foreground">
                  Total COD Collected
                </span>
                <span className="font-semibold text-foreground">
                  ₹{cashFlow?.totalCodCollected?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                <span className="text-sm font-medium text-foreground">
                  COD Collection Limit
                </span>
                <span className="font-semibold text-foreground">
                  ₹{wallet?.codLimit?.toLocaleString() || 0}
                </span>
              </div>
              {settlement && (
                <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <span className="text-sm font-medium text-foreground">
                    Latest Settlement Status
                  </span>
                  <span className="font-semibold text-foreground capitalize">
                    {settlement.status} (₹{settlement.amount})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Income;