import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  Users,
  CreditCard,
  PieChart,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { feeAPI } from '../../../api';
import { Button } from '../../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatsCard } from '../../../components/common/StatsCard';
import { EmptyState } from '../../../components/common/EmptyState';

export function FinanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await feeAPI.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError('Failed to load financial dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6 animate-pulse space-y-3">
              <div className="h-4 w-28 bg-[#EAF3F0] rounded" />
              <div className="h-8 w-40 bg-[#D3E6E0] rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center space-y-4 border-[#B0403A]/20 bg-[#FDF2F1]">
        <AlertCircle className="w-10 h-10 text-[#B0403A] mx-auto" />
        <p className="text-xs font-semibold text-[#B0403A]">{error}</p>
        <Button variant="outline" icon={RefreshCw} onClick={fetchDashboardData}>
          Retry Connection
        </Button>
      </Card>
    );
  }

  const {
    today_collection = 0,
    this_month_collection = 0,
    total_fees_collected = 0,
    pending_fees = 0,
    pending_students_count = 0,
    this_month_expenses = 0,
    total_expenses = 0,
    net_cash: netCash = 0,
    monthly_trends = [],
    expense_distribution = [],
  } = data || {};

  const formatINR = (val) =>
    '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

  const maxBarValue = Math.max(
    ...monthly_trends.map((t) => Math.max(t.collection || 0, t.expense || 0)),
    1000
  );

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-bold text-[#14213D]">Real-Time Cash Flow & Analytics</span>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
            Refresh Stats
          </Button>
        </div>
      </Card>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Today's Collection"
          value={formatINR(today_collection)}
          icon={Calendar}
          active={true}
          subtext="Direct cash & digital receipt today"
        />

        <StatsCard
          title="This Month Collection"
          value={formatINR(this_month_collection)}
          icon={TrendingUp}
          subtext="Total collected in calendar month"
        />

        <StatsCard
          title="Net Cash Flow (Month)"
          value={formatINR(netCash)}
          icon={Wallet}
          subtext={`Collection (${formatINR(this_month_collection)}) − Expenses (${formatINR(this_month_expenses)})`}
        />

        <StatsCard
          title="Total Pending Fees"
          value={formatINR(pending_fees)}
          icon={AlertCircle}
          subtext={`Across ${pending_students_count} defaulter student(s)`}
        />

        <StatsCard
          title="Expenses (This Month)"
          value={formatINR(this_month_expenses)}
          icon={TrendingDown}
          subtext="Operating costs for current month"
        />

        <StatsCard
          title="Total Fee Collection (Year)"
          value={formatINR(total_fees_collected)}
          icon={CreditCard}
          subtext={data?.academic_year?.name ? `Cumulative receipts (${data.academic_year.name})` : "Cumulative academic session receipts"}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly Collection vs Expense Trend Chart */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold text-[#14213D]">
                Collection vs Expense Trend
              </CardTitle>
              <p className="text-[11px] text-[#52607D]">Monthly comparison for {data?.academic_year?.name ? `Academic Session ${data.academic_year.name}` : 'Active Academic Session'}</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#2F6F5E]" />
                <span className="text-[#52607D]">Collection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#B0403A]" />
                <span className="text-[#52607D]">Expense</span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-[#EDEAE1]">
              {monthly_trends.map((item, idx) => {
                const collHeight = Math.max(8, Math.round(((item.collection || 0) / maxBarValue) * 100));
                const expHeight = Math.max(8, Math.round(((item.expense || 0) / maxBarValue) * 100));

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-full">
                      {/* Collection Bar */}
                      <div
                        style={{ height: `${collHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-[#2F6F5E] hover:bg-[#25584a] rounded-t-[4px] transition-all relative group/bar"
                      >
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#14213D] text-white text-[10px] py-1 px-2 rounded font-mono font-medium whitespace-nowrap pointer-events-none transition-all z-10">
                          {formatINR(item.collection)}
                        </div>
                      </div>
                      {/* Expense Bar */}
                      <div
                        style={{ height: `${expHeight}%` }}
                        className="w-1/2 max-w-[24px] bg-[#B0403A] hover:bg-[#91322d] rounded-t-[4px] transition-all relative group/bar"
                      >
                        <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-[#14213D] text-white text-[10px] py-1 px-2 rounded font-mono font-medium whitespace-nowrap pointer-events-none transition-all z-10">
                          {formatINR(item.expense)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#8C97AB] group-hover:text-[#14213D]">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-[10px] text-[#8C97AB]">
              Hover over bars to inspect monthly totals
            </p>
          </CardContent>
        </Card>

        {/* Expense Category Breakdown */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
            <CardTitle className="text-sm font-bold text-[#14213D] flex items-center justify-between">
              <span>Expense Categories</span>
              <PieChart className="w-4 h-4 text-[#2F6F5E]" />
            </CardTitle>
          </CardHeader>

          <CardContent className="p-4 flex-1">
            {expense_distribution.length === 0 ? (
              <EmptyState
                icon={PieChart}
                title="No expenses logged"
                description="No expense records for this term."
              />
            ) : (
              <div className="space-y-3">
                {expense_distribution.map((cat, idx) => {
                  const percent = total_expenses > 0 ? Math.round((cat.amount / total_expenses) * 100) : 0;

                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-[#14213D]">
                        <span>{cat.name}</span>
                        <span className="font-mono text-[#2F6F5E]">
                          {formatINR(cat.amount)} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#FAFAF8] border border-[#EDEAE1] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#2F6F5E] rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(4, percent))}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>

          <div className="p-3 bg-[#FAFAF8] border-t border-[#E4E1D8] text-xs text-[#52607D] flex justify-between items-center">
            <span>Total Logged Expenses</span>
            <span className="font-bold font-mono text-[#14213D]">{formatINR(total_expenses)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
