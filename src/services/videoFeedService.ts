import { QuizQuestion } from './geminiService';

export interface MicroLessonClip {
  id: string;
  sourceVideoId: string; // YouTube video ID or identifier
  sourceChannelId: string;
  clipPart: number;
  totalParts: number;
  startSeconds: number;
  endSeconds: number;
  durationSeconds: number; // 30 - 90 seconds
  title: string;
  channelName: string;
  channelAvatar: string;
  subjectTag: string; // e.g. "#AP Physics - Newton's Laws"
  bookContext: string; // e.g. "Sourced from: Halliday Resnick Physics - Chapter 4"
  likesCount: number;
  bookmarksCount: number;
  summaryBullets: string[];
  diagnosticQuestion: QuizQuestion;
}

interface StudentCurriculum {
  grade?: string;
  programs?: string[];
  textbooks?: string[];
}

// Curated pool of high-yield educational video sources parsed from common curricula (SAT, AP, IGCSE)
interface SourceLecture {
  sourceId: string;
  ytVideoId: string;
  subject: string;
  curriculum: 'SAT' | 'AP' | 'IGCSE';
  bookTitle: string;
  chapter: string;
  channelName: string;
  channelAvatar: string;
  segments: Array<{
    title: string;
    start: number;
    end: number;
    bullets: string[];
    question: QuizQuestion;
  }>;
}

