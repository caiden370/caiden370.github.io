# Progressive Learning Path feature plan

## Goal

Add a new Progressive Learning tab that removes the burden of choosing what to do next. Instead of asking learners to pick between chapters, top words, and games, Masblo should guide them through a structured path: diagnose their level, teach one small concept at a time, practice it with games, review it later, and unlock harder material only when they are ready.

The path should be JSON-driven so curriculum can be expanded without rewriting app logic.

## Product principles

- **One clear next action:** the tab should always answer "what should I do now?"
- **Teach before testing:** lessons should include explanation, examples, pronunciation help, and guided practice before game-like quizzes.
- **Short sessions:** each sublevel should be completable in 3-8 minutes.
- **Progressive difficulty:** unlock content based on mastery, not just completion.
- **Standards-aligned:** use CEFR levels because they are widely used by language programs: A1, A2, B1, B2, C1, C2.
- **Fun by default:** mascots, coins, streaks, sound, animations, and mini-games should reinforce learning without hiding the learning goal.
- **Review is part of the path:** use spaced review so older material resurfaces automatically.

## Proposed navigation

Add a new bottom tab:

| Tab | Purpose |
| --- | --- |
| Chapters | Existing topic-based browse mode |
| Top Words | Existing top 1000 word chunks |
| Progressive | New guided path |
| Store | Existing rewards |
| Profile | Existing progress/mascot area |

The Progressive tab becomes the recommended default experience for learners who feel overwhelmed.

## Learner flow

1. **First visit:** show a short intro and offer a placement pretest.
2. **Pretest:** adaptive diagnostic covering vocabulary, listening, grammar, reading, and speaking confidence.
3. **Placement result:** place learner into a CEFR level and unit, such as `A1 Unit 2: Everyday survival phrases`.
4. **Daily path:** show one primary action, such as "Continue A1.2.3: Asking simple questions."
5. **Lesson:** teach a concept with examples, audio, and quick checks.
6. **Practice games:** reinforce the lesson through existing and new game modes.
7. **Mastery check:** determine whether the learner passes, repeats, or gets extra support.
8. **Review queue:** schedule mastered items for future review.
9. **Unlock next sublevel:** advance through the path.

## CEFR curriculum map

### A1 - Beginner

Learner can understand and use basic phrases for immediate needs.

Core outcomes:
- Greetings, introductions, politeness
- Pronunciation basics and Spanish sounds
- Numbers, dates, time, colors
- Basic nouns and gender
- Articles: `el`, `la`, `un`, `una`
- Present-tense essentials: `ser`, `estar`, `tener`, `hay`
- Regular present-tense verbs
- Simple questions: `qué`, `quién`, `dónde`, `cuándo`, `cómo`
- Everyday survival phrases
- Family, food, home, weather, school, shopping

Suggested units:
- A1.1 Getting started
- A1.2 Talking about yourself
- A1.3 Everyday objects and needs
- A1.4 Simple present tense
- A1.5 Questions and answers
- A1.6 Survival conversations

### A2 - Elementary

Learner can handle routine tasks and simple exchanges.

Core outcomes:
- Present tense with more irregular verbs
- Reflexive verbs for routines
- Direct and indirect object pronouns
- Comparisons
- Commands for familiar situations
- Past intro: preterite of common verbs
- Travel, restaurants, directions, errands
- Expanding listening speed and phrase recognition

Suggested units:
- A2.1 Daily routines
- A2.2 Getting around town
- A2.3 Food, restaurants, and shopping
- A2.4 Talking about the past
- A2.5 Giving instructions and requests
- A2.6 Practical conversations

### B1 - Intermediate

Learner can describe experiences, plans, opinions, and common problems.

Core outcomes:
- Preterite vs imperfect
- Future and conditional basics
- Present perfect
- Subjunctive introduction for wishes and needs
- Storytelling and sequencing
- Opinions, agreement, disagreement
- Health, work, travel complications
- Longer listening and reading comprehension

Suggested units:
- B1.1 Telling stories
- B1.2 Past-tense contrast
- B1.3 Plans and predictions
- B1.4 Opinions and explanations
- B1.5 Problems and solutions
- B1.6 Longer conversations

