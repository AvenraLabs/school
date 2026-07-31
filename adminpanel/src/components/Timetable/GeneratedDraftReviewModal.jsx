import React, { useState, useEffect } from 'react';
import { timetableGenerationAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Select } from '../ui/Input';
import { Modal } from '../common/Modal';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import {
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Save,
  Clock,
  Sparkles,
  User,
  Plus,
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export function GeneratedDraftReviewModal({ isOpen, onClose, job, onPublished }) {
  const [draftTimetable, setDraftTimetable] = useState({});
  const [unplacedUnits, setUnplacedUnits] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedDay, setSelectedDay] = useState('monday');
  const [publishing, setPublishing] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (job && job.result_summary) {
      const gentt = job.result_summary.generated_timetable || {};
      setDraftTimetable(structuredClone(gentt));
      setUnplacedUnits(job.result_summary.unplaced_units || []);

      const secIds = Object.keys(gentt);
      if (secIds.length > 0) {
        setSelectedSectionId(secIds[0]);
      }
    }
  }, [job]);

  if (!isOpen || !job) return null;

  const summary = job.result_summary || {};
  const sectionIds = Object.keys(draftTimetable);
  const activeSectionData = draftTimetable[selectedSectionId] || null;
  const activeDaySlots = activeSectionData?.days?.[selectedDay] || [];

  const handlePlaceUnplacedUnit = (unitIdx, targetDay, slotIdx) => {
    if (!activeSectionData) return;

    const unit = unplacedUnits[unitIdx];
    if (!unit) return;

    const updated = structuredClone(draftTimetable);
    const targetSlot = updated[selectedSectionId]?.days?.[targetDay]?.[slotIdx];

    if (!targetSlot || targetSlot.is_break) {
      toast.error('Cannot place subject into a break slot.');
      return;
    }

    targetSlot.subject_id = unit.subject_id;
    targetSlot.subject_name = unit.subject_name;
    targetSlot.teacher_assignment_id = unit.teacher_assignment_id;
    targetSlot.teacher_name = unit.teacher_name;

    setDraftTimetable(updated);

    // Remove unit from unplaced list
    const newUnplaced = [...unplacedUnits];
    newUnplaced.splice(unitIdx, 1);
    setUnplacedUnits(newUnplaced);

    toast.success(`Placed ${unit.subject_name} into ${targetDay.toUpperCase()} (${targetSlot.start_time} - ${targetSlot.end_time})!`);
  };

  const handleConfirmPublish = async () => {
    setPublishing(true);
    try {
      const res = await timetableGenerationAPI.confirm(job.id, draftTimetable);
      toast.success(res.message || 'Timetable published successfully to database!');
      if (onPublished) onPublished();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to publish generated timetable');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Review & Confirm Generated Timetable Draft"
      size="max-w-5xl"
    >
      <div className="space-y-4 text-xs">
        {/* Header Summary Banner */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-950 text-sm">Draft Generation Completed Successfully</h4>
              <p className="text-emerald-800 text-xs mt-0.5">
                {summary.placed_count} period slots assigned across {summary.sections_count} section(s).
                {unplacedUnits.length > 0 && (
                  <span className="text-amber-800 font-semibold ml-1.5">
                    ({unplacedUnits.length} unplaced unit(s) require manual placement)
                  </span>
                )}
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            disabled={publishing}
            onClick={handleConfirmPublish}
            className="bg-[#2F6F5E] hover:bg-[#245749] text-white text-xs py-1.5 px-4"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {publishing ? 'Publishing...' : 'Confirm & Publish Timetable'}
          </Button>
        </div>

        {/* Unplaced Units Banner */}
        {unplacedUnits.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/60">
            <CardHeader className="py-2.5 px-3 border-b border-amber-200 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Unplaced Subject Units ({unplacedUnits.length})</span>
              </div>
              <span className="text-[11px] text-amber-800 opacity-80">
                You can manually place these into open slots below before publishing.
              </span>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {unplacedUnits.map((u, idx) => (
                  <div
                    key={idx}
                    className="p-2 bg-white rounded border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-[#14213D]">
                        {u.class_name} ({u.section_name})
                      </span>
                      <span className="text-gray-600 ml-2">
                        Subject: <strong className="text-amber-900">{u.subject_name}</strong> · Teacher: {u.teacher_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        className="py-0.5 text-xs w-36"
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value !== '') {
                            const [day, slotIdx] = e.target.value.split(':');
                            handlePlaceUnplacedUnit(idx, day, Number(slotIdx));
                          }
                        }}
                        options={[
                          { value: '', label: 'Quick Place in Slot...' },
                          ...(activeDaySlots || [])
                            .map((slot, sIdx) => ({ slot, sIdx }))
                            .filter(({ slot }) => !slot.is_break && !slot.subject_id)
                            .map(({ slot, sIdx }) => ({
                              value: `${selectedDay}:${sIdx}`,
                              label: `${selectedDay.toUpperCase()} (${slot.start_time} - ${slot.end_time})`,
                            })),
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section & Day Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAFAF8] p-3 rounded-lg border border-[#E4E1D8]">
          <div className="flex items-center gap-2 w-full sm:w-64">
            <span className="font-bold text-[#14213D]">Select Section:</span>
            <Select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              options={sectionIds.map((id) => {
                const sec = draftTimetable[id];
                return {
                  value: id,
                  label: `${sec?.class_name || 'Class'} - Section ${sec?.section_name || id}`,
                };
              })}
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto">
            {DAYS.map((day) => {
              const count = activeSectionData?.days?.[day]?.filter((s) => s.subject_id).length || 0;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 rounded-md capitalize text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    selectedDay === day
                      ? 'bg-[#2F6F5E] text-white font-bold'
                      : 'bg-white text-gray-700 border border-[#E4E1D8] hover:bg-gray-100'
                  }`}
                >
                  <span>{day.substring(0, 3)}</span>
                  {count > 0 && (
                    <span className={`text-[10px] px-1 py-0.2 rounded-full ${
                      selectedDay === day ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Slots Grid */}
        <Card className="border-[#E4E1D8]">
          <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex flex-row items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-[#14213D]">
              <Calendar className="w-4 h-4 text-[#2F6F5E]" />
              <span className="capitalize">{selectedDay} Schedule Grid</span>
              <span className="text-gray-500 font-normal">
                ({activeSectionData?.class_name} Section {activeSectionData?.section_name})
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activeDaySlots.length === 0 ? (
              <p className="p-6 text-center text-gray-500">No schedule slots generated for this day.</p>
            ) : (
              <div className="divide-y divide-[#E4E1D8]">
                {activeDaySlots.map((slot, sIdx) => (
                  <div
                    key={sIdx}
                    className={`p-3 flex items-center justify-between ${
                      slot.is_break ? 'bg-amber-50/50' : 'hover:bg-[#FAFAF8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-24 font-mono text-gray-600 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{slot.start_time} - {slot.end_time}</span>
                      </div>

                      {slot.is_break ? (
                        <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                          {slot.title || 'Break'}
                        </span>
                      ) : slot.subject_id ? (
                        <div>
                          <h5 className="font-bold text-[#14213D] text-xs">{slot.subject_name}</h5>
                          <span className="text-gray-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-[#2F6F5E]" />
                            {slot.teacher_name || 'Assigned Teacher'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Empty Slot</span>
                      )}
                    </div>

                    {!slot.is_break && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        slot.subject_id ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {slot.subject_id ? 'Auto-Placed' : 'Open Slot'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Modal>
  );
}
