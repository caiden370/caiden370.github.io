# El Camino game module

This folder is intentionally isolated from the rest of Masblo. The React app only imports `ElCaminoPage`; the game itself lives under `src\el-camino`.

## Structure

```text
src\el-camino
  ElCaminoPage.js          React wrapper, exit button, D-pad, status box
  el-camino.css           El Camino-only styles
  game
    createElCaminoGame.js Phaser game config
    ElCaminoScene.js      Movement, collision, area transitions, rendering
    levelLoader.js        Loads public area folders and validates map shape
  maps
    objectCatalog.js      Terrain/object/person definitions

public\el-camino\areas
  manifest.json
  001-plaza-hola
    area.json
    map.txt
  001-tienda-agua
    area.json
    map.txt
```

## Config-driven physical areas

Physical maps no longer live in game code. Each area is a folder under `public\el-camino\areas`, and `manifest.json` lists the folders to load:

```json
{
  "startingAreaId": "plaza-hola",
  "areas": ["001-plaza-hola", "001-aula-hola", "001-tienda-agua"]
}
```

Each folder has:

```text
area.json   metadata, objects, NPCs, entrances, exits, interactions
map.txt     terrain grid, one character per tile
```

Example `map.txt`:

```text
gggggggg
ggppppgg
ggpggpgg
ggppppgg
gggggggg
```

Example `area.json`:

```json
{
  "id": "example-village",
  "name": "Example Village",
  "kind": "outdoor",
  "region": "A1 Starter Region",
  "cefrLevel": "A1",
  "teaches": ["greetings", "food"],
  "legend": {
    "g": "grass",
    "p": "dirtPath",
    "w": "water"
  },
  "playerStart": { "x": 3, "y": 3, "facing": "down" },
  "objects": [
    { "type": "tree", "x": 1, "y": 1, "w": 1, "h": 1 }
  ],
  "people": [
    { "personId": "ana", "x": 4, "y": 3, "message": "Hola!" }
  ],
  "exits": []
}
```

`levelLoader.js` reads every folder from the manifest, loads `area.json` and `map.txt`, then calculates `width` and `height` from the map file. If map rows have inconsistent widths, the loader fails clearly.

The loader also expands maps for phone play:

- Outdoor areas are padded to at least `28x20` tiles.
- Interior areas are padded to at least `18x12` tiles.
- Player starts, NPCs, objects, exits, and entrance target coordinates are shifted automatically.

This keeps both vertical and horizontal phone layouts from feeling cramped or showing map edges too often, while still letting AI generate compact `map.txt` files.

## Config-driven missions

El Camino is built so future levels can be generated from config. NPCs and objects can define `interactions`, and the Phaser scene runs the first interaction whose `when` conditions match the player's saved progress.

```js
{
  personId: "isabel",
  x: 4,
  y: 4,
  interactions: [
    {
      when: { hasItems: [{ itemId: "milk", count: 1 }] },
      actions: [
        { type: "showDialogue", speaker: "Rosa", text: "¡Gracias! You brought la leche." },
        { type: "removeItem", itemId: "milk", count: 1 },
        { type: "completeMission", missionId: "buy-milk-for-rosa" }
      ]
    }
  ]
}
```

Supported condition fields:

- `completedSteps`
- `completedMissions`
- `missingSteps`
- `missingMissions`
- `hasItems`
- `missingItems`

Supported action types:

- `showDialogue`
- `askChoice`
- `askAudioChoice`
- `askText`
- `askSpeech`
- `addItem`
- `removeItem`
- `completeStep`
- `completeMission`
- `setFlag`

This powers collection missions, delivery missions, verifier NPCs, object pickups, gated routes, and simple quizzes without changing scene code. Multiple choice options are shuffled automatically by the engine.

## Current mission examples

- **First greetings**: Ana says `Buenos días`; listen to the audio and choose the correct greeting to earn a greeting badge.
- **Introduce yourself**: Mateo asks `¿Cómo te llamas?`; type `Me llamo estudiante.`
- **Buy water for Ana**: Ana asks for `agua`; buy it from Carlos by speaking `Quiero agua, por favor`, return it to Ana, then unlock Camino Hola.
- **Mercado Sol**: Lucía asks for `pan`; Emma the market clerk uses audio and speaking prompts, then Lucía verifies the item and asks the player to type `gracias`.

