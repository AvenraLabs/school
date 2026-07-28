import { useState, useEffect, useCallback } from 'react';
import { libraryAPI } from '../../../api';
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { EmptyState } from '../../../components/common/EmptyState';
import { BookOpen, ClipboardList, AlertTriangle, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const REPORT_TABS = [
  { id: 'books', label: 'All Books Catalog', icon: BookOpen },
  { id: 'issued', label: 'Issued Loans', icon: ClipboardList },
  { id: 'overdue', label: 'Overdue Fines', icon: AlertTriangle },
  { id: 'lost', label: 'Lost / Damaged', icon: Package },
];

export function LibraryReports() {
  const [activeTab, setActiveTab] = useState('books');
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 15;

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'books') {
        const res = await libraryAPI.reportBooks({ status: statusFilter || undefined, limit: LIMIT, offset });
        setData(res.books || []);
        setTotal(res.total || 0);
      } else if (activeTab === 'issued') {
        const res = await libraryAPI.reportIssued({ status: statusFilter || 'issued', limit: LIMIT, offset });
        setData(res.issues || []);
        setTotal(res.total || 0);
      } else if (activeTab === 'overdue') {
        const res = await libraryAPI.reportOverdue({ limit: LIMIT, offset });
        setData(res.overdue || []);
        setTotal(res.total || 0);
      } else if (activeTab === 'lost') {
        const res = await libraryAPI.reportLost({ limit: LIMIT, offset });
        setData(res.lost || []);
        setTotal(res.total || 0);
      }
    } catch {
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter, offset]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="space-y-4 text-xs">
      {/* Sub Tab Bar */}
      <Card className="p-2">
        <div className="flex flex-wrap items-center gap-2">
          {REPORT_TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeTab === id ? 'primary' : 'outline'}
              size="sm"
              icon={Icon}
              onClick={() => { setActiveTab(id); setOffset(0); setStatusFilter(''); }}
            >
              {label}
            </Button>
          ))}
        </div>
      </Card>

      {/* Main Report Register */}
      <Card>
        <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
            {REPORT_TABS.find((t) => t.id === activeTab)?.label} Register ({total})
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                {activeTab === 'books' && (
                  <>
                    <th className="px-4 py-3">Book No</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3 text-center">Total Copies</th>
                    <th className="px-4 py-3 text-center">Available</th>
                    <th className="px-4 py-3 text-center">Issued</th>
                  </>
                )}
                {activeTab === 'issued' && (
                  <>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-4 py-3">Borrower</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </>
                )}
                {activeTab === 'overdue' && (
                  <>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-4 py-3">Borrower</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Overdue Days</th>
                    <th className="px-4 py-3 text-right">Estimated Fine</th>
                  </>
                )}
                {activeTab === 'lost' && (
                  <>
                    <th className="px-4 py-3">Book Title</th>
                    <th className="px-4 py-3">Reported Date</th>
                    <th className="px-4 py-3">Borrower / User</th>
                    <th className="px-4 py-3 text-right">Replacement Fine</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#8C97AB]">Loading report data...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center"><EmptyState icon={BookOpen} title="No records found" description="No report entries match your filters." /></td></tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAFAF8]">
                    {activeTab === 'books' && (
                      <>
                        <td className="px-4 py-2.5 font-mono font-bold">{row.book_no}</td>
                        <td className="px-4 py-2.5 font-semibold">{row.book_name}</td>
                        <td className="px-4 py-2.5 text-center font-mono">{row.total_copies}</td>
                        <td className="px-4 py-2.5 text-center font-mono font-bold text-[#2F6F5E]">{row.available_copies}</td>
                        <td className="px-4 py-2.5 text-center font-mono">{row.total_copies - row.available_copies}</td>
                      </>
                    )}
                    {activeTab === 'issued' && (
                      <>
                        <td className="px-4 py-2.5 font-semibold">{row.book?.book_name || row.book_name}</td>
                        <td className="px-4 py-2.5">{row.user?.name || row.user_name || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[#52607D]">{formatDate(row.issue_date)}</td>
                        <td className="px-4 py-2.5 font-mono text-[#52607D]">{formatDate(row.due_date)}</td>
                        <td className="px-4 py-2.5 text-center"><StatusBadge status={row.status === 'returned' ? 'active' : 'warning'} label={row.status} size="sm" /></td>
                      </>
                    )}
                    {activeTab === 'overdue' && (
                      <>
                        <td className="px-4 py-2.5 font-semibold">{row.book?.book_name || row.book_name}</td>
                        <td className="px-4 py-2.5">{row.user?.name || row.user_name || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-[#B0403A]">{formatDate(row.due_date)}</td>
                        <td className="px-4 py-2.5 font-mono font-bold text-[#B0403A]">{row.overdue_days || 0} days</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-[#B0403A]">₹{Number(row.fine_amount || 0).toLocaleString('en-IN')}</td>
                      </>
                    )}
                    {activeTab === 'lost' && (
                      <>
                        <td className="px-4 py-2.5 font-semibold">{row.book?.book_name || row.book_name}</td>
                        <td className="px-4 py-2.5 font-mono text-[#52607D]">{formatDate(row.reported_at || row.updatedAt)}</td>
                        <td className="px-4 py-2.5">{row.user?.name || '—'}</td>
                        <td className="px-4 py-2.5 text-right font-mono font-bold text-[#B0403A]">₹{Number(row.fine_amount || 0).toLocaleString('en-IN')}</td>
                      </>
                    )}
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
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={() => setOffset(Math.max(0, offset - LIMIT))} disabled={offset === 0}>Previous</Button>
              <Button variant="outline" size="sm" iconRight={ChevronRight} onClick={() => setOffset(offset + LIMIT)} disabled={currentPage >= totalPages}>Next</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