### B2 - Upper intermediate

Learner can communicate with fluency on concrete and abstract topics.

Core outcomes:
- Subjunctive expansion
- Advanced pronouns and sentence structure
- Hypotheticals
- Passive and impersonal constructions
- Nuanced connectors
- Debate, persuasion, and explanation
- News, culture, professional topics
- Idioms and regional variation

Suggested units:
- B2.1 Complex conversations
- B2.2 Expressing nuance
- B2.3 Hypotheticals and conditions
- B2.4 Debate and persuasion
- B2.5 Culture and current events
- B2.6 Professional communication

### C1 - Advanced

Learner can express ideas fluently and flexibly.

Core outcomes:
- Register and tone
- Advanced idioms and collocations
- Dense reading/listening
- Argument structure
- Academic and professional Spanish
- Repair strategies when misunderstood
- Regional accents and colloquial speech

Suggested units:
- C1.1 Advanced fluency
- C1.2 Formal vs informal language
- C1.3 Abstract topics
- C1.4 Professional and academic Spanish
- C1.5 Regional Spanish
- C1.6 Long-form expression

### C2 - Mastery

Learner can understand virtually everything and express subtle meaning.

Core outcomes:
- Literary and rhetorical language
- Humor, irony, implication
- High-speed native listening
- Specialized vocabulary domains
- Translation and interpretation practice
- Natural reformulation and paraphrase

Suggested units:
- C2.1 Native-speed comprehension
- C2.2 Precision and nuance
- C2.3 Literature and media
- C2.4 Specialized domains
- C2.5 Translation challenges
- C2.6 Capstone mastery

## Curriculum hierarchy

Use four nested levels:

1. **CEFR level:** A1, A2, B1, B2, C1, C2
2. **Unit:** major topic or skill, such as `A1.2 Talking about yourself`
3. **Lesson:** one focused learning objective
4. **Sublevel:** one tiny teach/practice/check step

Example:

```text
A1
  Unit A1.2 - Talking about yourself
    Lesson A1.2.1 - Saying your name and origin
      Sublevel A1.2.1a - Learn phrases
      Sublevel A1.2.1b - Listen and identify
      Sublevel A1.2.1c - Speak your answer
      Sublevel A1.2.1d - Conversation check
```

## JSON-first design

Create a curriculum directory under `src\json-files\progressiveLearning`.

Recommended files:

```text
src\json-files\progressiveLearning
  curriculum-index.json
  placement-pretest.json
  levels
    a1.json
    a2.json
    b1.json
    b2.json
    c1.json
    c2.json
  lessons
    a1
      a1-1-1.json
      a1-1-2.json
```

### `curriculum-index.json`

Purpose: fast loading of path structure without loading every lesson.

```json
{
  "version": 1,
  "levels": [
    {
      "id": "a1",
      "label": "A1 Beginner",
      "description": "Use basic phrases for immediate needs.",
      "units": [
        {
          "id": "a1-1",
          "title": "Getting started",
          "lessonIds": ["a1-1-1", "a1-1-2"]
        }
      ]
    }
  ]
}
```

### Lesson JSON schema

Each lesson should be self-contained and simple.

```json
{
  "id": "a1-1-1",
  "level": "a1",
  "unitId": "a1-1",
  "title": "Greeting people",
  "canDo": "I can greet someone and say goodbye politely.",
  "estimatedMinutes": 6,
  "prerequisites": [],
  "targets": {
    "vocabulary": ["hola", "buenos dias", "adios"],
    "grammar": ["formal-vs-informal-greetings"],
    "skills": ["listening", "speaking", "reading"]
  },
  "sublevels": [
    {
      "id": "a1-1-1a",
      "type": "teach",
      "title": "Learn the core greetings",
      "blocks": [
        {
          "type": "explanation",
          "markdown": "Use **hola** for hello. Use **buenos dias** in the morning."
        },
        {
          "type": "examples",
          "items": [
            { "spanish": "Hola", "english": "Hello" },
            { "spanish": "Buenos dias", "english": "Good morning" }
          ]
        }
      ]
    },
    {
      "id": "a1-1-1b",
      "type": "practice",
      "game": "multiple-choice",
      "source": "lesson.words",
      "goal": { "correct": 4, "attempts": 5 }
    },
    {
      "id": "a1-1-1c",
      "type": "speaking",
      "prompt": "Say hello and goodbye.",
      "acceptedAnswers": ["Hola, adios", "Hola. Hasta luego."]
    },
    {
      "id": "a1-1-1d",
      "type": "mastery-check",
      "goal": { "scorePercent": 80 }
    }
  ],
  "content": {
    "words": [
      { "spanish": "Hola", "english": "Hello" }
    ],
    "conversations": [],
    "stories": [],
    "speaking": {
      "questions_and_answers": []
    }
  }
}
```

