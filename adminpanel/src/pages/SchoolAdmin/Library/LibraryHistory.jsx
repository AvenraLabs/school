import { useState, useEffect, useCallback } from 'react';
import { libraryAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { EmptyState } from '../../../components/common/EmptyState';
import { History, Search, Ban, RotateCcw, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';

export function LibraryHistory() {
  const toast = useToast();
  const [issues, setIssues] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 15;

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.getIssuedBooks({
        status: status || undefined,
        search: search.trim() || undefined,
        limit: LIMIT,
        offset,
      });
      const rawIssues = res?.issues || res?.items || res?.rows || res?.data || (Array.isArray(res) ? res : []);
      setIssues(Array.isArray(rawIssues) ? rawIssues : []);
      setTotal(res?.total ?? res?.count ?? (Array.isArray(rawIssues) ? rawIssues.length : 0));
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [status, search, offset, toast]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;

  return (
    <div className="space-y-4 text-xs">
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            icon={Search}
            placeholder="Search borrower or book..."
            className="w-56 text-xs"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          />
          <Select
            className="w-36 text-xs"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setOffset(0); }}
          >
            <option value="">All Statuses</option>
            <option value="issued">Issued</option>
            <option value="returned">Returned</option>
            <option value="lost">Lost</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </Card>

      <Card>
        <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-xs font-bold uppercase text-[#52607D]">Library Circulation Audit Register ({total})</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Book Title</th>
                <th className="px-4 py-3">Borrower Name</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8C97AB]">Loading circulation history...</td></tr>
              ) : issues.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center"><EmptyState icon={History} title="No records found" description="No circulation records match your filter criteria." /></td></tr>
              ) : (
                issues.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAFAF8]">
                    <td className="px-4 py-2.5 font-semibold">
                      {row.Book?.book_name || row.book?.book_name || row.book_name || '—'}
                      {(row.Book?.book_no || row.book?.book_no) && <span className="block text-[10px] text-[#8C97AB] font-mono">No: {row.Book?.book_no || row.book?.book_no}</span>}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-semibold">{row.Student?.User?.name || row.Student?.user?.name || row.Teacher?.User?.name || row.Teacher?.user?.name || row.user?.name || row.user_name || '—'}</span>
                      {(row.Student?.User?.username || row.Student?.user?.username || row.Teacher?.User?.username || row.Teacher?.user?.username || row.user?.username) && (
                        <span className="block text-[10px] text-[#8C97AB] font-mono">@{row.Student?.User?.username || row.Student?.user?.username || row.Teacher?.User?.username || row.Teacher?.user?.username || row.user?.username}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{formatDate(row.issue_date)}</td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{formatDate(row.due_date)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge
                        status={row.status === 'returned' ? 'active' : row.status === 'issued' ? 'warning' : 'danger'}
                        label={row.status}
                        size="sm"
                      />
                    </td>
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
