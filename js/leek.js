// Generated by CoffeeScript 1.11.0
var DEBUG, MAP_CENTER, MAP_SIZE, attackAnything, debugMarkCells, getAggroMap, getCombosOnCell, getDangerMap, getMovements, getToolBaseDamages, gridLines, gridLozenge, indexBoot, main, moveAndAttackInPath, moveToCell, toolTargets, weaponBestDamageOnTarget, weaponBestRange, weaponCanAttack, weaponLeekBestRange, weaponSelect;

DEBUG = true;

global startTurn = getEntityTurnOrder();

global pPlaysFirst = startTurn == 1;

global pWeapons  = getWeapons();

global pWeaponsEffects = [];

global enemies = getAliveEnemies();

enemies = getAliveEnemies();;

global gObstacles = getObstacles();

global dangerMap = [];

if (!booted) {
  indexBoot = 0;
  while (indexBoot < count(pWeapons)) {
    pWeaponsEffects[indexBoot] = getWeaponEffects(pWeapons);
    indexBoot++;
  }
}

if (DEBUG && !booted) {
  debug("bootstrap:");
  debug("startTurn:");
  debug(startTurn);
  debug("pPlaysFirst:");
  debug(pPlaysFirst);
  debug("pWeapons:");
  debug(pWeapons);
  debug("pWeaponsEffects:");
  debug(pWeaponsEffects);
  debug("enemies:");
  debug(enemies);
  debug("----------------");
}

global booted = true;

debugMarkCells = function(cellArray, color) {
  var i;
  i = 0;
  while (i < count(cellArray)) {
    mark(cellArray[i], color);
    i++;
  }
};

getDangerMap = function(enemyId, cellId, allWeapons) {
  var cTargets, checkWeapons, chips, i, targets, wTargets, weapon, weapons, z;
  if (allWeapons && dangerMap[enemyId] !== null && dangerMap[enemyId][cellId] !== null) {
    return dangerMap[enemyId][cellId];
  }
  if (dangerMap[enemyId] === null) {
    dangerMap[enemyId] = [];
  }
  if (dangerMap[enemyId][cellId] === null) {
    dangerMap[enemyId][cellId] = [];
  }
  weapons = getWeapons(enemyId);
  chips = getChips(enemyId);
  targets = [];
  if (allWeapons) {
    checkWeapons = weapons;
  } else {
    weapon = getWeapon(enemyId);
    if (weapon !== null) {
      checkWeapons = [weapon];
    } else {
      checkWeapons = [];
    }
  }
  i = 0;
  while (i < count(checkWeapons)) {
    wTargets = toolTargets(checkWeapons[i], cellId);
    z = 0;
    while (z < count(wTargets)) {
      if (!inArray(targets, wTargets[z])) {
        push(targets, wTargets[z]);
      }
      z++;
    }
    i++;
  }
  i = 0;
  while (i < count(chips)) {
    cTargets = toolTargets(chips[i], cellId);
    z = 0;
    while (z < count(cTargets)) {
      if (!inArray(targets, cTargets[z])) {
        push(targets, cTargets[z]);
      }
      z++;
    }
    i++;
  }
  if (allWeapons) {
    dangerMap[enemyId][cellId] = targets;
  }
  return targets;
};

MAP_SIZE = 17;

MAP_CENTER = 305;

gridLozenge = function(centerCellId, innerRadius, outerRadius, checkObstacles, shouldMark) {
  var cX, cY, cell, result, x, y;
  cX = getCellX(centerCellId);
  cY = getCellY(centerCellId);
  x = cX - outerRadius;
  result = [];
  while (x <= cX + outerRadius) {
    y = cY - outerRadius;
    while (y <= cY + outerRadius) {
      cell = getCellFromXY(x, y);
      if (cell !== null && getCellDistance(centerCellId, cell) <= outerRadius && getCellDistance(centerCellId, cell) >= innerRadius && (!checkObstacles || !inArray(gObstacles, cell))) {
        push(result, cell);
        if (shouldMark !== false) {
          mark(cell, shouldMark);
        }
      }
      y++;
    }
    x++;
  }
  return result;
};

