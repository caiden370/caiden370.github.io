# Masblo project context

Masblo is a React/Create React App Spanish-learning PWA for `masblo.com`. The project goal is to make Spanish practice more fun, engaging, and effective while expanding the lesson content over time.

## Product direction

- Prioritize playful learning: short game loops, immediate feedback, sound, speech, mascots, progress, coins, and replayability.
- Keep features mobile-friendly and PWA-friendly. The manifest uses the app name `Masblo`, standalone display, and app icons from `public\logo.png`.
- Favor additions that make practice feel varied: listening, speaking, typing, recognition, story comprehension, conversations, and lightweight game mechanics.
- Content expansion should preserve the existing JSON schemas so all current game modes continue to work.

## Stack and commands

- React 19 app bootstrapped with Create React App.
- Main UI libraries: Material UI (`@mui/material`, `@mui/joy`, icons), Phosphor icons, Lucide, Tone.js.
- Speech features use browser `speechSynthesis` and `SpeechRecognition` / `webkitSpeechRecognition`.
- Scripts:
  - `npm start` runs the local dev server.
  - `npm run build` builds production output.
  - `npm test` runs CRA/Jest tests in watch mode.
  - `npm run deploy` deploys `build` through `gh-pages`.

## App architecture

- `src\App.js` owns top-level navigation state, selected chapter/content index, selected game id, coins, and experience.
- Main sections are string states: `Chapters`, `TopWords`, `Store`, `Profile`, `Settings`, `MenuGame`, and `game`.
- `src\bottom-navbar.js` switches major sections. `src\top-header.js` shows coins/level and can navigate to settings.
- `safeGetItem(key)` in `App.js` reads numeric localStorage values and normalizes `NaN` to `0`.
- Persistent user state is stored in `localStorage`: coins, experience, player name, selected/favorite mascot, owned mascots, favorite chapter, progress keys, voice choices, and cached content.

## Content model

- Chapter metadata lives in `src\json-files\chapterCovers.json`.
- There are 24 lesson chapters, indexed `0` through `23`, each backed by `src\json-files\<index>-learningContent.json`.
- Current lesson totals: 833 word/phrase items, 112 conversations, 72 stories, and 449 speaking question/answer prompts.
- Top-word practice lives in `src\json-files\topWords\10000-topWords.json` through `10019-topWords.json`.
- Top words are indexed separately from chapters using `TOP_WORDS_INDEX_RANGE = 10000`; there are 20 chunks of 50 words each, for 1000 total words.
- `src\utils\contentCache.js` dynamically imports content using the selected index:
  - chapter indexes load `json-files\<index>-learningContent.json`
  - top-word indexes load `json-files\topWords\<index>-topWords.json`
  - content is cached in memory and localStorage for one hour under `learningContent:<index>`.
- Lesson content objects are expected to contain:
  - `words`: array of `{ spanish, english }`
  - `conversations`: array with `topic`, `dialog`, and `questions`; dialog entries have `speaker`, `spanish`, `english`; questions have `question`, `options`, `answer`, `answerIndex`
  - `stories`: array with `sentences`, each sentence having `spanish` and `english`
  - `speaking.questions_and_answers`: array where each item has `question.{spanish,english}` and `answer.{spanish,english}`
- Chapter 3 currently has no speaking prompts; games that assume `speaking.questions_and_answers` need guards before relying on it.

## Learning and game flow

- `src\chapters-page.js` renders chapter cards and a favorite chapter. Cards go to `MenuGame` with the selected chapter index.
- `src\top-words-page.js` renders 20 word-range cards. Only the first chunk is unlocked initially; later chunks unlock when the previous chunk has at least 50 progress points.
- `src\game-menu.js` lists game modes and progress. `ScoreGoal` is currently nine entries of 20 points each.
- `src\game-wrapper.js` maps game ids:
  - `1`: Learn (`MixedReview` with learning mode)
  - `2`: Listen (`AudioReview`)
  - `3`: Conversations
  - `4`: Mixed Review
  - `5`: Sentences
  - `6`: Story
  - `7`: Speaking
  - `8`: Spell Battle
  - `9`: Driving Mode (`CarGame`)
