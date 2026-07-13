import Phaser from "phaser";
import { getObjectType, items, people, terrainTiles, TILE_SIZE } from "../maps/objectCatalog";
import { loadAreaConfigs } from "./levelLoader";
import { createDojoMenuAction } from "./dojoQuestionBanks";

const SAVE_KEY = "elCamino:save:v6";
const LEGACY_SAVE_KEY = "elCamino:save:v3";
const PLAYER_SPEED_MS = 36;
const PLAYER_STEP_TILES = 0.25;
const STARTING_INVENTORY = { coins: 5 };

const directionDeltas = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 }
};

const deskTypes = new Set(["computerDesk", "studyDesk", "teacherDesk", "formDesk", "taxFormDesk", "passportDesk", "examDesk"]);
const counterTypes = new Set(["serviceCounter", "hotelDesk", "mailCounter", "kitchenCounter"]);
const shelfTypes = new Set(["bookshelf", "groceryShelf", "supplyShelf"]);
const bedTypes = new Set(["dormBed", "doctorBed", "crib"]);
const wallBoardTypes = new Set(["chalkboard", "whiteboard", "bulletinBoard", "townBoard", "dreamBoard"]);
const schoolObjectTypes = new Set(["locker", "cubby", "crayonBox", "lunchTray", "clubBooth", "sportsGoal", "gymMat"]);
const playgroundTypes = new Set(["slide", "swings"]);
const officeObjectTypes = new Set(["podium", "printer", "meetingTable", "interviewChair", "filingCabinet", "queueRope", "ballotBox", "microphone", "eventBooth", "trophyCase", "labTable", "labSink", "vendingMachine", "schoolBell"]);
const lifeObjectTypes = new Set(["fridge", "stove", "atm", "busStop", "doctorBed", "birthdayTable", "familyPhoto", "toyBox", "grill", "car", "toolBench", "campusFountain", "bikeRack", "laundryMachine", "coffeeMachine"]);
const travelObjectTypes = new Set(["luggage", "ticketKiosk", "airportGate", "taxiStand", "menuBoard", "suitcase", "skyline"]);
const sparkleTypes = new Set(["questSparkle", "itemSparkle"]);
const dojoObjectTypes = new Set(["dojoBanner", "trainingDummy", "weaponRack"]);

function normalizeAnswer(answer = "") {
  return answer
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function shuffleOptions(options) {
  return options
    .map((option, index) => ({ ...option, index, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ sort, ...option }) => option);
}

function getAreaStart(areas, areaId) {
  const area = areas[areaId];
  return { areaId, ...area.playerStart };
}

function getAreaChapterId(area) {
  return area?.chapterId || area?.id;
}

function getTerrainColorHex(terrainName) {
  const color = terrainTiles[terrainName]?.color ?? terrainTiles.grass.color;
  return `#${color.toString(16).padStart(6, "0")}`;
}

function normalizePosition(position, areas) {
  if (!position?.areaId || !areas[position.areaId] || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
    return null;
  }

  return {
    areaId: position.areaId,
    x: position.x,
    y: position.y,
    facing: position.facing || "down"
  };
}

function normalizeChapterPositions(chapterPositions = {}, areas) {
  return Object.fromEntries(
    Object.entries(chapterPositions)
      .map(([chapterId, position]) => [chapterId, normalizePosition(position, areas)])
      .filter(([, position]) => position)
  );
}

function readSave(areas, startingAreaId) {
  try {
    const save = JSON.parse(localStorage.getItem(SAVE_KEY));
    const current = normalizePosition(save?.current, areas);
    if (current) {
      return {
        current,
        chapterPositions: normalizeChapterPositions(save.chapterPositions, areas),
        progress: normalizeProgress(save.progress)
      };
    }
  } catch (error) {
    console.warn("Unable to read El Camino save:", error);
  }

  try {
    const legacySave = JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY));
    const legacyPosition = normalizePosition(legacySave, areas);
    if (legacyPosition) {
      const chapterId = getAreaChapterId(areas[legacyPosition.areaId]);
      return {
        current: getAreaStart(areas, startingAreaId),
        chapterPositions: { [chapterId]: legacyPosition },
        progress: normalizeProgress(legacySave.progress)
      };
    }
  } catch (error) {
    console.warn("Unable to read legacy El Camino save:", error);
  }

  return {
    current: getAreaStart(areas, startingAreaId),
    chapterPositions: {},
    progress: normalizeProgress()
  };
}

function writeSave(save) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function normalizeProgress(progress = {}) {
  return {
    inventory: { ...STARTING_INVENTORY, ...(progress.inventory || {}) },
    completedSteps: progress.completedSteps || [],
    completedMissions: progress.completedMissions || [],
    flags: progress.flags || {}
  };
}

function getPerson(personId) {
  return people.find((person) => person.id === personId) || people[0];
}

export default class ElCaminoScene extends Phaser.Scene {
  constructor() {
    super("ElCaminoScene");
    this.areas = null;
    this.startingAreaId = null;
    this.currentArea = null;
    this.blocked = new Set();
    this.entrances = new Map();
    this.lockedEntranceMarkers = [];
    this.peopleByPosition = new Map();
    this.objectsByPosition = new Map();
    this.progress = normalizeProgress();
    this.chapterPositions = {};
    this.pendingChoice = null;
    this.playerTile = { x: 0, y: 0, facing: "down" };
    this.playerParts = null;
    this.playerWalkFrame = 0;
    this.isMoving = false;
    this.pendingMoveDirection = null;
  }

  create() {
    this.cameras.main.setBackgroundColor("#111827");
    this.game.events.on("el-camino-move", this.movePlayer, this);
    this.game.events.on("el-camino-reset", this.resetPlayer, this);
    this.game.events.on("el-camino-return-home", this.returnHome, this);
    this.game.events.on("el-camino-choice", this.handleChoice, this);
    this.game.events.on("el-camino-answer", this.handleAnswer, this);
    this.scale.on("resize", this.handleResize, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
    this.cursors = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT
    }, false);

