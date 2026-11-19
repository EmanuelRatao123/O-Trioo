import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TOTAL_PROCEDURAL_COMBINATIONS,
  computeInteractionOutcome,
  evaluateSchedulePhase,
  formatSchoolClock,
  calculateSlapstickKnockback,
} from './proceduralChaos';

test('procedural matrix exceeds 100,000 unique gameplay combinations', () => {
  assert.ok(
    TOTAL_PROCEDURAL_COMBINATIONS > 100_000,
    `Expected > 100,000 combinations, got ${TOTAL_PROCEDURAL_COMBINATIONS}`,
  );
  assert.equal(TOTAL_PROCEDURAL_COMBINATIONS, 1_088_640);
});

test('computeInteractionOutcome produces distinct deterministic hashes across axes', () => {
  const a = computeInteractionOutcome({
    characterId: 'duck',
    verb: 'quack_blast',
    prop: 'megaphone',
    phase: 'recess',
    personality: 'rigido',
    zoneName: 'Pátio Central',
  });
  const b = computeInteractionOutcome({
    characterId: 'rat',
    verb: 'sneak_climb',
    prop: 'beaker',
    phase: 'morning_classes',
    personality: 'nerd',
    zoneName: 'Lab de Ciências',
  });
  assert.notEqual(a.comboHash, b.comboHash);
  assert.ok(a.chaosPoints > 0);
  assert.ok(a.title.includes('Pedro H.'));
  assert.ok(b.title.includes('Emanuel'));
});

test('schedule phases map school hours accurately', () => {
  assert.equal(evaluateSchedulePhase(7 * 60 + 30).id, 'arrival');
  assert.equal(evaluateSchedulePhase(8 * 60 + 45).id, 'morning_classes');
  assert.equal(evaluateSchedulePhase(10 * 60 + 15).id, 'recess');
  assert.equal(evaluateSchedulePhase(12 * 60).id, 'lunch');
  assert.equal(evaluateSchedulePhase(14 * 60).id, 'afternoon_classes');
  assert.equal(evaluateSchedulePhase(16 * 60 + 30).id, 'dismissal');
  assert.equal(evaluateSchedulePhase(19 * 60).id, 'after_school');
  assert.equal(formatSchoolClock(7 * 60 + 5), '07:05');
});

test('slapstick knockback launches target away with upward arc', () => {
  const kb = calculateSlapstickKnockback({ x: 0, y: 0, z: 0 }, { x: 3, y: 0, z: 4 }, 10);
  assert.ok(Math.abs(kb.vx - 6) < 0.001);
  assert.ok(Math.abs(kb.vz - 8) < 0.001);
  assert.ok(kb.vy >= 4.5);
});