- The visible menu currently lists game ids 1, 2, 3, 4, 5, 6, 7, and 9; Spell Battle exists but is not currently exposed in the grid.
- Progress keys follow `ch<chapterIndex>-g<gameId>-progress`. This also covers top-word chunks because they use chapter-like indexes such as `10000`.
- Finishing games generally awards coins and experience equal to correct answers and updates local progress through `GameWrapper`.

## Game modes

- `src\games\mixed-review.js`: uses words for multiple choice, translation text response, and fill-in-the-blank. Learning mode restricts to multiple choice.
- `src\games\audio-review.js`: currently picks Spanish phrases from `words` and asks the user to type what they heard.
- `src\games\conversation-review.js`: plays a conversation, optionally audio-only, then asks conversation multiple-choice questions.
- `src\games\sentence.js`: picks sentences from conversations/stories and alternates between sentence jumble and audio exact response.
- `src\games\story.js`: uses story sentences for either translation choice or "what comes next?" sequence practice.
- `src\games\speak.js`: uses speech recognition for speaking prompts and word translation speaking practice.
- `src\games\spell-battle.js`: card-battle experiment with HP, abilities, bolts earned from quiz answers, and a battle quiz.
- `src\games\car-game.js`: driving-mode speaking practice intended for longer hands-free sessions; uses Spanish prompts, mic recognition, and spoken feedback phrases.
- `src\games\helper-game-objects.js` contains reusable MultipleChoice, TextResponse, FillInTheBlank, and AudioExactTextResponse components.
- `src\games\helper-conversation-game-objects.js` contains conversation rendering and conversation multiple-choice flow.
- `src\games\ui-objects.js` contains ProgressBar, popovers, text normalization, leave button, speech-recognition mic button, and shared utilities.
- `src\games\completion.js` renders the animated completion screen, score stats, mascot, and an ad/bonus coin button.

## Speech, sound, and feedback

- `src\speech.js` has two layers:
  - `SpeechButton` React component for clickable speech playback.
  - `speakSpanish`, `speakEnglish`, and `delay` helpers for async spoken flows.
- Voice selection prefers saved localStorage choices, then ranks Spanish/English browser voices. Spanish playback is slower (`0.85` rate); English is `0.9`.
- Correct/incorrect sounds are Tone.js synth effects in `playCorrectSound` and `playIncorrectSound`.
- `src\voice-selection.js` and `src\settings-page.js` expose voice settings.

## Mascots, rewards, and profile

- `src\mascot.js` defines many mascot variants with prices, random idle animations, and `getSortedMascotIdsByPrice()`.
- `src\utils\mascotStorage.js` manages selected and owned mascots.
- `src\store.js` sells mascots for coins and includes an embedded ad button that grants coins.
- `src\profile-page.js` shows player name, selected mascot, level, XP progress, and mascot selection.
- Leveling is simple: `computeLevel(exp)` returns `Math.floor(exp / 100) + 1`.

## Styling conventions

- Most styling is centralized in `src\App.css`, with global base styles in `src\index.css` and mascot/game animations in `src\animations\animations.css`.
- Existing code favors function components, local helper functions inside components, direct CSS class names, and Material UI `sx` overrides.
- Visual language is colorful/pastel, rounded, mobile-card based, and mascot-heavy.

## Known implementation notes to preserve/fix carefully

- Several files contain unused imports and console logging; avoid broad cleanup unless it is directly related to the current task.
- `src\word-game-menu.js` appears to be an older/alternate menu and is not used by `App.js`.
- `updateLocalProgress` in `src\game-menu.js` compares `prevPoints + safePoints >= ScoreGoal` instead of the per-game goal; this may affect star-fill logic.
- `getStarFillCompute` loops only the first six games even though nine game ids exist.
- Some game code assumes content sections exist. When expanding or varying content, add guards before indexing arrays.
- React keys sometimes use `Date.now()`, which can force remounts. Keep this behavior only when remount/reset is intentional.
- Speech recognition support is browser-dependent; graceful unsupported states matter.

## When adding content

- Keep chapter file names and object keys aligned: `N-learningContent.json` should expose key `"N"`.
- Preserve `answerIndex` alignment with the `options` array.
- Add enough `words`, `conversations`, `stories`, and `speaking.questions_and_answers` for every game mode to have valid random choices.
- Prefer practical, learner-useful Spanish with clear English translations. Include accents and punctuation because the UI speaks Spanish text aloud.
- For top words, keep each `10000+N-topWords.json` chunk at 50 words so unlock/progress math stays consistent.

