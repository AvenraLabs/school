import React, { useState, useEffect } from 'react';
import { classesAPI, sectionsAPI } from '../../api';
import './Academic.css';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, Layers } from 'lucide-react';

/* Form styles kept inline for modal simplicity */
const styles = {
  inputField: {
    width: '100%', height: '42px', padding: '0 14px', fontSize: '14px',
    border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc',
    color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  },
  label: { display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '16px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '12px',
  },
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
  const [studentCount, setStudentCount] = useState('');
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
    const normalizedNewName = newSectionName.trim().toUpperCase();

    // Check if section already exists locally in this class
    const existsLocally = showAddSection?.sections?.some(
      (sec) => sec.name.trim().toUpperCase() === normalizedNewName
    );

    if (existsLocally) {
      toast.error('Section already exists for this class');
      return;
    }

    setSaving(true);
    try {
      await sectionsAPI.create(showAddSection.id, normalizedNewName, Number(studentCount) || 0);
      toast.success('Section created');
      setShowAddSection(null);
      setNewSectionName('');
      setStudentCount('');
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
    <div className="academic-page-container">
      {/* Header */}
      <div className="academic-page-header">
        <div>
          <h1 className="academic-title">Classes &amp; Sections</h1>
          <p className="academic-subtitle">Manage your school&apos;s academic structure</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => { setShowAddClass(true); setNewClassName(''); }}
        >
          <Plus className="w-4 h-4" /> Add Class
        </button>
      </div>

      {/* Body */}
      {loading ? (
        <div className="academic-empty">
          <p className="academic-empty-desc">Loading…</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="academic-empty">
          <Layers className="academic-empty-icon" />
          <h2 className="academic-empty-title">No classes yet</h2>
          <p className="academic-empty-desc">Create your first class to get started</p>
        </div>
      ) : (
        <div className="academic-grid">
          {classes.map((cls) => (
            <div key={cls.id} className="academic-card">
              {/* Card Header */}
              <div className="class-header">
                <div className="class-title-wrap">
                  <div className="class-icon-bg">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="class-name">{cls.class_name}</h3>
                    <div className="section-count-badge">
                      {cls.sections?.length || 0} Section{cls.sections?.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button
                    className="btn-card-action"
                    title="Edit Class"
                    onClick={() => { setShowEditClass(cls); setEditClassName(cls.class_name); }}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="btn-card-action danger"
                    title="Delete Class"
                    onClick={() => setDeleteTarget(cls)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Sections list inside card */}
              <div className="sections-container">
                {cls.sections && cls.sections.length > 0 ? (
                  cls.sections.map(sec => (
                    <div key={sec.id} className="section-pill">
                      <div className="section-pill-left">
                        <div className="section-letter">{sec.name}</div>
                        <span className="section-info-text">Section {sec.name}</span>
                      </div>
                      <div className="section-pill-actions">
                        <button
                          className={`status-badge ${sec.is_active ? 'status-active' : 'status-inactive'}`}
                          onClick={() => toggleSectionStatus(sec.id, sec.is_active)}
                          title="Toggle Status"
                        >
                          {sec.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '10px', color: '#94a3b8', fontSize: '13px' }}>
                    No sections added yet
                  </div>
                )}
                
                <button
                  className="btn-add-section"
                  onClick={() => { setShowAddSection(cls); setNewSectionName(''); setStudentCount(''); }}
                >
                  <Plus className="w-4 h-4" /> Add Section
                </button>
              </div>
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
            <button type="button" onClick={() => setShowAddClass(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
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
            <button type="button" onClick={() => setShowEditClass(null)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Section Modal */}
      <Modal
        isOpen={!!showAddSection}
        onClose={() => { setShowAddSection(null); setStudentCount(''); }}
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
          <div style={{ marginBottom: '16px' }}>
            <label style={styles.label}>Auto-generate Students (Count - Optional)</label>
            <input
              style={styles.inputField}
              type="number"
              min="0"
              value={studentCount}
              onChange={(e) => setStudentCount(e.target.value)}
              placeholder="e.g. 30 (leave blank or 0 to skip)"
            />
          </div>
          <div style={styles.formActions}>
            <button type="button" onClick={() => { setShowAddSection(null); setStudentCount(''); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary">
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
