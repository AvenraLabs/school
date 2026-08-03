import { useState, useEffect } from 'react';
import { feeAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate, formatDateTime } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle } from '../../../components/ui/Card';
import { StatsCard } from '../../../components/common/StatsCard';
import { EmptyState } from '../../../components/common/EmptyState';
import {
  CalendarDays, Banknote, Smartphone, Building2,
  IndianRupee, Search, ChevronLeft, ChevronRight, X, RefreshCw
} from 'lucide-react';

export function FeeReports() {
  const [reportDate, setReportDate] = useState('');
  const [mode, setMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

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
  const isFilteredByDate = Boolean(reportDate);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Collection"
          value={`₹${Number(summary.total ?? summary.total_collected ?? 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          active={true}
          subtext={`${summary.count || payments.length || 0} receipts (${isFilteredByDate ? formatDate(reportDate) : 'All Time'})`}
        />
        <StatsCard
          title="Cash Collection"
          value={`₹${Number(summary.cash ?? summary.cash_total ?? 0).toLocaleString('en-IN')}`}
          icon={Banknote}
          subtext="Direct desk cash"
        />
        <StatsCard
          title="UPI / Digital"
          value={`₹${Number(summary.upi ?? summary.upi_total ?? 0).toLocaleString('en-IN')}`}
          icon={Smartphone}
          subtext="Online & QR payments"
        />
        <StatsCard
          title="Bank & Cheque"
          value={`₹${Number(summary.bank ?? summary.bank_total ?? 0).toLocaleString('en-IN')}`}
          icon={Building2}
          subtext="Direct bank transfers"
        />
      </div>

      {/* Filter Bar */}
      <Card className="p-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Input
                type="date"
                className="w-40 text-xs"
                value={reportDate}
                onChange={(e) => { setReportDate(e.target.value); setCurrentPage(1); }}
              />
              {reportDate && (
                <button
                  type="button"
                  onClick={() => { setReportDate(''); setCurrentPage(1); }}
                  className="p-1.5 text-[#8C97AB] hover:text-[#14213D] hover:bg-[#FAFAF8] rounded-md transition-colors cursor-pointer"
                  title="Clear date filter (Show All Time)"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Select
              className="w-36 text-xs"
              value={mode}
              onChange={(e) => { setMode(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Modes</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
            </Select>
            <div className="w-64">
              <Input
                icon={Search}
                placeholder="Search student or receipt..."
                className="w-full text-xs"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!reportDate && (
              <span className="text-xs font-medium text-[#2F6F5E] bg-[#EAF3F0] px-2.5 py-1 rounded-full border border-[#2F6F5E]/20 shrink-0">
                All-Time Records
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Receipt No</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Class & Section</th>
                <th className="px-4 py-3">Fee Title</th>
                <th className="px-4 py-3">Mode</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#8C97AB]">Loading receipts report...</td></tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <EmptyState
                      icon={CalendarDays}
                      title="No collection receipts found"
                      description={isFilteredByDate ? "No collection entries match the selected date." : "No collection entries match your filters."}
                    />
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-2.5 font-mono font-bold">#{p.receipt_no}</td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{formatDateTime(p.paid_at)}</td>
                    <td className="px-4 py-2.5 font-semibold">{p.student_name || p.student?.name || p.student?.User?.name || '—'}</td>
                    <td className="px-4 py-2.5 text-[#52607D]">{p.class_name ? `Class ${p.class_name}` : (p.student?.class_name ? `Class ${p.student.class_name}` : '—')}</td>
                    <td className="px-4 py-2.5 text-[#52607D]">{p.fee_title || 'Fee Payment'}</td>
                    <td className="px-4 py-2.5 uppercase font-mono font-semibold text-[#2F6F5E]">{p.mode}</td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-[#14213D]">₹{Number(p.amount).toLocaleString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#52607D]">
            <span>Page <strong className="text-[#14213D] font-mono">{currentPage}</strong> of <strong className="text-[#14213D] font-mono">{totalPages}</strong></span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>Previous</Button>
              <Button variant="outline" size="sm" iconRight={ChevronRight} onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