## When making the app more engaging

- Good extension points: `GameWrapper`/`game-menu` for new modes, `completion.js` for rewards, `mascot.js`/animations for delight, `contentCache.js` for data loading, and JSON content files for curriculum expansion.
- Favor features that reuse existing content schemas before inventing new schemas.
- If adding a new game id, update `ScoreGoal`, the menu grid, `GameWrapper`, progress/star calculations, and any completion/unlock logic together.
- Validate with `npm run build` after code changes. For content-only changes, at minimum ensure affected JSON parses and the app can import it.

## El Camino chapter generation guide

Use this guide when building a full El Camino life chapter. A chapter should feel like a large, explorable Spanish-speaking world, not a list of isolated quizzes.

### Chapter goals

- Build a coherent life-stage chapter with a clear theme, for example elementary school, high school, university, first job, independent life, travel, family, adult responsibilities, community leadership, or future dreams.
- Increase Spanish difficulty by chapter. Early chapters can use short English clarification, but later chapters should rely mostly on Spanish context, longer dialogue, and comprehension.
- Keep areas thematically focused. Each area should teach and repeat a small set of useful vocabulary, grammar, and social tasks.
- Make the player move between people, buildings, and objects. Prefer errands, collection missions, verifiers, locked routes, and conversations over single-NPC quiz chains.
- Do not use the real user's name in game content. Use generic player phrasing such as `estudiante`, `amigo`, `amiga`, or no name.

### Files to create

For each area, create:

```text
public\el-camino\areas\<chapter-number>-<chapter-slug>-<area-slug>\area.json
public\el-camino\areas\<chapter-number>-<chapter-slug>-<area-slug>\map.txt
```

Then add every new area folder to:

```text
public\el-camino\areas\manifest.json
```

Runtime code lives in:

```text
src\el-camino
```

Only change runtime code when a reusable mechanic is missing. Most chapter work should be config-only.

### Recommended chapter structure

A full chapter should usually include:

1. **Hub/entrance area**: introduces the chapter goal and routes to other areas.
2. **Five large main maps**: each with 5-10 meaningful missions.
3. **Several interiors**: stores, classrooms, dorms, offices, cafes, labs, houses, etc.
4. **At least one multi-person errand chain per main area**.
5. **Three boss rooms** after the normal chapter review.
6. **One chapter badge** awarded only after all three bosses are defeated.

Example active chapter shape:

```text
chapter entrance / campus
  -> classroom / hall / dorm
  -> playground / gym / library
  -> cafeteria / store / cafe
  -> final review area
  -> boss room 1 -> boss room 2 -> boss room 3 -> badge
```

### Area design checklist

Each area should have:

- `id`, `name`, `kind`, `chapterId`, `region`, `cefrLevel`, `teaches`, `legend`, and `playerStart`.
- A `map.txt` with consistent row widths.
- Distinct terrain and objects so areas do not look identical.
- Paths to other areas using `exits` or building `entrance`.
- NPCs with longer back-and-forth conversations, not one-line prompts.
- Missions that reinforce the area's theme through repetition.
- Spanish-first dialogue where possible.
- Harder questions than simple copying. Use translation, inference, sequencing, and comprehension.

### Mission design patterns

Use config-driven `interactions` with `when` conditions and `actions`.

Good mission types:

- **Conversation quiz**: NPC teaches through several Spanish lines, then asks a comprehension question.
- **Collection mission**: player collects items from different people or objects, then returns to a verifier NPC.
- **Delivery mission**: NPC requests an item, player buys/earns it elsewhere, then returns.
- **Gate mission**: a route or building is locked until the player has an item, completed mission, or badge.
- **Giving interaction**: NPC or object gives an item after a quiz or condition.
- **Ordering/buying mission**: player speaks/types a polite request to a clerk NPC.
- **Puzzle mission**: player must infer an order, location, schedule, or missing object from Spanish clues.
- **Social choice mission**: player chooses the most natural Spanish response in a conversation.
- **Review mission**: combines several prior themes before opening boss rooms.

Store, restaurant, and service interactions should be with NPCs, not just shelves or counters.

### Language content standards

