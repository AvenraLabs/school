import { useState, useEffect, useCallback } from 'react';
import { libraryAPI, uploadAPI } from '../../../api';
import { getApiAssetUrl } from '../../../api/axios';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Select, Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Modal } from '../../../components/common/Modal';
import { EmptyState } from '../../../components/common/EmptyState';
import {
  Plus, Search, Edit2, BookOpen, ChevronLeft, ChevronRight, X, Camera
} from 'lucide-react';

function BookCoverImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#EAF3F0] text-[#2F6F5E]">
        <BookOpen className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      src={getApiAssetUrl(src)}
      alt={alt || 'Book Cover'}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function LibraryBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 12;

  const [modalState, setModalState] = useState(null);
  const [bookForm, setBookForm] = useState({
    book_name: '',
    book_no: '',
    author: '',
    category: 'General',
    total_copies: 1,
    image_url: '',
  });
  const [savingBook, setSavingBook] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const toast = useToast();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryAPI.getBooks({
        search: search.trim() || undefined,
        status: availabilityFilter !== 'all' ? availabilityFilter : undefined,
        limit: LIMIT,
        offset: page * LIMIT,
      });
      setBooks(res?.items || []);
      setTotalCount(res?.total || 0);
    } catch {
      toast.error('Failed to load library catalog');
    } finally {
      setLoading(false);
    }
  }, [search, availabilityFilter, page, toast]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const openAddModal = () => {
    setBookForm({
      book_name: '',
      book_no: '',
      author: '',
      category: 'General',
      total_copies: 1,
      image_url: '',
    });
    setModalState({ mode: 'add' });
  };

  const openEditModal = (book) => {
    setBookForm({
      book_name: book.book_name || '',
      book_no: book.book_no || '',
      author: book.author || '',
      category: book.category || 'General',
      total_copies: book.total_copies || 1,
      image_url: book.image_url || '',
    });
    setModalState({ mode: 'edit', book });
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const res = await uploadAPI.uploadBookImage(file);
      if (res.url || res.data?.url) {
        setBookForm((prev) => ({ ...prev, image_url: res.url || res.data?.url }));
        toast.success('Cover image attached');
      } else {
        toast.error('Cover image upload failed');
      }
    } catch {
      toast.error('Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookForm.book_name.trim()) return toast.error('Book title is required');
    setSavingBook(true);
    try {
      if (modalState.mode === 'add') {
        await libraryAPI.addBook({
          book_name: bookForm.book_name.trim(),
          book_no: bookForm.book_no.trim() || `BK-${Date.now().toString().slice(-6)}`,
          author: bookForm.author.trim() || 'Unknown',
          category: bookForm.category || 'General',
          total_copies: Number(bookForm.total_copies) || 1,
          image_url: bookForm.image_url || undefined,
        });
        toast.success('Book added to library catalog!');
      } else {
        await libraryAPI.editBook(modalState.book.id, {
          book_name: bookForm.book_name.trim(),
          book_no: bookForm.book_no.trim(),
          author: bookForm.author.trim(),
          category: bookForm.category,
          total_copies: Number(bookForm.total_copies) || 1,
          image_url: bookForm.image_url || undefined,
        });
        toast.success('Book details updated!');
      }
      setModalState(null);
      fetchBooks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save book');
    } finally {
      setSavingBook(false);
    }
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <div className="space-y-4 text-xs">
      {/* Search & Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Input
              icon={Search}
              placeholder="Search books by title or ISBN..."
              className="w-64 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              className="w-36 text-xs"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <option value="all">All Copies</option>
              <option value="available">Available Only</option>
              <option value="issued">Issued Only</option>
            </Select>
          </div>

          <Button variant="primary" icon={Plus} onClick={openAddModal}>
            Add New Book
          </Button>
        </div>
      </Card>

      {/* Catalog Grid */}
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="p-8 text-center text-[#8C97AB]">Loading book catalog...</div>
          ) : books.length === 0 ? (
            <EmptyState icon={BookOpen} title="No books found" description="Add books to your library catalog." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {books.map((b) => (
                <div key={b.id} className="p-3 bg-[#FAFAF8] border border-[#E4E1D8] rounded-[8px] space-y-2 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-36 rounded-[6px] overflow-hidden bg-[#EAF3F0]">
                      <BookCoverImage src={b.image_url} alt={b.book_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-display font-bold text-xs text-[#14213D] truncate">{b.book_name}</p>
                      <p className="text-[10px] text-[#8C97AB] font-mono">Acc No: {b.book_no}</p>
                      {b.author && <p className="text-[10px] text-[#52607D] italic">By {b.author}</p>}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#EDEAE1] flex items-center justify-between">
                    <span className="font-mono text-[10px] text-[#2F6F5E] font-semibold">
                      {b.available_copies ?? b.total_copies} / {b.total_copies} Copies
                    </span>
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEditModal(b)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#52607D]">
            <span>Page <strong className="text-[#14213D] font-mono">{page + 1}</strong> of <strong className="text-[#14213D] font-mono">{totalPages}</strong></span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</Button>
              <Button variant="outline" size="sm" iconRight={ChevronRight} onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Add / Edit Book Modal */}
      {modalState && (
        <Modal
          isOpen={true}
          onClose={() => setModalState(null)}
          title={modalState.mode === 'add' ? 'Add New Library Book' : 'Edit Book Catalog Entry'}
        >
          <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Book Title *</label>
              <Input
                required
                placeholder="e.g. Higher Mathematics, Concepts of Physics"
                value={bookForm.book_name}
                onChange={(e) => setBookForm({ ...bookForm, book_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Accession / Book No *</label>
                <Input
                  required
                  placeholder="e.g. BK-1004"
                  value={bookForm.book_no}
                  onChange={(e) => setBookForm({ ...bookForm, book_no: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Author Name</label>
                <Input
                  placeholder="e.g. H.C. Verma, R.D. Sharma"
                  value={bookForm.author}
                  onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Genre / Category</label>
                <Input
                  placeholder="e.g. Science, Mathematics, Fiction"
                  value={bookForm.category}
                  onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-semibold text-[#14213D] mb-1">Total Copies Count *</label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={bookForm.total_copies}
                  onChange={(e) => setBookForm({ ...bookForm, total_copies: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Book Cover Image (Optional)</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E4E1D8] bg-[#FAFAF8] hover:bg-[#EAF3F0] text-xs text-[#52607D] cursor-pointer transition-colors">
                  <Camera className="w-3.5 h-3.5 text-[#2F6F5E]" />
                  <span>Attach Cover Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="hidden"
                  />
                </label>
                {uploadingCover && <span className="text-[11px] text-[#2F6F5E] animate-pulse">Uploading cover...</span>}
              </div>
              {bookForm.image_url && (
                <div className="mt-2 relative w-20 h-24 rounded-[8px] overflow-hidden border border-[#E4E1D8]">
                  <img src={getApiAssetUrl(bookForm.image_url)} alt="Cover Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setBookForm((prev) => ({ ...prev, image_url: '' }))}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalState(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={savingBook}>
                {savingBook ? 'Saving...' : modalState.mode === 'add' ? 'Add Book' : 'Update Book'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
