import { useState, useEffect } from 'react';
import { feeAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Plus, Tag, Edit2, Trash2 } from 'lucide-react';

export function FeeCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await feeAPI.getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load fee categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSaving(true);
    try {
      await feeAPI.createCategory(newCategoryName.trim());
      toast.success(`Category "${newCategoryName.trim()}" added`);
      setNewCategoryName('');
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setSaving(false);
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

  const handleDelete = async (catId, catName) => {
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      await feeAPI.deleteCategory(catId);
      toast.success('Category deleted');
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="card p-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-900">Fee Categories Master</h3>
        </div>
        <p className="text-xs text-slate-500">Categories used for receipt itemization (e.g. Tuition, Books, Transport, Exam)</p>
      </div>

      <form onSubmit={handleAddCategory} className="flex items-center gap-3">
        <input
          type="text"
          placeholder="New Category Name (e.g. Tuition Fee)..."
          className="input-field text-xs font-semibold flex-1"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button
          type="submit"
          disabled={saving || !newCategoryName.trim()}
          className="btn-primary text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-1 border-none shadow-md shadow-indigo-100 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </form>

      {loading ? (
        <div className="text-xs text-slate-400 text-center py-6">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div key={cat.id} className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between gap-2">
              {editingId === cat.id ? (
                <div className="flex items-center gap-1 w-full">
                  <input
                    type="text"
                    className="input-field text-xs font-bold py-1 flex-1"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                  />
                  <button type="button" onClick={() => handleSaveEdit(cat.id)} className="text-xs font-bold text-emerald-600 px-2 py-1 bg-emerald-50 rounded">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-400 px-2 py-1">Cancel</button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-extrabold text-slate-800">{cat.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="text-slate-400 hover:text-indigo-600 p-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