const CURATED_SOURCE_LECTURES: SourceLecture[] = [
  {
    sourceId: 'src_physics_newton',
    ytVideoId: 'kKKM8Y-u7ds', // Veritasium / Physics
    subject: '#AP Physics - Newton’s Laws',
    curriculum: 'AP',
    bookTitle: "Halliday & Resnick Fundamentals of Physics",
    chapter: 'Chapter 5: Force and Motion',
    channelName: 'Domain of Physics',
    channelAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    segments: [
      {
        title: "Newton’s 1st Law & Non-Inertial Reference Frames",
        start: 0,
        end: 65,
        bullets: [
          "Inertia represents a body's inherent resistance to altering its velocity vector.",
          "Fictitious forces appear only when observing dynamics from an accelerating frame.",
          "Net force zero implies constant velocity, not necessarily absence of all forces.",
        ],
        question: {
          id: 'q_phys_1',
          question: "When a bus abruptly brakes, why do passengers lurch forward?",
          options: [
            "A mysterious forward force is exerted on their chests",
            "Their bodies retain existing velocity due to inertia while the bus decelerates",
            "Gravity temporarily shifts direction horizontally",
            "Friction between shoes and the floor disappears completely",
          ],
          correctIndex: 1,
          explanation:
            "According to Newton's First Law, mass in motion continues in uniform motion unless acted upon by an external net force (the seat/floor friction).",
        },
      },
      {
        title: "Newton’s 3rd Law: Action-Reaction Pairs Demystified",
        start: 120,
        end: 185,
        bullets: [
          "Action and reaction forces ALWAYS act on two distinct physical objects.",
          "They can never cancel each other out on a single free-body diagram.",
          "Magnitude is identical regardless of the relative masses of the interacting bodies.",
        ],
        question: {
          id: 'q_phys_2',
          question: "A massive truck collides with a tiny mosquito. Which experiences a larger impact force?",
          options: [
            "The truck experiences a larger force",
            "The mosquito experiences a larger force",
            "Both experience forces of precisely identical magnitude",
            "The force depends on which object had higher kinetic energy",
          ],
          correctIndex: 2,
          explanation:
            "Newton's 3rd Law states that F_truck_on_bug = -F_bug_on_truck. The forces are identical; the mosquito undergoes far greater acceleration because its mass is microscopic.",
        },
      },
      {
        title: "Free-Body Diagrams & Normal Force on an Incline",
        start: 240,
        end: 310,
        bullets: [
          "Decompose gravity into components: mg sin(θ) parallel and mg cos(θ) perpendicular.",
          "Normal force is perpendicular to the contact surface, equaling mg cos(θ) without acceleration.",
          "Static friction adjusts dynamically up to μ_s * N to prevent slipping.",
        ],
        question: {
          id: 'q_phys_3',
          question: "On an incline of angle θ, why is normal force N = mg cos(θ) instead of mg?",
          options: [
            "The surface absorbs part of the gravity",
            "Only the perpendicular component of gravity presses the block into the ramp",
            "Air resistance offsets the gravitational field",
            "Normal force always equals zero on any slope",
          ],
          correctIndex: 1,
          explanation:
            "Resolving vectors reveals that mg cos(θ) is the sole component acting normal to the inclined plane.",
        },
      },
    ],
  },
  {
    sourceId: 'src_sat_math_circle',
    ytVideoId: 'HEfHFsfGXjs', // 3Blue1Brown / Math
    subject: '#SAT Math - Circle Theorems & Radian Arc Length',
    curriculum: 'SAT',
    bookTitle: "The Official SAT Study Guide",
    chapter: 'Chapter 20: Additional Topics in Math',
    channelName: 'College Board Masterclass',
    channelAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    segments: [
      {
        title: "Standard Equation of a Circle: Completing the Square",
        start: 0,
        end: 55,
        bullets: [
          "Standard form: (x - h)² + (y - k)² = r² where center is (h, k) and radius is r.",
          "SAT frequently supplies general quadratic form x² + y² + Ax + By + C = 0.",
          "Always divide linear coefficients by 2 and square them to complete the square.",
        ],
        question: {
          id: 'q_sat_1',
          question: "For the circle x² + y² - 6x + 8y = 0, what are the coordinates of the center?",
          options: [
            "(-3, 4)",
            "(3, -4)",
            "(-6, 8)",
            "(6, -8)",
          ],
          correctIndex: 1,
          explanation:
            "Completing the square gives (x - 3)² + (y + 4)² = 9 + 16 = 25. Thus center (h, k) is (3, -4).",
        },
      },
      {
        title: "Radian Measure & Arc Length Formula (s = rθ)",
        start: 80,
        end: 145,
        bullets: [
          "A radian is the angle subtended when arc length precisely equals radius.",
          "Formula s = rθ requires angle θ to be expressed in radians, never degrees.",
          "Sector area formula is A = (1/2) r² θ.",
        ],
        question: {
          id: 'q_sat_2',
          question: "If a circle with radius 6 cm has a central angle of π/3 radians, what is the arc length?",
          options: [
            "2π cm",
            "6π cm",
            "18π cm",
            "π/2 cm",
          ],
          correctIndex: 0,
          explanation:
            "Using s = rθ: s = 6 * (π/3) = 2π cm.",
        },
      },
    ],
  },
  {
    sourceId: 'src_bio_respiration',
    ytVideoId: '8kK2zwjRV0M', // Biology / Cellular respiration
    subject: '#AP Biology - Chemiosmosis & ATP Synthase',
    curriculum: 'AP',
    bookTitle: "Campbell Biology 12th Edition",
    chapter: 'Chapter 9: Cellular Respiration and Fermentation',
    channelName: 'BioInteractive Academy',
    channelAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    segments: [
      {
        title: "The Proton-Motive Force Across the Mitochondrial Membrane",
        start: 0,
        end: 70,
        bullets: [
          "Electron transport chain complexes pump H+ from matrix into intermembrane space.",
          "This generates both a chemical pH gradient and an electrical voltage gradient.",
          "Oxygen acts as the terminal electron acceptor, forming H2O.",
        ],
        question: {
          id: 'q_bio_1',
          question: "What directly powers ATP synthesis during oxidative phosphorylation?",
          options: [
            "Direct breakdown of glucose in the nucleus",
            "The proton gradient flowing back into the matrix through ATP synthase",
            "Sunlight absorbed by chlorophyll",
            "Active transport of sodium and potassium",
          ],
          correctIndex: 1,
          explanation:
            "Protons flow down their electrochemical gradient via ATP synthase (chemiosmosis), mechanically turning the catalytic rotor to phosphorylate ADP into ATP.",
        },
      },
      {
        title: "ATP Synthase: Nature’s Biological Molecular Motor",
        start: 95,
        end: 160,
        bullets: [
          "Composed of stationary stator (F0) and rotating catalytic knob (F1).",
          "Proton passage causes conformational shifts that press ADP and Pi into ATP.",
          "Produces approximately 26–28 ATP per glucose molecule.",
        ],
        question: {
          id: 'q_bio_2',
          question: "If a chemical uncoupler makes the inner membrane permeable to protons, what occurs?",
          options: [
            "ATP production stops while electron transport continues, generating heat",
            "Glucose production increases tenfold",
            "ATP synthesis increases exponentially",
            "Cell division accelerates",
          ],
          correctIndex: 0,
          explanation:
            "Uncouplers dissipate the proton gradient without ATP synthase rotation; energy is released as heat (thermogenesis).",
        },
      },
    ],
  },
  {
    sourceId: 'src_igcse_chemistry',
    ytVideoId: 'z1GCnyRNTgk', // Chemistry / Bonding
    subject: '#IGCSE Chemistry - Covalent vs Ionic Lattices',
    curriculum: 'IGCSE',
    bookTitle: "Cambridge IGCSE Chemistry Coursebook",
    chapter: 'Chapter 3: Atoms, Elements and Compounds',
    channelName: 'Cambridge Science Hub',
    channelAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    segments: [
      {
        title: "Giant Ionic Lattices: High Melting Points & Conductivity",
        start: 0,
        end: 60,
        bullets: [
          "Strong electrostatic forces of attraction between oppositely charged ions in 3D lattice.",
          "Solid salts do not conduct electricity because ions are locked in place.",
          "Conduct when molten or aqueous because ions become mobile charge carriers.",
        ],
        question: {
          id: 'q_chem_1',
          question: "Why does solid sodium chloride (NaCl) not conduct electricity?",
          options: [
            "It has no ions present",
            "Its ions are fixed in rigid lattice positions and cannot move",
            "It contains free electrons that cancel out current",
            "Salt is completely non-polar",
          ],
          correctIndex: 1,
          explanation:
            "Electrical conduction requires mobile charged particles. In solid ionic lattices, ions vibrate in place but cannot migrate.",
        },
      },
      {
        title: "Giant Covalent Structures: Diamond vs Graphite",
        start: 85,
        end: 155,
        bullets: [
          "Diamond: each carbon forms 4 strong covalent bonds in tetrahedral lattice (extremely hard).",
          "Graphite: each carbon forms 3 bonds in planar hexagonal layers with delocalised electrons.",
          "Weak van der Waals forces between layers allow graphite to act as a lubricant and conduct electricity.",
        ],
        question: {
          id: 'q_chem_2',
          question: "Why can graphite conduct electricity while diamond is an electrical insulator?",
          options: [
            "Graphite contains metallic impurities",
            "Graphite has delocalised electrons along its hexagonal carbon layers",
            "Diamond has no carbon atoms",
            "Graphite is a liquid at room temperature",
          ],
          correctIndex: 1,
          explanation:
            "Each carbon in graphite only bonds to 3 others, leaving 1 valence electron delocalised and free to carry charge across the planes.",
        },
      },
    ],
  },
  {
    sourceId: 'src_sat_grammar_dangling',
    ytVideoId: 'z0Ue9vH0kOI',
    subject: '#SAT Writing - Dangling Modifiers & Parallel Structure',
    curriculum: 'SAT',
    bookTitle: "The College Panda's SAT Writing",
    chapter: 'Chapter 2: Modifier Placement',
    channelName: 'Ivy League Prep Academy',
    channelAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    segments: [
      {
        title: "Dangling Modifiers: Who Is Actually Performing the Action?",
        start: 0,
        end: 55,
        bullets: [
          "An introductory participial phrase must be immediately followed by the noun it modifies.",
          "Incorrect: 'Walking down the street, the trees were beautiful.' (Trees aren't walking!)",
          "Correct: 'Walking down the street, Maria noticed the beautiful trees.'",
        ],
        question: {
          id: 'q_sat_gram_1',
          question: "Which sentence correctly repairs the dangling modifier: 'Having finished the experiment, the lab report was written.'?",
          options: [
            "Having finished the experiment, the computer wrote the lab report.",
            "Having finished the experiment, the students wrote the lab report.",
            "The lab report was written, having finished the experiment.",
            "Finishing the experiment, the report sat on the desk.",
          ],
          correctIndex: 1,
          explanation:
            "The modifier 'Having finished the experiment' must be immediately followed by the actor who performed the action: 'the students'.",
        },
      },
      {
        title: "Parallel Structure Across Coordinating Conjunctions",
        start: 75,
        end: 135,
        bullets: [
          "Items in a list or comparison must share identical grammatical form.",
          "Pairing gerunds with gerunds ('swimming, running, and cycling') or infinitives with infinitives.",
          "Check for false parallelism around 'not only... but also' and 'either... or'.",
        ],
        question: {
          id: 'q_sat_gram_2',
          question: "Identify the parallel sentence:",
          options: [
            "She likes hiking, to swim, and riding bicycles.",
            "She likes hiking, swimming, and riding bicycles.",
            "She likes to hike, swimming, and bicycle rides.",
            "She likes hiking, swimming, and to ride bicycles.",
          ],
          correctIndex: 1,
          explanation:
            "All three elements use the gerund (-ing) form: hiking, swimming, and riding.",
        },
      },
    ],
  },
];

