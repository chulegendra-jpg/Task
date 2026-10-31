/* =====================================================================
   CONFIG — everything you may want to customise lives here.
   ===================================================================== */

/* ---------- Replaceable artwork ----------
   Leave a value as null to use the built-in SVG artwork.
   To use your own image, put the file in /assets and set the path, e.g.
     characterStates.excellent = "assets/characters/happy.png"
   Transparent PNG / WebP / SVG recommended for characters (square, ~512px).
   Backgrounds are cropped with "cover" (recommended 800x720).            */
const ASSETS = {
  characterStates: {
    excellent: 'great.png',   // 100% of tasks done  – very happy
    good:      'good.png',    // more than 50%       – satisfied
    average:   'bad.png',     // about 40–50%        – slightly angry
    low:       'verybad.png', // below 40%           – very angry
    neutral:   'good.png'     // no tasks / future day – same picture, shown in greyscale
  },
  // Files are looked up next to index.html. If a file is missing, the built-in SVG is used instead.
  backgrounds: {
    excellent: null, // violet desert
    good:      null, // blue desert
    average:   null, // orange desert
    low:       null, // red desert
    neutral:   null  // dusk grey desert
  },
  trophy: null,  // Home → "Keep it up!" card
  fire: null,    // streak flame icon (small, square)
  avatar: null   // default profile picture
};

/* ---------- Moods ---------- */
const MOOD_META = {
  excellent: { label: 'Perfect day',  color: '#a78bfa', seg: 4, segColor: '#3ddc6e' },
  good:      { label: 'Going well',   color: '#6d8bff', seg: 3, segColor: '#3ddc6e' },
  average:   { label: 'Halfway',      color: '#ff9a3d', seg: 2, segColor: '#ffd23f' },
  low:       { label: 'Needs a push', color: '#ff5a4d', seg: 1, segColor: '#ff4d4d' },
  neutral:   { label: 'No tasks',     color: '#8b9097', seg: 0, segColor: '#3a3e45' }
};

/* ---------- Categories ---------- */
const CATEGORIES = {
  school:      { label: 'School',  color: '#6d8bff', icon: 'school' },
  programming: { label: 'Code',    color: '#B8F52A', icon: 'code' },
  english:     { label: 'English', color: '#a78bfa', icon: 'chat' },
  health:      { label: 'Health',  color: '#ff9a3d', icon: 'heart' },
  review:      { label: 'Review',  color: '#ffd23f', icon: 'rotate' },
  other:       { label: 'Other',   color: '#8b9097', icon: 'flag' }
};
const LEARNING_CATS = ['school', 'programming', 'english', 'review'];

