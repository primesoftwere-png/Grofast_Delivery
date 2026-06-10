'use client';

import { useState, useEffect } from "react";
import { Wallet, History, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle } from "lucide-react";
import { deliveryWalletAPI } from "@/lib/api";

const WalletPage = () => {
  const [balanceData, setBalanceData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [balanceRes, transRes] = await Promise.all([
          deliveryWalletAPI.getWalletBalance(),
          deliveryWalletAPI.getTransactions({ limit: 50 })
        ]);

        if (balanceRes.success) setBalanceData(balanceRes.data);
        if (transRes.success) setTransactions(transRes.data.transactions || []);
      } catch (err) {
        setError(err.message || "Failed to load wallet data");
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
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

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-20">
      <h1 className="text-2xl font-display font-bold text-foreground">
        My Wallet
      </h1>

      {/* Wallet Balance Card */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
              <Wallet className="w-4 h-4" />
              <span>Available Balance</span>
            </div>
            {balanceData?.isBlocked && (
              <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Blocked
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-4xl font-bold">
              ₹{balanceData?.balance?.toLocaleString() || 0}
            </h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              COD Limit: ₹{balanceData?.codLimit?.toLocaleString() || 0}
            </p>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs text-primary-foreground/70 mb-1">COD Collected</p>
              <p className="font-semibold text-lg">₹{balanceData?.codCollected?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70 mb-1">Pending to Settle</p>
              <p className="font-semibold text-lg">₹{balanceData?.codPending?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {balanceData?.isBlocked && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Account Blocked</p>
            <p className="text-sm mt-1">{balanceData.blockReason || "You have exceeded your COD collection limit. Please deposit the pending amount to unblock your account."}</p>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <History className="w-5 h-5 text-muted-foreground" />
            Recent Transactions
          </h2>
        </div>

        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl text-muted-foreground">
              No transactions found
            </div>
          ) : (
            transactions.map((tx) => (
              <div key={tx._id} className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.transactionType === 'credit' || tx.transactionType === 'bonus' 
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                      : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                  }`}>
                    {tx.transactionType === 'credit' || tx.transactionType === 'bonus' ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {tx.transactionType}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString()} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {tx.orderId && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Order #{tx.orderId.orderNumber || tx.orderId}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`font-bold ${
                    tx.transactionType === 'credit' || tx.transactionType === 'bonus' 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {tx.transactionType === 'credit' || tx.transactionType === 'bonus' ? '+' : '-'}₹{tx.amount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tx.paymentMethod ? tx.paymentMethod.toUpperCase() : 'WALLET'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
