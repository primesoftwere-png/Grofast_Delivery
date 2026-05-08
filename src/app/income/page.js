'use client';

import { DollarSign, TrendingDown, Wallet } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const weeklyData = [
  { week: "Week 1", gross: 4200, commission: 630, net: 3570 },
  { week: "Week 2", gross: 5100, commission: 765, net: 4335 },
  { week: "Week 3", gross: 4800, commission: 720, net: 4080 },
  { week: "Week 4", gross: 5600, commission: 840, net: 4760 },
];

const Income = () => {
  const totalGross = weeklyData.reduce((s, w) => s + w.gross, 0);
  const totalCommission = weeklyData.reduce((s, w) => s + w.commission, 0);
  const totalNet = weeklyData.reduce((s, w) => s + w.net, 0);

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
                  ₹{totalGross.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Commission */}
          <div className="border border-border/50 rounded-xl">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Commission (15%)
                </p>
                <p className="text-lg font-bold text-foreground">
                  -₹{totalCommission.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="border border-border/50 border-primary/30 bg-primary/5 rounded-xl">
            <div className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Net Income
                </p>
                <p className="text-lg font-bold text-primary">
                  ₹{totalNet.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-2">
            <p className="text-base font-semibold">
              Monthly Breakdown
            </p>
          </div>

          <div className="p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="week"
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
                  dataKey="gross"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                  name="Gross"
                />
                <Bar
                  dataKey="net"
                  fill="hsl(var(--secondary))"
                  radius={[6, 6, 0, 0]}
                  name="Net"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Details */}
        <div className="border border-border/50 rounded-xl">
          <div className="p-4 pb-2">
            <p className="text-base font-semibold">
              Weekly Details
            </p>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {weeklyData.map((w) => (
                <div
                  key={w.week}
                  className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
                >
                  <span className="text-sm font-medium text-foreground">
                    {w.week}
                  </span>

                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-muted-foreground">
                      ₹{w.gross}
                    </span>
                    <span className="text-destructive">
                      -₹{w.commission}
                    </span>
                    <span className="font-semibold text-primary">
                      ₹{w.net}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Income;