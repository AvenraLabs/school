import { useState, useEffect } from 'react';
import { feeAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/common/EmptyState';
import { Plus, Tag, Edit2, Trash2, Check, X } from 'lucide-react';

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
    <Card>
      <CardHeader className="py-3 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
        <CardTitle className="text-sm font-bold text-[#14213D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#2F6F5E]" />
            <span>Fee Categories Master</span>
          </div>
          <span className="text-xs text-[#52607D] font-normal">Categories used for fee itemization</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4 text-xs">
        <form onSubmit={handleAddCategory} className="flex items-center gap-2">
          <Input
            placeholder="New Fee Category Name..."
            className="flex-1 text-xs"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button variant="primary" icon={Plus} type="submit" loading={saving} disabled={!newCategoryName.trim()}>
            Add Category
          </Button>
        </form>

        {loading ? (
          <div className="p-6 text-center text-[#8C97AB]">Loading categories...</div>
        ) : categories.length === 0 ? (
          <EmptyState icon={Tag} title="No categories defined" description="Add your first fee category above." />
        ) : (
          <div className="divide-y divide-[#EDEAE1] border border-[#E4E1D8] rounded-[8px] overflow-hidden">
            {categories.map((c) => (
              <div key={c.id} className="p-3 flex items-center justify-between gap-3 hover:bg-[#FAFAF8]">
                {editingId === c.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      autoFocus
                      className="text-xs h-8"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                    />
                    <Button variant="primary" size="sm" icon={Check} onClick={() => handleSaveEdit(c.id)} />
                    <Button variant="outline" size="sm" icon={X} onClick={() => setEditingId(null)} />
                  </div>
                ) : (
                  <>
                    <span className="font-semibold text-[#14213D]">{c.name}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" icon={Edit2} onClick={() => { setEditingId(c.id); setEditingName(c.name); }} />
                      <Button variant="ghost" size="sm" icon={Trash2} className="text-[#B0403A] hover:bg-[#FDF2F1]" onClick={() => handleDelete(c.id, c.name)} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