/**
 * Scatter Algorithm:
 * Takes segments from multiple source videos and scatters them so that:
 * 1. Clips from the same 10-minute source video are NEVER consecutive.
 * 2. Creates a continuous 15-20 clip personalized queue.
 */
function scatterClips(rawClips: MicroLessonClip[]): MicroLessonClip[] {
  if (rawClips.length <= 1) return rawClips;

  // Group clips by sourceVideoId
  const groups: { [key: string]: MicroLessonClip[] } = {};
  for (const clip of rawClips) {
    if (!groups[clip.sourceVideoId]) {
      groups[clip.sourceVideoId] = [];
    }
    groups[clip.sourceVideoId].push(clip);
  }

  const result: MicroLessonClip[] = [];
  const groupKeys = Object.keys(groups);

  // Round-robin with jitter to ensure no consecutive source IDs
  let hasMore = true;
  let lastSourceId = '';

  while (hasMore) {
    hasMore = false;
    // Shuffle keys per round
    const shuffledKeys = [...groupKeys].sort(() => Math.random() - 0.5);

    for (const key of shuffledKeys) {
      if (groups[key].length > 0) {
        if (key !== lastSourceId || groupKeys.length === 1) {
          const item = groups[key].shift()!;
          result.push(item);
          lastSourceId = key;
          hasMore = true;
        }
      }
    }

    // Check if any group still has items
    for (const k of groupKeys) {
      if (groups[k].length > 0) hasMore = true;
    }
  }

  return result;
}

