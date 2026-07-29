import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, studentsAPI, teachersAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { formatDate } from '../../../utils/date';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Search, BookOpen, RotateCcw, AlertTriangle, GraduationCap, UserCheck } from 'lucide-react';
import { BorrowerSearchInput } from '../../../components/common/BorrowerSearchInput';

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
    classesAPI
      .list()
      .then((d) => {
        const raw = d?.items || d?.rows || d?.data || (Array.isArray(d) ? d : []);
        setClasses(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setClasses([]));
  }, []);

  const searchBorrower = useCallback(async () => {
    if (!term.trim() && !classId) {
      setResults([]);
      return;
    }
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list({
          limit: 50,
          search: term.trim() || undefined,
          status: 'active',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setResults(Array.isArray(items) ? items : []);
      } else {
        const res = await studentsAPI.list({
          limit: 50,
          search: term.trim() || undefined,
          class_id: classId || undefined,
          status: 'ACTIVE',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setResults(Array.isArray(items) ? items : []);
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
      const rawIssues = res?.issues || res?.items || res?.rows || res?.data || (Array.isArray(res) ? res : []);
      setBorrowedBooks(Array.isArray(rawIssues) ? rawIssues : []);
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
          {/* Borrower Search Component */}
          <BorrowerSearchInput
            borrowerType={borrowerType}
            onBorrowerTypeChange={(type) => { setBorrowerType(type); setSelectedBorrower(null); setBorrowedBooks([]); }}
            selectedBorrower={selectedBorrower}
            onSelectBorrower={(b) => handleSelectBorrower(b)}
            onClearBorrower={() => { setSelectedBorrower(null); setBorrowedBooks([]); }}
            showTypeToggle={true}
          />

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
