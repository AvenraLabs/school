import { useState, useEffect } from 'react';
import { feeAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Plus, Tag, Check, X, Edit2, Trash2 } from 'lucide-react';

const DEFAULT_SUGGESTIONS = [
  'Tuition Fee',
  'Books & Stationeries',
  'Transport Fee',
  'Computer & IT Lab',
  'Uniform',
  'Admission Fee',
  'Annual Day & Events',
  'Exam & Evaluation',
];

export function FeeCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await feeAPI.getCategories();
      setCategories(data);
    } catch {
      toast.error('Failed to load fee categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (nameToAdd) => {
    const targetName = (nameToAdd || newCategoryName).trim();
    if (!targetName) return;

    setSaving(true);
    try {
      await feeAPI.createCategory(targetName);
      toast.success(`Category "${targetName}" added`);
      setNewCategoryName('');
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      await feeAPI.updateCategory(cat.id, { is_active: !cat.is_active });
      toast.success(`Category ${!cat.is_active ? 'activated' : 'deactivated'}`);
      loadCategories();
    } catch {
      toast.error('Failed to update category status');
    }
  };

  const handleSaveEdit = async (catId) => {
    if (!editingName.trim()) return;
    try {
      await feeAPI.updateCategory(catId, { name: editingName.trim() });
      toast.success('Category name updated');
      setEditingId(null);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to rename category');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await feeAPI.deleteCategory(deleteTarget.id);
      toast.success(`Category "${deleteTarget.name}" deleted successfully`);
      setDeleteTarget(null);
      loadCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Cannot delete category because it is assigned in a Class Fee Plan. You can deactivate it instead.'
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const existingNames = new Set(safeCategories.map((c) => c.name.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Top Banner / Add Form */}
      <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">Fee Categories</h2>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCategory();
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-xl"
        >
          <input
            type="text"
            placeholder="Enter new category name..."
            className="input-field flex-1"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            disabled={saving}
          />
          <button
            type="submit"
            className="btn-primary bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center justify-center gap-2 border-none shadow-md shadow-indigo-100"
            disabled={saving || !newCategoryName.trim()}
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>

        {/* Quick Add Suggestions */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 block mb-2">Quick Add Suggestions:</span>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SUGGESTIONS.map((sug) => {
              const alreadyExists = existingNames.has(sug.toLowerCase());
              return (
                <button
                  key={sug}
                  type="button"
                  disabled={alreadyExists || saving}
                  onClick={() => handleAddCategory(sug)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    alreadyExists
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                      : 'bg-indigo-50/60 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100 hover:border-indigo-300'
                  }`}
                >
                  {alreadyExists ? `✓ ${sug}` : `+ ${sug}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="card bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Configured Categories ({safeCategories.length})</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading categories...</div>
        ) : safeCategories.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No fee categories created yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-xs">
                  <th className="p-3 pl-6">Category Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50">
                    <td className="p-3 pl-6 font-medium text-slate-900">
                      {editingId === cat.id ? (
                        <div className="flex items-center gap-2 max-w-xs">
                          <input
                            type="text"
                            className="input-field text-sm py-1"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            autoFocus
                          />
                          <button onClick={() => handleSaveEdit(cat.id)} className="text-emerald-600 hover:text-emerald-800 p-1">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        cat.name
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(cat)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          cat.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-3 pr-6 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingId(cat.id);
                          setEditingName(cat.name);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Fee Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"?`}
        confirmText="Delete Category"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
