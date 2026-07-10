import React, { useEffect, useMemo, useState } from 'react';
import { notificationsAPI, classesAPI, uploadAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { useToast } from '../../context/ToastContext';

const getAssetUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  let cleanPath = path;
  if (path.startsWith('/uploads')) {
    cleanPath = `/api${path}`;
  }
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const host = baseUrl.replace(/\/api$/, '');
  return `${host}${cleanPath}`;
};
import {
  Bell,
  CheckCircle,
  Clock3,
  Eye,
  GraduationCap,
  Megaphone,
  Search,
  Send,
  Sparkles,
  Users,
  Camera,
} from 'lucide-react';
import './Notifications.css';

const audienceMeta = {
  all: { label: 'Everyone', icon: Users, tone: 'all' },
  student: { label: 'Students', icon: GraduationCap, tone: 'student' },
  teacher: { label: 'Teachers', icon: Users, tone: 'teacher' },
};

const formatDate = (value) => {
  if (!value) return 'Just now';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [showAcks, setShowAcks] = useState(null);
  const [acks, setAcks] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState({ title: '', message: '', target_role: 'all', class_id: '', section_id: '', send_whatsapp: false, image_url: '' });
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 15;
  const toast = useToast();

  useEffect(() => {
    loadNotifications();
    loadClasses();
  }, [page]);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.list({ limit: LIMIT, offset: page * LIMIT });
      setNotifications(res.items || []);
      setTotalCount(res.total || 0);
    } catch (e) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) {
      /* optional data */
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const res = await uploadAPI.uploadAnnouncement(file);
      if (res.success && res.url) {
        setForm((prev) => ({ ...prev, image_url: res.url }));
        toast.success('Image uploaded successfully');
      } else {
        toast.error('Image upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    if (form.image_url) {
      try {
        await uploadAPI.deleteFile(form.image_url);
      } catch (e) {
        console.error("Cleanup failed:", e);
      }
    }
    setForm((prev) => ({ ...prev, image_url: '' }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await notificationsAPI.create(
        form.title,
        form.message,
        form.target_role,
        form.class_id ? Number(form.class_id) : undefined,
        form.section_id ? Number(form.section_id) : undefined,
        form.send_whatsapp,
        form.image_url
      );
      toast.success('Notification sent');
      setShowCompose(false);
      setForm({ title: '', message: '', target_role: 'all', class_id: '', section_id: '', send_whatsapp: false, image_url: '' });
      // Go back to page 0 so the new announcement appears at the top
      if (page === 0) {
        loadNotifications();
      } else {
        setPage(0); // useEffect [page] will trigger the reload
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const viewAcks = async (notif) => {
    setShowAcks(notif);
    setAcks(null);
    try {
      const res = await notificationsAPI.getAcknowledgements(notif.id);
      setAcks(res.data || { count: 0, rows: [] });
    } catch (e) {
      setAcks({ count: 0, rows: [] });
    }
  };

  const selectedSections = classes.find((c) => String(c.id) === String(form.class_id))?.sections || [];

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notifications.filter((notification) => {
      const role = notification.target_role || 'all';
      const matchesRole = filter === 'all' || role === filter;
      const matchesQuery = !normalizedQuery
        || notification.title?.toLowerCase().includes(normalizedQuery)
        || notification.message?.toLowerCase().includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [filter, notifications, query]);

  const totalPages = Math.ceil(totalCount / LIMIT);

  const stats = useMemo(() => ({
    total: totalCount,
    student: notifications.filter((item) => item.target_role === 'student').length,
    teacher: notifications.filter((item) => item.target_role === 'teacher').length,
  }), [notifications, totalCount]);

  return (
    <div className="notifications-page">
      <section className="notifications-hero">
        <div className="notifications-hero-copy">
          <div className="notifications-kicker">
            <Sparkles size={16} />
            School announcements
          </div>
          <h1>Announcements</h1>
          <p>Send clean, targeted announcements to students, teachers, classes, and sections.</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="notify-btn notify-btn-primary">
          <Send size={18} />
          Compose
        </button>
      </section>

      <section className="notifications-stats">
        <div className="notify-stat-card">
          <span>Total Sent</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="notify-stat-card">
          <span>Students</span>
          <strong>{stats.student}</strong>
        </div>
        <div className="notify-stat-card">
          <span>Teachers</span>
          <strong>{stats.teacher}</strong>
        </div>
      </section>

      <section className="notifications-toolbar">
        <div className="notifications-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or message"
          />
        </div>
        <div className="notifications-filters">
          {['all', 'student', 'teacher'].map((role) => (
            <button
              key={role}
              type="button"
              className={filter === role ? 'active' : ''}
              onClick={() => setFilter(role)}
            >
              {audienceMeta[role].label}
            </button>
          ))}
        </div>
      </section>

      <section className="notifications-grid">
        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={42} />
            <strong>No notifications found</strong>
            <span>Try a different filter or compose a new announcement.</span>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const role = notification.target_role || 'all';
            const meta = audienceMeta[role] || audienceMeta.all;
            const AudienceIcon = meta.icon;
            return (
              <article key={notification.id} className="notification-card">
                <div className="notification-card-top">
                  <div className={`notification-icon ${meta.tone}`}>
                    <AudienceIcon size={20} />
                  </div>
                  <span className={`notification-chip ${meta.tone}`}>{meta.label}</span>
                </div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                {notification.image_url && (
                  <div className="notification-card-image" style={{ margin: '12px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', maxHeight: '160px' }}>
                    <img
                      src={getAssetUrl(notification.image_url)}
                      alt="announcement"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <div className="notification-card-meta">
                  <span>
                    <Clock3 size={14} />
                    {formatDate(notification.created_at)}
                  </span>
                  <button type="button" onClick={() => viewAcks(notification)}>
                    <Eye size={15} />
                    Acks
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="notify-pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '24px', padding: '0 4px' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Page {page + 1} of {totalPages} &nbsp;·&nbsp; {totalCount} total
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="notify-btn notify-btn-soft"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{ opacity: page === 0 ? 0.45 : 1 }}
            >
              ← Previous
            </button>
            <button
              className="notify-btn notify-btn-soft"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              style={{ opacity: page >= totalPages - 1 ? 0.45 : 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Compose Announcement" maxWidth="max-w-xl">
        <form onSubmit={handleSend} className="notify-form">
          <label>
            <span>Title</span>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="New homework assigned" />
          </label>
          <label>
            <span>Message</span>
            <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Write a short, clear message..." />
          </label>
          <label>
            <span>Photo Attachment (Optional)</span>
            <div className="notify-image-uploader" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              {form.image_url ? (
                <div style={{ position: 'relative', width: '80px', height: '60px' }}>
                  <img
                    src={getAssetUrl(form.image_url)}
                    alt="attachment preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    border: '1px dashed #cbd5e0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#4a5568',
                    backgroundColor: '#f7fafc',
                    width: '100%'
                  }}
                >
                  <Camera size={18} />
                  {uploadingImage ? 'Uploading...' : 'Attach Image / Take Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={uploadingImage}
                  />
                </label>
              )}
            </div>
          </label>
          <div className="notify-form-grid">
            <label>
              <span>Target</span>
              <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}>
                <option value="all">Everyone</option>
                <option value="teacher">Teachers</option>
                <option value="student">Students</option>
              </select>
            </label>
            <label>
              <span>Class</span>
              <select value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })}>
                <option value="">All classes</option>
                {classes.map((item) => <option key={item.id} value={item.id}>{item.class_name}</option>)}
              </select>
            </label>
            <label>
              <span>Section</span>
              <select value={form.section_id} onChange={(e) => setForm({ ...form, section_id: e.target.value })} disabled={!form.class_id}>
                <option value="">All sections</option>
                {selectedSections.map((section) => <option key={section.id} value={section.id}>Section {section.name}</option>)}
              </select>
            </label>
          </div>
          <div className="notify-whatsapp-option" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '16px 0 8px' }}>
            <input
              type="checkbox"
              id="send_whatsapp"
              checked={form.send_whatsapp || false}
              onChange={(e) => setForm({ ...form, send_whatsapp: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="send_whatsapp" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Send via WhatsApp
            </label>
          </div>
          <div className="notify-form-actions">
            <button type="button" onClick={() => setShowCompose(false)} className="notify-btn notify-btn-soft">Cancel</button>
            <button type="submit" disabled={sending} className="notify-btn notify-btn-primary">
              <Send size={16} />
              {sending ? 'Sending...' : 'Send announcement'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!showAcks} onClose={() => { setShowAcks(null); setAcks(null); }} title={`Acknowledgements - ${showAcks?.title || ''}`}>
        {acks === null ? (
          <div className="acks-empty">Loading acknowledgements...</div>
        ) : (
          <div className="acks-panel">
            {/* Seen / Unseen Stats Grid */}
            <div className="acks-stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div className="acks-stat-pill" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#eafaf1', padding: '12px', borderRadius: '12px', border: '1px solid #c2f0d5', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#2ecc71', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seen</span>
                <strong style={{ fontSize: '20px', fontWeight: '900', color: '#1e7e34', marginTop: '4px' }}>{acks.seenCount ?? 0}</strong>
              </div>
              <div className="acks-stat-pill" style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#fdf3f2', padding: '12px', borderRadius: '12px', border: '1px solid #f9d6d5', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#e74c3c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unseen</span>
                <strong style={{ fontSize: '20px', fontWeight: '900', color: '#bd2130', marginTop: '4px' }}>{acks.unseenCount ?? 0}</strong>
              </div>
            </div>

            {acks.rows?.length === 0 ? (
              <div className="acks-empty">No acknowledgements yet</div>
            ) : (
              <div className="acks-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {(acks.rows || []).map((ack, index) => {
                  const u = ack.User || ack.user;
                  const displayName = u?.name || `User #${ack.user_id}`;
                  const displayRole = u?.role ? u.role.replace(/_/g, ' ') : '';
                  return (
                    <div key={index} className="ack-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckCircle size={16} style={{ color: '#2ecc71' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '14px', fontWeight: '700', color: '#2d3748' }}>{displayName}</span>
                          {displayRole && <small style={{ fontSize: '11px', color: '#718096', textTransform: 'capitalize' }}>{displayRole}</small>}
                        </div>
                      </div>
                      {ack.acknowledged_at && <span style={{ fontSize: '12px', color: '#a0aec0' }}>{formatDate(ack.acknowledged_at)}</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
