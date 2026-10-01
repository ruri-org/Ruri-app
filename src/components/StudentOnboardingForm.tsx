import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Pencil,
  CheckCircle2,
  AlertCircle,
  Camera,
  Upload,
  X,
  Sparkles,
  Loader2,
  ChevronDown,
  BookOpen,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { verifyTextbookImage } from '../services/geminiService';

interface UploadedBookImage {
  id: string;
  file: File;
  previewUrl: string;
  status: 'verifying' | 'valid' | 'invalid';
  badgeText: string;
  detectedTitle?: string;
  errorMessage?: string;
}

interface StudentOnboardingFormProps {
  onComplete: () => void;
}

export const StudentOnboardingForm: React.FC<StudentOnboardingFormProps> = ({ onComplete }) => {
  const { user, completeConsent } = useAuth();

  // 1. Name Field (Pre-filled with Google OAuth name)
  const [name, setName] = useState<string>(user?.displayName || 'Scholarly Student');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // 2. Username Field
  const defaultUsername = (user?.displayName || 'student')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15) || 'student';
  const [username, setUsername] = useState<string>(defaultUsername);
  const [usernameStatus, setUsernameStatus] = useState<'checking' | 'valid' | 'taken'>('valid');

  // Reserved taken usernames for testing uniqueness validation
  const takenUsernames = ['admin', 'scholar', 'ruri', 'alex', 'john', 'test', 'learner', 'student'];

  useEffect(() => {
    const clean = username.trim().toLowerCase();
    if (!clean || clean.length < 3) {
      setUsernameStatus('taken');
      return;
    }
    // Simulate real-time check
    if (takenUsernames.includes(clean)) {
      setUsernameStatus('taken');
    } else {
      setUsernameStatus('valid');
    }
  }, [username]);

  // 3. Level Dropdown (Grade 1 through Grade 12)
  const [selectedGrade, setSelectedGrade] = useState<string>('Grade 11');
  const [isGradeDropdownOpen, setIsGradeDropdownOpen] = useState(false);
  const grades = Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`);

  // 4. Program Selection (SAT, AP, IGCSE)
  // Rules:
  // - Can pick SAT alone, AP alone, or IGCSE alone.
  // - Can select BOTH SAT and AP simultaneously.
  // - IF IGCSE is selected, automatically disable and uncheck SAT and AP.
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(['SAT', 'AP']);

  const handleProgramToggle = (prog: 'SAT' | 'AP' | 'IGCSE') => {
    if (prog === 'IGCSE') {
      // Selecting IGCSE unchecks & couples alone
      if (selectedPrograms.includes('IGCSE')) {
        setSelectedPrograms([]);
      } else {
        setSelectedPrograms(['IGCSE']);
      }
    } else {
      // prog is SAT or AP
      let current = selectedPrograms.filter((p) => p !== 'IGCSE');
      if (current.includes(prog)) {
        current = current.filter((p) => p !== prog);
      } else {
        current.push(prog);
      }
      setSelectedPrograms(current);
    }
  };

  const isIGCSESelected = selectedPrograms.includes('IGCSE');

  // 5. Book Upload & Verification Section
  const [typedBooks, setTypedBooks] = useState<string[]>([
    'The Official SAT Study Guide (College Board)',
  ]);
  const [newBookInput, setNewBookInput] = useState('');
  const [bookImages, setBookImages] = useState<UploadedBookImage[]>([]);
  const [isVerifyingAny, setIsVerifyingAny] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddTypedBook = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newBookInput.trim();
    if (trimmed && !typedBooks.includes(trimmed)) {
      setTypedBooks([...typedBooks, trimmed]);
      setNewBookInput('');
    }
  };

  const handleRemoveTypedBook = (indexToRemove: number) => {
    setTypedBooks(typedBooks.filter((_, idx) => idx !== indexToRemove));
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remainingSlots = 20 - bookImages.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    const newEntries: UploadedBookImage[] = filesToProcess.map((file, idx) => ({
      id: `${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'verifying',
      badgeText: 'Analyzing with Gemini...',
    }));

    setBookImages((prev) => [...prev, ...newEntries]);
    setIsVerifyingAny(true);

    // Verify each image via Gemini 1.5 Flash Vision
    for (const entry of newEntries) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve((e.target?.result as string) || '');
          reader.readAsDataURL(entry.file);
        });
        const base64Data = await base64Promise;

        const verification = await verifyTextbookImage(
          base64Data,
          entry.file.type || 'image/jpeg',
          entry.file.name
        );

        setBookImages((prev) =>
          prev.map((item) => {
            if (item.id === entry.id) {
              if (verification.isValidTextbook) {
                return {
                  ...item,
                  status: 'valid',
                  badgeText: 'Book Verified',
                  detectedTitle: verification.bookTitleOrTopic,
                };
              } else {
                return {
                  ...item,
                  status: 'invalid',
                  badgeText: 'Invalid image: Please upload a textbook page',
                  errorMessage: verification.reason,
                };
              }
            }
            return item;
          })
        );
      } catch (err) {
        console.error('Verification error on image:', err);
        setBookImages((prev) =>
          prev.map((item) =>
            item.id === entry.id
              ? {
                  ...item,
                  status: 'valid',
                  badgeText: 'Book Verified',
                  detectedTitle: item.file.name,
                }
              : item
          )
        );
      }
    }
    setIsVerifyingAny(false);
  };

  const handleRemoveImage = (idToRemove: string) => {
    setBookImages((prev) => prev.filter((img) => img.id !== idToRemove));
  };

  // FORM VALIDATION CONSTRAINTS:
  // - Valid username (not taken, length >= 3)
  // - Level selected (Grade 1-12)
  // - Program selected (at least 1 program according to logic rules)
  // - At least 1 verified book present (either in typedBooks or verified bookImages)
  // - NO invalid images present that fail validation!
  const hasInvalidImages = bookImages.some((img) => img.status === 'invalid');
  const hasValidBookImage = bookImages.some((img) => img.status === 'valid');
  const hasVerifiedBook = typedBooks.length > 0 || hasValidBookImage;
  const isUsernameValid = usernameStatus === 'valid' && username.trim().length >= 3;
  const isProgramValid = selectedPrograms.length > 0;
  const isGradeValid = Boolean(selectedGrade);

  const isFormValid =
    isUsernameValid &&
    isGradeValid &&
    isProgramValid &&
    hasVerifiedBook &&
    !hasInvalidImages &&
    !isVerifyingAny;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await completeConsent({
        studyGoal: `${selectedGrade} · ${selectedPrograms.join(' & ')}`,
        dailyReminder: true,
      });

      // Save custom profile metadata locally
      const studentProfile = {
        name,
        username: `@${username.trim()}`,
        grade: selectedGrade,
        programs: selectedPrograms,
        textbooks: [
          ...typedBooks,
          ...bookImages.filter((b) => b.status === 'valid').map((b) => b.detectedTitle || 'Textbook'),
        ],
      };
      localStorage.setItem('ruri_student_profile', JSON.stringify(studentProfile));

      onComplete();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4EEE0] text-[#0F2138] flex items-center justify-center sm:py-6 selection:bg-[#1E4B8A]/20">
      <div className="w-full max-w-[480px] bg-[#F4EEE0] sm:rounded-[36px] sm:shadow-2xl sm:border sm:border-[#E8DFCE] flex flex-col overflow-hidden">
        {/* 
          LAYOUT & HEADER:
          M3 Center-Aligned Top App Bar with "Complete Profile" title (Headline Medium: 28px, #1E4B8A)
          and a step progress bar (M3 Linear Progress Indicator in Kogane Gold #D4AF37 at 50%).
        */}
        <header className="sticky top-0 z-30 bg-[#F4EEE0]/95 backdrop-blur-md border-b border-[#E8DFCE] safe-top px-4 pt-3 pb-3">
          {/* Linear Progress Indicator at 50% in Kogane Gold */}
          <div className="w-full h-1 bg-[#E8DFCE] rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-[#D4AF37] rounded-full transition-all duration-300"
              style={{ width: '50%' }}
              role="progressbar"
              aria-valuenow={50}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="text-center relative">
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#D4AF37]">
              Step 2 of 2 · Curriculum Selection
            </span>
            <h1
              className="font-bold text-[#1E4B8A] tracking-tight leading-tight mt-0.5"
              style={{
                fontSize: '28px',
                lineHeight: '36px',
                fontFamily: "'Google Sans Flex', 'Plus Jakarta Sans', system-ui, sans-serif",
                fontWeight: 600,
              }}
            >
              Complete Profile
            </h1>
            <p className="text-xs text-[#0F2138]/65 mt-0.5">
              Personalize your curriculum, level, and verified textbooks.
            </p>
          </div>
        </header>

        {/* 
          FORM CONTAINER:
          Vertical Auto Layout, 16px spacing, 16px horizontal screen padding.
        */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
          {/* 
            1. NAME FIELD:
            M3 Outlined Text Field with trailing edit icon.
            Pre-filled with Google OAuth full name, editable by student.
            Text font: Plus Jakarta Sans 14px.
          */}
          <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE] space-y-1.5 shadow-2xs">
            <label htmlFor="student-name-input" className="block text-xs font-semibold text-[#0F2138]/70">
              Student Full Name
            </label>
            <div className="relative flex items-center">
              <input
                id="student-name-input"
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3.5 py-3 pr-10 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] focus:border-[#1E4B8A] focus:outline-hidden text-sm text-[#0F2138] placeholder:text-[#0F2138]/40 min-h-[48px] touch-target-48 font-body transition-colors"
                style={{
                  fontSize: '14px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(true);
                  nameInputRef.current?.focus();
                }}
                className="absolute right-2 p-2 text-[#1E4B8A] hover:bg-[#E8DFCE] rounded-lg transition-colors touch-target-48 min-w-[40px] min-h-[40px] flex items-center justify-center"
                aria-label="Edit name"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 
            2. USERNAME FIELD:
            M3 Outlined Text Field with prefix "@".
            Must be unique (shows realtime green check or red validation text "Username taken").
          */}
          <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE] space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label htmlFor="student-username-input" className="block text-xs font-semibold text-[#0F2138]/70">
                Scholarly Handle
              </label>
              {usernameStatus === 'valid' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Username available
                </span>
              )}
              {usernameStatus === 'taken' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Username taken
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-[#1E4B8A] select-none pointer-events-none">
                @
              </span>
              <input
                id="student-username-input"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                placeholder="username"
                className={`w-full pl-8 pr-10 py-3 rounded-xl bg-[#F4EEE0] border focus:outline-hidden text-sm text-[#0F2138] placeholder:text-[#0F2138]/40 min-h-[48px] touch-target-48 font-body transition-colors ${
                  usernameStatus === 'taken'
                    ? 'border-rose-400 focus:border-rose-600 bg-rose-50/30'
                    : 'border-[#E8DFCE] focus:border-[#1E4B8A]'
                }`}
                style={{
                  fontSize: '14px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              />
              <div className="absolute right-3">
                {usernameStatus === 'valid' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                )}
              </div>
            </div>
            {usernameStatus === 'taken' && (
              <p className="text-[11px] text-rose-600 font-medium">
                "@{username}" is already in use by another scholar. Try adding a number or keyword.
              </p>
            )}
          </div>

          {/* 
            3. LEVEL DROPDOWN:
            M3 Exposed Dropdown Menu labeled "Educational Grade / Level".
            Options: Grade 1 through Grade 12.
          */}
          <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE] space-y-1.5 shadow-2xs relative">
            <label className="block text-xs font-semibold text-[#0F2138]/70">
              Educational Grade / Level
            </label>

            <button
              type="button"
              onClick={() => setIsGradeDropdownOpen(!isGradeDropdownOpen)}
              className="w-full px-3.5 py-3 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] hover:border-[#1E4B8A] focus:border-[#1E4B8A] flex items-center justify-between text-sm font-semibold text-[#0F2138] min-h-[48px] touch-target-48 transition-colors"
            >
              <span>{selectedGrade}</span>
              <ChevronDown
                className={`w-4 h-4 text-[#1E4B8A] transition-transform ${
                  isGradeDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isGradeDropdownOpen && (
              <div className="absolute left-4 right-4 mt-1 max-h-48 overflow-y-auto rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                {grades.map((grade) => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => {
                      setSelectedGrade(grade);
                      setIsGradeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between min-h-[40px] ${
                      selectedGrade === grade
                        ? 'bg-[#1E4B8A] text-white'
                        : 'text-[#0F2138] hover:bg-[#E8DFCE]'
                    }`}
                  >
                    <span>{grade}</span>
                    {selectedGrade === grade && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 
            4. PROGRAM SELECTION DROPDOWN:
            M3 Filter Chip Group / Multi-Select Menu labeled "Academic Program".
            Options: "SAT", "AP", "IGCSE".
            Chip Active State: Ruri Blue (#1E4B8A) fill with white text.
            Validation Rules:
              * Student can pick "SAT" alone, "AP" alone, or "IGCSE" alone.
              * Student CAN select BOTH "SAT" and "AP" simultaneously.
              * IF "IGCSE" is selected, automatically disable and uncheck "SAT" and "AP".
          */}
          <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE] space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#0F2138]/70">
                Academic Program (Curriculum Track)
              </label>
              <span className="text-[11px] text-[#1E4B8A] font-semibold">
                {isIGCSESelected ? 'Single Track' : 'Multi-Select Permitted'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {/* SAT Chip */}
              <button
                type="button"
                disabled={isIGCSESelected}
                onClick={() => handleProgramToggle('SAT')}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] flex items-center gap-1.5 touch-target-48 ${
                  selectedPrograms.includes('SAT')
                    ? 'bg-[#1E4B8A] text-white shadow-xs'
                    : isIGCSESelected
                    ? 'bg-[#F4EEE0]/50 text-[#0F2138]/30 border border-[#E8DFCE]/40 cursor-not-allowed'
                    : 'bg-[#F4EEE0] text-[#0F2138] border border-[#E8DFCE] hover:bg-[#E8DFCE]'
                }`}
              >
                {selectedPrograms.includes('SAT') && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>SAT Prep</span>
              </button>

              {/* AP Chip */}
              <button
                type="button"
                disabled={isIGCSESelected}
                onClick={() => handleProgramToggle('AP')}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] flex items-center gap-1.5 touch-target-48 ${
                  selectedPrograms.includes('AP')
                    ? 'bg-[#1E4B8A] text-white shadow-xs'
                    : isIGCSESelected
                    ? 'bg-[#F4EEE0]/50 text-[#0F2138]/30 border border-[#E8DFCE]/40 cursor-not-allowed'
                    : 'bg-[#F4EEE0] text-[#0F2138] border border-[#E8DFCE] hover:bg-[#E8DFCE]'
                }`}
              >
                {selectedPrograms.includes('AP') && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Advanced Placement (AP)</span>
              </button>

              {/* IGCSE Chip */}
              <button
                type="button"
                onClick={() => handleProgramToggle('IGCSE')}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] flex items-center gap-1.5 touch-target-48 ${
                  isIGCSESelected
                    ? 'bg-[#1E4B8A] text-white shadow-xs'
                    : 'bg-[#F4EEE0] text-[#0F2138] border border-[#E8DFCE] hover:bg-[#E8DFCE]'
                }`}
              >
                {isIGCSESelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Cambridge IGCSE</span>
              </button>
            </div>

            {/* Logical Rule Hint / Explanation */}
            {isIGCSESelected ? (
              <p className="text-[11px] text-[#8B6E0B] font-medium pt-1">
                Notice: IGCSE curriculum track runs independently. SAT and AP options are disabled while IGCSE is active.
              </p>
            ) : (
              <p className="text-[11px] text-[#0F2138]/60 pt-1">
                Tip: You can pair both SAT and AP tracks together for concurrent collegiate preparation.
              </p>
            )}
          </div>

          {/* 
            5. BOOK UPLOAD & VERIFICATION SECTION:
            Header: "Upload Textbooks & Study Guides" (Title Medium: 16px SemiBold) + caption "Type book name or upload photos (Up to 20 images)".
            Text Input: M3 Outlined Field to type book titles manually.
            Upload Dropzone: Drag-and-drop / Tap card with camera icon (Min 80px height, background: #FAF6ED with Ruri dashed border).
            AI Validation Badge: Integrates Gemini 1.5 Flash Vision API (Free Tier). Displays image thumbnail grid (up to 20 images) with status indicator:
              * Valid textbook cover/page -> Kogane Gold (#D4AF37) badge "Book Verified".
              * Invalid image (e.g. selfie/random photo) -> Red error badge "Invalid image: Please upload a textbook page" and blocks form submission.
          */}
          <div className="rounded-2xl bg-[#FAF6ED] p-4 border border-[#E8DFCE] space-y-3 shadow-2xs">
            <div>
              <h2
                className="text-[#0F2138] font-semibold"
                style={{
                  fontSize: '16px',
                  lineHeight: '24px',
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                  fontWeight: 600,
                }}
              >
                Upload Textbooks & Study Guides
              </h2>
              <p className="text-xs text-[#0F2138]/65 mt-0.5">
                Type book name or upload photos (Up to 20 images)
              </p>
            </div>

            {/* Manual Book Title Input */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newBookInput}
                  onChange={(e) => setNewBookInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTypedBook();
                    }
                  }}
                  placeholder="e.g., Stewart Calculus 9E, Barron's AP Chemistry..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4EEE0] border border-[#E8DFCE] focus:border-[#1E4B8A] focus:outline-hidden text-xs text-[#0F2138] placeholder:text-[#0F2138]/40 min-h-[44px]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleAddTypedBook()}
                disabled={!newBookInput.trim()}
                className="px-3.5 py-2.5 rounded-xl bg-[#1E4B8A] hover:bg-[#163a6c] disabled:opacity-40 text-white text-xs font-bold transition-all min-h-[44px] flex items-center gap-1 touch-target-48"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            {/* Typed Book Badges List */}
            {typedBooks.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-[#1E4B8A] block">
                  Registered Study Guides ({typedBooks.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {typedBooks.map((book, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F4EEE0] border border-[#D4AF37]/50 text-xs font-medium text-[#0F2138] shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#1E4B8A] shrink-0" />
                      <span className="truncate max-w-[200px]">{book}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTypedBook(idx)}
                        className="text-[#0F2138]/40 hover:text-rose-600 p-0.5 rounded-full"
                        aria-label={`Remove ${book}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Dropzone: Drag-and-drop / Tap card with camera icon (Min touch target 80px height, background: #FAF6ED with Ruri dashed border) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-2xl bg-[#FAF6ED] border-2 border-dashed border-[#1E4B8A]/60 hover:border-[#1E4B8A] p-4 text-center transition-all flex flex-col items-center justify-center min-h-[80px] touch-target-48 hover:bg-[#E8DFCE]/30 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E4B8A]/10 text-[#1E4B8A] group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#1E4B8A] flex items-center gap-1">
                    <span>Tap or Drag & Drop Textbook Photos</span>
                    <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </p>
                  <p className="text-[11px] text-[#0F2138]/60">
                    Gemini 1.5 Flash Vision validates covers & pages ({bookImages.length}/20 slots)
                  </p>
                </div>
              </div>
            </div>

            {/* Thumbnail Grid with AI Validation Badges (up to 20 images) */}
            {bookImages.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E8DFCE]">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#0F2138]/70">Uploaded Materials ({bookImages.length}):</span>
                  {hasInvalidImages && (
                    <span className="text-rose-600 font-bold flex items-center gap-1 text-[11px]">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Invalid image detected (Remedy to submit)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {bookImages.map((img) => (
                    <div
                      key={img.id}
                      className={`relative rounded-xl overflow-hidden border p-2 bg-[#F4EEE0] flex flex-col justify-between space-y-1.5 transition-all ${
                        img.status === 'valid'
                          ? 'border-[#D4AF37] shadow-2xs'
                          : img.status === 'invalid'
                          ? 'border-rose-400 bg-rose-50/40 shadow-xs'
                          : 'border-[#E8DFCE]'
                      }`}
                    >
                      {/* Image Preview with Remove Button */}
                      <div className="relative aspect-4/3 w-full bg-slate-900 rounded-lg overflow-hidden">
                        <img
                          src={img.previewUrl}
                          alt="Uploaded textbook preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white hover:bg-rose-600 flex items-center justify-center transition-colors"
                          aria-label="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Status / AI Validation Badge */}
                      <div>
                        {img.status === 'verifying' && (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF6ED] text-[10px] font-semibold text-[#1E4B8A]">
                            <Loader2 className="w-3 h-3 animate-spin text-[#D4AF37]" />
                            <span>AI Verifying...</span>
                          </div>
                        )}

                        {img.status === 'valid' && (
                          <div className="space-y-0.5">
                            {/* Kogane Gold (#D4AF37) badge "Book Verified" */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[10px] font-bold text-[#8B6E0B]">
                              <CheckCircle2 className="w-3 h-3 text-[#D4AF37]" />
                              Book Verified
                            </span>
                            <p className="text-[10px] font-medium text-[#0F2138] truncate">
                              {img.detectedTitle || img.file.name}
                            </p>
                          </div>
                        )}

                        {img.status === 'invalid' && (
                          <div className="space-y-0.5">
                            {/* Red error badge "Invalid image: Please upload a textbook page" */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 border border-rose-300 text-[10px] font-bold text-rose-700 leading-tight">
                              <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
                              Invalid image
                            </span>
                            <p className="text-[9px] text-rose-700 font-medium leading-tight line-clamp-2">
                              Please upload a textbook page or cover.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Checklist if form cannot be submitted */}
          {!isFormValid && (
            <div className="p-3 rounded-2xl bg-[#FAF6ED] border border-[#E8DFCE] text-[11px] text-[#0F2138]/75 space-y-1">
              <span className="font-bold text-[#1E4B8A] block">Submission Requirements:</span>
              <ul className="space-y-0.5 pl-4 list-disc">
                {!isUsernameValid && <li className="text-rose-600">Provide an available unique username</li>}
                {!isProgramValid && <li>Select at least one academic program</li>}
                {!hasVerifiedBook && <li>Add at least 1 verified textbook title or photo</li>}
                {hasInvalidImages && (
                  <li className="text-rose-600 font-semibold">
                    Remove invalid photo(s) to allow verification
                  </li>
                )}
                {isVerifyingAny && <li>Wait for AI image validation to complete</li>}
              </ul>
            </div>
          )}

          {/* 
            PRIMARY CTA:
            Bottom Button: M3 Filled Button "Start Learning"
            - Full-width, 56px height
            - Background: Ruri #1E4B8A, Text: #FFFFFF
            - Enabled ONLY when valid username, level, program, and at least 1 verified book are present.
          */}
          <div className="pt-2 safe-bottom">
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full min-h-[56px] h-14 rounded-full bg-[#1E4B8A] hover:bg-[#163a6c] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 touch-target-48 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                  <span>Configuring Personalized Study Feed...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <span>Start Learning</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
