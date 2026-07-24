import { useState, useEffect, useCallback } from 'react';
import { libraryAPI } from '../../../api';
import { formatDate } from '../../../utils/date';
import { BookOpen, ClipboardList, AlertTriangle, Package, Loader2, ChevronDown } from 'lucide-react';

const REPORT_TABS = [
  { id: 'books',   label: 'All Books',     icon: BookOpen },
  { id: 'issued',  label: 'Issued Books',  icon: ClipboardList },
  { id: 'overdue', label: 'Overdue',       icon: AlertTriangle },
  { id: 'lost',    label: 'Lost Books',    icon: Package },
];

function SkeletonRow({ cols }) {
  return (
    <tr>
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
      ))}
    </tr>
  );
}

function BooksReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.reportBooks({ status: statusFilter || undefined, limit: LIMIT, offset });
      setData(res.books || []);
      setTotal(res.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 cursor-pointer">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <ReportTable
        loading={loading}
        rows={data}
        total={total}
        offset={offset}
        limit={LIMIT}
        onPage={setOffset}
        cols={['Book No', 'Book Name', 'Total', 'Available', 'Issued', 'Status']}
        renderRow={(b) => (
          <tr key={b.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">{b.book_no}</td>
            <td className="px-4 py-3 font-medium text-slate-900">{b.book_name}</td>
            <td className="px-4 py-3 text-center">{b.total_copies}</td>
            <td className="px-4 py-3 text-center font-semibold text-emerald-600">{b.available_copies}</td>
            <td className="px-4 py-3 text-center">{b.total_copies - b.available_copies}</td>
            <td className="px-4 py-3 text-center">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.status === 'archived' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                {b.status}
              </span>
            </td>
          </tr>
        )}
      />
    </div>
  );
}

function IssuedReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('issued');
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.reportIssued({ status: statusFilter || undefined, limit: LIMIT, offset });
      setData(res.issues || []);
      setTotal(res.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, offset]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 cursor-pointer">
            <option value="issued">Currently Issued</option>
            <option value="returned">Returned</option>
            <option value="">All</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <ReportTable
        loading={loading}
        rows={data}
        total={total}
        offset={offset}
        limit={LIMIT}
        onPage={setOffset}
        cols={['Student', 'Class', 'Book', 'Issued On', 'Due Date', 'Returned On']}
        renderRow={(issue) => (
          <tr key={issue.id} className="hover:bg-slate-50">
            <td className="px-4 py-3">
              <p className="font-medium text-slate-900">{issue.Student?.user?.name || '—'}</p>
              {issue.Student?.roll_no && <p className="text-xs text-slate-400">Roll No: {issue.Student.roll_no}</p>}
            </td>
            <td className="px-4 py-3 text-slate-500 text-xs">
              {issue.Student?.class?.class_name || issue.Student?.class?.name} {issue.Student?.section?.name}
            </td>
            <td className="px-4 py-3">
              <p className="font-medium text-slate-900">{issue.Book?.book_name}</p>
              <p className="text-xs font-mono text-slate-400">{issue.Book?.book_no}</p>
            </td>
            <td className="px-4 py-3 text-slate-600">{formatDate(issue.issue_date)}</td>
            <td className="px-4 py-3 text-slate-600">{formatDate(issue.due_date)}</td>
            <td className="px-4 py-3 text-slate-500">{issue.returned_date ? formatDate(issue.returned_date) : '—'}</td>
          </tr>
        )}
      />
    </div>
  );
}

function OverdueReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.reportOverdue({ limit: LIMIT, offset });
      setData(res.issues || []);
      setTotal(res.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-3">
      {total > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">{total} overdue book{total !== 1 ? 's' : ''} found</p>
        </div>
      )}
      <ReportTable
        loading={loading}
        rows={data}
        total={total}
        offset={offset}
        limit={LIMIT}
        onPage={setOffset}
        cols={['Student', 'Class', 'Phone', 'Book', 'Due Date', 'Days Overdue']}
        renderRow={(issue) => {
          const dueDays = Math.floor((new Date() - new Date(issue.due_date)) / (1000 * 60 * 60 * 24));
          return (
            <tr key={issue.id} className="hover:bg-slate-50">
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{issue.Student?.user?.name || '—'}</p>
                {issue.Student?.roll_no && <p className="text-xs text-slate-400">Roll No: {issue.Student.roll_no}</p>}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {issue.Student?.class?.class_name || issue.Student?.class?.name} {issue.Student?.section?.name}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">{issue.Student?.user?.phone || '—'}</td>
              <td className="px-4 py-3">
                <p className="font-medium text-slate-900">{issue.Book?.book_name}</p>
                <p className="text-xs font-mono text-slate-400">{issue.Book?.book_no}</p>
              </td>
              <td className="px-4 py-3 font-semibold text-rose-600">{formatDate(issue.due_date)}</td>
              <td className="px-4 py-3">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  {dueDays} day{dueDays !== 1 ? 's' : ''}
                </span>
              </td>
            </tr>
          );
        }}
      />
    </div>
  );
}

function LostReport() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.reportLost({ limit: LIMIT, offset });
      setData(res.issues || []);
      setTotal(res.total || 0);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [offset]);

  useEffect(() => { load(); }, [load]);

  return (
    <ReportTable
      loading={loading}
      rows={data}
      total={total}
      offset={offset}
      limit={LIMIT}
      onPage={setOffset}
      cols={['Student', 'Class', 'Book', 'Issue Date', 'Fine (₹)', 'Remarks']}
      renderRow={(issue) => (
        <tr key={issue.id} className="hover:bg-slate-50">
          <td className="px-4 py-3">
            <p className="font-medium text-slate-900">{issue.Student?.user?.name || '—'}</p>
            {issue.Student?.roll_no && <p className="text-xs text-slate-400">Roll No: {issue.Student.roll_no}</p>}
          </td>
          <td className="px-4 py-3 text-xs text-slate-500">
            {issue.Student?.class?.class_name || issue.Student?.class?.name}
          </td>
          <td className="px-4 py-3">
            <p className="font-medium text-slate-900">{issue.Book?.book_name}</p>
            <p className="text-xs font-mono text-slate-400">{issue.Book?.book_no}</p>
          </td>
          <td className="px-4 py-3 text-slate-600">{formatDate(issue.issue_date)}</td>
          <td className="px-4 py-3 font-semibold text-rose-600">
            {issue.fine_amount ? `₹${parseFloat(issue.fine_amount).toFixed(2)}` : '—'}
          </td>
          <td className="px-4 py-3 text-xs text-slate-500">{issue.remarks || '—'}</td>
        </tr>
      )}
    />
  );
}

function ReportTable({ loading, rows, total, offset, limit, onPage, cols, renderRow }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {cols.map((c) => (
                <th key={c} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading
              ? [...Array(5)].map((_, i) => <SkeletonRow key={i} cols={cols.length} />)
              : rows.length === 0
              ? (
                <tr>
                  <td colSpan={cols.length} className="py-14 text-center text-sm text-slate-400">No data found</td>
                </tr>
              )
              : rows.map(renderRow)
            }
          </tbody>
        </table>
      </div>

      {total > limit && (
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-xs text-slate-500">{offset + 1}–{Math.min(offset + limit, total)} of {total}</p>
          <div className="flex gap-2">
            <button disabled={offset === 0} onClick={() => onPage(Math.max(0, offset - limit))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50">Previous</button>
            <button disabled={offset + limit >= total} onClick={() => onPage(offset + limit)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}

export function LibraryReports() {
  const [activeReport, setActiveReport] = useState('books');

  return (
    <div className="space-y-5">
      {/* Report Tab Selector */}
      <div className="flex flex-wrap gap-2">
        {REPORT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              id={`library-report-${tab.id}`}
              onClick={() => setActiveReport(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-transparent shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-indigo-500'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeReport === 'books'   && <BooksReport />}
      {activeReport === 'issued'  && <IssuedReport />}
      {activeReport === 'overdue' && <OverdueReport />}
      {activeReport === 'lost'    && <LostReport />}
    </div>
  );
}
