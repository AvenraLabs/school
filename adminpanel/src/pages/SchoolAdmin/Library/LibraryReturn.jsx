import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, studentsAPI, teachersAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Search, BookOpen, RotateCcw, AlertTriangle, GraduationCap, UserCheck } from 'lucide-react';

export function LibraryReturn() {
  const [borrowerType, setBorrowerType] = useState('student');
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [returningId, setReturningId] = useState(null);
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (borrowerType === 'student') {
      classesAPI.list().then((d) => setClasses(Array.isArray(d) ? d : d?.rows || d?.items || []));
    }
  }, [borrowerType]);

  const searchBorrower = useCallback(async () => {
    if (!term.trim() && !classId && borrowerType === 'student') return;
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list(20, 0, 'active', 'approved');
        const items = res?.rows || res?.items || res || [];
        const filtered = term.trim()
          ? items.filter((t) => (t.user?.name || '').toLowerCase().includes(term.toLowerCase()))
          : items;
        setResults(filtered);
      } else {
        const res = await studentsAPI.list(15, 0, classId || undefined, undefined, undefined, 'approved');
        const items = res?.rows || res?.items || res || [];
        const filtered = term.trim()
          ? items.filter((s) => (s.user?.name || '').toLowerCase().includes(term.toLowerCase()))
          : items;
        setResults(filtered);
      }
    } catch {
      setResults([]);
    }
  }, [term, classId, borrowerType]);

  useEffect(() => {
    const t = setTimeout(() => searchBorrower(), 300);
    return () => clearTimeout(t);
  }, [term, classId, searchBorrower]);

  const fetchBorrowedBooks = useCallback(async (userId) => {
    setLoadingBooks(true);
    try {
      const res = await libraryAPI.getIssuedBooks({ user_id: userId, status: 'issued' });
      setBorrowedBooks(res?.items || []);
    } catch {
      toast.error('Failed to load active loans');
    } finally {
      setLoadingBooks(false);
    }
  }, [toast]);

  const handleSelectBorrower = (b) => {
    setSelectedBorrower(b);
    const userId = b.user_id || b.user?.id || b.id;
    fetchBorrowedBooks(userId);
  };

  const handleReturn = async (issueId, bookName) => {
    setReturningId(issueId);
    try {
      await libraryAPI.returnBook(issueId);
      toast.success(`"${bookName}" returned to inventory`);
      const userId = selectedBorrower.user_id || selectedBorrower.user?.id || selectedBorrower.id;
      fetchBorrowedBooks(userId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#2F6F5E]" /> Return Book Desk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={borrowerType === 'student' ? 'primary' : 'outline'}
              size="sm"
              icon={GraduationCap}
              onClick={() => { setBorrowerType('student'); setSelectedBorrower(null); setBorrowedBooks([]); }}
            >
              Student Borrower
            </Button>
            <Button
              variant={borrowerType === 'teacher' ? 'primary' : 'outline'}
              size="sm"
              icon={UserCheck}
              onClick={() => { setBorrowerType('teacher'); setSelectedBorrower(null); setBorrowedBooks([]); }}
            >
              Teacher Borrower
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              icon={Search}
              placeholder="Search borrower by name..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            {borrowerType === 'student' && (
              <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>Class {c.class_name}</option>
                ))}
              </Select>
            )}
          </div>

          {results.length > 0 && !selectedBorrower && (
            <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden divide-y divide-[#EDEAE1]">
              {results.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelectBorrower(b)}
                  className="p-3 hover:bg-[#EAF3F0] cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-[#14213D]">{b.user?.name || b.name}</span>
                  <span className="text-[10px] text-[#8C97AB] font-mono">{b.admission_no || b.employee_id || 'ID'}</span>
                </div>
              ))}
            </div>
          )}

          {selectedBorrower && (
            <div className="space-y-3">
              <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] flex items-center justify-between">
                <span className="font-bold text-[#2F6F5E]">Active Borrower: {selectedBorrower.user?.name || selectedBorrower.name}</span>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedBorrower(null); setBorrowedBooks([]); }}>Change</Button>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-[#14213D]">Currently Borrowed Books ({borrowedBooks.length})</h4>
                {loadingBooks ? (
                  <p className="text-[#8C97AB]">Loading active loans...</p>
                ) : borrowedBooks.length === 0 ? (
                  <p className="text-[#8C97AB]">No active books currently borrowed by this user.</p>
                ) : (
                  <div className="divide-y divide-[#EDEAE1] border border-[#E4E1D8] rounded-[8px] overflow-hidden">
                    {borrowedBooks.map((item) => (
                      <div key={item.id} className="p-3 flex items-center justify-between gap-3 bg-[#FAFAF8]">
                        <div>
                          <p className="font-bold text-[#14213D]">{item.book?.book_name || item.book_name}</p>
                          <p className="text-[10px] text-[#8C97AB]">Issued: {formatDate(item.issue_date)} · Due: {formatDate(item.due_date)}</p>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={RotateCcw}
                          loading={returningId === item.id}
                          onClick={() => handleReturn(item.id, item.book?.book_name || item.book_name)}
                        >
                          Return Book
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