/* ---------- Calendar vocabulary ---------- */
const DAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];           // index = Date.getDay()
const DAY_SHORT = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };
const DAY_FULL = { sun: 'Sunday', mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday' };
const WEEK_START_INDEX = { sat: 6, sun: 0, mon: 1 };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const NUM_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

/* ---------- Default weekly timetable (all editable in Settings) ---------- */
const DEFAULT_SCHEDULE = {
  school: {
    sat: ['07:30', '13:45'], sun: ['07:30', '12:20'], mon: ['07:30', '13:45'],
    tue: ['07:30', '13:45'], wed: ['07:30', '13:45'], thu: null, fri: null
  },
  english: {
    sat: null, sun: ['19:30', '21:00'], mon: null, tue: ['19:30', '21:00'],
    wed: null, thu: ['19:30', '21:00'], fri: null
  }
};

/* Recurring routines (School and English class are generated from the schedule above).
   order = position in the day. jsStage = one of the five JavaScript study stages.   */
const SCHOOL_DAYS = ['sat', 'sun', 'mon', 'tue', 'wed'];
const DEFAULT_ROUTINES = [
  { id: 'r-homework', title: 'Homework & school review', description: 'Finish assignments first, then review today’s lessons', category: 'school', days: SCHOOL_DAYS, order: 20 },
  { id: 'r-js-new', title: 'Learn a new JavaScript topic', description: 'Watch one lesson, then code it yourself', category: 'programming', days: ['sat', 'mon', 'wed'], order: 30, jsStage: 'learn' },
  { id: 'r-js-practice', title: 'JavaScript exercises & practice', description: 'Solve problems without the video running', category: 'programming', days: ['sun'], order: 30, jsStage: 'practice' },
  { id: 'r-js-review', title: 'JavaScript review & practice', description: 'Revisit older topics, fix weak spots', category: 'programming', days: ['tue'], order: 30, jsStage: 'review' },
  { id: 'r-en-short', title: 'Short English practice', description: '20 minutes: vocabulary, reading or listening', category: 'english', days: ['sat', 'mon', 'wed'], order: 40 },
  { id: 'r-rest', title: 'Meals, rest & free time', description: 'Eat properly and take a real break', category: 'health', days: SCHOOL_DAYS, order: 50 },

  { id: 'r-deep-js', title: 'Deep JavaScript study', description: 'One long, focused block on a harder topic', category: 'programming', days: ['thu'], order: 10, jsStage: 'learn' },
  { id: 'r-solo-code', title: 'Independent coding exercises', description: 'No tutorials – write it from scratch', category: 'programming', days: ['thu'], order: 20, jsStage: 'practice' },
  { id: 'r-project-thu', title: 'Personal programming project', description: 'Move your own project forward', category: 'programming', days: ['thu'], order: 30, jsStage: 'project' },
  { id: 'r-en-thu', title: 'English practice', description: 'Speaking, writing or listening', category: 'english', days: ['thu'], order: 40 },
  { id: 'r-exercise', title: 'Exercise & rest', description: 'Move your body, then switch off', category: 'health', days: ['thu'], order: 80 },

  { id: 'r-quiz', title: 'Weekly JavaScript quiz', description: 'Test yourself on this week’s topics', category: 'programming', days: ['fri'], order: 10, jsStage: 'quiz' },
  { id: 'r-mistakes', title: 'Review mistakes', description: 'Understand every wrong answer', category: 'review', days: ['fri'], order: 20, jsStage: 'review' },
  { id: 'r-project-fri', title: 'Improve personal project', description: 'Refactor, fix bugs, add one feature', category: 'programming', days: ['fri'], order: 30, jsStage: 'project' },
  { id: 'r-github', title: 'GitHub update', description: 'Commit only when real code has changed', category: 'programming', days: ['fri'], order: 40 },
  { id: 'r-en-fri', title: 'English writing or speaking', description: 'Write a paragraph or record yourself', category: 'english', days: ['fri'], order: 50 },
  { id: 'r-weekly', title: 'Weekly review & rest', description: 'Look back, plan next week, relax', category: 'review', days: ['fri'], order: 80 },

  { id: 'r-sleep', title: 'Sleep 8–10 hours', description: 'Lights out on time', category: 'health', days: DAYS.slice(), order: 99 }
];

/* ---------- JavaScript learning roadmap ---------- */
const JS_COURSE = { videos: 76, minutes: 10 * 60 + 21 };
const JS_STAGES = [
  { id: 'learn',    label: 'Learn',    text: 'Study one new topic' },
  { id: 'practice', label: 'Practice', text: 'Code it on your own' },
  { id: 'review',   label: 'Review',   text: 'Revisit earlier topics' },
  { id: 'quiz',     label: 'Quiz',     text: 'Weekly self-test' },
  { id: 'project',  label: 'Build',    text: 'Ship practical projects' }
];
const JS_TOPICS = [
  'Variables and data types', 'Operators', 'Strings and numbers', 'Arrays and objects',
  'Array methods', 'Functions', 'Scope', 'Arrow functions', 'Conditions', 'Loops',
  'DOM', 'Events', 'Modules', 'LocalStorage', 'CRUD operations', 'Final practical project'
].map((t, i) => ({ id: 'b' + (i + 1), title: t }));
const JS_NEXT = [
  'Advanced JavaScript', 'Closures', 'this', 'Prototypes and OOP', 'Promises', 'Async/await',
  'Event loop', 'Fetch API', 'REST APIs', 'Error handling', 'TypeScript', 'React', 'Next.js'
].map((t, i) => ({ id: 'a' + (i + 1), title: t }));