### Sublevel types

Support these JSON-driven sublevel types first:

| Type | Purpose |
| --- | --- |
| `teach` | Explanation, examples, tips, pronunciation notes |
| `guided-practice` | Low-pressure checks with hints |
| `game` | Existing games adapted to lesson content |
| `listening` | Audio recognition and dictation |
| `speaking` | Mic-based speaking challenge |
| `conversation` | Dialog with comprehension questions |
| `story` | Reading/listening sequence |
| `review` | Spaced review of older items |
| `mastery-check` | Pass/fail checkpoint for unlocks |

## Pretest design

The pretest should be adaptive and short enough to avoid fatigue.

### Pretest sections

| Section | What it measures |
| --- | --- |
| Vocabulary | Common words and phrases |
| Grammar | Articles, verb tense, pronouns, sentence structure |
| Listening | Can the learner recognize spoken Spanish? |
| Reading | Can the learner understand short passages? |
| Speaking | Optional mic check for pronunciation/recall |
| Confidence | Self-rating to avoid placing anxious learners too high |

### Adaptive strategy

1. Start with A1/A2 mixed questions.
2. If learner gets 80%+ correct, try harder B1 questions.
3. If learner struggles below 50%, stay at A1 and identify gaps.
4. Stop after enough confidence, around 15-25 questions.
5. Place the learner at the earliest level where prerequisites are weak.

### Placement output

Store:

```json
{
  "placedLevel": "a1",
  "placedUnitId": "a1-2",
  "placedLessonId": "a1-2-1",
  "skillScores": {
    "vocabulary": 0.72,
    "grammar": 0.48,
    "listening": 0.55,
    "reading": 0.68,
    "speaking": null
  },
  "recommendedFocus": ["grammar", "listening"]
}
```

## Progress and mastery model

Add localStorage-backed progress first, then later move to a more structured store if needed.

Suggested keys:

| Key | Value |
| --- | --- |
| `progressive:onboarded` | whether the intro/pretest has been completed |
| `progressive:placement` | placement result JSON |
| `progressive:currentLessonId` | current lesson |
| `progressive:sublevel:<id>` | completion/mastery data |
| `progressive:lesson:<id>` | aggregate lesson mastery |
| `progressive:reviewQueue` | due review items |

Mastery should account for:
- correctness
- number of attempts
- whether hints were used
- listening/speaking success separately from reading
- review success over time

Suggested scoring:

```text
mastery = weighted average of:
  50% recent correctness
  20% first-try success
  20% review retention
  10% skill coverage
```

Unlock rule:
- Pass a sublevel at 70%+ to continue.
- Pass a lesson at 80%+ to mark mastered.
- If below threshold, insert a support sublevel with extra teaching and easier practice.

## UI plan

### Progressive tab home

Show:
- current CEFR level and unit
- one big "Continue" button
- today's learning path cards
- review queue count
- placement/pretest status
- optional "browse path" accordion

Possible layout:

```text
Progressive Learning
A1 Beginner - Unit 2

[Continue: Asking simple questions]
5 min · teaches "donde", "que", "como"

Today
1. Review greetings
2. Learn question words
3. Listening game
4. Conversation check
```

### Lesson screen

Reuse existing card/game visual language:
- mascot at top
- short explanation block
- tap-to-hear examples
- "try it" interaction
- progress bar for current sublevel
- reward animation after completion