gridLines = function(centerCellId, innerRadius, outerRadius, checkObstacles, shouldMark) {
  var cX, cY, cell, result, x, y;
  cX = getCellX(centerCellId);
  cY = getCellY(centerCellId);
  result = [];
  x = cX - outerRadius;
  while (x <= cX + outerRadius) {
    cell = getCellFromXY(x, cY);
    if (cell !== null && getCellDistance(centerCellId, cell) >= innerRadius && (!checkObstacles || !inArray(gObstacles, cell))) {
      push(result, cell);
      if (shouldMark !== false) {
        mark(cell, shouldMark);
      }
    }
    x++;
  }
  y = cY - outerRadius;
  while (y <= cY + outerRadius) {
    cell = getCellFromXY(cX, y);
    if (cell !== null && getCellDistance(centerCellId, cell) >= innerRadius && (!checkObstacles || !inArray(gObstacles, cell))) {
      push(result, cell);
      if (shouldMark !== false) {
        mark(cell, shouldMark);
      }
    }
    y++;
  }
  return result;
};

getMovements = function(fromCell, MP) {
  var mov, movementIndex, validMov;
  mov = gridLozenge(fromCell, 0, MP, true, false);
  validMov = [];
  movementIndex = 0;
  while (movementIndex < count(mov)) {
    if (getPathLength(mov[movementIndex], fromCell) <= MP) {
      push(validMov, mov[movementIndex]);
    }
    movementIndex++;
  }
  return validMov;
};

getAggroMap = function(cellId, MP) {
  var enemyIndex, map, movementIndex, movements, targets;
  targets = [];
  movements = getMovements(cellId, MP);
  enemyIndex = 0;
  while (enemyIndex < count(enemies)) {
    movementIndex = 0;
    while (movementIndex < count(movements)) {
      map = getDangerMap(getLeek(), movements[movementIndex], true);
      if (inArray(map, getCell(enemies[enemyIndex]))) {
        push(targets, movements[movementIndex]);
      }
      movementIndex++;
    }
    enemyIndex++;
  }
  return targets;
};

moveToCell = function(cell) {
  moveTowardCell(cell);
};

attackAnything = function() {
  var bFound, j;
  bFound = false;
  j = 0;
  while (!bFound && j < count(enemies)) {
    while (useChip(CHIP_SPARK, enemies[j]) > 0) {
      continue;
    }
    if (weaponCanAttack(getWeapon(), getCell(), getCell(enemies[j]))) {
      bFound = true;
      while (useWeapon(enemies[j]) > 0) {
        continue;
      }
    }
    j++;
  }
};

moveAndAttackInPath = function(path) {
  var i;
  i = 0;
  while (i < count(path)) {
    attackAnything();
    moveToCell(path[i]);
    attackAnything();
    i++;
  }
};

getCombosOnCell = function(leekId, cellId) {
  var equipedWeapon, turnPoints;
  equipedWeapon = getWeapon(leekId);
  return turnPoints = getTP(leekId);
};

getToolBaseDamages = function(toolId) {
  var damages, effects, i;
  damages = [];
  if (isChip(toolId)) {
    effects = getChipEffects(toolId);
  } else {
    effects = getWeaponEffects(toolId);
  }
  i = 0;
  while (i < count(effects)) {
    if (effects[i][0] === EFFECT_DAMAGE) {
      push(damages, [effects[i][1], effects[i][2]]);
    }
    i++;
  }
  return damages;
};

