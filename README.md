# Streakwise

A personal daily planner for school, programming and English. Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run it
- **Easiest:** double-click `streakwise-single.html` (everything in one file), or open `index.html`.
- **Local server (optional):** `python3 -m http.server 8000` in this folder, then open http://localhost:8000
- Fonts load from Google Fonts when online; the app falls back to system fonts offline.

## Folder structure
```
index.html            page shell + bottom navigation
css/style.css         design tokens, all components, responsive rules
js/config.js          ASSETS (replace artwork), moods, categories, default timetable, routines, JS roadmap
js/store.js           local-date helpers, state, localStorage, routines -> daily tasks, mood/streak/level rules
js/art.js             icons, original mascot (5 moods), desert scenes, trophy, progress ring
js/ui.js              sheets, confirm dialogs, toast, sound, animated numbers
js/pages.js           Home, Tasks, Calendar, Settings
js/sheets.js          task, profile, timetable, routine and roadmap forms
js/app.js             routing, click handling, swipe, import/export, boot
assets/               put your own characters and backgrounds here
build.js              `node build.js` rebuilds streakwise-single.html
```

## Replace the characters, backgrounds and trophy
Open `js/config.js` and set paths in `ASSETS`. `null` means "use the built-in SVG".
```js
characterStates: { excellent: "assets/characters/happy.png", good: "assets/characters/good.png",
                   average: "assets/characters/angry-light.png", low: "assets/characters/angry.png",
                   neutral: "assets/characters/neutral.png" },
backgrounds:     { excellent: "assets/backgrounds/violet.jpg", good: "assets/backgrounds/blue.jpg",
                   average: "assets/backgrounds/orange.jpg", low: "assets/backgrounds/red.jpg",
                   neutral: "assets/backgrounds/dusk.jpg" },
trophy: "assets/trophy.png", fire: "assets/fire.png", avatar: "assets/avatar.png"
```
Characters: square transparent PNG/WebP/SVG (about 512 px). Backgrounds are cropped with `cover` (about 800x720). Run `node build.js` afterwards if you use the single file.

## Rules used for progress
| Day completion | Mood | Ring / dots |
|---|---|---|
| 100% | Excellent (violet) | 4 green |
| 51-99% | Good (blue) | 3 green + 1 grey |
| 40-50% | Average (orange) | 2 yellow + 2 grey |
| below 40% | Low (red) | 1 red + 3 grey |
| no tasks, or a future day with nothing ticked | Neutral | no indicators |

- **Streak:** consecutive days that have tasks and reach the threshold (Settings: all tasks / 75% / 50%). Days with no tasks are skipped. Today does not break a streak until the day is over.
- **XP and level:** 10 XP per completed task, +25 per perfect day. Level L starts at 50 x L x (L-1) XP.
- **Completion (Home):** completed / planned tasks over the last 30 days. **Active days:** dates with at least one completed task.
- Every day from your first use up to today is created automatically, so a missed day counts as missed. Nothing is generated for dates before you started.

## How data is stored
Everything is saved in your browser's `localStorage` under the key `streakwise-v1` as one JSON object (profile, settings, schedule, routines, tasks, roadmap). Each task keeps its own date (`YYYY-MM-DD`, local time) and completion state, which is the history the calendar reads. The profile photo is resized to 256 px and saved as a small data URL. Use **Settings -> Export data** for backups; importing replaces current data.
Data lives per browser and per address: opening the file from a different path or browser starts fresh.
