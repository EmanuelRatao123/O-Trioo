import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultSave, migrateSavePayload } from './saveSystem';
import { GRAPHICS_PRESET_CONFIGS, getPresetConfig } from './graphicsProfile';

test('migrateSavePayload preserves legacy progress and safely defaults new universe/graphics fields', () => {
  const legacyV1Save = {
    characterId: 'duck',
    chaosScore: 4850,
    goalsScored: 3,
    pranksPulled: 19,
    discoveredSecrets: ['secret_tunnel', 'rooftop'],
    uniqueCombos: ['1-2-3-4-5-6'],
  };

  const migrated = migrateSavePayload(legacyV1Save);
  assert.equal(migrated.characterId, 'duck');
  assert.equal(migrated.chaosScore, 4850);
  assert.equal(migrated.goalsScored, 3);
  assert.equal(migrated.pranksPulled, 19);
  assert.deepEqual(migrated.discoveredSecrets, ['secret_tunnel', 'rooftop']);
  assert.equal(migrated.universe, 'animal');
  assert.equal(migrated.settings.graphics.preset, 'high');
  assert.equal(migrated.settings.joystickSize, 1.0);
});

test('migrateSavePayload handles corrupted or null inputs safely', () => {
  const def = createDefaultSave();
  const safe = migrateSavePayload(null);
  assert.equal(safe.universe, def.universe);
  assert.equal(safe.characterId, def.characterId);
  assert.ok(safe.inventory.length >= 2);
});

test('graphics presets scale shadow resolution, renderScale, and NPC distance cleanly', () => {
  const low = getPresetConfig('low');
  const extreme = getPresetConfig('extreme');
  assert.equal(low.shadowResolution, 0);
  assert.ok(low.renderScale < extreme.renderScale);
  assert.ok(low.npcSimDistance < extreme.npcSimDistance);
  assert.equal(GRAPHICS_PRESET_CONFIGS.ultra.postProcessing, true);
});