### Path map

Later enhancement:
- show levels as islands/worlds
- units as stops
- completed lessons as stars
- locked future lessons visible but not distracting

## Implementation phases

### Phase 1 - Planning and data foundation

- Add this feature plan.
- Add starter curriculum JSON schemas.
- Add a small A1 sample path with 2-3 lessons.
- Add placement pretest JSON with initial A1/A2 questions.

### Phase 2 - Progressive tab shell

- Add Progressive tab to bottom navigation.
- Add `ProgressiveLearningPage`.
- Load `curriculum-index.json`.
- Show current placement/current lesson or pretest prompt.
- Add localStorage helpers for progressive progress.

### Phase 3 - Lesson renderer

- Create a JSON-driven lesson renderer.
- Support `teach`, `examples`, `guided-practice`, and `mastery-check`.
- Reuse `SpeechButton`, `MultipleChoice`, `TextResponse`, `ProgressBar`, and `GameCompletionComponent`.

### Phase 4 - Pretest

- Render placement questions from JSON.
- Score by CEFR level and skill.
- Store placement result.
- Route learner to starting lesson.

### Phase 5 - Game integration

- Allow sublevels to invoke existing games against lesson-scoped content.
- Adapt `loadChapterContent` or create a parallel `loadProgressiveLessonContent`.
- Add game wrapper support for a supplied content object rather than only `chapterIndex`.

### Phase 6 - Review and mastery

- Add review queue and due review logic.
- Insert daily review before new lessons.
- Make completion update mastery and unlock next sublevel.

### Phase 7 - Full curriculum expansion

- Build complete A1 and A2 first.
- Add B1 once the renderer supports longer reading/listening and grammar teaching.
- Add B2-C2 after advanced lesson types exist: debate, long-form listening, paraphrase, idioms, register, and native-speed comprehension.

## Technical changes expected

New files/folders likely needed:

```text
src\progressive-learning-page.js
src\progressive
  progressiveStorage.js
  curriculumLoader.js
  placementEngine.js
  LessonRenderer.js
  SublevelRenderer.js
src\json-files\progressiveLearning
  curriculum-index.json
  placement-pretest.json
  levels\*.json
  lessons\**\*.json
```

Existing files likely touched:

| File | Change |
| --- | --- |
| `src\App.js` | Add Progressive navigation state and route |
| `src\bottom-navbar.js` | Add Progressive tab |
| `src\game-wrapper.js` | Eventually support lesson-scoped content |
| `src\games\*.js` | Accept injected content where useful |
| `src\utils\contentCache.js` | Add or parallel progressive content loader |
| `src\App.css` | Add progressive path styles |

## Content authoring rules

- Keep each lesson focused on one learner outcome.
- Every lesson needs at least one teaching sublevel before games.
- Examples should include both Spanish and English.
- Prefer useful phrases and realistic dialogs over isolated grammar drills.
- Mark each content item with optional tags later: `skill`, `cefr`, `grammar`, `topic`, `difficulty`.
- Avoid creating giant JSON files; split by level/unit/lesson.
- Keep answer indexes correct and JSON parseable.

## Risks and decisions

| Risk | Mitigation |
| --- | --- |
| Curriculum scope is huge | Build A1 vertical slice first, then expand level by level |
| Existing games assume chapter indexes | Introduce content injection instead of rewriting all games |
| Pretest may place users too high | Place conservatively and let users manually move easier/harder |
| Speaking recognition varies by browser | Make speaking useful but optional for placement |
| Too much JSON complexity | Start with simple schemas and evolve only when a lesson needs it |
| Learner still feels overwhelmed | Keep Progressive home focused on one primary next action |

## First vertical slice recommendation

Build this first:

1. Progressive tab shell.
2. A1 pretest with 15 questions.
3. A1 Unit 1 with three lessons:
   - Greetings and goodbyes
   - Saying your name and where you are from
   - Asking how someone is
4. Lesson renderer for teaching blocks, examples, multiple choice, listening, and mastery check.
5. Progress storage and next-action logic.

This gives the app a guided experience without needing the full CEFR curriculum immediately.
