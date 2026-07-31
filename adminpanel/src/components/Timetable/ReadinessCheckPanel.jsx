import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export function ReadinessCheckPanel({ readinessData, loading, onRefresh, selectedClass }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  if (loading) {
    return (
      <Card className="border-[#E4E1D8] p-6 text-center text-gray-500">
        <div className="flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#2F6F5E]" />
          <span>Running Pre-flight Readiness Check across active classes & sections...</span>
        </div>
      </Card>
    );
  }

  if (!readinessData) return null;

  const { is_school_ready, summary, sections = [], teacher_overloads = [] } = readinessData;

  // Flatten issue details across sections
  const missingTeacherIssues = [];
  const missingPeriodIssues = [];

  sections.forEach((sec) => {
    (sec.missing_teachers || []).forEach((item) => {
      missingTeacherIssues.push({
        class_name: sec.class_name,
        section_name: sec.section_name,
        class_id: sec.class_id,
        section_id: sec.section_id,
        ...item,
      });
    });

    (sec.missing_periods || []).forEach((item) => {
      missingPeriodIssues.push({
        class_name: sec.class_name,
        section_name: sec.section_name,
        class_id: sec.class_id,
        section_id: sec.section_id,
        ...item,
      });
    });
  });

  return (
    <Card className="border-[#E4E1D8] shadow-xs space-y-3">
      {/* Top Banner */}
      <CardHeader className={`p-4 border-b rounded-t-[10px] ${
        is_school_ready
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          : 'bg-amber-50/70 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              is_school_ready ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {is_school_ready ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {is_school_ready
                  ? 'All Pre-flight Readiness Checks Passed!'
                  : 'Pre-flight Action Required Before Auto-Generation'}
              </h3>
              <p className="text-xs opacity-80 mt-0.5">
                {is_school_ready
                  ? 'All sections have active teacher assignments, period budgets, and bell schedules configured.'
                  : `${summary.blocked_sections} section(s) have blocking issues or unmapped teacher assignments.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="bg-white hover:bg-gray-50 border-gray-300 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-gray-600" />
              Re-check Readiness
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded-lg border border-[#E4E1D8] bg-white flex flex-col justify-between">
            <span className="text-gray-500 text-[11px]">Total Sections</span>
            <span className="font-bold text-base text-[#14213D]">{summary.total_sections}</span>
          </div>

          <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between">
            <span className="text-emerald-800 text-[11px]">Ready Sections</span>
            <span className="font-bold text-base text-emerald-900">{summary.ready_sections}</span>
          </div>

          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            summary.total_missing_teachers > 0 ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <span className="text-gray-600 text-[11px]">Missing Teachers</span>
            <span className={`font-bold text-base ${summary.total_missing_teachers > 0 ? 'text-red-700' : 'text-gray-700'}`}>
              {summary.total_missing_teachers}
            </span>
          </div>

          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            summary.total_missing_periods > 0 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <span className="text-gray-600 text-[11px]">Unset Periods</span>
            <span className={`font-bold text-base ${summary.total_missing_periods > 0 ? 'text-amber-800' : 'text-gray-700'}`}>
              {summary.total_missing_periods}
            </span>
          </div>

          <div className={`p-2.5 rounded-lg border flex flex-col justify-between ${
            summary.teacher_overloads_count > 0 ? 'border-purple-200 bg-purple-50/50' : 'border-gray-200 bg-gray-50/50'
          }`}>
            <span className="text-purple-800 text-[11px]">Overloaded Teachers</span>
            <span className={`font-bold text-base ${summary.teacher_overloads_count > 0 ? 'text-purple-900' : 'text-gray-700'}`}>
              {summary.teacher_overloads_count}
            </span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-[#E4E1D8] text-xs">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === 'summary'
                ? 'border-[#2F6F5E] text-[#2F6F5E] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            Section Status ({sections.length})
          </button>

          <button
            onClick={() => setActiveTab('missing_teachers')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'missing_teachers'
                ? 'border-[#2F6F5E] text-[#2F6F5E] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Missing Teachers</span>
            {missingTeacherIssues.length > 0 && (
              <span className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {missingTeacherIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('missing_periods')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'missing_periods'
                ? 'border-[#2F6F5E] text-[#2F6F5E] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Unset Periods</span>
            {missingPeriodIssues.length > 0 && (
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {missingPeriodIssues.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('overloads')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overloads'
                ? 'border-[#2F6F5E] text-[#2F6F5E] font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <span>Teacher Capacity</span>
            {teacher_overloads.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {teacher_overloads.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Section Summary List */}
        {activeTab === 'summary' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sections.map((sec) => (
              <div
                key={`${sec.class_id}_${sec.section_id}`}
                className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                  sec.is_ready
                    ? 'bg-emerald-50/30 border-emerald-200'
                    : 'bg-amber-50/30 border-amber-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#14213D]">
                      {sec.class_name} ({sec.section_name})
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      sec.is_ready ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                    }`}>
                      {sec.is_ready ? 'Ready' : 'Issues Pending'}
                    </span>
                  </div>

                  <p className="text-[#8C97AB] text-[11px] mt-0.5">
                    {sec.bell_schedule ? (
                      <span className="text-[#2F6F5E] font-medium">
                        Schedule: {sec.bell_schedule.name} ({sec.bell_schedule.period_count} slots)
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">No Bell Schedule Template Assigned</span>
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-gray-600 text-[11px] block">
                    {sec.total_subjects} Subjects · {sec.total_required_periods} p/wk
                  </span>
                  {!sec.is_ready && (
                    <span className="text-amber-800 font-semibold text-[10px]">
                      {sec.missing_teachers.length} teacher / {sec.missing_periods.length} period issue(s)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Missing Teacher Assignments */}
        {activeTab === 'missing_teachers' && (
          <div className="space-y-2">
            {missingTeacherIssues.length === 0 ? (
              <p className="text-xs text-emerald-700 p-4 bg-emerald-50 rounded-lg text-center font-medium">
                Awesome! Every assigned subject has an active teacher mapped across all sections.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {missingTeacherIssues.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-red-200 bg-red-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <div>
                        <span className="font-bold text-[#14213D]">
                          Class {item.class_name} ({item.section_name})
                        </span>
                        <span className="text-gray-600 ml-2">
                          Subject <strong className="text-red-700">{item.subject_name}</strong> has no teacher assigned
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/assignments')}
                      className="text-[#2F6F5E] border-[#2F6F5E] hover:bg-[#EAF3F0] text-xs py-1"
                    >
                      Assign Teacher <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Missing Period Allocations */}
        {activeTab === 'missing_periods' && (
          <div className="space-y-2">
            {missingPeriodIssues.length === 0 ? (
              <p className="text-xs text-emerald-700 p-4 bg-emerald-50 rounded-lg text-center font-medium">
                Great! Every subject has a valid periods_per_week budget configured.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {missingPeriodIssues.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold text-[#14213D]">
                          Class {item.class_name} ({item.section_name})
                        </span>
                        <span className="text-gray-600 ml-2">
                          Subject <strong className="text-amber-900">{item.subject_name}</strong> has no periods/week set
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/subject-periods')}
                      className="text-[#2F6F5E] border-[#2F6F5E] hover:bg-[#EAF3F0] text-xs py-1"
                    >
                      Set Periods <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Teacher Overload Warnings */}
        {activeTab === 'overloads' && (
          <div className="space-y-2">
            {teacher_overloads.length === 0 ? (
              <p className="text-xs text-emerald-700 p-4 bg-emerald-50 rounded-lg text-center font-medium">
                No teacher capacity overloads detected! All teachers are within their max workload limits.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {teacher_overloads.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-purple-200 bg-purple-50/50 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-700 shrink-0" />
                        <span className="font-bold text-[#14213D]">{t.name} ({t.employee_id})</span>
                        <span className="bg-purple-200 text-purple-900 font-bold px-1.5 py-0.2 rounded text-[10px]">
                          Overloaded +{t.excess_periods} p/wk
                        </span>
                      </div>
                      <p className="text-purple-800 text-[11px] mt-0.5">
                        Assigned total: <strong>{t.required_load} periods/wk</strong> (Max configured capacity: {t.max_capacity} periods/wk)
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/admin/assignments')}
                      className="text-purple-800 border-purple-300 hover:bg-purple-100 text-xs py-1 self-end md:self-auto"
                    >
                      Re-allocate Subjects
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