    this.emitStatus(null);
    this.loadConfiguredAreas();
  }

  update() {
    if (!this.areas) return;
    if (this.cursors.up.isDown) this.movePlayer("up");
    else if (this.cursors.down.isDown) this.movePlayer("down");
    else if (this.cursors.left.isDown) this.movePlayer("left");
    else if (this.cursors.right.isDown) this.movePlayer("right");
  }

  loadArea(areaId, playerX, playerY, facing = "down") {
    const area = this.areas[areaId] || this.areas[this.startingAreaId];
    this.currentArea = area;
    this.blocked = new Set();
    this.entrances = new Map();
    this.clearLockedEntranceMarkers();
    this.peopleByPosition = new Map();
    this.objectsByPosition = new Map();
    this.pendingChoice = null;
    this.isMoving = false;
    this.pendingMoveDirection = null;

    this.children.removeAll();
    this.drawTerrain(area);
    this.drawObjects(area);
    this.drawPeople(area);
    this.refreshLockedEntranceMarkers();
    const safeSpawn = this.resolveSafeSpawn(playerX, playerY);
    this.createPlayer(safeSpawn.x, safeSpawn.y, facing);

    // this.cameras.main.setBounds(0, 0, area.width * TILE_SIZE, area.height * TILE_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.2, 0.2);
    this.updateCameraForViewport();

    this.saveGame({ areaId: area.id, x: safeSpawn.x, y: safeSpawn.y, facing });
    this.emitStatus(null);
    this.emitProgress();
  }

  handleResize(gameSize) {
    this.cameras.main.setSize(gameSize.width, gameSize.height);
    this.updateCameraForViewport(gameSize.width, gameSize.height);
  }

  updateCameraForViewport(width = this.scale.width, height = this.scale.height) {
    const shortestSide = Math.min(width, height);
    const isPortrait = height >= width;
    let zoom = isPortrait ? 1.05 : 1.15;
    if (shortestSide >= 520) zoom = isPortrait ? 1.18 : 1.28;
    if (shortestSide >= 760) zoom = isPortrait ? 1.35 : 1.48;
    if (shortestSide >= 1100) zoom = 1.7;
    this.cameras.main.setZoom(zoom);
  }

  drawTerrain(area) {
    area.rows.forEach((row, y) => {
      row.split("").forEach((tileKey, x) => {
        const terrainName = area.legend[tileKey] || "grass";
        const terrain = terrainTiles[terrainName] || terrainTiles.grass;
        this.add.rectangle(
          x * TILE_SIZE,
          y * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE,
          terrain.color
        ).setOrigin(0);

        this.addTerrainDetails(terrainName, x, y);
        if (!terrain.walkable) {
          this.blocked.add(this.positionKey(x, y));
        }
      });
    });
  }

  addTerrainDetails(terrainName, x, y) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    if (terrainName === "grass") {
      if ((x + y) % 3 === 0) {
        this.add.rectangle(px + 7, py + 22, 2, 6, 0x3f9140).setOrigin(0);
        this.add.rectangle(px + 9, py + 20, 2, 7, 0x5eaf50).setOrigin(0);
      }
      if ((x * 3 + y) % 7 === 0) {
        this.add.rectangle(px + 22, py + 8, 2, 5, 0x3f9140).setOrigin(0);
        this.add.rectangle(px + 19, py + 11, 5, 2, 0x5eaf50).setOrigin(0);
      }
    }
    if (terrainName === "flowerGrass") {
      this.add.rectangle(px + 10, py + 11, 2, 7, 0x3f9140).setOrigin(0);
      this.add.rectangle(px + 8, py + 9, 6, 5, 0xffdc6f).setOrigin(0);
      this.add.rectangle(px + 10, py + 10, 2, 2, 0xffffff).setOrigin(0);
      this.add.rectangle(px + 23, py + 21, 2, 7, 0x3f9140).setOrigin(0);
      this.add.rectangle(px + 21, py + 19, 6, 5, 0xff86b7).setOrigin(0);
    }
    if (terrainName === "dirtPath") {
      this.add.rectangle(px + 3, py + 9, 5, 3, 0xa96c37).setOrigin(0).setAlpha(0.45);
      this.add.rectangle(px + 20, py + 22, 6, 3, 0xa96c37).setOrigin(0).setAlpha(0.35);
    }
    if (terrainName === "water") {
      this.add.rectangle(px + 5, py + 9, 14, 3, 0x8ed8ff).setOrigin(0).setAlpha(0.65);
      this.add.rectangle(px + 14, py + 22, 13, 3, 0x8ed8ff).setOrigin(0).setAlpha(0.55);
      this.add.rectangle(px + 1, py + 29, 18, 2, 0x247ab0).setOrigin(0).setAlpha(0.55);
    }
    if (terrainName === "woodFloor") {
      this.add.rectangle(px, py + 15, TILE_SIZE, 2, 0xa96c37).setOrigin(0).setAlpha(0.55);
      this.add.rectangle(px + ((x + y) % 2 ? 6 : 20), py + 4, 9, 2, 0xe0a66c).setOrigin(0).setAlpha(0.5);
    }
    if (terrainName === "tatamiFloor") {
      this.add.rectangle(px, py, TILE_SIZE, 1, 0xb09b62).setOrigin(0).setAlpha(0.65);
      this.add.rectangle(px, py + TILE_SIZE - 2, TILE_SIZE, 2, 0xf0e3b3).setOrigin(0).setAlpha(0.55);
      if ((x + y) % 2 === 0) {
        this.add.rectangle(px + 15, py + 3, 2, TILE_SIZE - 6, 0xc5b276).setOrigin(0).setAlpha(0.4);
      }
    }
    if (terrainName === "stoneFloor") {
      this.add.rectangle(px, py, TILE_SIZE, 1, 0x8f918b).setOrigin(0).setAlpha(0.35);
      this.add.rectangle(px, py + TILE_SIZE - 1, TILE_SIZE, 1, 0xffffff).setOrigin(0).setAlpha(0.2);
    }
    if (terrainName === "asphalt") {
      this.add.rectangle(px + 4, py + 15, 7, 2, 0x7d8aa2).setOrigin(0).setAlpha(0.45);
      this.add.rectangle(px + 20, py + 9, 5, 2, 0x7d8aa2).setOrigin(0).setAlpha(0.35);
    }
    if (terrainName === "track") {
      this.add.rectangle(px, py + 5, TILE_SIZE, 2, 0xffd166).setOrigin(0).setAlpha(0.35);
      this.add.rectangle(px, py + 22, TILE_SIZE, 2, 0xffd166).setOrigin(0).setAlpha(0.35);
    }
    if (terrainName === "campusStone") {
      this.add.rectangle(px + 3, py + 3, 10, 10, 0xb7b7ad).setOrigin(0).setAlpha(0.45);
      this.add.rectangle(px + 18, py + 17, 10, 9, 0xb7b7ad).setOrigin(0).setAlpha(0.35);
    }
  }

  drawObjects(area) {
    area.objects?.forEach((object) => {
      const type = getObjectType(object.type);
      const width = object.w || 1;
      const height = object.h || 1;
      this.drawObjectByType(object, type, width, height);

      for (let y = object.y; y < object.y + height; y++) {
        for (let x = object.x; x < object.x + width; x++) {
          const key = this.positionKey(x, y);
          this.objectsByPosition.set(key, object);
          if (type.walkable === false && object.walkable !== true) {
            this.blocked.add(key);
          }
        }
      }

      if (object.entrance) {
        const entrance = object.entrance;
        const entranceKey = this.positionKey(entrance.x, entrance.y);
        this.entrances.set(entranceKey, entrance);
        this.blocked.delete(entranceKey);
      }
    });

    area.exits?.forEach((exit) => {
      const exitKey = this.positionKey(exit.x, exit.y);
      this.entrances.set(exitKey, exit);
      this.blocked.delete(exitKey);
      this.add.rectangle(exit.x * TILE_SIZE + 8, exit.y * TILE_SIZE + 22, 16, 5, 0x30291e).setOrigin(0);
    });
  }

  clearLockedEntranceMarkers() {
    this.lockedEntranceMarkers?.forEach((marker) => marker.destroy());
    this.lockedEntranceMarkers = [];
  }

  refreshLockedEntranceMarkers() {
    this.clearLockedEntranceMarkers();
    this.entrances.forEach((entrance) => {
      if (entrance?.targetArea && entrance.requires && !this.matchesConditions(entrance.requires)) {
        this.drawLockedEntranceMarker(entrance.x, entrance.y);
      }
    });
  }

  drawLockedEntranceMarker(x, y) {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;
    const marker = this.add.container(px, py);
    marker.setDepth(20);
    marker.add(this.add.rectangle(16, 16, 25, 25, 0xfff7cf, 0.94).setStrokeStyle(3, 0x111827));
    marker.add(this.add.rectangle(10, 14, 12, 9, 0xdc2626).setOrigin(0));
    marker.add(this.add.rectangle(12, 9, 8, 8, 0xfff7cf).setOrigin(0).setStrokeStyle(3, 0xdc2626));
    marker.add(this.add.rectangle(15, 17, 2, 4, 0xfff7cf).setOrigin(0));
    marker.add(this.add.text(16, 30, "LOCKED", {
      color: "#111827",
      fontFamily: "monospace",
      fontSize: "6px",
      fontStyle: "bold"
    }).setOrigin(0.5));
    this.lockedEntranceMarkers.push(marker);
  }

  drawObjectByType(object, type, width, height) {
    const px = object.x * TILE_SIZE;
    const py = object.y * TILE_SIZE;
    const pixelWidth = width * TILE_SIZE;
    const pixelHeight = height * TILE_SIZE;

    if (object.type.startsWith("house") || ["restaurant", "store", "school", "office", "gym", "dojo", "library", "dorm", "auditorium"].includes(object.type)) {
      this.drawBuilding(object, type, pixelWidth, pixelHeight);
      return;
    }

    if (object.type === "tree") {
      this.add.ellipse(px + 16, py + 26, 20, 7, 0x1f5f2a, 0.25);
      this.add.rectangle(px + 11, py + 16, 10, 15, 0x765136).setOrigin(0).setStrokeStyle(1, 0x3f2512);
      this.add.rectangle(px + 13, py + 16, 4, 15, 0x9a6733).setOrigin(0);
      this.add.rectangle(px + 4, py + 8, 24, 16, 0x2f8f3b).setOrigin(0).setStrokeStyle(2, 0x174e25);
      this.add.rectangle(px + 8, py + 3, 17, 22, 0x24722e).setOrigin(0).setStrokeStyle(1, 0x174e25);
      this.add.rectangle(px + 12, py, 10, 10, 0x65b65b).setOrigin(0).setStrokeStyle(1, 0x24722e);
      this.add.rectangle(px + 6, py + 13, 4, 4, 0x8ed16f).setOrigin(0);
      return;
    }

    if (object.type === "fence") {
      for (let i = 0; i < width; i++) {
        const x = px + i * TILE_SIZE;
        this.add.rectangle(x + 4, py + 7, 6, 22, 0x7a4f24).setOrigin(0);
        this.add.rectangle(x + 5, py + 7, 3, 22, 0xb98245).setOrigin(0);
        this.add.rectangle(x + 20, py + 7, 6, 22, 0x7a4f24).setOrigin(0);
        this.add.rectangle(x + 21, py + 7, 3, 22, 0xb98245).setOrigin(0);
        this.add.rectangle(x, py + 14, TILE_SIZE, 5, 0x8a5b2c).setOrigin(0);
        this.add.rectangle(x, py + 18, TILE_SIZE, 3, 0xd09a58).setOrigin(0);
      }
      return;
    }

    if (object.type === "stoneWall") {
      this.add.rectangle(px, py + 8, pixelWidth, 18, 0x59636c).setOrigin(0);
      this.add.rectangle(px, py + 6, pixelWidth, 5, 0xaeb6bd).setOrigin(0);
      for (let i = 0; i < width; i++) {
        const x = px + i * TILE_SIZE;
        this.add.rectangle(x + 2, py + 11, 12, 5, 0x87919a).setOrigin(0);
        this.add.rectangle(x + 17, py + 11, 12, 5, 0x6c7680).setOrigin(0);
        this.add.rectangle(x + 8, py + 19, 14, 4, 0x7f8992).setOrigin(0);
        this.add.rectangle(x + 24, py + 20, 6, 3, 0x424b54).setOrigin(0);
      }
      return;
    }

    if (object.type === "table") {
      this.drawTable(px, py, pixelWidth);
      return;
    }

    if (object.type === "bench") {
      this.drawBench(px, py, pixelWidth);
      return;
    }

    if (object.type === "desk") {
      this.drawDesk(px, py, pixelWidth);
      return;
    }

    if (deskTypes.has(object.type)) {
      this.drawSpecialDesk(object.type, px, py, pixelWidth);
      return;
    }

    if (object.type === "chair") {
      this.drawChair(px, py);
      return;
    }

    if (object.type === "counter") {
      this.drawCounter(px, py, pixelWidth);
      return;
    }

    if (counterTypes.has(object.type)) {
      this.drawSpecialCounter(object.type, px, py, pixelWidth);
      return;
    }

    if (object.type === "shelf") {
      this.drawShelf(px, py, pixelWidth);
      return;
    }

    if (shelfTypes.has(object.type)) {
      this.drawSpecialShelf(object.type, px, py, pixelWidth);
      return;
    }

    if (object.type === "couch") {
      this.drawCouch(px, py, pixelWidth);
      return;
    }

    if (object.type === "bed") {
      this.drawBed(px, py, pixelWidth);
      return;
    }

    if (bedTypes.has(object.type)) {
      this.drawSpecialBed(object.type, px, py, pixelWidth);
      return;
    }

    if (object.type === "plant") {
      this.drawPlant(px, py);
      return;
    }

    if (object.type === "sign") {
      this.drawSign(px, py);
      return;
    }

    if (wallBoardTypes.has(object.type)) {
      this.drawWallBoard(object.type, px, py, pixelWidth);
      return;
    }

    if (schoolObjectTypes.has(object.type)) {
      this.drawSchoolObject(object.type, px, py, pixelWidth);
      return;
    }

    if (playgroundTypes.has(object.type)) {
      this.drawPlaygroundObject(object.type, px, py, pixelWidth);
      return;
    }

    if (officeObjectTypes.has(object.type)) {
      this.drawOfficeObject(object.type, px, py, pixelWidth);
      return;
    }

    if (lifeObjectTypes.has(object.type)) {
      this.drawLifeObject(object.type, px, py, pixelWidth);
      return;
    }

    if (travelObjectTypes.has(object.type)) {
      this.drawTravelObject(object.type, px, py, pixelWidth);
      return;
    }

    if (sparkleTypes.has(object.type)) {
      this.drawSparkle(object.type, px, py);
      return;
    }

    if (dojoObjectTypes.has(object.type)) {
      this.drawDojoObject(object.type, px, py, pixelWidth);
      return;
    }

    if (object.type === "routeGate") {
      this.drawRouteGate(px, py);
      return;
    }

    this.drawCrateObject(px, py, pixelWidth, pixelHeight, type.color);
  }

  drawBuilding(object, type, pixelWidth, pixelHeight) {
    const px = object.x * TILE_SIZE;
    const py = object.y * TILE_SIZE;
    const roofColor = object.type === "restaurant" ? 0xffb23f : object.type === "store" ? 0xc995ee : object.type === "school" ? 0xf0c84b : object.type === "gym" ? 0xe67e22 : object.type === "dojo" ? 0xc92a2a : object.type === "library" ? 0x4f8fd8 : object.type === "dorm" ? 0x50a96b : object.type === "auditorium" ? 0x9b59b6 : type.color;
    const wallColor = object.type === "office" ? 0xd5dbe7 : object.type === "gym" ? 0xf2c078 : object.type === "dojo" ? 0xfff4d8 : object.type === "library" ? 0xd9f2ff : object.type === "dorm" ? 0xd9f5dc : object.type === "auditorium" ? 0xe7d8f6 : 0xf3dfaa;
    const trimColor = object.type === "restaurant" ? 0xb64c2e : object.type === "store" ? 0x6d3d91 : object.type === "gym" ? 0x8d5524 : object.type === "dojo" ? 0x5f1717 : object.type === "library" ? 0x2f66d0 : object.type === "dorm" ? 0x24722e : object.type === "auditorium" ? 0x5b2c83 : 0x6b3f24;

    this.add.ellipse(px + pixelWidth / 2, py + pixelHeight - 1, pixelWidth - 8, 12, 0x111827, 0.18);
    this.add.rectangle(px + 2, py + 16, pixelWidth - 4, pixelHeight - 15, 0x9f7a4f).setOrigin(0);
    this.add.rectangle(px + 4, py + 14, pixelWidth - 8, pixelHeight - 15, wallColor).setOrigin(0);
    this.add.rectangle(px + 2, py + 10, pixelWidth - 4, 8, trimColor).setOrigin(0);
    this.add.rectangle(px + 6, py, pixelWidth - 12, 12, roofColor).setOrigin(0);
    this.add.rectangle(px + 2, py + 8, pixelWidth - 4, 8, roofColor).setOrigin(0);
    this.add.rectangle(px + 8, py + 3, pixelWidth - 16, 3, 0xffffff).setOrigin(0).setAlpha(0.18);

    const doorX = object.entrance ? object.entrance.x * TILE_SIZE + 10 : px + Math.floor(pixelWidth / 2) - 7;
    this.add.rectangle(doorX, py + pixelHeight - 22, 14, 20, 0x6b3f24).setOrigin(0);
    this.add.rectangle(doorX + 9, py + pixelHeight - 11, 2, 2, 0xffd166).setOrigin(0);

    this.add.rectangle(px + 8, py + 27, 12, 11, 0x90c9f6).setOrigin(0);
    this.add.rectangle(px + 10, py + 29, 8, 7, 0xd9f2ff).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 20, py + 27, 12, 11, 0x90c9f6).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 18, py + 29, 8, 7, 0xd9f2ff).setOrigin(0);

    if (object.type === "restaurant") {
      this.add.rectangle(px + 10, py + 17, pixelWidth - 20, 7, 0xfff2bf).setOrigin(0);
      this.add.rectangle(px + 14, py + 19, pixelWidth - 28, 3, 0xb64c2e).setOrigin(0);
    }

    if (object.type === "store") {
      this.add.rectangle(px + 10, py + 17, pixelWidth - 20, 7, 0xf5df8f).setOrigin(0);
      for (let x = px + 12; x < px + pixelWidth - 14; x += 12) {
        this.add.rectangle(x, py + 17, 6, 7, ((x - px) / 12) % 2 === 0 ? 0xffffff : 0xc995ee).setOrigin(0);
      }
    }

    if (object.type === "school") {
      this.add.rectangle(px + pixelWidth / 2 - 8, py + 16, 16, 9, 0x2f66d0).setOrigin(0);
      this.add.rectangle(px + pixelWidth / 2 - 5, py + 18, 10, 2, 0xffffff).setOrigin(0);
    }

    if (object.type === "gym") {
      this.add.rectangle(px + 10, py + 18, pixelWidth - 20, 4, 0xffffff).setOrigin(0);
      this.add.rectangle(px + 12, py + 24, 10, 10, 0xb64c2e).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 22, py + 24, 10, 10, 0xb64c2e).setOrigin(0);
    }

    if (object.type === "dojo") {
      this.add.rectangle(px + 9, py + 17, pixelWidth - 18, 8, 0xfff7cf).setOrigin(0).setStrokeStyle(1, 0x5f1717);
      this.add.rectangle(px + pixelWidth / 2 - 8, py + 19, 16, 3, 0xc92a2a).setOrigin(0);
      this.add.rectangle(px + 7, py + 28, 4, 10, 0x5f1717).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 11, py + 28, 4, 10, 0x5f1717).setOrigin(0);
    }

    if (object.type === "library") {
      this.add.rectangle(px + 10, py + 17, pixelWidth - 20, 6, 0xf5df8f).setOrigin(0);
      this.add.rectangle(px + 15, py + 19, pixelWidth - 30, 2, 0x2f66d0).setOrigin(0);
    }

    if (object.type === "dorm") {
      for (let x = px + 11; x < px + pixelWidth - 12; x += 18) {
        this.add.rectangle(x, py + 18, 10, 10, 0x90c9f6).setOrigin(0);
      }
    }

    if (object.entrance) {
      this.add.rectangle(object.entrance.x * TILE_SIZE + 8, object.entrance.y * TILE_SIZE + 2, 16, 8, 0xd9a257).setOrigin(0);
      this.add.rectangle(object.entrance.x * TILE_SIZE + 9, object.entrance.y * TILE_SIZE + 3, 14, 3, 0xf5c26b).setOrigin(0);
    }
  }

  drawTable(px, py, pixelWidth) {
    this.add.ellipse(px + pixelWidth / 2, py + 25, pixelWidth - 8, 7, 0x111827, 0.16);
    this.add.rectangle(px + 4, py + 9, pixelWidth - 8, 13, 0x6d421f).setOrigin(0).setStrokeStyle(1, 0x3f2512);
    this.add.rectangle(px + 6, py + 7, pixelWidth - 12, 10, 0xa96c37).setOrigin(0).setStrokeStyle(1, 0x5d3519);
    this.add.rectangle(px + 9, py + 9, pixelWidth - 18, 2, 0xd09a58).setOrigin(0);
    this.add.rectangle(px + 10, py + 17, 5, 10, 0x5d3519).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 15, py + 17, 5, 10, 0x5d3519).setOrigin(0);
  }

  drawBench(px, py, pixelWidth) {
    this.add.rectangle(px + 3, py + 12, pixelWidth - 6, 6, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 5, py + 9, pixelWidth - 10, 4, 0xc98b50).setOrigin(0);
    this.add.rectangle(px + 8, py + 18, 4, 10, 0x5d3519).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 12, py + 18, 4, 10, 0x5d3519).setOrigin(0);
  }

  drawDesk(px, py, pixelWidth) {
    this.add.rectangle(px + 3, py + 8, pixelWidth - 6, 16, 0x5b371c).setOrigin(0);
    this.add.rectangle(px + 5, py + 6, pixelWidth - 10, 9, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 8, py + 15, pixelWidth - 16, 2, 0xc98b50).setOrigin(0);
    this.add.rectangle(px + 8, py + 19, 8, 4, 0x3f2512).setOrigin(0);
  }

  drawChair(px, py) {
    this.add.rectangle(px + 9, py + 6, 14, 8, 0x61432a).setOrigin(0).setStrokeStyle(1, 0x3f2512);
    this.add.rectangle(px + 8, py + 13, 16, 10, 0x8d5524).setOrigin(0).setStrokeStyle(1, 0x3f2512);
    this.add.rectangle(px + 11, py + 15, 10, 2, 0xc98b50).setOrigin(0);
    this.add.rectangle(px + 10, py + 22, 4, 7, 0x3f2512).setOrigin(0);
    this.add.rectangle(px + 19, py + 22, 4, 7, 0x3f2512).setOrigin(0);
  }

  drawCounter(px, py, pixelWidth) {
    this.add.rectangle(px + 2, py + 7, pixelWidth - 4, 21, 0x9a8f72).setOrigin(0).setStrokeStyle(1, 0x5d5a49);
    this.add.rectangle(px + 4, py + 5, pixelWidth - 8, 9, 0xf0e7bf).setOrigin(0).setStrokeStyle(1, 0x8d8468);
    this.add.rectangle(px + 6, py + 16, pixelWidth - 12, 3, 0xd7d0b1).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 18, py + 8, 10, 5, 0x90c9f6).setOrigin(0);
  }

  drawShelf(px, py, pixelWidth) {
    this.add.rectangle(px + 4, py + 5, pixelWidth - 8, 24, 0x6d421f).setOrigin(0);
    this.add.rectangle(px + 6, py + 7, pixelWidth - 12, 4, 0xb98245).setOrigin(0);
    this.add.rectangle(px + 6, py + 17, pixelWidth - 12, 4, 0xb98245).setOrigin(0);
    for (let x = px + 9; x < px + pixelWidth - 8; x += 9) {
      this.add.rectangle(x, py + 11, 5, 6, 0xffd166).setOrigin(0);
      this.add.rectangle(x + 1, py + 21, 4, 5, 0x8ed16f).setOrigin(0);
    }
  }

  drawCouch(px, py, pixelWidth) {
    this.add.rectangle(px + 3, py + 10, pixelWidth - 6, 16, 0x375ea8).setOrigin(0);
    this.add.rectangle(px + 5, py + 6, pixelWidth - 10, 12, 0x6b8fd6).setOrigin(0);
    this.add.rectangle(px + 7, py + 18, 10, 8, 0x5575bd).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 17, py + 18, 10, 8, 0x5575bd).setOrigin(0);
  }

  drawBed(px, py, pixelWidth) {
    this.add.rectangle(px + 3, py + 8, pixelWidth - 6, 20, 0x7b4f2d).setOrigin(0);
    this.add.rectangle(px + 5, py + 10, pixelWidth - 10, 15, 0xefefdc).setOrigin(0);
    this.add.rectangle(px + 6, py + 11, 11, 8, 0xbcd9ff).setOrigin(0);
    this.add.rectangle(px + 18, py + 13, pixelWidth - 25, 10, 0xf3b6ac).setOrigin(0);
  }

  drawPlant(px, py) {
    this.add.rectangle(px + 11, py + 19, 10, 10, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 13, py + 17, 6, 3, 0xc98b50).setOrigin(0);
    this.add.rectangle(px + 9, py + 10, 7, 10, 0x36a853).setOrigin(0);
    this.add.rectangle(px + 16, py + 7, 7, 12, 0x2f8f3b).setOrigin(0);
    this.add.rectangle(px + 12, py + 4, 8, 9, 0x65b65b).setOrigin(0);
  }

  drawSign(px, py) {
    this.add.rectangle(px + 14, py + 17, 4, 13, 0x6b3f24).setOrigin(0);
    this.add.rectangle(px + 5, py + 6, 22, 14, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 7, py + 8, 18, 10, 0xfff2bf).setOrigin(0);
    this.add.rectangle(px + 10, py + 11, 12, 2, 0x6b3f24).setOrigin(0);
    this.add.rectangle(px + 11, py + 15, 10, 1, 0x6b3f24).setOrigin(0);
  }

  drawSpecialDesk(type, px, py, pixelWidth) {
    this.drawDesk(px, py, pixelWidth);
    if (["computerDesk", "studyDesk"].includes(type)) {
      this.add.rectangle(px + pixelWidth - 20, py + 3, 14, 10, 0x26334c).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 18, py + 5, 10, 6, 0x8ed8ff).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 16, py + 14, 6, 3, 0x26334c).setOrigin(0);
    }
    if (type === "teacherDesk") {
      this.add.rectangle(px + 8, py + 3, 11, 6, 0xf5df8f).setOrigin(0);
      this.add.rectangle(px + 10, py + 5, 7, 1, 0x6b3f24).setOrigin(0);
    }
    if (["formDesk", "taxFormDesk", "passportDesk"].includes(type)) {
      this.add.rectangle(px + 7, py + 3, 16, 12, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + 10, py + 6, 10, 1, 0x34495e).setOrigin(0);
      this.add.rectangle(px + 10, py + 10, 8, 1, 0x34495e).setOrigin(0);
      if (type === "passportDesk") this.add.rectangle(px + pixelWidth - 15, py + 6, 8, 6, 0x2f66d0).setOrigin(0);
    }
  }

  drawSpecialCounter(type, px, py, pixelWidth) {
    this.drawCounter(px, py, pixelWidth);
    const accent = type === "hotelDesk" ? 0xffd166 : type === "mailCounter" ? 0xb64c2e : type === "kitchenCounter" ? 0x8ed16f : 0x90c9f6;
    this.add.rectangle(px + 8, py + 8, 12, 6, accent).setOrigin(0);
    if (type === "hotelDesk") this.add.rectangle(px + pixelWidth - 18, py + 4, 10, 9, 0xf5df8f).setOrigin(0);
    if (type === "mailCounter") this.add.rectangle(px + pixelWidth - 19, py + 9, 12, 8, 0xf5f7fa).setOrigin(0);
    if (type === "kitchenCounter") this.add.rectangle(px + pixelWidth - 20, py + 4, 13, 8, 0xd9f2ff).setOrigin(0);
  }

  drawSpecialShelf(type, px, py, pixelWidth) {
    this.drawShelf(px, py, pixelWidth);
    const colors = type === "bookshelf" ? [0x2f66d0, 0xe74c3c, 0xf0c84b] : type === "groceryShelf" ? [0x8ed16f, 0xff86b7, 0xffd166] : [0xf5f7fa, 0x2f66d0, 0xffd166];
    for (let x = px + 8; x < px + pixelWidth - 8; x += 8) {
      this.add.rectangle(x, py + 10, 4, 7, colors[((x - px) / 8) % colors.length]).setOrigin(0);
      this.add.rectangle(x + 1, py + 21, 5, 5, colors[(((x - px) / 8) + 1) % colors.length]).setOrigin(0);
    }
  }

  drawSpecialBed(type, px, py, pixelWidth) {
    this.drawBed(px, py, pixelWidth);
    if (type === "dormBed") {
      this.add.rectangle(px + pixelWidth - 13, py + 4, 8, 22, 0x8d5524).setOrigin(0);
    }
    if (type === "doctorBed") {
      this.add.rectangle(px + 4, py + 11, pixelWidth - 8, 13, 0xd9f2ff).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 12, py + 24, 8, 5, 0x5d6673).setOrigin(0);
    }
    if (type === "crib") {
      for (let x = px + 5; x < px + pixelWidth - 4; x += 7) {
        this.add.rectangle(x, py + 8, 3, 19, 0xf5df8f).setOrigin(0);
      }
    }
  }

  drawWallBoard(type, px, py, pixelWidth) {
    const fill = type === "whiteboard" ? 0xf5f7fa : type === "bulletinBoard" || type === "townBoard" ? 0xb98245 : type === "dreamBoard" ? 0x7d8aa2 : 0x2f6f4f;
    this.add.rectangle(px + 3, py + 5, pixelWidth - 6, 20, 0x5d3519).setOrigin(0);
    this.add.rectangle(px + 5, py + 7, pixelWidth - 10, 16, fill).setOrigin(0);
    this.add.rectangle(px + 8, py + 11, pixelWidth - 16, 2, type === "chalkboard" ? 0xf5f7fa : 0x34495e).setOrigin(0).setAlpha(0.8);
    this.add.rectangle(px + 9, py + 16, Math.max(8, pixelWidth - 24), 2, 0xffd166).setOrigin(0).setAlpha(0.8);
  }

  drawSchoolObject(type, px, py, pixelWidth) {
    if (type === "locker") {
      for (let x = px + 3; x < px + pixelWidth - 3; x += 13) {
        this.add.rectangle(x, py + 3, 10, 26, 0x4f6f9f).setOrigin(0);
        this.add.rectangle(x + 2, py + 7, 6, 2, 0x90c9f6).setOrigin(0);
        this.add.rectangle(x + 7, py + 15, 2, 2, 0xffd166).setOrigin(0);
      }
      return;
    }
    if (type === "cubby") {
      this.add.rectangle(px + 3, py + 5, pixelWidth - 6, 23, 0x8d5524).setOrigin(0);
      for (let x = px + 6; x < px + pixelWidth - 7; x += 11) this.add.rectangle(x, py + 8, 8, 7, 0xf5df8f).setOrigin(0);
      this.add.rectangle(px + 6, py + 18, pixelWidth - 12, 3, 0xc98b50).setOrigin(0);
      return;
    }
    if (type === "crayonBox") {
      this.add.rectangle(px + 6, py + 14, 20, 11, 0xffd166).setOrigin(0);
      [0xe74c3c, 0x2f66d0, 0x36a853, 0x9b59b6].forEach((color, index) => this.add.rectangle(px + 8 + index * 4, py + 7, 3, 11, color).setOrigin(0));
      return;
    }
    if (type === "lunchTray") {
      this.add.rectangle(px + 5, py + 9, 22, 15, 0xd7d0b1).setOrigin(0);
      this.add.ellipse(px + 12, py + 16, 8, 7, 0xffd166);
      this.add.rectangle(px + 18, py + 12, 6, 9, 0x8ed16f).setOrigin(0);
      return;
    }
    if (type === "clubBooth") {
      this.add.rectangle(px + 3, py + 13, pixelWidth - 6, 13, 0x8d5524).setOrigin(0);
      this.add.rectangle(px + 4, py + 5, pixelWidth - 8, 9, 0xffd166).setOrigin(0);
      this.add.rectangle(px + 8, py + 8, pixelWidth - 16, 2, 0x6b3f24).setOrigin(0);
      return;
    }
    if (type === "sportsGoal") {
      this.add.rectangle(px + 4, py + 4, 4, 24, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 8, py + 4, 4, 24, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + 4, py + 4, pixelWidth - 8, 4, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + 9, py + 10, pixelWidth - 18, 2, 0xd9f2ff).setOrigin(0);
      return;
    }
    this.add.rectangle(px + 3, py + 9, pixelWidth - 6, 16, 0x2f66d0).setOrigin(0);
    this.add.rectangle(px + 5, py + 11, pixelWidth - 10, 12, 0x8ed8ff).setOrigin(0);
  }

  drawPlaygroundObject(type, px, py, pixelWidth) {
    if (type === "slide") {
      this.add.rectangle(px + 5, py + 5, 6, 24, 0xffd166).setOrigin(0);
      this.add.rectangle(px + 9, py + 5, 13, 5, 0xe74c3c).setOrigin(0);
      this.add.rectangle(px + 14, py + 10, 8, 19, 0xff6b6b).setOrigin(0);
      this.add.rectangle(px + 18, py + 25, 10, 4, 0xff6b6b).setOrigin(0);
      return;
    }
    this.add.rectangle(px + 5, py + 4, 4, 25, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + pixelWidth - 9, py + 4, 4, 25, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 5, py + 4, pixelWidth - 10, 4, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 13, py + 8, 2, 15, 0x111827).setOrigin(0);
    this.add.rectangle(px + 19, py + 8, 2, 15, 0x111827).setOrigin(0);
    this.add.rectangle(px + 12, py + 22, 10, 4, 0xf0c84b).setOrigin(0);
  }

  drawOfficeObject(type, px, py, pixelWidth) {
    if (type === "podium") {
      this.add.rectangle(px + 8, py + 8, pixelWidth - 16, 19, 0x8d5524).setOrigin(0);
      this.add.rectangle(px + 10, py + 5, pixelWidth - 20, 8, 0xc98b50).setOrigin(0);
      return;
    }
    if (type === "printer") {
      this.add.rectangle(px + 5, py + 12, 22, 13, 0xd5dbe7).setOrigin(0);
      this.add.rectangle(px + 8, py + 7, 16, 7, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + 10, py + 18, 12, 3, 0x34495e).setOrigin(0);
      return;
    }
    if (type === "trophyCase") {
      this.add.rectangle(px + 3, py + 5, pixelWidth - 6, 23, 0x6b3f24).setOrigin(0);
      this.add.rectangle(px + 5, py + 7, pixelWidth - 10, 19, 0xd9f2ff).setOrigin(0).setAlpha(0.75);
      this.add.rectangle(px + 10, py + 13, 7, 9, 0xffd166).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 17, py + 11, 7, 11, 0xffd166).setOrigin(0);
      return;
    }
    if (type === "labTable") {
      this.drawTable(px, py, pixelWidth);
      this.add.rectangle(px + 8, py + 5, 7, 10, 0x8ed8ff).setOrigin(0);
      this.add.rectangle(px + 20, py + 4, 5, 11, 0x8ed16f).setOrigin(0);
      return;
    }
    if (type === "labSink") {
      this.add.rectangle(px + 5, py + 10, 22, 16, 0xd5dbe7).setOrigin(0);
      this.add.rectangle(px + 9, py + 13, 14, 8, 0x90c9f6).setOrigin(0);
      this.add.rectangle(px + 14, py + 7, 4, 7, 0x5d6673).setOrigin(0);
      return;
    }
    if (type === "vendingMachine") {
      this.add.rectangle(px + 7, py + 3, 18, 27, 0xb64c2e).setOrigin(0);
      this.add.rectangle(px + 10, py + 6, 8, 12, 0x90c9f6).setOrigin(0);
      this.add.rectangle(px + 19, py + 8, 3, 11, 0xffd166).setOrigin(0);
      this.add.rectangle(px + 11, py + 23, 11, 3, 0x111827).setOrigin(0);
      return;
    }
    if (type === "schoolBell") {
      this.add.rectangle(px + 14, py + 6, 4, 20, 0x6b3f24).setOrigin(0);
      this.add.ellipse(px + 16, py + 9, 15, 10, 0xffd166);
      this.add.rectangle(px + 10, py + 13, 12, 3, 0xb98245).setOrigin(0);
      return;
    }
    if (type === "meetingTable") {
      this.drawTable(px, py, pixelWidth);
      this.add.rectangle(px + 8, py + 5, pixelWidth - 16, 5, 0xf5df8f).setOrigin(0);
      return;
    }
    if (type === "interviewChair") {
      this.drawChair(px, py);
      this.add.rectangle(px + 6, py + 4, 20, 3, 0x34495e).setOrigin(0);
      return;
    }
    if (type === "filingCabinet") {
      this.add.rectangle(px + 7, py + 4, 18, 25, 0x7d8aa2).setOrigin(0);
      [8, 15, 22].forEach((y) => {
        this.add.rectangle(px + 9, py + y, 14, 5, 0xd5dbe7).setOrigin(0);
        this.add.rectangle(px + 15, py + y + 2, 4, 1, 0x34495e).setOrigin(0);
      });
      return;
    }
    if (type === "queueRope") {
      this.add.rectangle(px + 6, py + 8, 4, 20, 0x34495e).setOrigin(0);
      this.add.rectangle(px + pixelWidth - 10, py + 8, 4, 20, 0x34495e).setOrigin(0);
      this.add.rectangle(px + 8, py + 12, pixelWidth - 16, 4, 0xb64c2e).setOrigin(0);
      return;
    }
    if (type === "ballotBox") {
      this.add.rectangle(px + 7, py + 10, 18, 15, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + 10, py + 7, 12, 5, 0x2f66d0).setOrigin(0);
      this.add.rectangle(px + 12, py + 14, 8, 2, 0x111827).setOrigin(0);
      return;
    }
    if (type === "microphone") {
      this.add.rectangle(px + 15, py + 10, 3, 18, 0x111827).setOrigin(0);
      this.add.ellipse(px + 16, py + 8, 8, 10, 0x34495e);
      this.add.rectangle(px + 10, py + 27, 12, 3, 0x111827).setOrigin(0);
      return;
    }
    this.drawSchoolObject("clubBooth", px, py, pixelWidth);
  }

  drawLifeObject(type, px, py, pixelWidth) {
    if (type === "fridge") {
      this.add.rectangle(px + 7, py + 3, 18, 27, 0xd9f2ff).setOrigin(0);
      this.add.rectangle(px + 9, py + 5, 14, 10, 0xf5f7fa).setOrigin(0);
      this.add.rectangle(px + 22, py + 17, 2, 6, 0x34495e).setOrigin(0);
      return;
    }
    if (type === "stove") {
      this.add.rectangle(px + 5, py + 8, 22, 19, 0x5d6673).setOrigin(0);
      this.add.rectangle(px + 7, py + 10, 18, 6, 0xf5f7fa).setOrigin(0);
      this.add.ellipse(px + 11, py + 21, 6, 4, 0x111827);
      this.add.ellipse(px + 20, py + 21, 6, 4, 0x111827);
      return;
    }
    if (type === "atm") {
      this.add.rectangle(px + 6, py + 4, 20, 25, 0x2f66d0).setOrigin(0);
      this.add.rectangle(px + 10, py + 8, 12, 7, 0x8ed8ff).setOrigin(0);
      this.add.rectangle(px + 11, py + 19, 10, 2, 0xffd166).setOrigin(0);
      return;
    }
    if (type === "campusFountain") {
      this.add.ellipse(px + 16, py + 18, 26, 16, 0x7d8aa2);
      this.add.ellipse(px + 16, py + 17, 20, 11, 0x3598d4);
      this.add.rectangle(px + 14, py + 6, 4, 12, 0xd6d2c4).setOrigin(0);
      this.add.rectangle(px + 11, py + 7, 10, 3, 0x8ed8ff).setOrigin(0).setAlpha(0.75);
      return;
    }
    if (type === "bikeRack") {
      for (let x = px + 5; x < px + pixelWidth - 6; x += 9) {
        this.add.ellipse(x + 4, py + 21, 9, 9, 0x34495e);
        this.add.rectangle(x + 4, py + 10, 2, 14, 0x7d8aa2).setOrigin(0);
      }
      return;
    }
    if (type === "laundryMachine") {
      this.add.rectangle(px + 6, py + 4, 20, 25, 0xd9f2ff).setOrigin(0);
      this.add.ellipse(px + 16, py + 17, 13, 13, 0x90c9f6);
      this.add.rectangle(px + 9, py + 7, 14, 4, 0x7d8aa2).setOrigin(0);
      return;
    }
    if (type === "coffeeMachine") {
      this.add.rectangle(px + 7, py + 5, 18, 23, 0x5d3519).setOrigin(0);
      this.add.rectangle(px + 10, py + 8, 12, 7, 0x90c9f6).setOrigin(0);
      this.add.rectangle(px + 13, py + 20, 7, 5, 0xf5df8f).setOrigin(0);
      return;
    }
    if (type === "busStop") {
      this.drawSign(px, py);
      this.add.rectangle(px + 3, py + 24, 26, 3, 0x7d8aa2).setOrigin(0);
      return;
    }
    if (type === "birthdayTable") {
      this.drawTable(px, py, pixelWidth);
      this.add.rectangle(px + pixelWidth / 2 - 2, py + 4, 4, 10, 0xff86b7).setOrigin(0);
      this.add.rectangle(px + pixelWidth / 2 - 1, py + 2, 2, 3, 0xffd166).setOrigin(0);
      return;
    }
    if (type === "familyPhoto") {
      this.add.rectangle(px + 6, py + 6, 20, 18, 0x8d5524).setOrigin(0);
      this.add.rectangle(px + 8, py + 8, 16, 14, 0xf5df8f).setOrigin(0);
      this.add.rectangle(px + 11, py + 13, 3, 5, 0x2f66d0).setOrigin(0);
      this.add.rectangle(px + 18, py + 13, 3, 5, 0xe74c3c).setOrigin(0);
      return;
    }
    if (type === "toyBox") {
      this.add.rectangle(px + 5, py + 14, 22, 12, 0xffd166).setOrigin(0);
      this.add.rectangle(px + 8, py + 10, 16, 5, 0xe74c3c).setOrigin(0);
      this.add.rectangle(px + 12, py + 17, 7, 4, 0x2f66d0).setOrigin(0);
      return;
    }
    if (type === "grill") {
      this.add.rectangle(px + 7, py + 12, 18, 10, 0x34495e).setOrigin(0);
      this.add.rectangle(px + 8, py + 9, 16, 4, 0x5d6673).setOrigin(0);
      this.add.rectangle(px + 10, py + 22, 3, 7, 0x111827).setOrigin(0);
      this.add.rectangle(px + 21, py + 22, 3, 7, 0x111827).setOrigin(0);
      return;
    }
    if (type === "car") {
      this.add.rectangle(px + 3, py + 13, pixelWidth - 6, 12, 0xe74c3c).setOrigin(0);
      this.add.rectangle(px + 9, py + 7, pixelWidth - 18, 9, 0xc0392b).setOrigin(0);
      this.add.rectangle(px + 11, py + 9, 8, 5, 0x90c9f6).setOrigin(0);
      this.add.ellipse(px + 10, py + 26, 7, 7, 0x111827);
      this.add.ellipse(px + pixelWidth - 10, py + 26, 7, 7, 0x111827);
      return;
    }
    if (type === "toolBench") {
      this.drawTable(px, py, pixelWidth);
      this.add.rectangle(px + 8, py + 5, 12, 3, 0x5d6673).setOrigin(0);
      this.add.rectangle(px + 21, py + 4, 3, 9, 0xffd166).setOrigin(0);
      return;
    }
    this.drawSpecialBed(type, px, py, pixelWidth);
  }

  drawTravelObject(type, px, py, pixelWidth) {
    if (["luggage", "suitcase"].includes(type)) {
      const color = type === "suitcase" ? 0x2f66d0 : 0x8d5524;
      this.add.rectangle(px + 8, py + 11, 17, 16, color).setOrigin(0);
      this.add.rectangle(px + 12, py + 7, 9, 5, 0x34495e).setOrigin(0);
      this.add.rectangle(px + 11, py + 15, 2, 9, 0xf5df8f).setOrigin(0);
      return;
    }
    if (type === "ticketKiosk") {
      this.add.rectangle(px + 6, py + 4, 20, 25, 0x7d8aa2).setOrigin(0);
      this.add.rectangle(px + 9, py + 7, 14, 9, 0x8ed8ff).setOrigin(0);
      this.add.rectangle(px + 11, py + 20, 10, 3, 0xffd166).setOrigin(0);
      return;
    }
    if (type === "airportGate") {
      this.add.rectangle(px + 4, py + 6, pixelWidth - 8, 18, 0x90c9f6).setOrigin(0);
      this.add.rectangle(px + 7, py + 9, pixelWidth - 14, 12, 0xd9f2ff).setOrigin(0);
      this.add.rectangle(px + pixelWidth / 2 - 2, py + 7, 4, 17, 0x34495e).setOrigin(0);
      return;
    }
    if (type === "taxiStand") {
      this.drawSign(px, py);
      this.add.rectangle(px + 8, py + 8, 16, 5, 0xffd166).setOrigin(0);
      return;
    }
    if (type === "menuBoard") {
      this.drawWallBoard("chalkboard", px, py, pixelWidth);
      this.add.rectangle(px + 9, py + 14, pixelWidth - 18, 1, 0xffd166).setOrigin(0);
      return;
    }
    this.add.rectangle(px + 2, py + 15, pixelWidth - 4, 13, 0x34495e).setOrigin(0);
    for (let x = px + 5; x < px + pixelWidth - 4; x += 9) {
      this.add.rectangle(x, py + 8, 6, 20, 0x5d6673).setOrigin(0);
      this.add.rectangle(x + 1, py + 10, 4, 5, 0x90c9f6).setOrigin(0);
    }
  }

  drawSparkle(type, px, py) {
    const color = type === "questSparkle" ? 0xffd166 : 0x8ed8ff;
    this.add.rectangle(px + 15, py + 5, 3, 22, color).setOrigin(0);
    this.add.rectangle(px + 6, py + 14, 21, 3, color).setOrigin(0);
    this.add.rectangle(px + 10, py + 9, 4, 4, 0xffffff).setOrigin(0).setAlpha(0.8);
    this.add.rectangle(px + 19, py + 19, 4, 4, 0xffffff).setOrigin(0).setAlpha(0.65);
  }

  drawRouteGate(px, py) {
    this.add.rectangle(px + 4, py + 5, 6, 26, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 22, py + 5, 6, 26, 0x8d5524).setOrigin(0);
    this.add.rectangle(px + 6, py + 10, 20, 5, 0xffd166).setOrigin(0);
    this.add.rectangle(px + 6, py + 19, 20, 5, 0xffd166).setOrigin(0);
    this.add.rectangle(px + 11, py + 2, 10, 7, 0xf5df8f).setOrigin(0);
  }

  drawDojoObject(type, px, py, pixelWidth) {
    if (type === "dojoBanner") {
      this.add.rectangle(px + 8, py + 2, pixelWidth - 16, 28, 0x5f1717).setOrigin(0).setStrokeStyle(2, 0x241010);
      this.add.rectangle(px + 11, py + 4, pixelWidth - 22, 22, 0xc92a2a).setOrigin(0);
      this.add.rectangle(px + pixelWidth / 2 - 2, py + 8, 4, 14, 0xfff7cf).setOrigin(0);
      this.add.rectangle(px + pixelWidth / 2 - 7, py + 13, 14, 4, 0xfff7cf).setOrigin(0);
      return;
    }

    if (type === "trainingDummy") {
      this.add.ellipse(px + 16, py + 29, 24, 7, 0x111827, 0.22);
      this.add.rectangle(px + 14, py + 7, 4, 22, 0x5d3519).setOrigin(0).setStrokeStyle(1, 0x2b180f);
      this.add.rectangle(px + 7, py + 10, 18, 12, 0xb98245).setOrigin(0).setStrokeStyle(2, 0x5d3519);
      this.add.rectangle(px + 4, py + 14, 24, 4, 0x8d5524).setOrigin(0).setStrokeStyle(1, 0x5d3519);
      this.add.rectangle(px + 10, py + 13, 12, 2, 0xf5df8f).setOrigin(0);
      return;
    }

    this.add.rectangle(px + 3, py + 6, pixelWidth - 6, 23, 0x5d3519).setOrigin(0).setStrokeStyle(2, 0x2b180f);
    this.add.rectangle(px + 6, py + 9, pixelWidth - 12, 4, 0x9a6733).setOrigin(0);
    this.add.rectangle(px + 6, py + 22, pixelWidth - 12, 4, 0x9a6733).setOrigin(0);
    for (let x = px + 9; x < px + pixelWidth - 8; x += 9) {
      this.add.rectangle(x, py + 5, 3, 21, 0xd7b56d).setOrigin(0).setAngle((x / 9) % 2 === 0 ? 8 : -8);
    }
  }

  drawCrateObject(px, py, pixelWidth, pixelHeight, color) {
    this.add.ellipse(px + pixelWidth / 2, py + pixelHeight - 3, pixelWidth - 8, 7, 0x111827, 0.2);
    this.add.rectangle(px + 4, py + 7, pixelWidth - 8, pixelHeight - 11, 0x4b3421).setOrigin(0).setStrokeStyle(1, 0x241b13);
    this.add.rectangle(px + 6, py + 6, pixelWidth - 12, pixelHeight - 14, color).setOrigin(0).setStrokeStyle(2, 0x2b3442);
    this.add.rectangle(px + 8, py + 9, pixelWidth - 16, 3, 0xffffff).setOrigin(0).setAlpha(0.18);
    this.add.rectangle(px + Math.floor(pixelWidth / 2) - 2, py + 13, 4, Math.max(6, pixelHeight - 23), 0x111827).setOrigin(0).setAlpha(0.22);
  }

  drawPeople(area) {
    area.people?.forEach((npc) => {
      const person = getPerson(npc.personId);
      const px = npc.x * TILE_SIZE;
      const py = npc.y * TILE_SIZE;
      this.blocked.add(this.positionKey(npc.x, npc.y));
      this.peopleByPosition.set(this.positionKey(npc.x, npc.y), { ...npc, person });

      if (npc.boss) this.drawBossNpc(px, py, person);
      else this.drawNpc(px, py, person);
    });
  }

  drawBossNpc(px, py, person) {
    const skin = person.skin || 0xf2b37e;
    const hair = person.hair || 0x111827;
    const outfit = person.color || 0x7c3aed;
    const accent = person.accent || 0xffd166;
    const outline = 0x182033;
    const rect = (x, y, width, height, color, stroke = outline) => (
      this.add.rectangle(px + x, py + y, width, height, color)
        .setOrigin(0)
        .setStrokeStyle(1, stroke)
    );

    this.add.ellipse(px + 16, py + 29, 32, 10, 0x111827, 0.32);
    this.add.ellipse(px + 16, py + 4, 34, 42, accent, 0.13).setStrokeStyle(2, accent, 0.5);
    rect(8, 27, 6, 6, 0x26334c);
    rect(18, 27, 6, 6, 0x26334c);
    rect(3, 10, 6, 18, skin);
    rect(23, 10, 6, 18, skin);
    rect(6, 4, 20, 25, outfit);
    rect(9, -8, 14, 15, skin);
    rect(7, -13, 18, 8, hair);
    rect(6, -8, 5, 10, hair);
    rect(21, -8, 5, 10, hair);
    rect(11, -3, 3, 3, outline, outline);
    rect(18, -3, 3, 3, outline, outline);
    rect(12, 2, 8, 2, 0x934f35, 0x934f35);
    rect(9, 13, 14, 4, accent);
    rect(4, -16, 24, 4, accent);
    rect(12, -15, 8, 2, 0xffffff, 0xffffff);
    rect(5, 20, 22, 3, 0xffffff, 0xffffff).setAlpha(0.18);
  }

  drawNpc(px, py, person) {
    const skin = person.skin || 0xf2b37e;
    const hair = person.hair || 0x3b2416;
    const outfit = person.color || 0x3498db;
    const accent = person.accent || 0xffffff;

    const outline = 0x182033;
    const hairStyle = person.id.split("").reduce((total, letter) => total + letter.charCodeAt(0), 0) % 3;
    const rect = (x, y, width, height, color, stroke = outline) => (
      this.add.rectangle(px + x, py + y, width, height, color)
        .setOrigin(0)
        .setStrokeStyle(1, stroke)
    );

    this.add.ellipse(px + 16, py + 29, 23, 7, 0x111827, 0.28);
    rect(8, 24, 6, 7, 0x26334c);
    rect(18, 24, 6, 7, 0x26334c);
    rect(6, 14, 5, 12, skin);
    rect(21, 14, 5, 12, skin);
    rect(9, 13, 14, 15, outfit);
    rect(11, 10, 10, 5, skin);
    rect(9, 3, 14, 12, skin);
    rect(8, 0, 16, 7, hair);
    rect(7, 4, hairStyle === 1 ? 4 : 5, hairStyle === 2 ? 11 : 8, hair);
    rect(20, 4, hairStyle === 1 ? 6 : 5, hairStyle === 0 ? 8 : 11, hair);
    if (hairStyle === 1) {
      rect(11, -2, 4, 5, hair);
      rect(16, -3, 6, 6, hair);
    }
    if (hairStyle === 2) {
      rect(5, 8, 4, 12, hair);
      rect(23, 8, 4, 12, hair);
    }
    rect(12, 7, 2, 2, outline, outline);
    rect(18, 7, 2, 2, outline, outline);
    rect(14, 12, 4, 1, 0x8f4f2d, 0x8f4f2d);
    rect(10, 15, 12, 2, 0xffffff, 0xffffff).setAlpha(0.16);

    if (person.outfit === "dress") {
      this.add.rectangle(px + 8, py + 20, 16, 8, outfit).setOrigin(0);
      this.add.rectangle(px + 10, py + 15, 12, 3, accent).setOrigin(0);
      this.add.rectangle(px + 12, py + 1, 8, 3, accent).setOrigin(0);
      return;
    }

    if (person.outfit === "apron") {
      this.add.rectangle(px + 11, py + 14, 10, 14, accent).setOrigin(0);
      this.add.rectangle(px + 12, py + 17, 8, 2, 0xd7d0b1).setOrigin(0);
      this.add.rectangle(px + 13, py + 22, 6, 3, 0xd7d0b1).setOrigin(0);
      return;
    }

    if (person.outfit === "teacher") {
      this.add.rectangle(px + 8, py + 13, 16, 4, accent).setOrigin(0);
      this.add.rectangle(px + 19, py + 16, 2, 10, 0xffd166).setOrigin(0);
      this.add.rectangle(px + 5, py + 18, 6, 3, 0xfff2bf).setOrigin(0);
      return;
    }

    if (person.outfit === "hoodie") {
      this.add.rectangle(px + 8, py + 12, 16, 5, outfit).setOrigin(0);
      this.add.rectangle(px + 11, py + 15, 10, 2, accent).setOrigin(0);
      this.add.rectangle(px + 12, py + 17, 2, 7, accent).setOrigin(0);
      return;
    }

    if (person.outfit === "vest") {
      this.add.rectangle(px + 10, py + 14, 5, 14, accent).setOrigin(0);
      this.add.rectangle(px + 17, py + 14, 5, 14, accent).setOrigin(0);
      this.add.rectangle(px + 14, py + 14, 4, 14, outfit).setOrigin(0);
      return;
    }

    this.add.rectangle(px + 10, py + 15, 12, 3, accent).setOrigin(0);
    this.add.rectangle(px + 8, py + 13, 3, 15, 0x26334c).setOrigin(0);
    this.add.rectangle(px + 21, py + 13, 3, 15, 0x26334c).setOrigin(0);
  }

  createPlayer(x, y, facing) {
    this.playerTile = { x, y, facing };
    this.player = this.add.container(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2);
    this.player.setDepth(100);
    this.playerParts = {
      shadow: this.add.ellipse(0, 13, 21, 8, 0x101827, 0.45),
      leftLeg: this.add.rectangle(-5, 9, 7, 11, 0x26334c).setStrokeStyle(1, 0x111827),
      rightLeg: this.add.rectangle(5, 9, 7, 11, 0x26334c).setStrokeStyle(1, 0x111827),
      leftShoe: this.add.rectangle(-5, 15, 8, 4, 0xf5df8f).setStrokeStyle(1, 0x111827),
      rightShoe: this.add.rectangle(5, 15, 8, 4, 0xf5df8f).setStrokeStyle(1, 0x111827),
      leftArm: this.add.rectangle(-11, 2, 6, 13, 0xf2b37e).setStrokeStyle(1, 0x111827),
      rightArm: this.add.rectangle(11, 2, 6, 13, 0xf2b37e).setStrokeStyle(1, 0x111827),
      body: this.add.rectangle(0, 1, 19, 18, 0x2f66d0).setStrokeStyle(2, 0x111827),
      shirtPanel: this.add.rectangle(0, 4, 10, 7, 0x4c82e6),
      collar: this.add.rectangle(0, -7, 12, 4, 0xfff2bf).setStrokeStyle(1, 0x111827),
      neck: this.add.rectangle(0, -10, 8, 5, 0xd9905f).setStrokeStyle(1, 0x111827),
      head: this.add.rectangle(0, -17, 16, 14, 0xf2b37e).setStrokeStyle(2, 0x111827),
      leftEar: this.add.rectangle(-9, -16, 3, 5, 0xd9905f).setStrokeStyle(1, 0x111827),
      rightEar: this.add.rectangle(9, -16, 3, 5, 0xd9905f).setStrokeStyle(1, 0x111827),
      hairBack: this.add.rectangle(0, -22, 18, 7, 0x3b2416).setStrokeStyle(1, 0x111827),
      hairFront: this.add.rectangle(-3, -20, 16, 4, 0x2b180f),
      cap: this.add.rectangle(0, -25, 18, 7, 0xe85d3f).setStrokeStyle(2, 0x111827),
      capHighlight: this.add.rectangle(-4, -27, 8, 3, 0xff9b54),
      capBrim: this.add.rectangle(6, -22, 10, 3, 0xb93b2b).setStrokeStyle(1, 0x111827),
      leftEye: this.add.rectangle(-4, -17, 2, 2, 0x111827),
      rightEye: this.add.rectangle(4, -17, 2, 2, 0x111827),
      sideNose: this.add.rectangle(6, -15, 2, 3, 0xd9905f),
      smile: this.add.rectangle(0, -12, 6, 1, 0x8f4f2d),
      bag: this.add.rectangle(11, 1, 6, 12, 0x8d5524).setStrokeStyle(1, 0x111827),
      bagFlap: this.add.rectangle(11, -2, 6, 4, 0xc98b50).setStrokeStyle(1, 0x111827)
    };
    this.player.add(Object.values(this.playerParts));
    this.setPlayerFacing(facing);
  }

  updatePlayerSprite(facing, walkFrame = 0) {
    if (!this.playerParts) return;

    const isSide = facing === "left" || facing === "right";
    const isUp = facing === "up";
    const step = walkFrame % 2 === 0 ? 0 : 3;
    const armStep = walkFrame % 2 === 0 ? 0 : 4;
    const lean = isSide ? (facing === "left" ? -2 : 2) : 0;
    const bodyColor = isUp ? 0x244d9c : isSide ? 0x2a58b4 : 0x2f66d0;
    const sideDirection = facing === "left" ? -1 : 1;

    this.player.setScale(1, 1);
    this.playerParts.body.setFillStyle(bodyColor).setPosition(lean, 1);
    this.playerParts.shirtPanel.setPosition(lean, 4).setVisible(!isUp);
    this.playerParts.collar.setPosition(lean, -7).setVisible(!isUp);
    this.playerParts.neck.setPosition(lean, -10).setVisible(!isUp);
    this.playerParts.head.setPosition(lean, -17);
    this.playerParts.leftEar.setPosition(lean - 9, -16).setVisible(!isUp && !isSide);
    this.playerParts.rightEar.setPosition(lean + 9, -16).setVisible(!isUp && !isSide);
    this.playerParts.hairBack.setPosition(lean, isUp ? -19 : -22);
    this.playerParts.hairFront.setPosition(isSide ? lean + sideDirection * 2 : lean - 3, -20).setVisible(!isUp);
    this.playerParts.cap.setPosition(lean, -25);
    this.playerParts.capHighlight.setPosition(lean - 4, -27).setVisible(!isUp);
    this.playerParts.capBrim.setPosition(lean + sideDirection * 6, -22).setVisible(!isUp);
    this.playerParts.leftEye.setPosition(isSide ? lean + sideDirection * 4 : lean - 4, -17).setVisible(!isUp);
    this.playerParts.rightEye.setPosition(lean + 4, -17).setVisible(!isUp && !isSide);
    this.playerParts.sideNose.setPosition(lean + sideDirection * 7, -15).setVisible(isSide);
    this.playerParts.smile.setPosition(lean, -12).setVisible(!isUp && !isSide);
    this.playerParts.bag.setPosition(isUp ? lean : isSide ? lean - sideDirection * 10 : 11, 1);
    this.playerParts.bagFlap.setPosition(isUp ? lean : isSide ? lean - sideDirection * 10 : 11, isUp ? -3 : -2);

    if (isUp) {
      this.playerParts.leftLeg.setPosition(-5, 10 + step);
      this.playerParts.rightLeg.setPosition(5, 10 - step);
      this.playerParts.leftShoe.setPosition(-5, 15 + step);
      this.playerParts.rightShoe.setPosition(5, 15 - step);
      this.playerParts.leftArm.setPosition(-11, 2 - armStep);
      this.playerParts.rightArm.setPosition(11, 2 + armStep);
      return;
    }

    if (isSide) {
      this.playerParts.leftLeg.setPosition(lean - sideDirection * 2, 10 + step);
      this.playerParts.rightLeg.setPosition(lean + sideDirection * 5, 10 - step);
      this.playerParts.leftShoe.setPosition(lean - sideDirection * 2, 15 + step);
      this.playerParts.rightShoe.setPosition(lean + sideDirection * 5, 15 - step);
      this.playerParts.leftArm.setPosition(lean - sideDirection * 8, 2 + armStep);
      this.playerParts.rightArm.setPosition(lean + sideDirection * 8, 2 - armStep);
      return;
    }

    this.playerParts.leftLeg.setPosition(-5, 10 + step);
    this.playerParts.rightLeg.setPosition(5, 10 - step);
    this.playerParts.leftShoe.setPosition(-5, 15 + step);
    this.playerParts.rightShoe.setPosition(5, 15 - step);
    this.playerParts.leftArm.setPosition(-11, 2 + armStep);
    this.playerParts.rightArm.setPosition(11, 2 - armStep);
  }

  roundTilePosition(value) {
    return Math.round(value / PLAYER_STEP_TILES) * PLAYER_STEP_TILES;
  }

  isAlignedToTile(value) {
    return Number.isInteger(this.roundTilePosition(value));
  }

  stepTowardTileCenter(value) {
    const target = Math.round(value);
    if (target === value) return value;
    const direction = target > value ? 1 : -1;
    return this.roundTilePosition(value + direction * PLAYER_STEP_TILES);
  }

  movePlayer(direction) {
    if (!directionDeltas[direction]) return;
    if (this.isMoving) {
      this.pendingMoveDirection = direction;
      return;
    }

    const delta = directionDeltas[direction];
    let nextX = this.roundTilePosition(this.playerTile.x + delta.x * PLAYER_STEP_TILES);
    let nextY = this.roundTilePosition(this.playerTile.y + delta.y * PLAYER_STEP_TILES);

    if (delta.y !== 0 && !this.isAlignedToTile(this.playerTile.x)) {
      nextX = this.stepTowardTileCenter(this.playerTile.x);
      nextY = this.playerTile.y;
    }

    if (delta.x !== 0 && !this.isAlignedToTile(this.playerTile.y)) {
      nextX = this.playerTile.x;
      nextY = this.stepTowardTileCenter(this.playerTile.y);
    }

    this.setPlayerFacing(direction);
    const targetKey = this.positionKey(Math.round(nextX), Math.round(nextY));

    const npc = this.peopleByPosition.get(targetKey);
    if (npc) {
      this.runInteractions(npc, `${npc.person.name}: ${npc.message || "Hola."}`);
      this.saveCurrentPosition(direction);
      return;
    }

    const object = this.objectsByPosition.get(targetKey);
    if (object?.interactions) {
      this.runInteractions(object, "You inspect it.");
      this.saveCurrentPosition(direction);
      return;
    }

    const blockedEntrance = this.isAlignedToTile(nextX) && this.isAlignedToTile(nextY)
      ? this.entrances.get(targetKey)
      : null;
    if (blockedEntrance?.targetArea && blockedEntrance.requires && !this.matchesConditions(blockedEntrance.requires)) {
      this.emitStatus(blockedEntrance.blockedMessage || "You need to finish something before going this way.");
      this.saveCurrentPosition(direction);
      return;
    }

    if (!this.canWalkTo(nextX, nextY)) {
      this.emitStatus("The path is blocked.");
      this.saveCurrentPosition(direction);
      return;
    }

    this.emitStatus(null);
    this.isMoving = true;
    this.pendingMoveDirection = null;
    this.playerWalkFrame = (this.playerWalkFrame + 1) % 2;
    this.updatePlayerSprite(direction, this.playerWalkFrame);
    this.playerTile = { x: nextX, y: nextY, facing: direction };
    this.tweens.add({
      targets: this.player,
      x: nextX * TILE_SIZE + TILE_SIZE / 2,
      y: nextY * TILE_SIZE + TILE_SIZE / 2,
      duration: PLAYER_SPEED_MS,
      ease: "Linear",
      onComplete: () => {
        this.isMoving = false;
        this.updatePlayerSprite(direction, 0);
        const previousAreaId = this.currentArea?.id;
        this.handleAreaTransition(nextX, nextY, direction);
        if (this.currentArea?.id === previousAreaId && this.pendingMoveDirection && !this.pendingChoice) {
          const pendingDirection = this.pendingMoveDirection;
          this.pendingMoveDirection = null;
          this.movePlayer(pendingDirection);
        }
      }
    });
  }

  handleAreaTransition(x, y, facing) {
    const isOnTileCenter = this.isAlignedToTile(x) && this.isAlignedToTile(y);
    const entrance = isOnTileCenter ? this.entrances.get(this.positionKey(x, y)) : null;
    if (entrance?.targetArea) {
      if (entrance.requires && !this.matchesConditions(entrance.requires)) {
        this.emitStatus(entrance.blockedMessage || "You need to finish something before going this way.");
        this.saveCurrentPosition(facing);
        return;
      }
      const destination = this.getEntranceDestination(entrance, facing);
      this.loadArea(destination.areaId, destination.x, destination.y, destination.facing);
      return;
    }

    this.saveCurrentPosition(facing);
  }

  getEntranceDestination(entrance, facing) {
    const savedChapterPosition = entrance.restorePosition !== false
      && this.currentArea.id === this.startingAreaId
      && entrance.chapterId
      ? this.chapterPositions[entrance.chapterId]
      : null;

    if (savedChapterPosition) return savedChapterPosition;

    return {
      areaId: entrance.targetArea,
      x: entrance.targetX,
      y: entrance.targetY,
      facing: entrance.facing || facing
    };
  }

  saveCurrentPosition(facing) {
    this.saveGame({
      areaId: this.currentArea.id,
      x: this.playerTile.x,
      y: this.playerTile.y,
      facing
    });
  }

  saveGame(position) {
    const chapterId = getAreaChapterId(this.areas?.[position.areaId]);
    if (position.areaId !== this.startingAreaId && chapterId) {
      this.chapterPositions[chapterId] = position;
    }

    writeSave({
      current: position,
      chapterPositions: this.chapterPositions,
      progress: this.progress
    });
    this.emitProgress();
  }

  canWalkTo(x, y) {
    if (x < 0 || y < 0 || x >= this.currentArea.width || y >= this.currentArea.height) return false;
    return !this.blocked.has(this.positionKey(Math.round(x), Math.round(y)));
  }

  resolveSafeSpawn(x, y) {
    const target = { x: Math.round(x), y: Math.round(y) };
    if (this.isSafeSpawnTile(target.x, target.y)) return target;

    const maxRadius = Math.max(this.currentArea.width, this.currentArea.height);
    for (let radius = 1; radius <= maxRadius; radius += 1) {
      const candidates = [];
      for (let dy = -radius; dy <= radius; dy += 1) {
        for (let dx = -radius; dx <= radius; dx += 1) {
          if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;
          candidates.push({ x: target.x + dx, y: target.y + dy, distance: Math.abs(dx) + Math.abs(dy) });
        }
      }

      const safeCandidate = candidates
        .sort((a, b) => a.distance - b.distance)
        .find((candidate) => this.isSafeSpawnTile(candidate.x, candidate.y));

      if (safeCandidate) {
        return { x: safeCandidate.x, y: safeCandidate.y };
      }
    }

    return target;
  }

  isSafeSpawnTile(x, y) {
    if (x < 0 || y < 0 || x >= this.currentArea.width || y >= this.currentArea.height) return false;
    const key = this.positionKey(x, y);
    return !this.blocked.has(key)
      && !this.peopleByPosition.has(key)
      && !this.objectsByPosition.has(key);
  }

  setPlayerFacing(facing) {
    this.playerTile.facing = facing;
    this.updatePlayerSprite(facing, 0);
  }

  resetPlayer() {
    if (!this.areas) return;
    const start = getAreaStart(this.areas, this.startingAreaId);
    this.progress = normalizeProgress();
    this.chapterPositions = {};
    this.loadArea(start.areaId, start.x, start.y, start.facing);
  }

  returnHome() {
    if (!this.areas) return;
    if (this.currentArea?.id !== this.startingAreaId) {
      this.saveCurrentPosition(this.playerTile.facing);
    }
    const start = getAreaStart(this.areas, this.startingAreaId);
    this.loadArea(start.areaId, start.x, start.y, start.facing);
  }

  emitStatus(message) {
    this.game.events.emit("el-camino-status", message);
  }

  emitProgress() {
    this.refreshLockedEntranceMarkers();
    this.game.events.emit("el-camino-progress", {
      coins: this.progress.inventory.coins || 0,
      inventory: Object.entries(this.progress.inventory)
        .filter(([itemId, count]) => itemId !== "coins" && items[itemId]?.category !== "badge" && count > 0)
        .map(([itemId, count]) => ({
          itemId,
          count,
          name: this.getItemName(itemId),
          spanish: items[itemId]?.spanish || itemId
        })),
      badges: Object.entries(this.progress.inventory)
        .filter(([itemId, count]) => items[itemId]?.category === "badge" && count > 0)
        .map(([itemId, count]) => ({
          itemId,
          count,
          name: this.getItemName(itemId),
          spanish: items[itemId]?.spanish || itemId
        })),
      completedMissions: this.progress.completedMissions,
      completedSteps: this.progress.completedSteps,
      objective: this.getNextObjective(),
      map: this.getChapterMapData()
    });
  }

  getChapterMapData() {
    if (!this.areas || !this.currentArea) return null;
    const chapterId = getAreaChapterId(this.currentArea);
    const chapterAreas = Object.values(this.areas).filter((area) => getAreaChapterId(area) === chapterId);
    const layout = this.getChapterAreaLayout(chapterAreas);

    return {
      chapterId,
      title: this.currentArea.region || this.currentArea.name,
      currentAreaId: this.currentArea.id,
      player: {
        areaId: this.currentArea.id,
        x: Math.round(this.playerTile.x),
        y: Math.round(this.playerTile.y)
      },
      areas: chapterAreas.map((area) => ({
        id: area.id,
        name: area.name,
        width: area.width,
        height: area.height,
        rows: area.rows,
        legend: Object.fromEntries(
          Object.entries(area.legend).map(([tileKey, terrainName]) => [tileKey, getTerrainColorHex(terrainName)])
        ),
        position: layout[area.id] || { x: 0, y: 0 },
        exits: area.exits
          .filter((exit) => this.areas[exit.targetArea] && getAreaChapterId(this.areas[exit.targetArea]) === chapterId)
          .map((exit) => ({
            targetArea: exit.targetArea,
            direction: this.getExitDirection(exit, area),
            locked: exit.requires && !this.matchesConditions(exit.requires)
          }))
      }))
    };
  }

  getChapterAreaLayout(chapterAreas) {
    const chapterIds = new Set(chapterAreas.map((area) => area.id));
    const layout = {};
    const queue = [];
    const startArea = chapterAreas[0];

    if (startArea) {
      layout[startArea.id] = { x: 0, y: 0 };
      queue.push(startArea);
    }

    while (queue.length) {
      const area = queue.shift();
      const position = layout[area.id];
      area.exits.forEach((exit) => {
        if (!chapterIds.has(exit.targetArea) || layout[exit.targetArea]) return;
        const direction = this.getExitDirection(exit, area);
        const delta = directionDeltas[direction] || { x: 1, y: 0 };
        layout[exit.targetArea] = { x: position.x + delta.x, y: position.y + delta.y };
        queue.push(this.areas[exit.targetArea]);
      });
    }

    let nextUnplacedY = 2;
    chapterAreas.forEach((area) => {
      if (!layout[area.id]) {
        layout[area.id] = { x: 0, y: nextUnplacedY };
        nextUnplacedY += 1;
      }
    });

    return this.spreadOverlappingMapNodes(layout);
  }

  spreadOverlappingMapNodes(layout) {
    const occupied = new Map();
    Object.entries(layout).forEach(([areaId, position]) => {
      let x = position.x;
      let key = `${x},${position.y}`;
      while (occupied.has(key)) {
        x += 1;
        key = `${x},${position.y}`;
      }
      occupied.set(key, areaId);
      layout[areaId] = { x, y: position.y };
    });
    return layout;
  }

  getExitDirection(exit, area) {
    if (exit.x <= 0) return "left";
    if (exit.x >= area.width - 1) return "right";
    if (exit.y <= 0) return "up";
    if (exit.y >= area.height - 1) return "down";
    return "right";
  }

  getNextObjective() {
    const missions = this.progress.completedMissions;
    const chapterId = this.currentArea?.chapterId;

    if (chapterId === "high-school") {
      if (!missions.includes("hs-schedule")) return "Habla con Valeria. Lee el horario del instituto.";
      if (!missions.includes("hs-opinions")) return "Habla con Marcos. Practica me gusta y prefiero.";
      if (!missions.includes("hs-hall-pass")) return "Entra al pasillo. Habla con Elena sobre antes de la campana.";
      if (!missions.includes("hs-club-form")) return "Habla con Javier en el pasillo. Explica una preferencia.";
      if (!missions.includes("hs-gym-practice")) return "Ve al gimnasio. Practica tener que y entrenar.";
      if (!missions.includes("hs-team-talk")) return "Habla con Marcos en el gimnasio sobre el equipo.";
      if (!missions.includes("hs-buy-lunch")) return "Ve a la cafetería. Compra almuerzo para un amigo.";
      if (!missions.includes("hs-lunch-delivery")) return "Entrega el almuerzo a Valeria.";
      if (!missions.includes("hs-join-club")) return "Ve al club/laboratorio y entrega el formulario.";
      if (!missions.includes("hs-science-kit")) return "Completa la conversación del laboratorio.";
      if (!missions.includes("hs-final-review")) return "Habla con Valeria en el club para el repaso final.";
    }

    if (chapterId === "college") {
      if (!missions.includes("college-orientation")) return "Habla con Valeria en la plaza universitaria.";
      if (!missions.includes("college-plan")) return "Habla con Marcos y entiende el plan del día.";
      if (!missions.includes("college-roommate")) return "Ve al dormitorio y habla con tu compañera.";
      if (!missions.includes("college-dorm-complete")) return "Encuentra la llave del dormitorio.";
      if (!missions.includes("college-buy-supplies")) return "Ve a la librería y compra libro de texto y calculadora.";
      if (!missions.includes("college-study-plan")) return "Ve a la biblioteca y habla con Sofia.";
      if (!missions.includes("college-library-complete")) return "Busca apuntes y explica tu plan de estudio.";
      if (!missions.includes("college-buy-coffee")) return "Ve al café y pide un café con cortesía.";
      if (!missions.includes("college-final-review")) return "Habla con Marcos en el café para el repaso final.";
    }

    if (!missions.includes("elem-greeting")) return "Habla con Ana. Escucha: Buenos días.";
    if (!missions.includes("elem-introduction")) return "Habla con Mateo. Practica: Me llamo estudiante.";
    if (!missions.includes("elem-entrance-ready")) return "Completa la entrada: saludo, nombre, direcciones y palabras amables.";
    if (!missions.includes("elem-classroom-complete")) return "Ve al aula. Aprende objetos, colores y números.";
    if (!missions.includes("elem-playground-complete")) return "Ve al patio. Practica acciones y direcciones.";
    if (!missions.includes("elem-cafeteria-complete")) return "Ve a la cafetería. Pide comida con por favor.";
    if (!missions.includes("elem-library-complete")) return "Ve a la biblioteca y arte. Repasa sentimientos, colores y formas.";
    if (!missions.includes("elem-final-review")) return "Vuelve a la entrada y habla con la directora.";
    return "All current El Camino missions are complete.";
  }

  async loadConfiguredAreas() {
    try {
      const { areas, startingAreaId } = await loadAreaConfigs();
      this.areas = areas;
      this.startingAreaId = startingAreaId;

      const save = readSave(this.areas, this.startingAreaId);
      this.progress = save.progress;
      this.chapterPositions = save.chapterPositions;
      this.loadArea(save.current.areaId, save.current.x, save.current.y, save.current.facing || "down");
    } catch (error) {
      console.error("Unable to load El Camino areas:", error);
      this.emitStatus("El Camino could not load its area files.");
    }
  }

  emitChoices(choiceConfig) {
    this.game.events.emit("el-camino-question", choiceConfig);
  }

  runInteractions(entity, fallbackMessage) {
    const interaction = entity.interactions?.find((candidate) => this.matchesConditions(candidate.when));
    if (!interaction) {
      this.emitStatus(fallbackMessage);
      return;
    }
    this.runActions(interaction.actions || []);
  }

  matchesConditions(conditions = {}) {
    return this.hasCompleted(conditions.completedSteps, this.progress.completedSteps)
      && this.hasCompleted(conditions.completedMissions, this.progress.completedMissions)
      && this.hasMissing(conditions.missingSteps, this.progress.completedSteps)
      && this.hasMissing(conditions.missingMissions, this.progress.completedMissions)
      && this.hasItems(conditions.hasItems)
      && this.missingItems(conditions.missingItems);
  }

  hasCompleted(required = [], completed = []) {
    return required.every((id) => completed.includes(id));
  }

  hasMissing(requiredMissing = [], completed = []) {
    return requiredMissing.every((id) => !completed.includes(id));
  }

  hasItems(required = []) {
    return required.every(({ itemId, count = 1 }) => (this.progress.inventory[itemId] || 0) >= count);
  }

  missingItems(requiredMissing = []) {
    return requiredMissing.every(({ itemId, count = 1 }) => (this.progress.inventory[itemId] || 0) < count);
  }

  runActions(actions = []) {
    const messages = [];
    actions.forEach((action) => {
      switch (action.type) {
        case "showDialogue":
          messages.push(action.speaker ? `<dialogue>${action.speaker}<name> ${action.text}` : `<dialogue>${action.text}`);
          break;
        case "addItem":
          this.addItem(action.itemId, action.count);
          messages.push(`Got ${this.getItemName(action.itemId)}.`);
          break;
        case "removeItem":
          this.addItem(action.itemId, -(action.count || 1));
          break;
        case "completeStep":
          this.completeUnique(this.progress.completedSteps, action.stepId);
          break;
        case "completeMission":
          this.completeUnique(this.progress.completedMissions, action.missionId);
          break;
        case "setFlag":
          this.progress.flags[action.flag] = action.value ?? true;
          break;
        case "askChoice":
        case "askAudioChoice": {
          const randomizedOptions = action.shuffle === false
            ? action.options.map((option, index) => ({ ...option, index }))
            : shuffleOptions(action.options);
          this.pendingChoice = { ...action, options: randomizedOptions };
          this.emitChoices({
            kind: action.type === "askAudioChoice" || action.audioText ? "audioChoice" : "choice",
            prompt: action.prompt,
            audioText: action.audioText,
            options: randomizedOptions.map((option, index) => ({ index, label: option.label }))
          });
          break;
        }
        case "openDojoMenu":
          this.runActions([createDojoMenuAction()]);
          break;
        case "askText":
        case "askSpeech":
          this.pendingChoice = action;
          this.emitChoices({
            kind: action.type === "askSpeech" ? "speech" : "text",
            prompt: action.prompt,
            audioText: action.audioText,
            placeholder: action.placeholder
          });
          break;
        case "askBossQuiz":
          this.startBossQuiz(action);
          break;
        default:
          break;
      }
    });

    this.saveCurrentPosition(this.playerTile.facing);
    if (messages.length > 0) {
      this.emitStatus(messages.join("<break>"));
    }
  }

  handleChoice(index) {
    this.handleAnswer(index);
  }

  handleAnswer(answer) {
    if (!this.pendingChoice) return;
    const choiceConfig = this.pendingChoice;

    if (choiceConfig.type === "askBossQuiz") {
      this.handleBossAnswer(answer);
      return;
    }

    if (choiceConfig.type === "askChoice") {
      const selected = choiceConfig.options[answer];
      if (!selected) return;
      if (selected.correct) {
        this.pendingChoice = null;
        this.emitChoices(null);
        this.runActions(selected.actions || []);
        return;
      }

      this.emitStatus(choiceConfig.wrongMessage || "Not quite. Try again.");
      return;
    }

    if (["askText", "askSpeech"].includes(choiceConfig.type)) {
      const normalized = normalizeAnswer(answer);
      const correctAnswers = choiceConfig.correctAnswers || [];
      const isCorrect = correctAnswers.some((correctAnswer) => normalizeAnswer(correctAnswer) === normalized);
      if (isCorrect) {
        this.pendingChoice = null;
        this.emitChoices(null);
        this.runActions(choiceConfig.actions || []);
        return;
      }

      this.emitStatus(choiceConfig.wrongMessage || "Not quite. Try again.");
      return;
    }

    if (choiceConfig.type === "askAudioChoice") {
      const selected = choiceConfig.options[answer];
      if (!selected) return;
      if (selected.correct) {
        this.pendingChoice = null;
        this.emitChoices(null);
        this.runActions(selected.actions || []);
        return;
      }

      this.emitStatus(choiceConfig.wrongMessage || "Listen again and try another answer.");
      return;
    }

    if (choiceConfig.correct) {
      this.pendingChoice = null;
      this.emitChoices(null);
      this.runActions(choiceConfig.actions || []);
      return;
    }
  }

  addItem(itemId, count = 1) {
    const nextCount = Math.max(0, (this.progress.inventory[itemId] || 0) + count);
    this.progress.inventory[itemId] = nextCount;
  }

  startBossQuiz(action) {
    this.pendingChoice = {
      ...action,
      type: "askBossQuiz",
      currentIndex: 0
    };
    this.emitBossQuestion();
  }

  emitBossQuestion() {
    const boss = this.pendingChoice;
    const question = boss.questions[boss.currentIndex];
    if (!question) return;

    boss.currentQuestion = {
      ...question,
      options: question.options ? shuffleOptions(question.options) : undefined
    };

    const prefix = `${boss.title || "Boss"} ${boss.currentIndex + 1}/${boss.questions.length}`;
    if (["askChoice", "askAudioChoice"].includes(question.type)) {
      this.emitChoices({
        kind: question.type === "askAudioChoice" || question.audioText ? "audioChoice" : "choice",
        prompt: `${prefix}: ${question.prompt}`,
        audioText: question.audioText,
        options: boss.currentQuestion.options.map((option, index) => ({ index, label: option.label }))
      });
      return;
    }

    this.emitChoices({
      kind: question.type === "askSpeech" ? "speech" : "text",
      prompt: `${prefix}: ${question.prompt}`,
      audioText: question.audioText,
      placeholder: question.placeholder
    });
  }

  handleBossAnswer(answer) {
    const boss = this.pendingChoice;
    const question = boss.currentQuestion;
    let isCorrect = false;
    let actions = [];

    if (["askChoice", "askAudioChoice"].includes(question.type)) {
      const selected = question.options?.[answer];
      isCorrect = !!selected?.correct;
      actions = selected?.actions || [];
    } else {
      const normalized = normalizeAnswer(answer);
      isCorrect = (question.correctAnswers || []).some((correctAnswer) => normalizeAnswer(correctAnswer) === normalized);
      actions = question.actions || [];
    }

    if (!isCorrect) {
      // boss.currentIndex = 0;
      this.emitStatus(boss.restartMessage || "No. El duelo empieza de nuevo.");
      this.emitBossQuestion();
      return;
    }

    if (actions.length) this.runActions(actions);
    if (this.pendingChoice !== boss) return;

    boss.currentIndex += 1;
    if (boss.currentIndex >= boss.questions.length) {
      const completeActions = boss.actions || [];
      this.pendingChoice = null;
      this.emitChoices(null);
      this.runActions(completeActions);
      return;
    }

    this.emitBossQuestion();
  }

  completeUnique(list, id) {
    if (id && !list.includes(id)) {
      list.push(id);
    }
  }

  getItemName(itemId) {
    return items[itemId]?.name || itemId;
  }

  positionKey(x, y) {
    return `${x},${y}`;
  }

  shutdown() {
    this.game.events.off("el-camino-move", this.movePlayer, this);
    this.game.events.off("el-camino-reset", this.resetPlayer, this);
    this.game.events.off("el-camino-choice", this.handleChoice, this);
    this.game.events.off("el-camino-answer", this.handleAnswer, this);
    this.scale.off("resize", this.handleResize, this);
  }
}