/**
 * Generate a personalized micro-lesson clip feed for the student.
 * Parses student's uploaded textbooks, academic track, and grade.
 */
export function generatePersonalizedFeed(): MicroLessonClip[] {
  // Read student profile from local storage if available
  let profile: StudentCurriculum = {
    grade: 'Grade 11',
    programs: ['SAT', 'AP'],
    textbooks: [
      'The Official SAT Study Guide',
      'Campbell Biology 12th Edition',
      'Halliday & Resnick Fundamentals of Physics',
    ],
  };

  try {
    const raw = localStorage.getItem('ruri_student_profile');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.programs) profile.programs = parsed.programs;
      if (parsed.grade) profile.grade = parsed.grade;
      if (parsed.textbooks && parsed.textbooks.length > 0) {
        profile.textbooks = parsed.textbooks;
      }
    }
  } catch (e) {
    console.warn('Profile read warning, using default curriculum:', e);
  }

  // Filter or match curated source lectures based on curriculum
  let matchedSources = CURATED_SOURCE_LECTURES.filter((lec) => {
    if (!profile.programs || profile.programs.length === 0) return true;
    return profile.programs.includes(lec.curriculum);
  });

  if (matchedSources.length < 3) {
    matchedSources = CURATED_SOURCE_LECTURES;
  }

  // Create clips for each segment
  const allClips: MicroLessonClip[] = [];

  matchedSources.forEach((source) => {
    source.segments.forEach((seg, idx) => {
      const duration = seg.end - seg.start;
      allClips.push({
        id: `clip_${source.sourceId}_p${idx + 1}_${Math.random().toString(36).substr(2, 4)}`,
        sourceVideoId: source.ytVideoId,
        sourceChannelId: source.sourceId,
        clipPart: idx + 1,
        totalParts: source.segments.length,
        startSeconds: seg.start,
        endSeconds: seg.end,
        durationSeconds: duration,
        title: seg.title,
        channelName: source.channelName,
        channelAvatar: source.channelAvatar,
        subjectTag: source.subject,
        bookContext: `Sourced from: ${source.bookTitle} - ${source.chapter}`,
        likesCount: 1240 + Math.floor(Math.random() * 850),
        bookmarksCount: 380 + Math.floor(Math.random() * 210),
        summaryBullets: seg.bullets,
        diagnosticQuestion: seg.question,
      });
    });
  });

  // Duplicate with slight stagger to ensure at least 15-20 clips in queue
  const extendedClips: MicroLessonClip[] = [];
  while (extendedClips.length < 18) {
    allClips.forEach((c) => {
      extendedClips.push({
        ...c,
        id: `${c.id}_r${Math.random().toString(36).substr(2, 4)}`,
      });
    });
  }

  // Scatter clips so identical sourceVideoId items are never consecutive
  return scatterClips(extendedClips);
}
