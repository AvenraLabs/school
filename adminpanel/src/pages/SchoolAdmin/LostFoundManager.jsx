import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { lostFoundAPI } from '../../api';
import { Search, Plus, Trash2, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';

export function LostFoundManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('open'); // open, my, closed
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lost');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadItems();
  }, [tab, typeFilter]);

  async function loadItems() {
    setLoading(true);
    try {
      let res;
      if (tab === 'open') {
        res = await lostFoundAPI.list({
          status: 'OPEN',
          type: typeFilter === 'all' ? '' : typeFilter,
          search,
        });
      } else if (tab === 'my') {
        res = await lostFoundAPI.listMy();
      } else {
        res = await lostFoundAPI.list({
          status: 'CLOSED',
          type: typeFilter === 'all' ? '' : typeFilter,
          search,
        });
      }
      setItems(res.data || []);
    } catch (err) {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadItems();
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 2) {
      toast.error('Maximum 2 photos allowed');
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    setSubmitting(true);

    try {
      await lostFoundAPI.create({
        title,
        type,
        date,
        description,
        photos,
      });
      toast.success('Post created successfully!');
      setShowCreate(false);
      resetForm();
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setType('lost');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setPhotos([]);
  };

  const handleClose = async (id) => {
    if (!window.confirm('Are you sure you want to close/solve this post?')) return;
    try {
      await lostFoundAPI.close(id);
      toast.success('Post marked as Closed/Solved!');
      loadItems();
    } catch (err) {
      toast.error('Failed to close post');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await lostFoundAPI.delete(id);
      toast.success('Post deleted successfully!');
      loadItems();
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="space-y-6">
      <div className="page-header flex justify-between items-center">
        <div>
          <h1 className="page-title text-2xl font-bold text-slate-900">Lost & Found</h1>
          <p className="page-subtitle text-sm text-slate-500">Track and report lost/found items inside the school</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition"
        >
          <Plus className="w-4 h-4" /> Create Post
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { key: 'open', label: 'Open Items' },
          { key: 'my', label: 'My Posts' },
          { key: 'closed', label: 'Closed Items' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      {tab !== 'my' && (
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <button type="submit" className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg font-medium transition">
            Search
          </button>
        </form>
      )}

      {/* Item Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading items...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white">
          No lost or found items reported yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isOwner = String(item.created_by) === String(user?.id);
            const isAdmin = ['school_admin', 'super_admin'].includes(user?.role);
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        item.type === 'lost' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}
                    >
                      {item.type.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{item.title}</h3>
                    {item.description && <p className="text-xs text-slate-500 line-clamp-3">{item.description}</p>}
                  </div>

                  {item.photos && item.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {item.photos.map((p, i) => (
                        <img key={i} src={p} alt="" className="w-full h-24 object-cover rounded-lg border border-slate-100" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-semibold">
                    By: {item.Creator?.name || 'Unknown'} ({item.Creator?.role?.replace(/_/g, ' ')})
                  </div>
                  <div className="flex gap-2">
                    {item.status === 'OPEN' && (isOwner || isAdmin) && (
                      <button
                        onClick={() => handleClose(item.id)}
                        className="p-1.5 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition"
                        title="Mark Closed"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Create Lost/Found Post</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Pencil Box, Math Book"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Post Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="lost">Lost Item</option>
                    <option value="found">Found Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide description of item (where left, stickers, decals, etc.)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Photos (Max 2)</label>
                <div className="flex items-center gap-3">
                  {photos.map((p, i) => (
                    <div key={i} className="relative w-16 h-16 border border-slate-200 rounded-lg overflow-hidden">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute top-0 right-0 bg-rose-600 text-white rounded-bl p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 2 && (
                    <label className="w-16 h-16 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer text-slate-400">
                      <ImageIcon className="w-5 h-5" />
                      <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg font-semibold transition"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