toolTargets = function(toolId, cellId) {
  var i, isW, maxRange, minRange, targets, targetsLos;
  isW = isWeapon(toolId);
  maxRange = isW ? getWeaponMaxRange(toolId) : getChipMaxRange(toolId);
  minRange = isW ? getWeaponMinRange(toolId) : getChipMinRange(toolId);
  if ((isW && !isInlineWeapon(toolId)) || (!isW && !isInlineChip(toolId))) {
    targets = gridLozenge(cellId, minRange, maxRange, true, false);
  } else {
    targets = gridLines(cellId, minRange, maxRange, true, false);
  }
  if ((isW && !weaponNeedLos(toolId)) || (!isW && !chipNeedLos(toolId))) {
    return targets;
  }
  i = 0;
  targetsLos = [];
  while (i < count(targets)) {
    if (lineOfSight(cellId, targets[i])) {
      push(targetsLos, targets[i]);
    }
    i++;
  }
  return targetsLos;
};

weaponSelect = function(weaponId) {
  if (getWeapon() !== weaponId) {
    return setWeapon(weaponId);
  }
};

weaponBestRange = function() {
  var i, max, maxWeapon, range;
  max = -1;
  i = 0;
  while (i < count(pWeapons)) {
    range = getWeaponMaxRange(pWeapons[i]);
    if (range > max) {
      max = range;
      maxWeapon = pWeapons[i];
    }
    i++;
  }
  return maxWeapon;
};

weaponLeekBestRange = function(leekId) {
  var i, lWeapons, max, maxWeapon, range;
  lWeapons = getWeapons(leekId);
  max = -1;
  i = 0;
  while (i < count(lWeapons)) {
    range = getWeaponMaxRange(lWeapons[i]);
    if (range > max) {
      max = range;
      maxWeapon = lWeapons[i];
    }
    i++;
  }
  return maxWeapon;
};

weaponBestDamageOnTarget = function(targetId) {};

weaponCanAttack = function(weaponId, fromCell, toCell) {
  var distance;
  distance = getCellDistance(fromCell, toCell);
  if (weaponNeedLos(weaponId) && !lineOfSight(fromCell, toCell)) {
    return false;
  } else if (isInlineWeapon(weaponId) && !isOnSameLine(fromCell, toCell)) {
    return false;
  } else if (getWeaponMinRange(weaponId) > distance || getWeaponMaxRange(weaponId) < distance) {
    return false;
  } else {
    return true;
  }
};

