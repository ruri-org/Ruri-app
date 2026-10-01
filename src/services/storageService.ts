import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

export interface UserStats {
  xp: number;
  streakDays: number;
  lastStudyDate: string; // YYYY-MM-DD
  completedLessons: string[];
  quizzesTaken: number;
  totalCorrectAnswers: number;
  savedLessonIds: string[];
  masteredFlashcards: string[];
  rankTitle: string; // e.g., '門下生' (Novice), '書生' (Scholar), '師匠' (Master)
}

const DEFAULT_STATS: UserStats = {
  xp: 120,
  streakDays: 3,
  lastStudyDate: new Date().toISOString().split('T')[0],
  completedLessons: ['lesson_wabi_sabi'],
  quizzesTaken: 4,
  totalCorrectAnswers: 11,
  savedLessonIds: ['lesson_wabi_sabi', 'lesson_quantum_superposition'],
  masteredFlashcards: ['Kanawa Tsugi (金輪継ぎ)'],
  rankTitle: '書生 (Scholar)',
};

const LOCAL_STORAGE_KEY = 'ruri_user_stats';

export function getLocalStats(): UserStats {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Error reading local stats:', e);
  }
  return DEFAULT_STATS;
}

export function saveLocalStats(stats: UserStats) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Error saving local stats:', e);
  }
}

export async function fetchUserStats(userId: string): Promise<UserStats> {
  const local = getLocalStats();
  if (!userId || userId.startsWith('guest_')) {
    return local;
  }

  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as UserStats;
      const merged = { ...local, ...data };
      saveLocalStats(merged);
      return merged;
    } else {
      // Initialize Firestore document
      await setDoc(docRef, local, { merge: true });
    }
  } catch (err) {
    console.warn('Firestore fetch notice (using local stats cache):', err);
  }

  return local;
}

export async function recordLessonComplete(
  userId: string,
  lessonId: string,
  xpEarned: number = 50
): Promise<UserStats> {
  const current = getLocalStats();
  const today = new Date().toISOString().split('T')[0];
  let newStreak = current.streakDays;

  if (current.lastStudyDate !== today) {
    newStreak += 1;
  }

  const updatedLessons = Array.from(new Set([...current.completedLessons, lessonId]));
  const updatedXp = current.xp + xpEarned;

  // Rank progression calculation
  let rank = '門下生 (Disciple)';
  if (updatedXp > 800) rank = '師範 (Grand Master)';
  else if (updatedXp > 450) rank = '教授 (Professor)';
  else if (updatedXp > 200) rank = '書生 (Scholar)';

  const updated: UserStats = {
    ...current,
    xp: updatedXp,
    streakDays: newStreak,
    lastStudyDate: today,
    completedLessons: updatedLessons,
    rankTitle: rank,
  };

  saveLocalStats(updated);

  if (userId && !userId.startsWith('guest_')) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.warn('Firestore sync notice:', e);
    }
  }

  return updated;
}

export async function recordQuizResult(
  userId: string,
  correctCount: number,
  totalCount: number
): Promise<UserStats> {
  const current = getLocalStats();
  const xpEarned = correctCount * 25;
  const updatedXp = current.xp + xpEarned;

  let rank = current.rankTitle;
  if (updatedXp > 800) rank = '師範 (Grand Master)';
  else if (updatedXp > 450) rank = '教授 (Professor)';
  else if (updatedXp > 200) rank = '書生 (Scholar)';

  const updated: UserStats = {
    ...current,
    xp: updatedXp,
    quizzesTaken: current.quizzesTaken + 1,
    totalCorrectAnswers: current.totalCorrectAnswers + correctCount,
    rankTitle: rank,
  };

  saveLocalStats(updated);

  if (userId && !userId.startsWith('guest_')) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, updated, { merge: true });
    } catch (e) {
      console.warn('Firestore sync notice:', e);
    }
  }

  return updated;
}
