import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { lostFoundAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import {
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Sparkles,
  Megaphone,
  Clock3
} from 'lucide-react';
import './LostFoundManager.css';

export function LostFoundManager() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('open'); // open, my, closed
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 12;

  // Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lost');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    setPage(0);
  }, [tab, typeFilter]);

  useEffect(() => {
    loadItems();
  }, [tab, typeFilter, page]);

  async function loadItems() {
    setLoading(true);
    try {
      let res;
      if (tab === 'open') {
        res = await lostFoundAPI.list({
          status: 'OPEN',
          type: typeFilter === 'all' ? '' : typeFilter,
          search,
          limit: LIMIT,
          offset: page * LIMIT,
        });
      } else if (tab === 'my') {
        res = await lostFoundAPI.listMy({ limit: LIMIT, offset: page * LIMIT });
      } else {
        res = await lostFoundAPI.list({
          status: 'CLOSED',
          type: typeFilter === 'all' ? '' : typeFilter,
          search,
          limit: LIMIT,
          offset: page * LIMIT,
        });
      }
      setItems(res.data || []);
      setTotalCount(res.total || 0);
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

  const handleClose = (id) => {
    setConfirmAction({
      id,
      type: 'close',
      title: 'Solve Lost & Found Post',
      message: 'Are you sure you want to mark this lost & found post as solved? It will be moved to the closed registry.',
    });
  };

  const handleDelete = (id) => {
    setConfirmAction({
      id,
      type: 'delete',
      title: 'Delete Lost & Found Post',
      message: 'Are you sure you want to delete this lost & found post permanently? This action cannot be undone.',
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    setConfirmAction(null);
    try {
      if (type === 'close') {
        await lostFoundAPI.close(id);
        toast.success('Post marked as Closed/Solved!');
      } else if (type === 'delete') {
        await lostFoundAPI.delete(id);
        toast.success('Post deleted successfully!');
      }
      loadItems();
    } catch (err) {
      toast.error(`Failed to execute action`);
    }
  };

  const getAssetUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/${cleanPath}`;
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  // Calculate statistics based on items currently displayed or in lists
  const stats = useMemo(() => {
    return {
      total: totalCount,
      lost: items.filter((item) => item.type === 'lost').length,
      found: items.filter((item) => item.type === 'found').length,
    };
  }, [items, totalCount]);

  return (
    <div className="lostfound-page">
      {/* Hero Header */}
      <section className="lostfound-hero">
        <div className="lostfound-hero-copy">
          <div className="lostfound-kicker">
            <Sparkles size={16} />
            School Registry
          </div>
          <h1>Lost & Found</h1>
          <p>Track, report, and claim lost or found items inside the school campus.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          className="lostfound-btn lostfound-btn-primary"
        >
          <Plus size={18} />
          Create Post
        </button>
      </section>

      {/* Stats Cards */}
      <section className="lostfound-stats">
        <div className="lostfound-stat-card">
          <span>Items Displayed</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="lostfound-stat-card">
          <span>Lost Items</span>
          <strong>{stats.lost}</strong>
        </div>
        <div className="lostfound-stat-card">
          <span>Found Items</span>
          <strong>{stats.found}</strong>
        </div>
      </section>

      {/* Toolbar / Search & Filters */}
      <section className="lostfound-toolbar">
        {tab !== 'my' ? (
          <form onSubmit={handleSearchSubmit} className="lostfound-search-container">
            <div className="lostfound-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="lostfound-select"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <button type="submit" className="lostfound-btn lostfound-btn-primary">
              Search
            </button>
          </form>
        ) : (
          <div style={{ flex: 1 }} />
        )}

        <div className="lostfound-filters">
          {[
            { key: 'open', label: 'Open Items' },
            { key: 'my', label: 'My Posts' },
            { key: 'closed', label: 'Closed Items' },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              className={tab === t.key ? 'active' : ''}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      {/* Item Grid */}
      <section className="lostfound-grid">
        {loading ? (
          <div className="lostfound-empty">Loading registry items...</div>
        ) : items.length === 0 ? (
          <div className="lostfound-empty">
            <Megaphone size={42} />
            <strong>No items found</strong>
            <span>There are no registered posts matching your current filter.</span>
          </div>
        ) : (
          items.map((item) => {
            const isOwner = String(item.created_by) === String(user?.id);
            const isAdmin = ['school_admin', 'super_admin'].includes(user?.role);
            return (
              <article key={item.id} className="lostfound-card">
                <div>
                  <div className="lostfound-card-top">
                    <span className={`lostfound-chip ${item.type === 'lost' ? 'lost' : 'found'}`}>
                      {item.type}
                    </span>
                    <span className="lostfound-card-date">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <h3>{item.title}</h3>
                  {item.description && <p>{item.description}</p>}

                  {item.photos && item.photos.length > 0 && (
                    <div className="lostfound-photos-grid">
                      {item.photos.map((p, i) => (
                        <img key={i} src={getAssetUrl(p)} alt="" className="lostfound-photo" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="lostfound-card-footer">
                  <div className="lostfound-creator">
                    <span className="lostfound-creator-name">
                      By {item.Creator?.name || 'Unknown'}
                    </span>
                    <span className="lostfound-creator-role">
                      {item.Creator?.role?.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="lostfound-actions">
                    {item.status === 'OPEN' && (isOwner || isAdmin) && (
                      <button
                        onClick={() => handleClose(item.id)}
                        className="lostfound-action-close"
                        title="Mark Solved/Closed"
                        type="button"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    )}
                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="lostfound-action-delete"
                        title="Delete Post"
                        type="button"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '24px',
            padding: '0 4px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Page {page + 1} of {totalPages} &nbsp;·&nbsp; {totalCount} items total
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="lostfound-btn lostfound-btn-soft"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ opacity: page === 0 ? 0.45 : 1 }}
            >
              ← Previous
            </button>
            <button
              className="lostfound-btn lostfound-btn-soft"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ opacity: page >= totalPages - 1 ? 0.45 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Creation Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Lost & Found Post"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="lostfound-form">
          <label>
            <span>Item Title *</span>
            <input
              type="text"
              required
              placeholder="e.g. Red Pencil Box, Math Book"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <div className="lostfound-form-grid">
            <label>
              <span>Post Type</span>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="lost">Lost Item</option>
                <option value="found">Found Item</option>
              </select>
            </label>
            <label>
              <span>Date</span>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Description</span>
            <textarea
              placeholder="Provide detail description of the item, where it was lost/found, tags, stickers, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>

          <label>
            <span>Photos (Max 2)</span>
            <div className="lostfound-photos-upload">
              {photos.map((p, i) => (
                <div key={i} className="lostfound-photo-preview">
                  <img src={p} alt="upload preview" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="lostfound-photo-remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 2 && (
                <label className="lostfound-upload-placeholder">
                  <ImageIcon size={20} />
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </label>

          <div className="lostfound-form-actions">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="lostfound-btn lostfound-btn-soft"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="lostfound-btn lostfound-btn-primary"
            >
              {submitting ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Action Confirmation Dialog Modal */}
      <Modal
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.title || 'Confirm Action'}
      >
        <div style={{ padding: '16px 0 24px', color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
          {confirmAction?.message}
        </div>
        <div className="lostfound-form-actions">
          <button
            type="button"
            onClick={() => setConfirmAction(null)}
            className="lostfound-btn lostfound-btn-soft"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={executeConfirmAction}
            className="lostfound-btn lostfound-btn-primary"
            style={{
              backgroundColor: confirmAction?.type === 'delete' ? '#ef4444' : '#10b981',
              color: '#ffffff',
            }}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </div>
  );
}