main = function() {
  var aggroMap, bFoundAttackPath, bFoundPseudoSafePath, bFoundSafePath, bestPathDistanceToMiddle, cellIndex, curWeapon, distance, enemiesDangerMaps, enemiesIndex, enemiesMovements, i, j, map, mapIndex, movements, path, pseudoMap, pseudoSafeMovements, safeMovements, subMovement, subMovementIndex;
  curWeapon = weaponBestRange();
  weaponSelect(curWeapon);
  movements = getMovements(getCell(), getMP());
  safeMovements = movements;
  pseudoSafeMovements = movements;
  enemiesIndex = 0;
  enemiesMovements = [];
  enemiesDangerMaps = [];
  while (enemiesIndex < count(enemies)) {
    enemiesMovements[enemies[enemiesIndex]] = getMovements(getCell(enemies[enemiesIndex]), getMP(enemies[enemiesIndex]));
    i = 0;
    while (i < count(enemiesMovements[enemies[enemiesIndex]])) {
      map = getDangerMap(enemies[enemiesIndex], enemiesMovements[enemies[enemiesIndex]][i], true);
      pseudoMap = getDangerMap(enemies[enemiesIndex], enemiesMovements[enemies[enemiesIndex]][i], false);
      debugMarkCells(pseudoMap, COLOR_RED);
      if (enemiesDangerMaps[enemies[enemiesIndex]] === null) {
        enemiesDangerMaps[enemies[enemiesIndex]] = [];
      }
      j = 0;
      while (j < count(pseudoMap)) {
        if (!inArray(enemiesDangerMaps[enemies[enemiesIndex]], pseudoMap[j])) {
          removeElement(safeMovements, pseudoMap[j]);
          removeElement(pseudoSafeMovements, pseudoMap[j]);
          push(enemiesDangerMaps[enemies[enemiesIndex]], pseudoMap[j]);
        }
        j++;
      }
      j = 0;
      while (j < count(map)) {
        if (!inArray(enemiesDangerMaps[enemies[enemiesIndex]], map[j])) {
          removeElement(safeMovements, map[j]);
          push(enemiesDangerMaps[enemies[enemiesIndex]], map[j]);
        }
        j++;
      }
      i++;
    }
    enemiesIndex++;
  }
  sort(safeMovements);
  sort(pseudoSafeMovements);
  debugMarkCells(movements, COLOR_BLUE);
  bFoundSafePath = false;
  bFoundPseudoSafePath = false;
  bFoundAttackPath = false;
  path = [];
  bestPathDistanceToMiddle = MAP_SIZE + 1;
  cellIndex = 0;
  aggroMap = getAggroMap(getCell(), getMP());
  debugMarkCells(aggroMap, getColor(255, 255, 0));
  debugMarkCells(safeMovements, COLOR_GREEN);
  mapIndex = 0;
  while (mapIndex < count(aggroMap)) {
    if (inArray(safeMovements, aggroMap[mapIndex])) {
      distance = getCellDistance(aggroMap[mapIndex], MAP_CENTER);
      if (!bFoundAttackPath || distance < bestPathDistanceToMiddle) {
        bestPathDistanceToMiddle = distance;
        path = [aggroMap[mapIndex]];
        bFoundSafePath = true;
        bFoundAttackPath = true;
      }
    } else if (!bFoundSafePath && inArray(pseudoSafeMovements, aggroMap[mapIndex])) {
      distance = getCellDistance(aggroMap[mapIndex], MAP_CENTER);
      if (!bFoundAttackPath || distance < bestPathDistanceToMiddle) {
        bestPathDistanceToMiddle = distance;
        path = [aggroMap[mapIndex]];
        bFoundPseudoSafePath = true;
        bFoundAttackPath = true;
      }
    } else {
      subMovement = getMovements(aggroMap[mapIndex], getMP() - getPathLength(getCell(), aggroMap[mapIndex]));
      subMovementIndex = 0;
      while (subMovementIndex < count(subMovement)) {
        if (inArray(safeMovements, subMovement[subMovementIndex])) {
          distance = getCellDistance(aggroMap[mapIndex], MAP_CENTER);
          if (!bFoundAttackPath || distance < bestPathDistanceToMiddle) {
            bestPathDistanceToMiddle = distance;
            path = [aggroMap[mapIndex], subMovement[subMovementIndex]];
            bFoundSafePath = true;
            bFoundAttackPath = true;
          }
        }
        subMovementIndex++;
      }
    }
    mapIndex++;
  }
  if (!(bFoundAttackPath && bFoundSafePath)) {
    while (cellIndex < count(movements)) {
      distance = getCellDistance(movements[cellIndex], MAP_CENTER);
      if (inArray(safeMovements, movements[cellIndex])) {
        if (!bFoundSafePath || distance < bestPathDistanceToMiddle) {
          bFoundSafePath = true;
          path = [movements[cellIndex]];
          bestPathDistanceToMiddle = distance;
        }
      } else if (!bFoundSafePath && inArray(pseudoSafeMovements, aggroMap[mapIndex])) {
        if (!bFoundAttackPath || distance < bestPathDistanceToMiddle) {
          bFoundPseudoSafePath = true;
          path = [movements[cellIndex]];
          bestPathDistanceToMiddle = distance;
        }
      } else if (!bFoundSafePath && !bFoundPseudoSafePath) {
        if (!bFoundAttackPath || distance < bestPathDistanceToMiddle) {
          path = [movements[cellIndex]];
          bestPathDistanceToMiddle = distance;
        }
      }
      cellIndex++;
    }
  }
  debug("bFoundSafePath:");
  debug(bFoundSafePath);
  debug("bFoundPseudoSafePath:");
  debug(bFoundPseudoSafePath);
  debug("bFoundAttackPath");
  debug(bFoundAttackPath);
  debug("path");
  debug(path);
  moveAndAttackInPath(path);
};

main();

debug("Instructions:");

debug(getOperations());
