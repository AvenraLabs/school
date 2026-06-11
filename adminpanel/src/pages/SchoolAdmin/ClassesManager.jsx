import React, { useState, useEffect } from 'react';
import { classesAPI, sectionsAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';

/* ── plain CSS styles ── */
const styles = {
  pageHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '24px', flexWrap: 'wrap', gap: '12px',
  },
  pageTitle: { fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 },
  pageSubtitle: { fontSize: '13px', color: '#94a3b8', marginTop: '4px' },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    height: '40px', padding: '0 18px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 600,
    background: '#4f46e5', color: '#fff', border: 'none',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
  },
  btnSecondary: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    height: '32px', padding: '0 12px', borderRadius: '8px',
    fontSize: '12px', fontWeight: 500,
    background: '#fff', color: '#475569', border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '8px',
    background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8',
  },
  btnGhostDanger: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '8px',
    background: 'transparent', border: 'none', cursor: 'pointer', color: '#f43f5e',
  },
  card: {
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e2e8f0', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    marginBottom: '10px',
  },
  accordionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', cursor: 'pointer', userSelect: 'none',
  },
  accordionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  classIcon: {
    width: '32px', height: '32px', borderRadius: '8px',
    background: '#eef2ff', color: '#4f46e5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  className: { fontWeight: 700, fontSize: '14px', color: '#0f172a' },
  sectionPill: {
    fontSize: '11px', color: '#64748b', background: '#f1f5f9',
    padding: '2px 8px', borderRadius: '20px',
  },
  accordionActions: { display: 'flex', alignItems: 'center', gap: '6px' },
  sectionRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 18px', borderTop: '1px solid #f8fafc',
  },
  sectionLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  sectionBadge: {
    width: '28px', height: '28px', borderRadius: '8px',
    background: '#f1f5f9', color: '#475569',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: 700,
  },
  sectionName: { fontSize: '13px', fontWeight: 500, color: '#334155' },
  sectionRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  badgeActive: {
    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
    background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0',
  },
  badgeInactive: {
    fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
    background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0',
  },
  btnToggleActive: {
    height: '28px', padding: '0 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
    background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer',
  },
  btnToggleInactive: {
    height: '28px', padding: '0 10px', borderRadius: '7px', fontSize: '11px', fontWeight: 600,
    background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', cursor: 'pointer',
  },
  emptyState: {
    background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0',
    padding: '60px 24px', textAlign: 'center',
  },
  emptyIcon: { width: '48px', height: '48px', color: '#cbd5e1', margin: '0 auto 12px' },
  emptyTitle: { fontSize: '16px', fontWeight: 700, color: '#475569', marginBottom: '6px' },
  emptyDesc: { fontSize: '13px', color: '#94a3b8' },
  /* Modal form */
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  inputField: {
    width: '100%', height: '42px', padding: '0 14px', fontSize: '14px',
    border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc',
    color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' },
};

