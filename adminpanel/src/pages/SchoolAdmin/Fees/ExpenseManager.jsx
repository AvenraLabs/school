import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Trash2,
  AlertCircle,
  CheckCircle,
  FileText,
  DollarSign,
  Calendar,
  X,
  Upload,
  Ban,
  Tag,
  RefreshCw,
} from "lucide-react";
import { expenseAPI } from "../../../api";
import { Button } from "../../../components/ui/Button";
import { Select, Input, Textarea } from "../../../components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent } from "../../../components/ui/Card";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { EmptyState } from "../../../components/common/EmptyState";
import { Modal } from "../../../components/common/Modal";
import { useToast } from "../../../context/ToastContext";

export function ExpenseManager() {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [cancelModalState, setCancelModalState] = useState({ open: false, expenseId: null, reason: "" });

  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    vendor: "",
    payment_mode: "cash",
    reference_no: "",
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
    attachment_url: "",
  });

  const [catFormData, setCatFormData] = useState({ name: "", description: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catsRes, expRes] = await Promise.all([
        expenseAPI.listCategories(),
        expenseAPI.listExpenses({
          search,
          category_id: selectedCategory || undefined,
          payment_mode: selectedMode || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
      ]);

      setCategories(catsRes.data || []);
      setExpenses(expRes.expenses || []);
    } catch (err) {
      toast.error("Failed to fetch expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedMode, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!formData.category_id || !formData.amount || !formData.expense_date) {
      toast.error("Please fill in category, amount, and date.");
      return;
    }

    try {
      setSubmitting(true);
      await expenseAPI.createExpense(formData);
      toast.success("Expense recorded successfully!");
      setShowAddExpenseModal(false);
      setFormData({
        category_id: "",
        amount: "",
        vendor: "",
        payment_mode: "cash",
        reference_no: "",
        expense_date: new Date().toISOString().split("T")[0],
        description: "",
        attachment_url: "",
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to record expense");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catFormData.name.trim()) return;

    try {
      setSubmitting(true);
      await expenseAPI.createCategory(catFormData);
      toast.success("Category created successfully!");
      setShowAddCatModal(false);
      setCatFormData({ name: "", description: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelExpense = async (e) => {
    e.preventDefault();
    if (!cancelModalState.reason.trim()) {
      toast.error("Reason is required to cancel voucher.");
      return;
    }

    try {
      setSubmitting(true);
      await expenseAPI.cancelExpense(cancelModalState.expenseId, cancelModalState.reason);
      toast.success("Expense voucher cancelled successfully!");
      setCancelModalState({ open: false, expenseId: null, reason: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to cancel voucher");
    } finally {
      setSubmitting(false);
    }
  };

  const totalFilteredAmount = expenses
    .filter((e) => !e.is_cancelled)
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Vouchers: {expenses.length}</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="font-bold font-mono text-[#2F6F5E]">Active Total: ₹{totalFilteredAmount.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Tag}
              onClick={() => setShowAddCatModal(true)}
            >
              Add Category
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => setShowAddExpenseModal(true)}
            >
              Record Expense
            </Button>
          </div>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="p-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 text-xs">
          <Input
            icon={Search}
            placeholder="Search voucher, vendor..."
            className="w-48 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            className="w-40 text-xs"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
          <Select
            className="w-36 text-xs"
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
          >
            <option value="">All Modes</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
          </Select>
          <Input
            type="date"
            className="w-36 text-xs"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            type="date"
            className="w-36 text-xs"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </form>
      </Card>

      {/* Expenses Data Table */}
      <Card>
        <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
          <CardTitle className="text-xs font-bold uppercase text-[#52607D]">Voucher Register Ledger</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Voucher No</th>
                <th className="px-4 py-3">Expense Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor / Recipient</th>
                <th className="px-4 py-3">Payment Mode</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-[#8C97AB]">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center"><EmptyState icon={FileText} title="No expense entries found" description="Adjust filters or record a new voucher." /></td></tr>
              ) : (
                expenses.map((exp) => (
                  <tr key={exp.id} className={`hover:bg-[#FAFAF8] ${exp.is_cancelled ? "opacity-50 line-through" : ""}`}>
                    <td className="px-4 py-2.5 font-mono font-bold">{exp.voucher_no}</td>
                    <td className="px-4 py-2.5 font-mono text-[#52607D]">{exp.expense_date}</td>
                    <td className="px-4 py-2.5 font-semibold">{exp.category?.name || "General"}</td>
                    <td className="px-4 py-2.5">{exp.vendor || "—"}</td>
                    <td className="px-4 py-2.5 uppercase font-mono font-semibold text-[#2F6F5E]">{exp.payment_mode}</td>
                    <td className="px-4 py-2.5 font-mono font-bold text-[#14213D]">₹{Number(exp.amount).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-2.5 text-right">
                      {!exp.is_cancelled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#B0403A] hover:bg-[#FDF2F1]"
                          onClick={() => setCancelModalState({ open: true, expenseId: exp.id, reason: "" })}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Add Expense */}
      <Modal isOpen={showAddExpenseModal} onClose={() => setShowAddExpenseModal(false)} title="Record Expense Voucher">
        <form onSubmit={handleCreateExpense} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Expense Category *</label>
            <Select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}>
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            {categories.length === 0 && (
              <p className="text-[11px] text-[#B0403A] mt-1">
                No expense categories found.{" "}
                <button
                  type="button"
                  className="underline font-bold text-[#2F6F5E]"
                  onClick={() => {
                    setShowAddExpenseModal(false);
                    setShowAddCatModal(true);
                  }}
                >
                  Create category first
                </button>
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Amount (₹) *</label>
              <Input type="number" required min="1" placeholder="Amount..." className="font-mono font-bold" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Expense Date *</label>
              <Input type="date" required value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Vendor / Payee</label>
              <Input placeholder="Vendor name" value={formData.vendor} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Payment Mode</label>
              <Select value={formData.payment_mode} onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank_transfer">Bank Transfer</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowAddExpenseModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Record Voucher</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Add Category */}
      <Modal isOpen={showAddCatModal} onClose={() => setShowAddCatModal(false)} title="Create Expense Category">
        <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Category Name *</label>
            <Input required placeholder="Category name..." value={catFormData.name} onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowAddCatModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit" loading={submitting}>Create Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
