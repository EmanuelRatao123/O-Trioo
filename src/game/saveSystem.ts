import {
  CharacterId,
  GameSettings,
  InventoryItem,
  UniverseMode,
} from './types';
import { getPresetConfig } from './graphicsProfile';

export const SAVE_STORAGE_KEY = 'rt_o_trio_save_data';

export interface SavePayload {
  version: number;
  universe: UniverseMode;
  characterId: CharacterId;
  chaosScore: number;
  goalsScored: number;
  pranksPulled: number;
  npcsStartled: number;
  schoolMinutes: number;
  discoveredSecrets: string[];
  uniqueCombos: string[];
  inventory: InventoryItem[];
  fullscreenPreferred: boolean;
  settings: GameSettings;
}

export function createDefaultSettings(): GameSettings {
  return {
    soundEnabled: true,
    ambienceVolume: 0.35,
    sfxVolume: 0.7,
    cameraSensitivity: 1.0,
    invertCameraY: false,
    timeScale: 1.0,
    mobileControls: 'auto',
    joystickSize: 1.0,
    hudScale: 1.0,
    showPerformanceOverlay: false,
    graphics: getPresetConfig('high'),
  };
}

export function createDefaultSave(): SavePayload {
  return {
    version: 2,
    universe: 'animal',
    characterId: 'rat',
    chaosScore: 0,
    goalsScored: 0,
    pranksPulled: 0,
    npcsStartled: 0,
    schoolMinutes: 7 * 60 + 25,
    discoveredSecrets: [],
    uniqueCombos: [],
    inventory: [
      { id: 'inv-chalk', name: 'Giz Colorido', description: 'Ótimo para distrair professores.', kind: 'book', quantity: 3, chaosBonus: 15 },
      { id: 'inv-stink', name: 'Bolinha de Espuma', description: 'Cria nuvem cômica ao lançar!', kind: 'beaker', quantity: 2, chaosBonus: 35 },
    ],
    fullscreenPreferred: false,
    settings: createDefaultSettings(),
  };
}

/**
 * Backward-compatible save loader: migrates old/partial v1 saves safely
 * without erasing any existing progress, inventory, or discoveries.
 */
export function migrateSavePayload(raw: unknown): SavePayload {
  const def = createDefaultSave();
  if (!raw || typeof raw !== 'object') return def;
  const obj = raw as Record<string, unknown>;

  const rawSettings = (obj.settings && typeof obj.settings === 'object' ? obj.settings : {}) as Record<string, unknown>;
  const rawGraphics = (rawSettings.graphics && typeof rawSettings.graphics === 'object'
    ? rawSettings.graphics
    : {}) as Record<string, unknown>;

  const preset =
    rawGraphics.preset === 'low' ||
    rawGraphics.preset === 'medium' ||
    rawGraphics.preset === 'high' ||
    rawGraphics.preset === 'ultra' ||
    rawGraphics.preset === 'extreme' ||
    rawGraphics.preset === 'custom'
      ? rawGraphics.preset
      : def.settings.graphics.preset;

  const baseGfx = getPresetConfig(preset);

  return {
    version: 2,
    universe: obj.universe === 'human' ? 'human' : 'animal',
    characterId:
      obj.characterId === 'duck' || obj.characterId === 'eagle' || obj.characterId === 'rat'
        ? obj.characterId
        : def.characterId,
    chaosScore: typeof obj.chaosScore === 'number' && Number.isFinite(obj.chaosScore) ? obj.chaosScore : 0,
    goalsScored: typeof obj.goalsScored === 'number' ? obj.goalsScored : 0,
    pranksPulled: typeof obj.pranksPulled === 'number' ? obj.pranksPulled : 0,
    npcsStartled: typeof obj.npcsStartled === 'number' ? obj.npcsStartled : 0,
    schoolMinutes:
      typeof obj.schoolMinutes === 'number' && obj.schoolMinutes >= 0
        ? obj.schoolMinutes
        : def.schoolMinutes,
    discoveredSecrets: Array.isArray(obj.discoveredSecrets)
      ? obj.discoveredSecrets.filter((x): x is string => typeof x === 'string')
      : [],
    uniqueCombos: Array.isArray(obj.uniqueCombos)
      ? obj.uniqueCombos.filter((x): x is string => typeof x === 'string')
      : [],
    inventory: Array.isArray(obj.inventory) && obj.inventory.length > 0
      ? (obj.inventory as InventoryItem[])
      : def.inventory,
    fullscreenPreferred: typeof obj.fullscreenPreferred === 'boolean' ? obj.fullscreenPreferred : false,
    settings: {
      soundEnabled: typeof rawSettings.soundEnabled === 'boolean' ? rawSettings.soundEnabled : def.settings.soundEnabled,
      ambienceVolume: typeof rawSettings.ambienceVolume === 'number' ? rawSettings.ambienceVolume : def.settings.ambienceVolume,
      sfxVolume: typeof rawSettings.sfxVolume === 'number' ? rawSettings.sfxVolume : def.settings.sfxVolume,
      cameraSensitivity: typeof rawSettings.cameraSensitivity === 'number' ? rawSettings.cameraSensitivity : def.settings.cameraSensitivity,
      invertCameraY: typeof rawSettings.invertCameraY === 'boolean' ? rawSettings.invertCameraY : def.settings.invertCameraY,
      timeScale: typeof rawSettings.timeScale === 'number' ? rawSettings.timeScale : def.settings.timeScale,
      mobileControls:
        rawSettings.mobileControls === 'on' || rawSettings.mobileControls === 'off' || rawSettings.mobileControls === 'auto'
          ? rawSettings.mobileControls
          : def.settings.mobileControls,
      joystickSize: typeof rawSettings.joystickSize === 'number' ? rawSettings.joystickSize : def.settings.joystickSize,
      hudScale: typeof rawSettings.hudScale === 'number' ? rawSettings.hudScale : def.settings.hudScale,
      showPerformanceOverlay:
        typeof rawSettings.showPerformanceOverlay === 'boolean'
          ? rawSettings.showPerformanceOverlay
          : def.settings.showPerformanceOverlay,
      graphics: {
        ...baseGfx,
        ...rawGraphics,
        preset,
      },
    },
  };
}

export function loadSavedGame(): SavePayload {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return createDefaultSave();
    const raw = window.localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return createDefaultSave();
    return migrateSavePayload(JSON.parse(raw));
  } catch {
    return createDefaultSave();
  }
}

export function persistSaveGame(payload: SavePayload): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore quota errors gracefully
  }
}
