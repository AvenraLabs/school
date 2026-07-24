import { useState, useEffect } from 'react';
import { feeAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import {
  CalendarDays, Banknote, Smartphone, Building2,
  IndianRupee, Search, ChevronLeft, ChevronRight, Filter, X
} from 'lucide-react';

const StatTile = ({ icon: Icon, label, value, color }) => {
  const colors = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', val: 'text-emerald-700', border: 'border-emerald-200' },
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  val: 'text-indigo-700',  border: 'border-indigo-200'  },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  val: 'text-violet-700',  border: 'border-violet-200'  },
    slate:   { bg: 'bg-slate-50',   icon: 'text-slate-500',   val: 'text-slate-800',   border: 'border-slate-200'   },
  };
  const c = colors[color] || colors.slate;
  return (
    <div className={`card p-4 flex items-center gap-3 border ${c.border}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className={`text-xl font-black mt-0.5 ${c.val}`}>{value}</p>
      </div>
    </div>
  );
};

export function FeeReports() {
  const [reportDate, setReportDate] = useState('');
  const [mode, setMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const toast = useToast();

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await feeAPI.getDailyReport({
        date: reportDate || undefined,
        mode: mode !== 'all' ? mode : undefined,
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery.trim() || undefined,
      });
      setReportData(data);
    } catch {
      toast.error('Failed to load collection report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportDate, mode, currentPage, itemsPerPage, searchQuery]);

  const summary = reportData?.summary || {};
  const payments = reportData?.payments || [];
  const pagination = reportData?.pagination || {};

  const totalItems = pagination.total ?? payments.length;
  const totalPages = pagination.total_pages || Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = payments;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getModeBadge = (paymentMode) => {
    switch (paymentMode) {
      case 'cash':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase">Cash</span>;
      case 'upi':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase">UPI / GPay</span>;
      case 'bank_transfer':
        return <span className="bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase">Bank / NEFT</span>;
      case 'cheque':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase">Cheque</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase">{paymentMode}</span>;
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Filters & Controls Toolbar ────────────────────── */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-500 flex-shrink-0" />
            <h2 className="text-sm font-bold text-slate-900">Fee Collection Report</h2>
          </div>

          {(reportDate || mode !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setReportDate('');
                setMode('all');
                setSearchQuery('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          {/* Mode Filter */}
          <div>
            <label className="label text-[11px] uppercase font-bold text-slate-500 mb-1 block">Payment Mode</label>
            <select
              className="select-field text-xs font-semibold w-full"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="all">All Payment Modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI / GPay</option>
              <option value="bank_transfer">Bank Transfer / NEFT</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="label text-[11px] uppercase font-bold text-slate-500 mb-1 block">Report Date</label>
            <div className="relative">
              <input
                type="date"
                className="input-field text-xs font-semibold w-full"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
              />
              {reportDate && (
                <button
                  type="button"
                  onClick={() => setReportDate('')}
                  className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                  title="Clear Date (Show All Time)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="label text-[11px] uppercase font-bold text-slate-500 mb-1 block">Search Report</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Receipt #, Student, Class, Fee title..."
                className="input-field text-xs pl-9 w-full"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Summary Stats ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          icon={IndianRupee}
          label="Total Collected"
          value={`₹${(summary.total_collected || 0).toLocaleString('en-IN')}`}
          color="slate"
        />
        <StatTile
          icon={Banknote}
          label="Cash Total"
          value={`₹${(summary.cash_total || 0).toLocaleString('en-IN')}`}
          color="emerald"
        />
        <StatTile
          icon={Smartphone}
          label="UPI Total"
          value={`₹${(summary.upi_total || 0).toLocaleString('en-IN')}`}
          color="indigo"
        />
        <StatTile
          icon={Building2}
          label="Bank / Cheque Total"
          value={`₹${(summary.bank_total || 0).toLocaleString('en-IN')}`}
          color="violet"
        />
      </div>

      {/* ── Report Transactions Table ──────────────────────── */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Collection Transactions ({totalItems})
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Rows:</span>
            <select
              className="select-field text-xs py-1 px-2 w-16"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">Loading report records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left text-xs">
              <thead>
                <tr>
                  <th className="pl-5">Receipt #</th>
                  <th>Date & Time</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Fee Description</th>
                  <th>Mode</th>
                  <th className="text-right pr-5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No report records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="pl-5 font-bold text-slate-900">#{p.receipt_no}</td>
                      <td className="text-slate-500 font-medium">
                        {p.paid_at ? new Date(p.paid_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }) : '—'}
                      </td>
                      <td className="font-bold text-slate-800">{p.student_name}</td>
                      <td className="font-semibold text-slate-600">{p.class_name ? `Class ${p.class_name}` : '—'}</td>
                      <td className="text-indigo-700 font-bold">{p.fee_title}</td>
                      <td>{getModeBadge(p.mode)}</td>
                      <td className="text-right pr-5 font-black text-emerald-700 text-sm">
                        ₹{Number(p.amount).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination Footer ─────────────────────────────── */}
        {!loading && totalItems > 0 && (
          <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-700">{startIndex + 1}</span> to{' '}
              <span className="font-bold text-slate-700">{Math.min(startIndex + itemsPerPage, totalItems)}</span> of{' '}
              <span className="font-bold text-slate-700">{totalItems}</span> transactions
            </p>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="btn-ghost text-xs p-1.5 rounded-lg disabled:opacity-40"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => {
                  const prev = arr[idx - 1];
                  const showEllipsis = prev && p - prev > 1;
                  return (
                    <span key={p} className="flex items-center gap-1.5">
                      {showEllipsis && <span className="text-xs text-slate-400 font-bold px-1">...</span>}
                      <button
                        type="button"
                        onClick={() => handlePageChange(p)}
                        className={`text-xs w-7 h-7 rounded-lg font-bold transition-all ${
                          currentPage === p
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'text-slate-600 hover:bg-slate-200/60'
                        }`}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="btn-ghost text-xs p-1.5 rounded-lg disabled:opacity-40"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
