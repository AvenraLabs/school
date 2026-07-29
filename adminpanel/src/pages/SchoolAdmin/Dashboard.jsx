import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolAPI } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Clock,
  AlertTriangle,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  DollarSign,
  Users,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export function SchoolAdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const res = await schoolAPI.getSchoolAnalytics();
      setAnalytics(res?.data || res || {});
    } catch (err) {
      console.error('Failed to load dashboard analytics data', err);
    } finally {
      setLoading(false);
    }
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (user?.name || user?.username || 'Admin').split(' ')[0];

  const attendanceRatio = analytics?.attendance?.avgAttendancePercentage ?? 0;
  const totalDays = analytics?.attendance?.totalDays ?? 0;
  const totalAbsences = analytics?.attendance?.totalAbsences ?? 0;

  const collectionRate = analytics?.finance?.collectionRate ?? 0;
  const totalCollected = analytics?.finance?.totalCollected ?? 0;
  const totalPendingDues = analytics?.finance?.totalPending ?? 0;

  const totalStudents = analytics?.overview?.totalStudents ?? 0;
  const defaultersCount = analytics?.academics?.defaultersCount ?? 0;

  if (loading) {
    return (
      <div className="space-y-4 text-xs animate-pulse">
        <Card className="p-4 bg-white border border-[#E4E1D8]">
          <div className="h-4 bg-[#EDEAE1] rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-[#EDEAE1] rounded w-1/4"></div>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-3.5 bg-white border border-[#E4E1D8]">
              <div className="h-3 bg-[#EDEAE1] rounded w-1/2 mb-3"></div>
              <div className="h-6 bg-[#EDEAE1] rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-[#EDEAE1] rounded w-2/3"></div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-white border border-[#E4E1D8] h-56 space-y-3">
            <div className="h-4 bg-[#EDEAE1] rounded w-1/3"></div>
            <div className="h-3 bg-[#EDEAE1] rounded w-full"></div>
            <div className="h-3 bg-[#EDEAE1] rounded w-full"></div>
            <div className="h-3 bg-[#EDEAE1] rounded w-full"></div>
          </Card>
          <Card className="p-4 bg-white border border-[#E4E1D8] h-56 space-y-3">
            <div className="h-4 bg-[#EDEAE1] rounded w-1/3"></div>
            <div className="h-3 bg-[#EDEAE1] rounded w-full"></div>
            <div className="h-3 bg-[#EDEAE1] rounded w-full"></div>
            <div className="h-3 bg-[#EDEAE1] rounded w-full"></div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      {/* Greeting Header & Date Badge */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D] text-sm">{greeting}, {firstName} 👋</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Institutional Executive Control Center</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[#52607D]">
            <Clock className="w-3.5 h-3.5 text-[#2F6F5E]" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </Card>

      {/* Primary Analytics & Metrics Deck */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3.5 border-l-4 border-l-[#2F6F5E] bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                ATTENDANCE RATIO
              </span>
              <div className="font-display font-bold text-xl text-[#14213D] mt-0.5">
                {attendanceRatio}%
              </div>
              <p className="text-[10px] text-[#8C97AB] mt-0.5">Campus-wide daily average</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#2F6F5E] bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                FEE COLLECTION RATE
              </span>
              <div className="font-display font-bold text-xl text-[#14213D] mt-0.5">
                {collectionRate}%
              </div>
              <p className="text-[10px] text-[#8C97AB] mt-0.5">Total collected vs target</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#B0403A] bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                OUTSTANDING DUES / FINES
              </span>
              <div className="font-display font-bold text-xl text-[#B0403A] mt-0.5 font-mono">
                ₹{Number(totalPendingDues).toLocaleString('en-IN')}
              </div>
              <p className="text-[10px] text-[#8C97AB] mt-0.5">Pending collection balance</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#FDF2F1] text-[#B0403A] flex items-center justify-center font-bold shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
        </Card>

        <Card className="p-3.5 border-l-4 border-l-[#B8860B] bg-white">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52607D] font-mono">
                ACADEMIC DEFAULTERS
              </span>
              <div className="font-display font-bold text-xl text-[#14213D] mt-0.5">
                {defaultersCount} Students
              </div>
              <p className="text-[10px] text-[#8C97AB] mt-0.5">Below 40% marks or 75% attendance</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#FDF8EC] text-[#B8860B] flex items-center justify-center font-bold shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: Attendance & Compliance Summary */}
        <Card>
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
              Attendance Compliance Breakdown
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
              Full Analytics <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[#EDEAE1]">
              <span className="text-[#52607D]">Campus-wide Attendance Ratio</span>
              <span className="font-bold text-[#2F6F5E] font-mono text-sm">{attendanceRatio}%</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[#EDEAE1]">
              <span className="text-[#52607D]">Total Academic Days Recorded</span>
              <span className="font-bold text-[#14213D] font-mono">{totalDays} Days</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[#EDEAE1]">
              <span className="text-[#52607D]">Total Absences Logged</span>
              <span className="font-bold text-[#B0403A] font-mono">{totalAbsences} Absences</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#52607D]">Total Active Student Body</span>
              <span className="font-bold text-[#14213D] font-mono">{totalStudents} Students</span>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Financial Performance & Dues Summary */}
        <Card>
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
            <CardTitle className="text-xs font-bold uppercase text-[#52607D]">
              Financial Collection & Dues Summary
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/fees')}>
              Fee Management <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-[#EDEAE1]">
              <span className="text-[#52607D]">Total Fees Collected</span>
              <span className="font-bold text-[#2F6F5E] font-mono text-sm">₹{Number(totalCollected).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[#EDEAE1]">
              <span className="text-[#52607D]">Outstanding Dues & Overdue Fines</span>
              <span className="font-bold text-[#B0403A] font-mono text-sm">₹{Number(totalPendingDues).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-[#EDEAE1]">
              <span className="text-[#52607D]">Collection Completion Rate</span>
              <span className="font-bold text-[#2F6F5E] font-mono">{collectionRate}%</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-[#52607D]">Pending Approvals Queue</span>
              <span className="font-bold text-[#B8860B] font-mono cursor-pointer underline" onClick={() => navigate('/admin/approvals')}>
                View Approvals Desk
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
