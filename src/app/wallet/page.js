'use client';

import { useState, useEffect } from "react";
import { Wallet, History, ArrowDownLeft, ArrowUpRight, Loader2, AlertCircle, RefreshCcw, CheckCircle2, FileText, Upload } from "lucide-react";
import { deliveryWalletAPI } from "@/lib/api";

const WalletPage = () => {
  const [balanceData, setBalanceData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Settlement Modal State
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Add Balance Modal State
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState("");
  const [addingBalance, setAddingBalance] = useState(false);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [balanceRes, transRes, settleRes] = await Promise.all([
        deliveryWalletAPI.getWalletBalance(),
        deliveryWalletAPI.getTransactions({ limit: 10 }),
        deliveryWalletAPI.getSettlementHistory({ limit: 10 })
      ]);

      if (balanceRes.success) setBalanceData(balanceRes.data);
      if (transRes.success) setTransactions(transRes.data.transactions || []);
      if (settleRes.success) setSettlements(settleRes.data.settlements || []);
    } catch (err) {
      setError(err.message || "Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      
      const payload = {
        amount: Number(settleAmount),
        paymentMethod,
        referenceNumber,
        remarks
      };
      
      const res = await deliveryWalletAPI.requestSettlement(payload);
      
      if (res.success) {
        setSuccessMessage("Settlement request submitted successfully.");
        setIsSettleModalOpen(false);
        // Reset form
        setSettleAmount("");
        setReferenceNumber("");
        setRemarks("");
        // Refresh data
        fetchWalletData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to submit settlement request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddBalanceSubmit = async (e) => {
    e.preventDefault();
    try {
      setAddingBalance(true);
      setError(null);
      
      const payload = {
        amount: Number(addBalanceAmount),
        description: "Wallet balance added (Simulated)"
      };
      
      const res = await deliveryWalletAPI.addBalance(payload);
      
      if (res.success) {
        setSuccessMessage("Balance added successfully.");
        setIsAddBalanceModalOpen(false);
        setAddBalanceAmount("");
        fetchWalletData();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to add balance");
    } finally {
      setAddingBalance(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-100px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Pending COD amount is negative balance
  const pendingAmount = balanceData?.balance < 0 ? Math.abs(balanceData.balance) : 0;

  return (
    <div className="p-4 space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-foreground">
          My Wallet
        </h1>
        <button onClick={fetchWalletData} className="p-2 bg-muted rounded-full hover:bg-muted/80 transition-colors">
          <RefreshCcw className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-500 text-green-700 rounded-xl p-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {error && !isSettleModalOpen && (
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-xl p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

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
          
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-bold">
                ₹{balanceData?.balance?.toLocaleString() || 0}
              </h2>
              <p className="text-primary-foreground/80 text-sm mt-1">
                COD Limit: ₹{balanceData?.codLimit?.toLocaleString() || 0}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddBalanceModalOpen(true)}
                className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform hover:bg-white/30"
              >
                + Add Balance
              </button>
              {pendingAmount > 0 && (
                <button 
                  onClick={() => setIsSettleModalOpen(true)}
                  className="bg-white text-primary px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-transform"
                >
                  Settle COD
                </button>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 pt-4 border-t border-white/20">
            <div>
              <p className="text-xs text-primary-foreground/70 mb-1">COD Collected</p>
              <p className="font-semibold text-lg">₹{balanceData?.codCollected?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-xs text-primary-foreground/70 mb-1">Pending to Settle</p>
              <p className="font-semibold text-lg">₹{balanceData?.codPending?.toLocaleString() || pendingAmount.toLocaleString()}</p>
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

      {/* Settlements List */}
      {settlements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-muted-foreground" />
              Recent Settlements
            </h2>
          </div>
          <div className="space-y-3">
            {settlements.map((settlement) => (
              <div key={settlement._id} className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      ₹{settlement.amount} <span className="text-xs text-muted-foreground ml-1">via {settlement.paymentMethod.toUpperCase()}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(settlement.createdAt).toLocaleDateString()} • {new Date(settlement.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      ID: {settlement.settlementNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    settlement.status === 'approved' ? 'bg-green-100 text-green-700' :
                    settlement.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {settlement.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
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

      {/* Settle COD Modal */}
      {isSettleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="font-bold text-lg">Settle COD Amount</h3>
              <button 
                onClick={() => setIsSettleModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSettleSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20 flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
            
              <div>
                <label className="block text-sm font-medium mb-1.5 text-muted-foreground">Pending Amount</label>
                <div className="text-xl font-bold">₹{pendingAmount.toLocaleString()}</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Amount to Settle (₹) *</label>
                <input
                  type="number"
                  min="1"
                  max={pendingAmount}
                  required
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Payment Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'upi', label: 'UPI' },
                    { id: 'bank_transfer', label: 'Bank' },
                    { id: 'cash', label: 'Cash' }
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`border rounded-xl text-center py-2 text-sm font-medium cursor-pointer transition-colors ${
                        paymentMethod === method.id 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-input hover:bg-muted'
                      }`}
                    >
                      {method.label}
                    </div>
                  ))}
                </div>
              </div>

              {paymentMethod !== 'cash' && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Reference Number *</label>
                  <input
                    type="text"
                    required
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter UTR or Transaction ID"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Remarks (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Any additional notes..."
                  rows="2"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-70 flex items-center justify-center"
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    "Submit Settlement Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Balance Modal (Simulated) */}
      {isAddBalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
              <h3 className="font-bold text-lg">Add Balance (Simulated)</h3>
              <button 
                onClick={() => setIsAddBalanceModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddBalanceSubmit} className="p-4 space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl border border-destructive/20 flex gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1.5">Amount to Add (₹) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addBalanceAmount}
                  onChange={(e) => setAddBalanceAmount(e.target.value)}
                  className="w-full bg-background border border-input rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter amount"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addingBalance}
                  className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-70 flex items-center justify-center"
                >
                  {addingBalance ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Adding...</>
                  ) : (
                    "Add Balance"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;
