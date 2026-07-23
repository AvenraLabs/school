import { useState, useEffect } from 'react';
import { feeAPI } from '../../../api';
import { useToast } from '../../../context/ToastContext';
import { Calendar, Filter, CreditCard, Banknote, Landmark, QrCode, TrendingUp } from 'lucide-react';

export function FeeReports() {
  const [activeSubTab, setActiveSubTab] = useState('summary'); // 'summary' | 'defaulters'
  const [summaryData, setSummaryData] = useState(null);
  const [defaulters, setDefaulters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minBalance, setMinBalance] = useState(0);
  const toast = useToast();

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await feeAPI.getCollectionSummary();
      setSummaryData(data);
    } catch {
      toast.error('Failed to load collection summary');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaulters = async () => {
    setLoading(true);
    try {
      const data = await feeAPI.getDefaulters({ min_balance: minBalance });
      setDefaulters(data || []);
    } catch {
      toast.error('Failed to load defaulter list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'summary') loadSummary();
    else loadDefaulters();
  }, [activeSubTab, minBalance]);

  return (
    <div className="space-y-6">
      {/* Clean Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveSubTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'summary'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Overall Collection Summary
        </button>
        <button
          onClick={() => setActiveSubTab('defaulters')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'defaulters'
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Pending Fee Defaulters List
        </button>
      </div>

      {loading ? (
        <div className="card p-12 bg-white text-center text-slate-400 font-medium rounded-2xl border border-slate-200/80">
          Loading report metrics...
        </div>
      ) : activeSubTab === 'summary' ? (
        <div className="space-y-6">

          {/* Overall Academic Year Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Fee Ledger</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{summaryData?.overall?.total_fee?.toLocaleString('en-IN') || 0}
              </span>
            </div>

            <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm border-t-4 border-t-emerald-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Collected</span>
              <span className="text-2xl font-black text-emerald-600">
                ₹{summaryData?.overall?.total_collected?.toLocaleString('en-IN') || 0}
              </span>
            </div>

            <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm border-t-4 border-t-rose-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Total Pending</span>
              <span className="text-2xl font-black text-rose-600">
                ₹{summaryData?.overall?.total_pending?.toLocaleString('en-IN') || 0}
              </span>
            </div>

            <div className="card p-5 bg-white border border-slate-200/80 rounded-2xl shadow-sm border-t-4 border-t-indigo-500">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Collection %</span>
              <span className="text-2xl font-black text-indigo-600">
                {summaryData?.overall?.collection_percentage || 0}%
              </span>
            </div>
          </div>

          {/* Class-wise Collection Breakdown Table */}
          <div className="card bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Class-wise Collection Breakdown</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3.5 pl-6">Class Name</th>
                    <th className="p-3.5">Students</th>
                    <th className="p-3.5">Total Fee</th>
                    <th className="p-3.5">Collected</th>
                    <th className="p-3.5">Pending</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryData?.classes?.map((cls) => (
                    <tr key={cls.class_name} className="hover:bg-slate-50/80">
                      <td className="p-3.5 pl-6 font-bold text-slate-900">{cls.class_name}</td>
                      <td className="p-3.5 text-slate-600 font-medium">{cls.student_count}</td>
                      <td className="p-3.5 font-semibold text-slate-800">₹{cls.total_fee.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-bold text-emerald-600">₹{cls.collected.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 font-bold text-rose-600">₹{cls.pending.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Defaulters List Subtab */
        <div className="space-y-6">
          <div className="card p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">Minimum Balance Filter:</span>
              <select
                className="select-field text-xs py-1 font-semibold"
                value={minBalance}
                onChange={(e) => setMinBalance(Number(e.target.value))}
              >
                <option value="0">All Pending (Balance &gt; ₹0)</option>
                <option value="1000">&gt; ₹1,000</option>
                <option value="5000">&gt; ₹5,000</option>
                <option value="10000">&gt; ₹10,000</option>
              </select>
            </div>

            <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
              {defaulters.length} Defaulters Found
            </span>
          </div>

          <div className="card bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="data-table w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3.5 pl-6">Student Name</th>
                    <th className="p-3.5">Class</th>
                    <th className="p-3.5">Parent Contact</th>
                    <th className="p-3.5">Total Fee</th>
                    <th className="p-3.5">Paid</th>
                    <th className="p-3.5 pr-6 text-right">Balance Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaulters.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-slate-400">No fee defaulters matching criteria!</td></tr>
                  ) : (
                    defaulters.map((d) => (
                      <tr key={d.ledger_id} className="hover:bg-slate-50/80">
                        <td className="p-3.5 pl-6">
                          <span className="font-bold text-slate-900 block">{d.name}</span>
                          <span className="text-[10px] text-slate-400">Roll No: {d.roll_no || d.admission_no || '—'}</span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">{d.class_name} - {d.section_name}</td>
                        <td className="p-3.5 text-slate-600 font-mono">{d.phone || '—'}</td>
                        <td className="p-3.5 text-slate-700">₹{d.total.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 font-semibold text-emerald-600">₹{d.paid.toLocaleString('en-IN')}</td>
                        <td className="p-3.5 pr-6 text-right font-extrabold text-rose-600">₹{d.balance.toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