export function ClassesManager() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showAddClass, setShowAddClass] = useState(false);
  const [showEditClass, setShowEditClass] = useState(null);
  const [showAddSection, setShowAddSection] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newClassName, setNewClassName] = useState('');
  const [editClassName, setEditClassName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => { loadClasses(); }, []);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleAddClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classesAPI.create(newClassName);
      toast.success('Class created');
      setShowAddClass(false);
      setNewClassName('');
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  const handleEditClass = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classesAPI.update(showEditClass.id, editClassName);
      toast.success('Class updated');
      setShowEditClass(null);
      loadClasses();
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClass = async () => {
    try {
      await classesAPI.delete(deleteTarget.id);
      toast.success('Class deleted');
      setDeleteTarget(null);
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await sectionsAPI.create(showAddSection.id, newSectionName);
      toast.success('Section created');
      setShowAddSection(null);
      setNewSectionName('');
      loadClasses();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create section');
    } finally {
      setSaving(false);
    }
  };

  const toggleSectionStatus = async (sectionId, currentActive) => {
    try {
      await sectionsAPI.updateStatus(sectionId, !currentActive);
      toast.success(`Section ${!currentActive ? 'activated' : 'deactivated'}`);
      loadClasses();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Classes &amp; Sections</h1>
          <p style={styles.pageSubtitle}>Manage your school&apos;s academic structure</p>
        </div>
        <button
          style={styles.btnPrimary}
          onClick={() => { setShowAddClass(true); setNewClassName(''); }}
        >
          <Plus style={{ width: '15px', height: '15px' }} /> Add Class
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div style={{ ...styles.emptyState }}>
          <p style={{ color: '#94a3b8' }}>Loading…</p>
        </div>
      ) : classes.length === 0 ? (
        <div style={styles.emptyState}>
          <Layers style={styles.emptyIcon} />
          <p style={styles.emptyTitle}>No classes yet</p>
          <p style={styles.emptyDesc}>Create your first class to get started</p>
        </div>
      ) : (
        <div>
          {classes.map((cls) => (
            <div key={cls.id} style={styles.card}>
              {/* Accordion header */}
              <div
                style={styles.accordionHeader}
                onClick={() => toggleExpand(cls.id)}
              >
                <div style={styles.accordionHeaderLeft}>
                  {expanded[cls.id]
                    ? <ChevronDown style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />
                    : <ChevronRight style={{ width: '15px', height: '15px', color: '#94a3b8', flexShrink: 0 }} />}
                  <div style={styles.classIcon}>
                    <Layers style={{ width: '15px', height: '15px' }} />
                  </div>
                  <span style={styles.className}>{cls.class_name}</span>
                  <span style={styles.sectionPill}>
                    {cls.sections?.length || 0} section{cls.sections?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div style={styles.accordionActions} onClick={e => e.stopPropagation()}>
                  <button
                    style={styles.btnSecondary}
                    onClick={() => { setShowAddSection(cls); setNewSectionName(''); }}
                  >
                    <Plus style={{ width: '12px', height: '12px' }} /> Section
                  </button>
                  <button
                    style={styles.btnGhost}
                    title="Edit"
                    onClick={() => { setShowEditClass(cls); setEditClassName(cls.class_name); }}
                  >
                    <Edit2 style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    style={styles.btnGhostDanger}
                    title="Delete"
                    onClick={() => setDeleteTarget(cls)}
                  >
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>

              {/* Sections list */}
              {expanded[cls.id] && cls.sections && cls.sections.length > 0 && (
                <div style={{ borderTop: '1px solid #f1f5f9' }}>
                  {cls.sections.map(sec => (
                    <div key={sec.id} style={styles.sectionRow}>
                      <div style={styles.sectionLeft}>
                        <div style={styles.sectionBadge}>{sec.name}</div>
                        <span style={styles.sectionName}>Section {sec.name}</span>
                      </div>
                      <div style={styles.sectionRight}>
                        <span style={sec.is_active ? styles.badgeActive : styles.badgeInactive}>
                          {sec.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          style={sec.is_active ? styles.btnToggleActive : styles.btnToggleInactive}
                          onClick={() => toggleSectionStatus(sec.id, sec.is_active)}
                        >
                          {sec.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Class Modal */}
      <Modal isOpen={showAddClass} onClose={() => setShowAddClass(false)} title="Add New Class">
        <form onSubmit={handleAddClass}>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Class Name</label>
            <input
              style={styles.inputField}
              required
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="e.g. Class 6"
              autoFocus
            />
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowAddClass(false)} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>
              {saving ? 'Creating...' : 'Create Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Class Modal */}
      <Modal isOpen={!!showEditClass} onClose={() => setShowEditClass(null)} title="Edit Class">
        <form onSubmit={handleEditClass}>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Class Name</label>
            <input
              style={styles.inputField}
              required
              value={editClassName}
              onChange={(e) => setEditClassName(e.target.value)}
            />
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowEditClass(null)} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={!!showAddSection}
        onClose={() => setShowAddSection(null)}
        title={`Add Section to ${showAddSection?.class_name}`}
      >
        <form onSubmit={handleAddSection}>
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Section Name</label>
            <input
              style={styles.inputField}
              required
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="e.g. A"
              autoFocus
            />
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => setShowAddSection(null)} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>
              {saving ? 'Creating...' : 'Create Section'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteClass}
        title="Delete Class"
        message={`Are you sure you want to delete "${deleteTarget?.class_name}"? This will also remove all sections under it.`}
        confirmText="Delete"
        danger
      />
    </div>
  );
}
