import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { teacherAiAPI, schoolAPI } from '../../api';
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

  // Form State - auto-fills board from School data
  const [board, setBoard] = useState(user?.school?.board || user?.board || 'CBSE');
  const [grade, setGrade] = useState('10');
  const [topic, setTopic] = useState('');

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

  // Paper Structure & Question Counts
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

  // Generate Question Paper
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic or syllabus keyword (e.g. Algebra, Thermodynamics, Photosynthesis)');
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
    const paperTitle = `${topic.trim()} Question Paper`;

    setGenerating(true);
    setGeneratedPaper(null);
    setSavedDocId(null);

    try {
      const payload = {
        feature: 'question_paper',
        board,
        grade: `Class ${grade}`,
        topic: topic.trim(),
        title: paperTitle,
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
          topic: topic.trim(),
        },
      };

      setGeneratedPaper(fullPaper);
      toast.success('Question paper generated successfully using Vector RAG search!');

      // Automatically auto-save draft document
      try {
        const saveRes = await teacherAiAPI.saveDocument({
          type: 'question_paper',
          title: paperTitle,
          board,
          grade: `Class ${grade}`,
          subject: topic.trim(),
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
              AI Question Paper Generator (Vector RAG)
            </h2>
            <p className="text-[11px] text-[#8C97AB]">
              Generate curriculum-aligned exam papers directly from your textbook vector database
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
                  1. Target Grade & Topic
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

                {/* Topic / Search Keywords */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                    Topic / Syllabus Keywords *
                  </label>
                  <Input
                    placeholder="e.g. Algebra, Thermodynamics, French Revolution, Light & Optics..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>

                {/* Difficulty Level */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
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
              </CardContent>
            </Card>

            {/* Paper Structure & Question Counts */}
            <Card>
              <CardHeader className="py-2.5 px-4 bg-[#FAFAF8] border-b border-[#E4E1D8] flex items-center justify-between">
                <CardTitle className="text-xs font-bold uppercase text-[#52607D] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#2F6F5E]" />
                  2. Question Breakdown
                </CardTitle>
                <span className="text-[10px] font-mono font-bold text-[#2F6F5E] bg-[#EAF3F0] px-2 py-0.5 rounded">
                  {totalQuestions} Questions · {totalCalculatedMarks} Marks
                </span>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      MCQs (1 Mark)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="30"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      Fill in Blanks (1 Mark)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={fillBlanksCount}
                      onChange={(e) => setFillBlanksCount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      True / False (1 Mark)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={trueFalseCount}
                      onChange={(e) => setTrueFalseCount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      Short Answers (3 Marks)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={shortAnswerCount}
                      onChange={(e) => setShortAnswerCount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                      Long / Analytical Answers (5 Marks)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="15"
                      value={longAnswerCount}
                      onChange={(e) => setLongAnswerCount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Additional Instructions */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[10px] font-semibold text-[#8C97AB] uppercase tracking-wider font-mono">
                    Custom Instructions / Directives (Optional)
                  </label>
                  <Textarea
                    placeholder="e.g. Include 1 real-world application question; provide internal choices in Section E..."
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                {/* Generate Action Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || totalQuestions === 0}
                  className="w-full mt-2 font-bold py-2.5 cursor-pointer shadow-sm"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Searching Vector DB & Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Question Paper
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Generated Paper Preview (7 Cols) */}
          <div className="lg:col-span-7">
            {generatedPaper ? (
              <Card className="border-[#2F6F5E]/30 shadow-md">
                <CardHeader className="py-3 px-4 bg-[#EAF3F0]/60 border-b border-[#D3E6E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-sm font-bold text-[#14213D] flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-[#2F6F5E]" />
                      {generatedPaper.title || 'Generated Question Paper'}
                    </CardTitle>
                    <p className="text-[10px] text-[#52607D]">
                      {generatedPaper.board || board} · {generatedPaper.grade || `Class ${grade}`} · {suggestedDuration} Mins · {totalCalculatedMarks} Marks
                    </p>
                  </div>

                  {/* Export / Print Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(false)}
                      className="cursor-pointer bg-white text-[11px]"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Student PDF
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleDownloadPDF(true)}
                      className="cursor-pointer text-[11px]"
                    >
                      <Award className="w-3.5 h-3.5 mr-1" />
                      With Answer Key
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* Paper Header / Watermark styling */}
                  <div className="border-b-2 border-[#14213D] pb-4 text-center space-y-1">
                    <h1 className="font-display font-extrabold text-base uppercase text-[#14213D]">
                      {user?.school?.school_name || user?.school_name || 'School Management System'}
                    </h1>
                    <h2 className="font-bold text-xs text-[#52607D]">
                      {generatedPaper.grade || `Class ${grade}`} ({board})
                    </h2>
                    <div className="flex items-center justify-between pt-2 px-2 text-[11px] font-semibold text-[#14213D]">
                      <span>Topic: {topic || 'Comprehensive'}</span>
                      <span>Time: {suggestedDuration} Mins</span>
                      <span>Max Marks: {totalCalculatedMarks}</span>
                    </div>
                  </div>

                  {/* Instructions */}
                  {generatedPaper.instructions && (
                    <div className="bg-[#FAFAF8] p-3 rounded-lg border border-[#E4E1D8] space-y-1">
                      <p className="font-bold text-[10px] uppercase text-[#52607D]">General Instructions:</p>
                      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-[#52607D]">
                        {Array.isArray(generatedPaper.instructions)
                          ? generatedPaper.instructions.map((inst, i) => <li key={i}>{inst}</li>)
                          : <li>{generatedPaper.instructions}</li>}
                      </ul>
                    </div>
                  )}

                  {/* Sections and Questions */}
                  {(generatedPaper.sections || []).map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-3">
                      <div className="bg-[#14213D] text-white px-3 py-1.5 rounded-md flex items-center justify-between">
                        <span className="font-bold text-xs">{sec.section_name}</span>
                        {sec.marks_per_question && (
                          <span className="text-[10px] opacity-90">({sec.marks_per_question} Mark each)</span>
                        )}
                      </div>

                      <div className="space-y-3 pl-2">
                        {(sec.questions || []).map((q, qIdx) => (
                          <div key={qIdx} className="space-y-1 text-[11px]">
                            <div className="flex items-start gap-1 font-semibold text-[#14213D]">
                              <span>Q{q.q_no || qIdx + 1}.</span>
                              <span className="flex-1">{q.question_text}</span>
                              <span className="text-[10px] text-[#8C97AB] font-mono ml-2">[{q.marks || 1}M]</span>
                            </div>

                            {/* Options for MCQs */}
                            {q.options && q.options.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 pl-4 pt-1">
                                {q.options.map((opt, oIdx) => (
                                  <div key={oIdx} className="text-[#52607D]">
                                    <span className="font-bold mr-1">({String.fromCharCode(65 + oIdx)})</span>
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

                  {/* Answer Key */}
                  {generatedPaper.answer_key && generatedPaper.answer_key.length > 0 && (
                    <div className="border-t-2 border-dashed border-[#E4E1D8] pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-xs text-[#14213D] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#2F6F5E]" />
                          Answer Key & Marking Scheme
                        </h3>
                        <button
                          type="button"
                          onClick={() => setShowAnswerKey(!showAnswerKey)}
                          className="text-[10px] text-[#2F6F5E] hover:underline cursor-pointer font-semibold"
                        >
                          {showAnswerKey ? 'Hide in Preview' : 'Show in Preview'}
                        </button>
                      </div>

                      {showAnswerKey && (
                        <div className="bg-[#EAF3F0]/30 p-3.5 rounded-lg border border-[#D3E6E0] space-y-2">
                          {generatedPaper.answer_key.map((ak, aIdx) => (
                            <div key={aIdx} className="text-[11px] text-[#14213D] flex items-start gap-2">
                              <span className="font-bold font-mono text-[#2F6F5E]">Q{ak.q_no}:</span>
                              <div>
                                <span className="font-bold">{ak.answer}</span>
                                {ak.explanation && (
                                  <p className="text-[10px] text-[#52607D] italic mt-0.5">{ak.explanation}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center p-8 bg-[#FAFAF8]/50 border-dashed">
                <EmptyState
                  icon={Sparkles}
                  title="No Question Paper Generated Yet"
                  description="Choose a target Class, enter a Topic or syllabus keyword (e.g. Algebra), configure your question counts, and click 'Generate Question Paper'."
                />
              </Card>
            )}
          </div>
        </div>
      ) : (
        /* Saved Papers Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C97AB]" />
              <Input
                placeholder="Search saved papers by title, topic, grade..."
                value={savedSearchQuery}
                onChange={(e) => setSavedSearchQuery(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
            <span className="text-[11px] text-[#8C97AB]">
              {filteredSavedPapers.length} saved papers found
            </span>
          </div>

          {loadingSaved ? (
            <div className="p-8 text-center text-[#8C97AB]">Loading saved question papers...</div>
          ) : filteredSavedPapers.length === 0 ? (
            <EmptyState
              icon={Folder}
              title="No Saved Question Papers"
              description="Generated question papers are automatically saved here for future reference and re-printing."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSavedPapers.map((paper) => (
                <Card key={paper.id} className="hover:border-[#2F6F5E]/50 transition-all shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-xs text-[#14213D] line-clamp-1">{paper.title}</h3>
                        <p className="text-[10px] text-[#8C97AB] flex items-center gap-1.5 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(paper.created_at || paper.createdAt)}
                        </p>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-[#2F6F5E] bg-[#EAF3F0] px-1.5 py-0.5 rounded">
                        {paper.grade}
                      </span>
                    </div>

                    <div className="text-[10px] text-[#52607D] bg-[#FAFAF8] p-2 rounded border border-[#E4E1D8] flex items-center justify-between">
                      <span>Topic: <strong>{paper.subject || 'Comprehensive'}</strong></span>
                      <span>Board: <strong>{paper.board || 'CBSE'}</strong></span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#E4E1D8]">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingSavedPaper(paper)}
                        className="text-[10px] h-7 px-2.5 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 mr-1 text-[#2F6F5E]" />
                        View & Export
                      </Button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSavedDoc(paper.id)}
                        className="text-[#E63946] hover:text-[#C5221F] p-1 rounded hover:bg-[#FDF2F2] cursor-pointer"
                        title="Delete saved paper"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Viewing Saved Paper Modal */}
      {viewingSavedPaper && (
        <Modal
          isOpen={Boolean(viewingSavedPaper)}
          onClose={() => setViewingSavedPaper(null)}
          title={viewingSavedPaper.title || 'Saved Question Paper'}
          size="lg"
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="font-bold text-xs text-[#14213D]">{viewingSavedPaper.title}</p>
                <p className="text-[10px] text-[#8C97AB]">
                  {viewingSavedPaper.board} · {viewingSavedPaper.grade} · {viewingSavedPaper.subject}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    generateQuestionPaperPDF({
                      schoolName: user?.school?.school_name || 'School Management System',
                      paperData: viewingSavedPaper.content,
                      includeAnswers: false,
                    });
                  }}
                  className="text-[10px]"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Student PDF
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    generateQuestionPaperPDF({
                      schoolName: user?.school?.school_name || 'School Management System',
                      paperData: viewingSavedPaper.content,
                      includeAnswers: true,
                    });
                  }}
                  className="text-[10px]"
                >
                  <Award className="w-3 h-3 mr-1" />
                  Answer Key PDF
                </Button>
              </div>
            </div>

            {/* Render Saved Content Sections */}
            {(viewingSavedPaper.content?.sections || []).map((sec, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <div className="bg-[#14213D] text-white px-3 py-1 rounded text-[11px] font-bold">
                  {sec.section_name}
                </div>
                <div className="space-y-2 pl-2">
                  {(sec.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="text-[11px]">
                      <span className="font-bold mr-1">Q{q.q_no || qIdx + 1}.</span>
                      <span>{q.question_text}</span>
                      {q.options && (
                        <div className="grid grid-cols-2 gap-1 pl-4 pt-1 text-[10px] text-[#52607D]">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx}>
                              ({String.fromCharCode(65 + oIdx)}) {opt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default QuestionPaperGenerator;
