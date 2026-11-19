import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CLASSROOMS,
  SCHOOL_ZONES,
  buildWorldColliders,
  buildWorldFloorSurfaces,
  getFloorHeightAt,
  getZoneAt,
  resolveCircleAABB,
} from './worldLayout';

test('school contains more than 20 distinct classrooms', () => {
  assert.ok(CLASSROOMS.length >= 22, `Expected >= 22 classrooms, got ${CLASSROOMS.length}`);
  const ids = new Set(CLASSROOMS.map((c) => c.id));
  assert.equal(ids.size, CLASSROOMS.length);
});

test('spawn point in courtyard is open and unobstructed', () => {
  const colliders = buildWorldColliders();
  const res = resolveCircleAABB(0, 0, 18, 0.5, 1.2, colliders);
  assert.equal(res.x, 0);
  assert.equal(res.z, 18);
  assert.equal(getZoneAt(0, 0, 18).id, 'courtyard');
});

test('main gate is open for free exit to surrounding streets', () => {
  const colliders = buildWorldColliders();
  const res = resolveCircleAABB(0, 0, 42, 0.5, 1.2, colliders);
  assert.equal(res.x, 0);
  assert.equal(res.z, 42);
  assert.equal(getZoneAt(0, 0, 76).id, 'streets');
});

test('multi-story floors, rooftops, and secret tunnels return expected heights', () => {
  const floors = buildWorldFloorSurfaces();
  assert.equal(getFloorHeightAt(0, 0, 18, floors), 0);
  assert.equal(getFloorHeightAt(14, 5, -18, floors), 5);
  assert.equal(getFloorHeightAt(0, 10, -22, floors), 10);
  assert.equal(getFloorHeightAt(-18, -3.5, -14, floors), -3.5);
  assert.ok(SCHOOL_ZONES.some((z) => z.id === 'secret_tunnel'));
});
