import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { classesAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Select } from '../../components/ui/Input';
import { Timetables } from './Timetables';
import { SubjectPeriodsManager } from './SubjectPeriodsManager';
import { SubstituteTeachers } from './SubstituteTeachers';
import { Calendar, Clock, UserCheck } from 'lucide-react';

export function TimetableModule() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'periods' | 'substitutions'

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const toast = useToast();

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch {
      toast.error('Failed to load classes');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const selectedSections = classes.find((c) => String(c.id) === String(selectedClass))?.sections || [];

  return (
    <div className="space-y-4 text-xs">
      {/* Top Action Bar / Unified Header */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-lg border border-[#E4E1D8]">
          <button
            onClick={() => handleTabChange('schedule')}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-[#2F6F5E] text-white shadow-sm font-bold'
                : 'text-[#14213D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Weekly Schedule</span>
          </button>
          <button
            onClick={() => handleTabChange('periods')}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'periods'
                ? 'bg-[#2F6F5E] text-white shadow-sm font-bold'
                : 'text-[#14213D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Period Allocations</span>
          </button>
          <button
            onClick={() => handleTabChange('substitutions')}
            className={`px-4 py-2 rounded-md font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'substitutions'
                ? 'bg-[#2F6F5E] text-white shadow-sm font-bold'
                : 'text-[#14213D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Substitutions</span>
          </button>
        </div>

        {/* Global Class/Section Selector */}
        {activeTab !== 'substitutions' && (
          <div className="flex items-center gap-2">
            <div className="w-40">
              <Select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection('');
                }}
              >
                <option value="">Select Class...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Class {c.class_name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-44">
              <Select
                disabled={!selectedClass}
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="">Select Section...</option>
                {selectedSections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Conditionally Render Active Tab Component */}
      <div className="tab-content">
        {activeTab === 'schedule' && (
          <Timetables
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            isEmbedded={true}
          />
        )}
        {activeTab === 'periods' && (
          <SubjectPeriodsManager
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            isEmbedded={true}
          />
        )}
        {activeTab === 'substitutions' && (
          <SubstituteTeachers
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            isEmbedded={true}
          />
        )}
      </div>
    </div>
  );
}