- Every important NPC should have a real conversation with multiple turns before the quiz.
- Avoid questions that only ask the player to repeat visible text.
- Mix question types:
  - Multiple choice comprehension.
  - Spanish audio to English meaning.
  - English prompt to typed/spoken Spanish sentence.
  - Spanish story with inference questions.
  - All-Spanish conversation response choices.
  - Questions about the level itself in Spanish.
- Make wrong feedback no-hint for tests and bosses, e.g. `No. Intenta otra vez.`
- Keep repetition intentional: reuse vocabulary across different contexts, not identical questions.
- Later chapters should have longer sentences, fewer English hints, and more Spanish-only prompts.

### Boss room requirements

Each completed chapter should have three distinct boss rooms:

- Boss rooms should be small, separate, visually distinct areas.
- Boss NPCs should use `"boss": true` so they render larger.
- Bosses use the `askBossQuiz` action.
- Each boss needs 5-10 difficult questions.
- The player must answer every question correctly. A wrong answer restarts that boss from question 1.
- Boss 2 should require boss 1 completion. Boss 3 should require boss 2 completion.
- The chapter badge is awarded only by boss 3.

Boss question categories should include:

1. Translate into English from Spanish text or audio.
2. Type/speak a longer Spanish sentence from English.
3. Long story comprehension.
4. Long audio comprehension.
5. Hard all-Spanish back-and-forth conversation choices.
6. Comprehension about locations, people, or events in the chapter.

Example boss action:

```json
{
  "type": "askBossQuiz",
  "bossId": "college-boss-final",
  "title": "Duelo de la Insignia",
  "restartMessage": "No. La entrevista empieza de nuevo.",
  "questions": [
    {
      "type": "askChoice",
      "prompt": "Translate: Después de estudiar, fui al café con mis compañeros.",
      "options": [
        { "label": "After studying, I went to the cafe with my classmates.", "correct": true },
        { "label": "Before studying, I bought a notebook.", "correct": false },
        { "label": "I could not study because the cafe was closed.", "correct": false }
      ]
    }
  ],
  "actions": [
    { "type": "addItem", "itemId": "chapterThreeBadge", "count": 1 },
    { "type": "completeMission", "missionId": "college-boss-final" }
  ]
}
```

### Gated exits and visible locks

Use `requires` and `blockedMessage` for locked routes:

```json
{
  "x": 24,
  "y": 0,
  "targetArea": "college-boss-dorm",
  "targetX": 8,
  "targetY": 10,
  "facing": "up",
  "requires": { "completedMissions": ["college-final-review"] },
  "blockedMessage": "Completa el repaso final antes de entrar."
}
```

Locked entrances render an in-world lock marker automatically. Keep blocked messages short and clear.

### Items, badges, and inventory

- Add reusable item definitions in `src\el-camino\maps\objectCatalog.js`.
- Badge items should use `category: "badge"` so they appear in the Bag's Badges tab.
- Coins are shown separately in the top UI and should not be described in repeated dialogue unless needed.
- Do not award chapter badges from normal review missions. Only the final boss should award the badge.

### Map feature expectations

The Map panel is generated from loaded chapter areas and exits. To make it useful:

- Keep area `chapterId` consistent for all maps in the same chapter.
- Add exits between related maps so the chapter layout is discoverable.
- Use `requires` on locked paths so the map and in-world lock markers can communicate blockers.
- Use clear area names because they appear in the map panel.

### Object and visual guidance

- Reuse object types from `src\el-camino\maps\objectCatalog.js` before adding new ones.
- Add new object types only when they will be reusable across future chapters.
- If adding a new object type, also add renderer support in `ElCaminoScene.drawObjectByType` when the generic drawing is not enough.
- Make each chapter visually distinct with terrain, buildings, furniture, and landmarks.

### Validation before finishing

For chapter/content changes, at minimum validate:

- Every JSON file parses.
- Every `map.txt` has consistent row widths.
- Every manifest folder exists.
- Every exit and entrance target area exists.
- Every referenced `personId`, object `type`, and item id exists in `objectCatalog.js`.
- Every boss has 5-10 questions.
- No chapter badge is awarded before the final boss.
- No content uses the real user's name.

Prefer targeted validation scripts for content-only changes. Run `npm run build` when runtime JS/CSS changes are made unless the user explicitly asks not to.
