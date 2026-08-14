import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { curriculumAPI, teacherAiAPI, classesAPI, schoolAPI } from '../../api';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { generateQuestionPaperPDF } from '../../utils/pdfGenerator';
import { formatDate } from '../../utils/date';
import {
  Sparkles,
  BookOpen,
  FileText,
  Layers,
  Download,
  Printer,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  Sliders,
  Plus,
  Search,
  ChevronLeft,
  HelpCircle,
  Folder,
  Calendar,
  Clock,
  Award,
  Save,
  Check,
} from 'lucide-react';

const GRADES = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`,
}));

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy (Foundational)' },
  { value: 'MEDIUM', label: 'Medium (Standard Board Level)' },
  { value: 'HARD', label: 'Hard (Advanced & HOTS)' },
  { value: 'MIXED', label: 'Mixed (Balanced Difficulty)' },
];

export function QuestionPaperGenerator() {
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('create'); // 'create' | 'saved'

  // Form State - auto-fills from School Settings
  const [board, setBoard] = useState(user?.school?.board || user?.board || 'CBSE');
  const [grade, setGrade] = useState('10');
  const [subject, setSubject] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [isOtherSubject, setIsOtherSubject] = useState(false);

  // Auto-sync School Board from active school settings on mount
  useEffect(() => {
    const syncSchoolBoard = async () => {
      try {
        const res = await schoolAPI.getMySchool();
        const sc = res.data || res;
        if (sc?.board) {
          setBoard(sc.board);
        }
      } catch {
        // Fallback to user.school.board or CBSE
      }
    };
    syncSchoolBoard();
  }, []);

  // RAG Curriculum Data
  const [curriculumSubjects, setCurriculumSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [curriculumChapters, setCurriculumChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopicMode, setIsCustomTopicMode] = useState(false);

  // Paper Structure & Question Counts
  const [title, setTitle] = useState('');
  const [examName, setExamName] = useState('Term Examination');
  const [difficulty, setDifficulty] = useState('MEDIUM');

  const [mcqCount, setMcqCount] = useState(5);
  const [fillBlanksCount, setFillBlanksCount] = useState(0);
  const [trueFalseCount, setTrueFalseCount] = useState(0);
  const [shortAnswerCount, setShortAnswerCount] = useState(3);
  const [longAnswerCount, setLongAnswerCount] = useState(2);
  const [instructions, setInstructions] = useState('');

  // Generation & Results
  const [generating, setGenerating] = useState(false);
  const [generatedPaper, setGeneratedPaper] = useState(null);
  const [showAnswerKey, setShowAnswerKey] = useState(true);
  const [savingDoc, setSavingDoc] = useState(false);
  const [savedDocId, setSavedDocId] = useState(null);

  // Saved Papers History
  const [savedPapers, setSavedPapers] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedSearchQuery, setSavedSearchQuery] = useState('');
  const [viewingSavedPaper, setViewingSavedPaper] = useState(null);

  // Calculate totals
  const safeMcq = Math.max(0, parseInt(mcqCount, 10) || 0);
  const safeFillBlanks = Math.max(0, parseInt(fillBlanksCount, 10) || 0);
  const safeTrueFalse = Math.max(0, parseInt(trueFalseCount, 10) || 0);
  const safeShort = Math.max(0, parseInt(shortAnswerCount, 10) || 0);
  const safeLong = Math.max(0, parseInt(longAnswerCount, 10) || 0);

  const totalQuestions = safeMcq + safeFillBlanks + safeTrueFalse + safeShort + safeLong;
  const totalCalculatedMarks =
    safeMcq * 1 + safeFillBlanks * 1 + safeTrueFalse * 1 + safeShort * 3 + safeLong * 5;
  const suggestedDuration = Math.max(15, Math.ceil(totalCalculatedMarks * 1.2));

  // Load Curriculum Subjects when board or grade changes
  const loadCurriculumSubjects = useCallback(async () => {
    if (!board || !grade) return;
    setLoadingSubjects(true);
    setSubject('');
    setCurriculumSubjects([]);
    setCurriculumChapters([]);
    setSelectedChapters([]);
    try {
      const subs = await curriculumAPI.getSubjects(board, grade);
      setCurriculumSubjects(subs || []);
      if (subs && subs.length > 0) {
        setSubject(subs[0]);
      }
    } catch {
      setCurriculumSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  }, [board, grade]);

  useEffect(() => {
    loadCurriculumSubjects();
  }, [loadCurriculumSubjects]);

  // Load Curriculum Chapters when subject changes
  const loadCurriculumChapters = useCallback(async () => {
    if (!board || !grade || !subject || isOtherSubject) {
      setCurriculumChapters([]);
      setSelectedChapters([]);
      return;
    }
    setLoadingChapters(true);
    setCurriculumChapters([]);
    setSelectedChapters([]);
    try {
      const chaps = await curriculumAPI.getChapters(board, grade, subject);
      setCurriculumChapters(chaps || []);
      if (chaps && chaps.length > 0) {
        // Select first 2 chapters by default for convenience
        setSelectedChapters([String(chaps[0].number || chaps[0].id || '1')]);
      }
    } catch {
      setCurriculumChapters([]);
    } finally {
      setLoadingChapters(false);
    }
  }, [board, grade, subject, isOtherSubject]);

  useEffect(() => {
    loadCurriculumChapters();
  }, [loadCurriculumChapters]);

  // Load Saved Papers
  const loadSavedPapers = async () => {
    setLoadingSaved(true);
    try {
      const res = await teacherAiAPI.listDocuments({ type: 'question_paper' });
      setSavedPapers(res || []);
    } catch {
      toast.error('Failed to load saved question papers');
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'saved') {
      loadSavedPapers();
    }
  }, [activeTab]);

  const handleToggleChapter = (chapNum) => {
    setSelectedChapters((prev) =>
      prev.includes(chapNum) ? prev.filter((c) => c !== chapNum) : [...prev, chapNum]
    );
  };

  const handleSelectAllChapters = () => {
    if (selectedChapters.length === curriculumChapters.length) {
      setSelectedChapters([]);
    } else {
      setSelectedChapters(curriculumChapters.map((c) => String(c.number || c.id)));
    }
  };

  // Generate Question Paper
  const handleGenerate = async () => {
    const resolvedSubject = isOtherSubject ? customSubject.trim() : subject;
    if (!resolvedSubject) {
      toast.error('Please select or specify a subject');
      return;
    }

    if (!isCustomTopicMode && selectedChapters.length === 0) {
      toast.error('Please select at least one syllabus chapter or switch to Custom Topic');
      return;
    }

    if (isCustomTopicMode && !customTopic.trim()) {
      toast.error('Please enter a topic description');
      return;
    }

    if (totalQuestions === 0) {
      toast.error('Please configure at least 1 question for the paper');
      return;
    }

    if (totalQuestions > 50) {
      toast.error('Maximum 50 questions permitted per generation');
      return;
    }

    const schoolName = user?.school?.school_name || user?.school_name || 'School Management System';
    const paperTitle = title.trim() || `${resolvedSubject} ${examName}`;

    setGenerating(true);
    setGeneratedPaper(null);
    setSavedDocId(null);

    try {
      const payload = {
        feature: 'question_paper',
        board,
        grade: `Class ${grade}`,
        subject: resolvedSubject,
        topic: isCustomTopicMode ? customTopic.trim() : '',
        chapters: isCustomTopicMode ? [] : selectedChapters,
        skipRag: isCustomTopicMode || isOtherSubject,
        title: paperTitle,
        examName,
        totalMarks: totalCalculatedMarks,
        duration: suggestedDuration,
        numQuestions: totalQuestions,
        questionCounts: {
          mcq: safeMcq,
          fillBlanks: safeFillBlanks,
          trueFalse: safeTrueFalse,
          shortAnswer: safeShort,
          longAnswer: safeLong,
        },
        difficulty,
        instructions,
      };

      const res = await teacherAiAPI.generate(payload);
      const paperData = res.data || res;

      // Enhance with school details for viewing & printing
      const fullPaper = {
        ...paperData,
        schoolName,
        meta: {
          board,
          grade: `Class ${grade}`,
          subject: resolvedSubject,
          chapters: selectedChapters,
        },
      };

      setGeneratedPaper(fullPaper);
      toast.success('Question paper generated successfully using RAG!');

      // Automatically auto-save draft document
      try {
        const saveRes = await teacherAiAPI.saveDocument({
          type: 'question_paper',
          title: paperTitle,
          board,
          grade: `Class ${grade}`,
          subject: resolvedSubject,
          chapters: selectedChapters,
          content: fullPaper,
          status: 'saved',
        });
        if (saveRes?.id) {
          setSavedDocId(saveRes.id);
        }
      } catch {
        // Safe fallback if auto-save fails
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate question paper. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = (includeAnswers = false) => {
    if (!generatedPaper) return;
    const schoolName = user?.school?.school_name || user?.school_name || 'School Management System';
    generateQuestionPaperPDF({
      schoolName,
      paperData: generatedPaper,
      includeAnswers,
    });
    toast.success(
      includeAnswers
        ? 'Question paper with Marking Scheme downloaded!'
        : 'Student Question Paper PDF downloaded!'
    );
  };

  const handleDeleteSavedDoc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved question paper?')) return;
    try {
      await teacherAiAPI.deleteDocument(id);
      toast.success('Question paper deleted');
      setSavedPapers((prev) => prev.filter((p) => p.id !== id));
      if (viewingSavedPaper?.id === id) {
        setViewingSavedPaper(null);
      }
    } catch {
      toast.error('Failed to delete question paper');
    }
  };

  const filteredSavedPapers = useMemo(() => {
    const q = savedSearchQuery.toLowerCase().trim();
    if (!q) return savedPapers;
    return savedPapers.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.subject || '').toLowerCase().includes(q) ||
        (p.grade || '').toLowerCase().includes(q)
    );
  }, [savedPapers, savedSearchQuery]);

  return (
    <div className="space-y-4 text-xs">
      {/* Compact Top Action Bar */}
      <div className="bg-white border border-[#E4E1D8] rounded-[10px] p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-base text-[#14213D]">
              AI Question Paper Generator (RAG)
            </h2>
            <p className="text-[11px] text-[#8C97AB]">
              Generate curriculum-aligned exam papers with answer keys using textbook RAG embeddings
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-lg border border-[#E4E1D8]">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-[#2F6F5E] text-white shadow-xs'
                : 'text-[#14213D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Paper</span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-[#2F6F5E] text-white shadow-xs'
                : 'text-[#14213D] hover:bg-[#EAF3F0] hover:text-[#2F6F5E]'
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Saved Papers ({savedPapers.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'create' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Configuration Form (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card>
              <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase text-[#52607D] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2F6F5E]" />
                  1. Curriculum & Syllabus
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {/* Grade Selector with School Board Affiliation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      Class / Grade *
                    </label>
                    <span className="text-[10px] font-mono text-[#2F6F5E] bg-[#EAF3F0] px-2 py-0.5 rounded font-semibold border border-[#D3E6E0]">
                      Board: {board}
                    </span>
                  </div>
                  <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                    {GRADES.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Subject Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      Subject *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtherSubject(!isOtherSubject);
                        if (!isOtherSubject) setIsCustomTopicMode(true);
                      }}
                      className="text-[10px] text-[#2F6F5E] hover:underline cursor-pointer"
                    >
                      {isOtherSubject ? 'Choose from Curriculum' : 'Custom / Unlisted Subject'}
                    </button>
                  </div>

                  {isOtherSubject ? (
                    <Input
                      placeholder="e.g. Computer Applications, Sanskrit..."
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                    />
                  ) : (
                    <Select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      disabled={loadingSubjects}
                    >
                      {loadingSubjects ? (
                        <option value="">Loading curriculum subjects...</option>
                      ) : curriculumSubjects.length === 0 ? (
                        <option value="">No RAG textbook found for this grade</option>
                      ) : (
                        curriculumSubjects.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))
                      )}
                    </Select>
                  )}
                </div>

                {/* Chapter & Topic RAG Selection */}
                {!isOtherSubject && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                        Chapters / Units (RAG Ingested)
                      </label>
                      {curriculumChapters.length > 0 && (
                        <button
                          type="button"
                          onClick={handleSelectAllChapters}
                          className="text-[10px] text-[#2F6F5E] hover:underline cursor-pointer"
                        >
                          {selectedChapters.length === curriculumChapters.length
                            ? 'Deselect All'
                            : 'Select All Chapters'}
                        </button>
                      )}
                    </div>

                    {loadingChapters ? (
                      <p className="text-[11px] text-[#8C97AB] py-3 text-center">Loading chapters...</p>
                    ) : curriculumChapters.length === 0 ? (
                      <div className="p-3 bg-[#FAFAF8] rounded-[6px] border border-[#E4E1D8] text-[11px] text-[#8C97AB]">
                        No specific chapters indexed for this subject. AI will generate based on grade standard curriculum.
                      </div>
                    ) : (
                      <div className="space-y-1.5 max-h-44 overflow-y-auto p-2 bg-[#FAFAF8] rounded-[6px] border border-[#E4E1D8]">
                        {curriculumChapters.map((chap) => {
                          const chapId = String(chap.number || chap.id);
                          const isChecked = selectedChapters.includes(chapId);
                          return (
                            <label
                              key={chapId}
                              className={`flex items-start gap-2 p-1.5 rounded cursor-pointer transition-colors text-[11px] ${
                                isChecked
                                  ? 'bg-[#EAF3F0] text-[#2F6F5E] font-medium'
                                  : 'text-[#14213D] hover:bg-white'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleChapter(chapId)}
                                className="mt-0.5 rounded accent-[#2F6F5E]"
                              />
                              <span>
                                Chapter {chap.number || chapId}: {chap.title || chap.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Topic Mode */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      Topic Focus / Custom Scope
                    </label>
                    <label className="flex items-center gap-1 text-[10px] text-[#52607D] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCustomTopicMode}
                        onChange={(e) => setIsCustomTopicMode(e.target.checked)}
                        className="rounded accent-[#2F6F5E]"
                      />
                      <span>Custom Topic Only</span>
                    </label>
                  </div>
                  {isCustomTopicMode && (
                    <Input
                      placeholder="e.g. Thermodynamics, Linear Equations, World War II..."
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Paper Structure & Question Counts */}
            <Card>
              <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8]">
                <CardTitle className="text-xs font-bold uppercase text-[#52607D] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#2F6F5E]" />
                  2. Exam Specs & Question Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1 font-mono">
                      Exam Type / Heading
                    </label>
                    <Input
                      placeholder="e.g. Unit Test 1, Mid-Term..."
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1 font-mono">
                      Difficulty Level
                    </label>
                    <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                      {DIFFICULTIES.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Question Section Distribution */}
                <div className="space-y-2 pt-2 border-t border-[#E4E1D8]">
                  <p className="text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                    Sections & Question Counts:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="p-2 bg-[#FAFAF8] rounded border border-[#E4E1D8]">
                      <label className="block text-[10px] text-[#52607D] mb-1">
                        MCQ (1 Mark)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={mcqCount}
                        onChange={(e) => setMcqCount(e.target.value)}
                      />
                    </div>

                    <div className="p-2 bg-[#FAFAF8] rounded border border-[#E4E1D8]">
                      <label className="block text-[10px] text-[#52607D] mb-1">
                        Fill in Blanks (1M)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={fillBlanksCount}
                        onChange={(e) => setFillBlanksCount(e.target.value)}
                      />
                    </div>

                    <div className="p-2 bg-[#FAFAF8] rounded border border-[#E4E1D8]">
                      <label className="block text-[10px] text-[#52607D] mb-1">
                        True / False (1M)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={trueFalseCount}
                        onChange={(e) => setTrueFalseCount(e.target.value)}
                      />
                    </div>

                    <div className="p-2 bg-[#FAFAF8] rounded border border-[#E4E1D8]">
                      <label className="block text-[10px] text-[#52607D] mb-1">
                        Short Answer (3M)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={shortAnswerCount}
                        onChange={(e) => setShortAnswerCount(e.target.value)}
                      />
                    </div>

                    <div className="p-2 bg-[#FAFAF8] rounded border border-[#E4E1D8]">
                      <label className="block text-[10px] text-[#52607D] mb-1">
                        Long Answer (5M)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={longAnswerCount}
                        onChange={(e) => setLongAnswerCount(e.target.value)}
                      />
                    </div>

                    <div className="p-2 bg-[#EAF3F0] rounded border border-[#2F6F5E]/30 flex flex-col justify-center text-center">
                      <span className="text-[10px] text-[#2F6F5E] font-bold">Total Marks</span>
                      <span className="text-sm font-bold text-[#14213D]">{totalCalculatedMarks} M</span>
                      <span className="text-[9px] text-[#52607D]">{totalQuestions} Qs · {suggestedDuration} Mins</span>
                    </div>
                  </div>
                </div>

                {/* Teacher Instructions Directive */}
                <div>
                  <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider mb-1 font-mono">
                    Special Teacher Directive (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g. Include 2 diagram-based questions, prioritize numericals..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  variant="primary"
                  size="md"
                  icon={generating ? RefreshCw : Sparkles}
                  loading={generating}
                  disabled={generating}
                  onClick={handleGenerate}
                  className="w-full bg-[#2F6F5E] hover:bg-[#245749] text-white py-2.5 font-bold shadow-xs text-xs"
                >
                  {generating ? 'Retrieving RAG Context & Generating...' : 'Generate AI Question Paper'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Question Paper Preview & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {generatedPaper ? (
              <Card className="flex flex-col h-full border-[#E4E1D8]">
                {/* Paper Toolbar */}
                <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#14213D]">
                      {generatedPaper.title || 'Generated Question Paper'}
                    </span>
                    {savedDocId && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#2F6F5E] bg-[#EAF3F0] px-2 py-0.5 rounded font-semibold">
                        <Check className="w-3 h-3" /> Saved to Library
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAnswerKey(!showAnswerKey)}
                      className={showAnswerKey ? 'bg-[#EAF3F0] text-[#2F6F5E] border-[#2F6F5E]' : ''}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {showAnswerKey ? 'Hide Marking Scheme' : 'Show Marking Scheme'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownloadPDF(false)}
                      className="text-[#2F6F5E] border-[#2F6F5E]"
                    >
                      Student PDF
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Download}
                      onClick={() => handleDownloadPDF(true)}
                      className="text-[#2F6F5E] border-[#2F6F5E]"
                    >
                      Teacher PDF + Key
                    </Button>

                    <Button variant="outline" size="sm" icon={Printer} onClick={() => window.print()}>
                      Print
                    </Button>
                  </div>
                </CardHeader>

                {/* Printable Paper Document */}
                <CardContent className="p-6 space-y-5 max-h-[750px] overflow-y-auto bg-white">
                  {/* Paper Header */}
                  <div className="text-center border-b-2 border-[#14213D] pb-3 space-y-1">
                    <h3 className="text-base font-bold uppercase tracking-wide text-[#14213D]">
                      {generatedPaper.schoolName || user?.school?.school_name || 'School Management System'}
                    </h3>
                    <h4 className="text-xs font-bold uppercase text-[#2F6F5E]">
                      {generatedPaper.title || generatedPaper.exam_name || 'TERM ASSESSMENT'}
                    </h4>
                    <div className="flex flex-wrap items-center justify-between text-[11px] font-semibold text-[#52607D] pt-2 px-2">
                      <span>
                        {generatedPaper.board || board} · {generatedPaper.grade || `Class ${grade}`} · Subject:{' '}
                        {generatedPaper.subject || subject}
                      </span>
                      <span>
                        Time: {generatedPaper.duration_mins || suggestedDuration} Mins | Max Marks:{' '}
                        {generatedPaper.total_marks || totalCalculatedMarks}
                      </span>
                    </div>
                  </div>

                  {/* Instructions */}
                  {generatedPaper.instructions && generatedPaper.instructions.length > 0 && (
                    <div className="p-3 bg-[#FAFAF8] rounded-[6px] border border-[#E4E1D8]">
                      <p className="text-[10px] font-bold text-[#8C97AB] uppercase tracking-wider mb-1">
                        General Instructions:
                      </p>
                      <ol className="list-decimal pl-4 space-y-0.5 text-[11px] text-[#52607D]">
                        {generatedPaper.instructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Sections & Questions */}
                  {(generatedPaper.sections || []).map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <div className="bg-[#EAF3F0] px-3 py-1.5 rounded-[4px] border border-[#2F6F5E]/30 flex justify-between items-center">
                        <span className="font-bold text-[#2F6F5E] text-xs">
                          {sec.section_name || `Section ${String.fromCharCode(65 + sIdx)}`}
                        </span>
                        {sec.marks_per_question && (
                          <span className="text-[10px] text-[#2F6F5E] font-semibold">
                            [{sec.marks_per_question} Mark each]
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 pl-1">
                        {(sec.questions || []).map((q, qIdx) => (
                          <div key={qIdx} className="space-y-1.5">
                            <div className="flex items-start justify-between gap-3">
                              <p className="font-semibold text-[#14213D] text-xs">
                                <span className="font-bold text-[#2F6F5E] mr-1">
                                  Q{q.q_no || qIdx + 1}.
                                </span>
                                {q.question_text}
                              </p>
                              <span className="font-mono text-[10px] text-[#8C97AB] font-semibold shrink-0">
                                [{q.marks || sec.marks_per_question || 1}]
                              </span>
                            </div>

                            {/* MCQ Options */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4 pt-1">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="text-[11px] text-[#52607D] flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full bg-[#FAFAF8] border border-[#E4E1D8] flex items-center justify-center font-bold text-[9px] text-[#52607D]">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Answer Key & Marking Scheme */}
                  {showAnswerKey && generatedPaper.answer_key && generatedPaper.answer_key.length > 0 && (
                    <div className="pt-4 border-t-2 border-dashed border-[#E4E1D8] space-y-3">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-[#2F6F5E]" />
                        <h4 className="font-bold text-xs uppercase text-[#14213D]">
                          Answer Key & Marking Scheme
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-2 bg-[#FAFAF8] p-3 rounded-[6px] border border-[#E4E1D8]">
                        {generatedPaper.answer_key.map((ak, aIdx) => (
                          <div key={aIdx} className="text-[11px] space-y-0.5">
                            <span className="font-bold text-[#2F6F5E]">
                              Q{ak.q_no || aIdx + 1}: {ak.answer}
                            </span>
                            {ak.explanation && (
                              <p className="text-[10px] text-[#8C97AB] pl-2">
                                {ak.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 h-full flex items-center justify-center">
                <EmptyState
                  icon={Sparkles}
                  title="Configure and Generate Question Paper"
                  description="Select your syllabus board, grade, subject, and question distribution on the left. AI RAG will pull relevant textbook passages to craft a rigorous, balanced examination paper."
                />
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Tab 2: Saved Question Papers & Archives */
        <Card className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <Input
              icon={Search}
              placeholder="Search saved question papers by title, subject, grade..."
              value={savedSearchQuery}
              onChange={(e) => setSavedSearchQuery(e.target.value)}
              className="max-w-md"
            />
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadSavedPapers}>
              Refresh
            </Button>
          </div>

          {loadingSaved ? (
            <p className="text-xs text-center py-8 text-[#8C97AB]">Loading saved question papers...</p>
          ) : filteredSavedPapers.length === 0 ? (
            <EmptyState
              icon={Folder}
              title="No Question Papers Found"
              description="Generated question papers are automatically saved here for re-printing and distribution."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSavedPapers.map((paper) => {
                const content = paper.content || {};
                const qCount = content.sections
                  ? content.sections.reduce((acc, s) => acc + (s.questions?.length || 0), 0)
                  : 0;

                return (
                  <Card key={paper.id} className="flex flex-col justify-between hover:shadow-sm transition-shadow">
                    <CardHeader className="py-2.5 px-3.5 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-xs font-bold text-[#14213D] truncate">
                          {paper.title || 'Question Paper'}
                        </CardTitle>
                        <p className="text-[10px] text-[#8C97AB] truncate">
                          {paper.subject || 'Subject'} · {paper.grade || 'Grade'} ({paper.board || 'CBSE'})
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSavedDoc(paper.id)}
                        className="text-[#B0403A] hover:bg-[#B0403A]/10 shrink-0"
                        title="Delete Question Paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </CardHeader>

                    <CardContent className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5 text-[11px] text-[#52607D]">
                        <div className="flex justify-between">
                          <span>Questions:</span>
                          <span className="font-semibold text-[#14213D]">{qCount} Questions</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Marks:</span>
                          <span className="font-semibold text-[#14213D]">{content.total_marks || '—'} Marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saved On:</span>
                          <span className="text-[#8C97AB]">{formatDate(paper.created_at || paper.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-[#E4E1D8]">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            setGeneratedPaper(content);
                            setSavedDocId(paper.id);
                            setActiveTab('create');
                          }}
                          className="flex-1 text-[#2F6F5E] border-[#2F6F5E]"
                        >
                          Open & View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Download}
                          onClick={() => {
                            const schoolName = user?.school?.school_name || user?.school_name || 'School Management System';
                            generateQuestionPaperPDF({
                              schoolName,
                              paperData: content,
                              includeAnswers: false,
                            });
                          }}
                          title="Download Student PDF"
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
