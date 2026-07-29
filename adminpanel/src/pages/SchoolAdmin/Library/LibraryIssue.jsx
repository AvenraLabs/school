import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, studentsAPI, teachersAPI, classesAPI, sectionsAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Search, BookOpen, UserCheck, BookPlus, GraduationCap, CheckCircle2 } from 'lucide-react';
import { BorrowerSearchInput } from '../../../components/common/BorrowerSearchInput';

export function LibraryIssue() {
  const [borrowerType, setBorrowerType] = useState('student');
  const [selectedBorrower, setSelectedBorrower] = useState(null);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [borrowerQuery, setBorrowerQuery] = useState('');
  const [borrowerResults, setBorrowerResults] = useState([]);

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
    if (!borrowerQuery.trim() && !classId) {
      setBorrowerResults([]);
      return;
    }
    try {
      if (borrowerType === 'teacher') {
        const res = await teachersAPI.list({
          limit: 50,
          search: borrowerQuery.trim() || undefined,
          status: 'active',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setBorrowerResults(Array.isArray(items) ? items : []);
      } else {
        const res = await studentsAPI.list({
          limit: 50,
          search: borrowerQuery.trim() || undefined,
          class_id: classId || undefined,
          status: 'ACTIVE',
          approval_status: 'approved',
        });
        const items = res?.rows || res?.items || (Array.isArray(res) ? res : []);
        setBorrowerResults(Array.isArray(items) ? items : []);
      }
    } catch {
      setBorrowerResults([]);
    }
  }, [borrowerQuery, classId, borrowerType]);

  useEffect(() => {
    const t = setTimeout(() => searchBorrower(), 300);
    return () => clearTimeout(t);
  }, [borrowerQuery, classId, searchBorrower]);

  const searchBooks = useCallback(async () => {
    if (!bookQuery.trim()) { setBookResults([]); return; }
    try {
      const res = await libraryAPI.getBooks({ search: bookQuery.trim(), status: 'available', limit: 10 });
      const rawBooks = res?.books || res?.items || res?.rows || res?.data || (Array.isArray(res) ? res : []);
      setBookResults(Array.isArray(rawBooks) ? rawBooks : []);
    } catch {
      setBookResults([]);
    }
  }, [bookQuery]);

  useEffect(() => {
    const t = setTimeout(() => searchBooks(), 300);
    return () => clearTimeout(t);
  }, [bookQuery, searchBooks]);

  const handleIssue = async () => {
    if (!selectedBorrower || !selectedBook) return;
    setSubmitting(true);
    try {
      await libraryAPI.issueBook({
        book_id: selectedBook.id,
        user_id: selectedBorrower.user_id || selectedBorrower.user?.id || selectedBorrower.id,
      });
      toast.success(`"${selectedBook.book_name}" issued successfully`);
      setSelectedBook(null);
      setSelectedBorrower(null);
      setBookQuery('');
      setBorrowerQuery('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 text-xs">
      <Card>
        <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-2">
            <BookPlus className="w-4 h-4 text-[#2F6F5E]" /> Issue Book Circulation Desk
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Borrower Search */}
          <BorrowerSearchInput
            borrowerType={borrowerType}
            onBorrowerTypeChange={(type) => { setBorrowerType(type); setSelectedBorrower(null); }}
            selectedBorrower={selectedBorrower}
            onSelectBorrower={(b) => setSelectedBorrower(b)}
            onClearBorrower={() => setSelectedBorrower(null)}
            showTypeToggle={true}
          />

          {/* Search Book */}
          <div className="space-y-2 pt-2 border-t border-[#EDEAE1]">
            <label className="block font-semibold text-[#14213D]">Search Book to Issue</label>
            <Input
              icon={Search}
              placeholder="Type book title or ISBN..."
              value={bookQuery}
              onChange={(e) => setBookQuery(e.target.value)}
            />

            {bookResults.length > 0 && !selectedBook && (
              <div className="border border-[#E4E1D8] rounded-[8px] overflow-hidden divide-y divide-[#EDEAE1]">
                {bookResults.map((bk) => (
                  <div
                    key={bk.id}
                    onClick={() => setSelectedBook(bk)}
                    className="p-3 hover:bg-[#EAF3F0] cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-[#14213D]">{bk.book_name}</p>
                      <p className="text-[10px] text-[#8C97AB]">No: {bk.book_no}</p>
                    </div>
                    <span className="font-mono font-bold text-[#2F6F5E]">{bk.available_copies} available</span>
                  </div>
                ))}
              </div>
            )}

            {selectedBook && (
              <div className="p-3 bg-[#EAF3F0] border border-[#D3E6E0] rounded-[8px] flex items-center justify-between">
                <span className="font-bold text-[#2F6F5E]">Book: {selectedBook.book_name} (No: {selectedBook.book_no})</span>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBook(null)}>Change</Button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-[#EDEAE1]">
            <Button
              variant="primary"
              icon={CheckCircle2}
              disabled={!selectedBorrower || !selectedBook}
              loading={submitting}
              onClick={handleIssue}
            >
              Issue Book
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
