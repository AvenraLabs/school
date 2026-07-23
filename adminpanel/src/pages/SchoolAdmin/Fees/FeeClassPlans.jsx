import { useState, useEffect } from 'react';
import { feeAPI, classesAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Save, CheckCircle2, IndianRupee, Calendar, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';

const DEFAULT_SCHEDULE_GROUPS = [
  {
    term_name: 'Annual / One-Time Fee',
    due_date: '2026-06-10',
    categories: [],
  },
  {
    term_name: 'Term 1',
    due_date: '2026-06-10',
    categories: [],
  },
  {
    term_name: 'Term 2',
    due_date: '2026-09-10',
    categories: [],
  },
  {
    term_name: 'Term 3',
    due_date: '2027-01-10',
    categories: [],
  },
];

export function FeeClassPlans() {
  const [classes, setClasses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [scheduleGroups, setScheduleGroups] = useState(DEFAULT_SCHEDULE_GROUPS);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSavedClassName, setJustSavedClassName] = useState(null);
  const toast = useToast();

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [clsData, catData, sumData] = await Promise.all([
        classesAPI.list(),
        feeAPI.getCategories(),
        feeAPI.getAllClassPlansSummary(),
      ]);

      const rawClasses = clsData?.items || clsData?.rows || clsData?.data || clsData;
      const classList = Array.isArray(rawClasses) ? rawClasses : [];
      const activeCats = Array.isArray(catData) ? catData.filter((c) => c.is_active) : [];

      setClasses(classList);
      setCategories(activeCats);
      setSummary(Array.isArray(sumData) ? sumData : []);

      if (classList.length > 0) {
        setSelectedClassId((prev) => prev || String(classList[0].id));
      }
    } catch {
      toast.error('Failed to load classes or fee categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadClassPlanAndSchedule = async (classId) => {
    if (!classId) return;
    setJustSavedClassName(null);
    try {
      const data = await feeAPI.getClassPlans(classId);

      if (Array.isArray(data?.schedules) && data.schedules.length > 0) {
        const loadedGroups = data.schedules.map((s) => ({
          term_name: s.term_name,
          due_date: s.due_date || '',
          categories: [],
        }));

        if (Array.isArray(data?.plans) && loadedGroups.length > 0) {
          data.plans.forEach((p) => {
            loadedGroups[0].categories.push({
              category_id: p.fee_category_id,
              category_name: p.fee_category?.name || 'Fee Item',
              amount: Number(p.amount) || 0,
            });
          });
        }
        setScheduleGroups(loadedGroups);
      } else {
        // Clean default 4 fee plans without forced auto-filled categories
        const newGroups = DEFAULT_SCHEDULE_GROUPS.map((grp) => ({
          ...grp,
          categories: [],
        }));
        setScheduleGroups(newGroups);
      }
    } catch {
      toast.error('Failed to load class plan details');
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadClassPlanAndSchedule(selectedClassId);
    }
  }, [selectedClassId, categories]);

  const safeCategoriesList = Array.isArray(categories) ? categories : [];
  const safeClassesList = Array.isArray(classes) ? classes : [];
  const safeSummaryList = Array.isArray(summary) ? summary : [];
  const selectedClassName = safeClassesList.find((c) => String(c.id) === String(selectedClassId))?.class_name || '';

  const currentIndex = safeClassesList.findIndex((c) => String(c.id) === String(selectedClassId));
  const nextClass = currentIndex >= 0 && currentIndex < safeClassesList.length - 1 ? safeClassesList[currentIndex + 1] : null;

  const calculateGroupTotal = (group) => {
    return (group.categories || []).reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const overallClassTotal = scheduleGroups.reduce((sum, grp) => sum + calculateGroupTotal(grp), 0);

  const handleGroupHeaderChange = (index, field, val) => {
    setScheduleGroups((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleAddCategoryToGroup = (groupIndex, categoryId) => {
    if (!categoryId) return;
    const cat = safeCategoriesList.find((c) => String(c.id) === String(categoryId));
    if (!cat) return;

    setScheduleGroups((prev) => {
      const updated = [...prev];
      const grp = { ...updated[groupIndex] };
      const exists = grp.categories.some((item) => String(item.category_id) === String(cat.id));
      if (exists) {
        toast.error(`Category '${cat.name}' already added to this fee plan`);
        return prev;
      }
      grp.categories = [...grp.categories, { category_id: cat.id, category_name: cat.name, amount: '' }];
      updated[groupIndex] = grp;
      return updated;
    });
  };

  const handleCategoryAmountChange = (groupIndex, catIndex, val) => {
    const num = val === '' ? '' : Math.max(0, Number(val));
    setScheduleGroups((prev) => {
      const updated = [...prev];
      const grp = { ...updated[groupIndex] };
      const catList = [...grp.categories];
      catList[catIndex] = { ...catList[catIndex], amount: num };
      grp.categories = catList;
      updated[groupIndex] = grp;
      return updated;
    });
  };

  const handleRemoveCategoryFromGroup = (groupIndex, catIndex) => {
    setScheduleGroups((prev) => {
      const updated = [...prev];
      const grp = { ...updated[groupIndex] };
      grp.categories = grp.categories.filter((_, i) => i !== catIndex);
      updated[groupIndex] = grp;
      return updated;
    });
  };

  // Add Fee Plan (empty name & categories)
  const handleAddGroup = () => {
    setScheduleGroups((prev) => [
      ...prev,
      { term_name: '', due_date: '', categories: [] },
    ]);
  };

  const handleRemoveGroup = (index) => {
    setScheduleGroups((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    if (!selectedClassId) return;

    const aggregateCategories = {};
    const scheduleItems = [];

    scheduleGroups.forEach((grp) => {
      const grpTotal = calculateGroupTotal(grp);
      if (grp.term_name && grp.term_name.trim()) {
        scheduleItems.push({
          term_name: grp.term_name.trim(),
          due_date: grp.due_date || null,
          amount: grpTotal,
        });
      }

      (grp.categories || []).forEach((item) => {
        const val = Number(item.amount) || 0;
        if (val > 0) {
          aggregateCategories[item.category_id] = (aggregateCategories[item.category_id] || 0) + val;
        }
      });
    });

    const categoryItems = Object.entries(aggregateCategories).map(([catId, amt]) => ({
      fee_category_id: Number(catId),
      amount: amt,
    }));

    setSaving(true);
    try {
      await feeAPI.upsertClassPlans(selectedClassId, {
        categories: categoryItems,
        schedules: scheduleItems,
      });
      toast.success(`Fee plan for Class ${selectedClassName} saved successfully!`);
      setJustSavedClassName(selectedClassName);

      const sumData = await feeAPI.getAllClassPlansSummary();
      setSummary(Array.isArray(sumData) ? sumData : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save class plan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Fee Plan Cards */}
        <div className="lg:col-span-2 space-y-6">
          {justSavedClassName && (
            <div className="card p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span className="text-xs font-bold text-emerald-900">
                  Fee plan for <strong className="underline">Class {justSavedClassName}</strong> saved!
                </span>
              </div>

              {nextClass && (
                <button
                  type="button"
                  onClick={() => setSelectedClassId(String(nextClass.id))}
                  className="btn-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 border-none shadow-sm"
                >
                  Configure Class {nextClass.class_name} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {scheduleGroups.map((group, grpIdx) => {
            const groupTotal = calculateGroupTotal(group);
            return (
              <div key={grpIdx} className="card bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
                {/* Group Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="text"
                      className="input-field text-sm font-extrabold text-slate-900 bg-white max-w-xs"
                      value={group.term_name}
                      onChange={(e) => handleGroupHeaderChange(grpIdx, 'term_name', e.target.value)}
                      placeholder="e.g. Annual or Term 1"
                    />

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="date"
                        className="input-field text-xs bg-white py-1"
                        value={group.due_date || ''}
                        onChange={(e) => handleGroupHeaderChange(grpIdx, 'due_date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      Plan Total: ₹{groupTotal.toLocaleString('en-IN')}
                    </span>

                    {scheduleGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(grpIdx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove Fee Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Group Categories Input List */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Categories in {group.term_name || 'Fee Plan'}:
                    </span>

                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <select
                        className="select-field text-xs py-1 text-indigo-700 font-bold bg-indigo-50/60 border-indigo-200"
                        onChange={(e) => {
                          handleAddCategoryToGroup(grpIdx, e.target.value);
                          e.target.value = '';
                        }}
                        defaultValue=""
                      >
                        <option value="" disabled>+ Add Fee Category</option>
                        {safeCategoriesList.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            + {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {group.categories.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No categories added yet. Select "+ Add Fee Category" above.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {group.categories.map((catItem, catIdx) => (
                        <div key={catIdx} className="py-2.5 flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-slate-800">{catItem.category_name}</span>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400 font-bold text-xs">₹</span>
                              <input
                                type="number"
                                min="0"
                                placeholder="0"
                                className="input-field text-xs font-bold text-right w-32 py-1 text-emerald-700"
                                value={catItem.amount}
                                onChange={(e) => handleCategoryAmountChange(grpIdx, catIdx, e.target.value)}
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCategoryFromGroup(grpIdx, catIdx)}
                              className="text-slate-400 hover:text-rose-600 p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Add Fee Plan Button & Save Action Bar */}
          <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between flex-wrap gap-4">
            <button
              type="button"
              onClick={handleAddGroup}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
            >
              <Plus className="w-4 h-4" /> Add Fee Plan
            </button>

            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Total Class {selectedClassName} Fee:</span>
                <span className="text-xl font-black text-indigo-600">₹{overallClassTotal.toLocaleString('en-IN')}</span>
              </div>

              <button
                onClick={handleSaveAll}
                className="btn-primary bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white flex items-center gap-2 px-6 py-2.5 border-none shadow-md shadow-indigo-100"
                disabled={saving}
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : `Save Class ${selectedClassName} Plan`}
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Class Plans Overview */}
        <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm space-y-4">
          <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Class Plans Overview
          </h4>

          <div className="space-y-2.5 max-h-[550px] overflow-y-auto pr-1">
            {safeSummaryList.map((item) => {
              const isSelected = String(item.class_id) === String(selectedClassId);
              return (
                <div
                  key={item.class_id}
                  onClick={() => setSelectedClassId(String(item.class_id))}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/70'
                  }`}
                >
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 block flex items-center gap-1.5">
                      Class {item.class_name}
                      {isSelected && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Active</span>}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {item.schedules_count > 0 ? `${item.schedules_count} fee plans` : 'No schedule set'}
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-800 flex items-center">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                    {item.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