Store, restaurant, and service interactions should be attached to NPCs rather than shelves or counters so the player is talking to a person.

## AI level generation pattern

For 100+ levels, each level should provide:

1. A new folder under `public\el-camino\areas`.
2. An `area.json` config with `objects`, `people`, `exits`, `legend`, and learning metadata.
3. A `map.txt` terrain grid with consistent row widths.
4. A manifest entry in `public\el-camino\areas\manifest.json`.
5. Reusable object types from `objectCatalog.js`.
6. NPC/object `interactions` using only the condition/action language above.
7. Clear mission ids and step ids, such as `buy-milk-for-rosa` and `buy-milk-at-store`.
8. Gated exits using `requires`, for example:

```js
{
  x: 20,
  y: 23,
  targetArea: "camino-del-mercado",
  requires: { completedMissions: ["buy-milk-for-rosa"] },
  blockedMessage: "Help Rosa first."
}
```

Avoid adding custom scene code for a single level. If a new mission cannot be described with conditions and actions, add one reusable action type rather than hard-coding that mission.

## How areas connect

Every area has an `id` in its `area.json`. Outdoor buildings define an `entrance`:

```js
{
  type: "restaurant",
  x: 13,
  y: 12,
  w: 5,
  h: 3,
  entrance: {
    x: 15,
    y: 15,
    targetArea: "restaurante-sol",
    targetX: 5,
    targetY: 7
  }
}
```

Interior maps define `exits`:

```js
exits: [
  { x: 5, y: 8, targetArea: "pueblo-del-alba", targetX: 15, targetY: 16, facing: "down" }
]
```

The player changes area by walking onto an entrance/exit tile.

## Adding a new object type

1. Add it to `maps\objectCatalog.js` in `objectTypes`.
2. Place it in an area's `objects` array.
3. If it needs custom drawing, add a case in `ElCaminoScene.drawObjectByType`.

Reusable object types can be invoked from config with `{ "type": "<name>", "x": 1, "y": 1 }`. Most also support `w` for wider versions.

Common: `tree`, `fence`, `stoneWall`, `water`, `plant`, `sign`, `routeGate`, `questSparkle`, `itemSparkle`.

Buildings: `houseBlue`, `houseRed`, `houseGreen`, `restaurant`, `store`, `school`, `office`.

School/life stages: `chalkboard`, `whiteboard`, `bulletinBoard`, `locker`, `cubby`, `crayonBox`, `lunchTray`, `slide`, `swings`, `sportsGoal`, `gymMat`, `clubBooth`, `podium`.

Home/college/work: `table`, `desk`, `computerDesk`, `studyDesk`, `teacherDesk`, `chair`, `couch`, `bed`, `dormBed`, `meetingTable`, `interviewChair`, `printer`, `filingCabinet`.

Services/adult life: `counter`, `serviceCounter`, `hotelDesk`, `mailCounter`, `kitchenCounter`, `shelf`, `bookshelf`, `groceryShelf`, `supplyShelf`, `fridge`, `stove`, `atm`, `busStop`, `doctorBed`, `formDesk`, `taxFormDesk`, `passportDesk`, `queueRope`, `car`, `toolBench`.

Travel/family/community/future: `luggage`, `ticketKiosk`, `airportGate`, `taxiStand`, `menuBoard`, `birthdayTable`, `familyPhoto`, `crib`, `toyBox`, `grill`, `ballotBox`, `microphone`, `eventBooth`, `townBoard`, `suitcase`, `dreamBoard`, `skyline`.

## Adding a new area

1. Create `public\el-camino\areas\<numbered-area-name>`.
2. Add `area.json` and `map.txt`.
3. Add the folder name to `public\el-camino\areas\manifest.json`.
4. Connect it from another area with an `entrance` or `exit`.

Keep maps simple and tile-based. One character in `rows` equals one terrain tile. Objects/NPCs sit on top of terrain and handle collision.
