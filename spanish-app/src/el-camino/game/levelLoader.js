const AREA_CONTENT_ROOT = `${process.env.PUBLIC_URL || ""}/el-camino/areas`;
const MIN_OUTDOOR_SIZE = { width: 28, height: 20 };
const MIN_INTERIOR_SIZE = { width: 18, height: 12 };

function normalizeMapText(mapText) {
  return mapText
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
}

function validateArea(area) {
  if (!area.id) throw new Error("El Camino area is missing id.");
  if (!area.name) throw new Error(`El Camino area ${area.id} is missing name.`);
  if (!area.playerStart) throw new Error(`El Camino area ${area.id} is missing playerStart.`);
  if (!area.legend) throw new Error(`El Camino area ${area.id} is missing legend.`);
  if (!area.rows?.length) throw new Error(`El Camino area ${area.id} has an empty map.`);

  const width = area.rows[0].length;
  const badRow = area.rows.find((row) => row.length !== width);
  if (badRow) throw new Error(`El Camino area ${area.id} has inconsistent map row widths.`);

  return {
    ...area,
    width,
    height: area.rows.length,
    objects: area.objects || [],
    people: area.people || [],
    exits: area.exits || []
  };
}

function getFillTile(area) {
  if (area.defaultTile) return area.defaultTile;
  if (area.legend.g) return "g";
  if (area.legend.w) return "w";
  return Object.keys(area.legend)[0];
}

function getMinimumSize(area) {
  return area.kind === "interior" ? MIN_INTERIOR_SIZE : MIN_OUTDOOR_SIZE;
}

function shiftPoint(point, padX, padY) {
  if (!point) return point;
  return {
    ...point,
    x: point.x + padX,
    y: point.y + padY
  };
}

function shiftEntrance(entrance, padX, padY) {
  if (!entrance) return entrance;
  return {
    ...entrance,
    x: entrance.x + padX,
    y: entrance.y + padY
  };
}

function expandAreaForPhone(area) {
  const minimumSize = getMinimumSize(area);
  const targetWidth = Math.max(area.width, minimumSize.width);
  const targetHeight = Math.max(area.height, minimumSize.height);
  const padX = Math.floor((targetWidth - area.width) / 2);
  const padY = Math.floor((targetHeight - area.height) / 2);
  const fillTile = getFillTile(area);
  const emptyRow = fillTile.repeat(targetWidth);
  const horizontalPad = fillTile.repeat(padX);
  const rightPad = fillTile.repeat(targetWidth - area.width - padX);
  const rows = [
    ...Array.from({ length: padY }, () => emptyRow),
    ...area.rows.map((row) => `${horizontalPad}${row}${rightPad}`),
    ...Array.from({ length: targetHeight - area.height - padY }, () => emptyRow)
  ];

  return {
    ...area,
    rows,
    width: targetWidth,
    height: targetHeight,
    playerStart: shiftPoint(area.playerStart, padX, padY),
    objects: area.objects.map((object) => ({
      ...object,
      x: object.x + padX,
      y: object.y + padY,
      entrance: shiftEntrance(object.entrance, padX, padY)
    })),
    people: area.people.map((person) => ({
      ...person,
      x: person.x + padX,
      y: person.y + padY
    })),
    exits: area.exits.map((exit) => ({
      ...exit,
      x: exit.x + padX,
      y: exit.y + padY
    })),
    layoutPadding: { x: padX, y: padY }
  };
}

function shiftTarget(targetAreaId, targetX, targetY, areasById) {
  const targetPadding = areasById[targetAreaId]?.layoutPadding || { x: 0, y: 0 };
  return {
    targetX: targetX + targetPadding.x,
    targetY: targetY + targetPadding.y
  };
}

function applyTargetPadding(area, areasById) {
  return {
    ...area,
    objects: area.objects.map((object) => {
      if (!object.entrance?.targetArea) return object;
      return {
        ...object,
        entrance: {
          ...object.entrance,
          ...shiftTarget(object.entrance.targetArea, object.entrance.targetX, object.entrance.targetY, areasById)
        }
      };
    }),
    exits: area.exits.map((exit) => {
      if (!exit.targetArea) return exit;
      return {
        ...exit,
        ...shiftTarget(exit.targetArea, exit.targetX, exit.targetY, areasById)
      };
    })
  };
}

export async function loadAreaConfigs() {
  const manifestResponse = await fetch(`${AREA_CONTENT_ROOT}/manifest.json`);
  if (!manifestResponse.ok) {
    throw new Error(`Unable to load El Camino area manifest: ${manifestResponse.status}`);
  }

  const manifest = await manifestResponse.json();
  const areaEntries = await Promise.all(
    manifest.areas.map(async (folder) => {
      const [areaResponse, mapResponse] = await Promise.all([
        fetch(`${AREA_CONTENT_ROOT}/${folder}/area.json`),
        fetch(`${AREA_CONTENT_ROOT}/${folder}/map.txt`)
      ]);

      if (!areaResponse.ok) throw new Error(`Unable to load area.json for ${folder}`);
      if (!mapResponse.ok) throw new Error(`Unable to load map.txt for ${folder}`);

      const area = await areaResponse.json();
      const mapText = await mapResponse.text();
      const normalizedArea = expandAreaForPhone(validateArea({
        ...area,
        rows: normalizeMapText(mapText)
      }));

      return [normalizedArea.id, normalizedArea];
    })
  );
  const paddedAreas = Object.fromEntries(areaEntries);
  const areas = Object.fromEntries(
    Object.entries(paddedAreas).map(([areaId, area]) => [areaId, applyTargetPadding(area, paddedAreas)])
  );

  return {
    areas,
    startingAreaId: manifest.startingAreaId
  };
}
