import { useState, useEffect, useCallback, useRef } from 'react';
import { libraryAPI, uploadAPI } from '../../../api';
import { getApiAssetUrl } from '../../../api/axios';
import { useToast } from '../../../context/ToastContext';
import {
  Plus, Search, Edit2, Archive, BookOpen, X, Loader2, ChevronDown,
  AlertCircle, Upload, Image as ImageIcon, LayoutGrid, List,
} from 'lucide-react';

function BookCoverImage({ src, alt, className }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-indigo-50/50 text-indigo-300">
        <BookOpen className="h-10 w-10" />
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

function AddEditBookModal({ mode, book, onClose, onSaved }) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState({
    book_no: book?.book_no || '',
    book_name: book?.book_name || '',
    total_copies: book?.total_copies || '',
    image_url: book?.image_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await uploadAPI.uploadBookImage(file);
      if (res?.url) {
        setForm((prev) => ({ ...prev, image_url: res.url }));
        toast.success('Book image uploaded');
      }
    } catch {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        book_name: form.book_name.trim(),
        ...(mode === 'add' ? { book_no: form.book_no.trim() } : {}),
        total_copies: parseInt(form.total_copies, 10),
        image_url: form.image_url || null,
      };
      if (mode === 'add') {
        await libraryAPI.addBook(payload);
        toast.success('Book added successfully');
      } else {
        await libraryAPI.editBook(book.id, payload);
        toast.success('Book updated');
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {mode === 'add' ? 'Add New Book' : 'Edit Book'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'add' ? 'Register a new book in the library master register' : 'Update book details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* Cover Image Upload */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Book Cover Image (Optional)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center">
                {form.image_url ? (
                  <img
                    src={getApiAssetUrl(form.image_url)}
                    alt="Book Cover"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || saving}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {form.image_url ? 'Change Photo' : 'Upload Cover Photo'}
                </button>
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image_url: '' }))}
                    className="text-xs font-semibold text-rose-600 hover:underline block"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {mode === 'add' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Book Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.book_no}
                onChange={(e) => setForm({ ...form, book_no: e.target.value })}
                placeholder="e.g. LIB001"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Book Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.book_name}
              onChange={(e) => setForm({ ...form, book_name: e.target.value })}
              placeholder="e.g. Science Class 6"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Copies <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={form.total_copies}
              onChange={(e) => setForm({ ...form, total_copies: e.target.value })}
              placeholder="e.g. 40"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'add' ? 'Add Book' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ArchiveConfirmModal({ book, onClose, onConfirmed }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    try {
      await libraryAPI.archiveBook(book.id);
      toast.success('Book archived');
      onConfirmed();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to archive book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl border border-slate-200 bg-white shadow-2xl p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Archive className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Archive Book?</h3>
            <p className="text-xs text-slate-500">This book will be hidden from active lists.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700">
          Archive <span className="font-semibold">{book.book_name}</span> ({book.book_no})?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={handleArchive}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}

export function LibraryBooks() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [offset, setOffset] = useState(0);
  const LIMIT = 12;

  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [archiveModal, setArchiveModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await libraryAPI.listBooks({
        search: search || undefined,
        status: statusFilter || undefined,
        limit: LIMIT,
        offset,
      });
      setBooks(data.books || []);
      setTotal(data.total || 0);
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, offset]);

  useEffect(() => { load(); }, [load]);

  const issuedCount = (book) => book.total_copies - book.available_copies;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search books..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 w-56"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setOffset(0); }}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 text-sm bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
            >
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="">All</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-xl border border-slate-200 bg-white p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          id="library-add-book-btn"
          onClick={() => setAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Book
        </button>
      </div>

      {/* Summary Chips */}
      <div className="flex gap-2 text-xs text-slate-500">
        <span className="bg-slate-100 rounded-full px-3 py-1 font-medium">{total} books registered</span>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Loading books...</span>
        </div>
      ) : books.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-slate-200 bg-white">
          <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">No books found</p>
          <button
            onClick={() => setAddModal(true)}
            className="text-xs font-semibold text-indigo-600 hover:underline mt-1 inline-block"
          >
            + Add a book now
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* App-like Grid Card Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {books.map((book) => {
            const isAvailable = book.available_copies > 0;
            return (
              <div
                key={book.id}
                className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-200"
              >
                {/* Book Cover / Icon */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center mb-3">
                  <BookCoverImage
                    src={book.image_url}
                    alt={book.book_name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1">
                    {book.status === 'archived' ? (
                      <span className="rounded-full bg-slate-950/70 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-white">Archived</span>
                    ) : isAvailable ? (
                      <span className="rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-white">
                        {book.available_copies} Available
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-semibold text-white">No Copies</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {book.book_name}
                    </h4>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">Book No: {book.book_no}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{book.available_copies}</span> / {book.total_copies} copies
                    </div>

                    {book.status === 'active' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditModal(book)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setArchiveModal(book)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cover</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Book No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Book Name</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Available</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Issued</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2">
                      <div className="h-10 w-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                        <BookCoverImage src={book.image_url} alt="" className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">{book.book_no}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{book.book_name}</td>
                    <td className="px-4 py-3 text-center text-slate-700">{book.total_copies}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${book.available_copies === 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {book.available_copies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{issuedCount(book)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${book.status === 'archived' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {book.status === 'active' && (
                          <>
                            <button
                              onClick={() => setEditModal(book)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setArchiveModal(book)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                              title="Archive"
                            >
                              <Archive className="h-3.5 w-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between border-t border-slate-100 px-2 py-3">
          <p className="text-xs text-slate-500">
            Showing {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - LIMIT))}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous
            </button>
            <button
              disabled={offset + LIMIT >= total}
              onClick={() => setOffset(offset + LIMIT)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {addModal && (
        <AddEditBookModal
          mode="add"
          onClose={() => setAddModal(false)}
          onSaved={load}
        />
      )}
      {editModal && (
        <AddEditBookModal
          mode="edit"
          book={editModal}
          onClose={() => setEditModal(null)}
          onSaved={load}
        />
      )}
      {archiveModal && (
        <ArchiveConfirmModal
          book={archiveModal}
          onClose={() => setArchiveModal(null)}
          onConfirmed={load}
        />
      )}
    </div>
  );
}
