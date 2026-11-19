import * as THREE from 'three';
import { AnimalSpecies, CharacterId, NpcRole, PropKind, UniverseMode } from './types';

export interface ProceduralTexturePack {
  courtyardTile: THREE.CanvasTexture;
  grass: THREE.CanvasTexture;
  asphalt: THREE.CanvasTexture;
  schoolWall: THREE.CanvasTexture;
  wallBump: THREE.CanvasTexture;
  classroomFloor: THREE.CanvasTexture;
  pitch: THREE.CanvasTexture;
  basketballCourt: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
}

function makeCanvasTexture(
  size: number,
  draw: (ctx: CanvasRenderingContext2D, s: number) => void,
  repeatX = 1,
  repeatY = 1,
  maxAniso = 4,
  isColor = true,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  draw(ctx, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.magFilter = THREE.NearestFilter;
  tex.anisotropy = maxAniso;
  return tex;
}

export function createProceduralTextures(
  maxAniso: number,
  quality: 'low' | 'medium' | 'high' = 'high',
): ProceduralTexturePack {
  const s = quality === 'low' ? 32 : quality === 'medium' ? 64 : 128;
  const half = s / 2;

  const courtyardTile = makeCanvasTexture(
    s,
    (ctx, sz) => {
      ctx.fillStyle = '#e7dfd0';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#d7ccb8';
      ctx.fillRect(0, 0, sz / 2, sz / 2);
      ctx.fillRect(sz / 2, sz / 2, sz / 2, sz / 2);
      ctx.strokeStyle = '#bfb198';
      ctx.lineWidth = Math.max(1, sz / 32);
      ctx.strokeRect(0, 0, sz / 2, sz / 2);
      ctx.strokeRect(sz / 2, sz / 2, sz / 2, sz / 2);
      // Subtle stone flecks
      ctx.fillStyle = 'rgba(120,113,108,0.12)';
      for (let i = 0; i < 18; i++) {
        ctx.fillRect((i * 17) % sz, (i * 29) % sz, Math.max(2, sz / 32), Math.max(2, sz / 32));
      }
    },
    22,
    22,
    maxAniso,
  );

  const grass = makeCanvasTexture(
    s,
    (ctx, sz) => {
      ctx.fillStyle = '#3e9c47';
      ctx.fillRect(0, 0, sz, sz);
      const greens = ['#48ad52', '#33853b', '#52ba5b', '#2f7a37'];
      const step = Math.max(2, sz / 16);
      for (let i = 0; i < 64; i++) {
        ctx.fillStyle = greens[i % greens.length];
        const x = ((i * 19) % 16) * step;
        const y = ((i * 31) % 16) * step;
        ctx.fillRect(x, y, step, step);
      }
    },
    34,
    34,
    maxAniso,
  );

  const asphalt = makeCanvasTexture(
    s,
    (ctx, sz) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, sz, sz);
      const dot = Math.max(2, sz / 16);
      for (let i = 0; i < 54; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#3e4d63' : '#263244';
        ctx.fillRect((i * 13) % (sz - dot), (i * 23) % (sz - dot), dot, dot);
      }
    },
    26,
    8,
    maxAniso,
  );

  const schoolWall = makeCanvasTexture(
    s,
    (ctx, sz) => {
      ctx.fillStyle = '#f9f4e8';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#eee3cd';
      for (let y = 0; y < sz; y += sz / 4) {
        ctx.fillRect(0, y, sz, Math.max(2, sz / 32));
      }
      // Subtle lower wainscoting brick tint
      ctx.fillStyle = '#e0d3ba';
      ctx.fillRect(0, sz * 0.75, sz, sz * 0.25);
    },
    4,
    2,
    maxAniso,
  );

  const wallBump = makeCanvasTexture(
    s,
    (ctx, sz) => {
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#9a9a9a';
      for (let y = 0; y < sz; y += sz / 8) {
        ctx.fillRect(0, y, sz, Math.max(1, sz / 32));
      }
      ctx.fillStyle = '#686868';
      for (let i = 0; i < 40; i++) {
        ctx.fillRect((i * 21) % sz, (i * 13) % sz, 2, 2);
      }
    },
    4,
    2,
    maxAniso,
    false,
  );

  const classroomFloor = makeCanvasTexture(
    s,
    (ctx, sz) => {
      ctx.fillStyle = '#ca9d70';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#ba8b5c';
      const w = half;
      const h = sz / 4;
      ctx.fillRect(0, 0, w, h);
      ctx.fillRect(w, h, w, h);
      ctx.fillRect(0, h * 2, w, h);
      ctx.fillRect(w, h * 3, w, h);
    },
    18,
    10,
    maxAniso,
  );

  const pitch = makeCanvasTexture(
    128,
    (ctx, sz) => {
      ctx.fillStyle = '#2f9e44';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#37b24d';
      for (let i = 0; i < 8; i += 2) {
        ctx.fillRect(i * 16, 0, 16, sz);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, sz - 8, sz - 8);
      ctx.beginPath();
      ctx.moveTo(sz / 2, 4);
      ctx.lineTo(sz / 2, sz - 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sz / 2, sz / 2, 18, 0, Math.PI * 2);
      ctx.stroke();
    },
    1,
    1,
    maxAniso,
  );

  const basketballCourt = makeCanvasTexture(
    128,
    (ctx, sz) => {
      ctx.fillStyle = '#2563eb';
      ctx.fillRect(0, 0, sz, sz);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(10, 10, sz - 20, sz - 20);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(10, 10, sz - 20, sz - 20);
      ctx.beginPath();
      ctx.moveTo(10, sz / 2);
      ctx.lineTo(sz - 10, sz / 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(sz / 2, sz / 2, 14, 0, Math.PI * 2);
      ctx.stroke();
    },
    1,
    1,
    maxAniso,
  );

  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const sctx = shadowCanvas.getContext('2d')!;
  const grad = sctx.createRadialGradient(32, 32, 4, 32, 32, 30);
  grad.addColorStop(0, 'rgba(15, 23, 42, 0.58)');
  grad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 64, 64);
  const contactShadow = new THREE.CanvasTexture(shadowCanvas);

  return {
    courtyardTile,
    grass,
    asphalt,
    schoolWall,
    wallBump,
    classroomFloor,
    pitch,
    basketballCourt,
    contactShadow,
  };
}

export function disposeTexturePack(pack: ProceduralTexturePack): void {
  Object.values(pack).forEach((tex) => tex.dispose());
}

export interface ArticulatedActorRig {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftLimb: THREE.Object3D;
  rightLimb: THREE.Object3D;
  leftWingOrArm?: THREE.Object3D;
  rightWingOrArm?: THREE.Object3D;
  tail?: THREE.Object3D;
  jaw?: THREE.Object3D;
  hairFlow?: THREE.Object3D;
}

const _boxCache = new Map<string, THREE.BoxGeometry>();
function boxGeo(w: number, h: number, d: number): THREE.BoxGeometry {
  const key = `${w.toFixed(3)}_${h.toFixed(3)}_${d.toFixed(3)}`;
  let g = _boxCache.get(key);
  if (!g) {
    g = new THREE.BoxGeometry(w, h, d);
    _boxCache.set(key, g);
  }
  return g;
}

const _matCache = new Map<string, THREE.MeshStandardMaterial>();
function stdMat(color: number, roughness = 0.72, metalness = 0.05): THREE.MeshStandardMaterial {
  const key = `${color}_${roughness}_${metalness}`;
  let m = _matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness, metalness });
    _matCache.set(key, m);
  }
  return m;
}

function addPart(
  parent: THREE.Object3D,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  color: number,
  roughness = 0.72,
  metalness = 0.05,
): THREE.Mesh {
  const mesh = new THREE.Mesh(boxGeo(w, h, d), stdMat(color, roughness, metalness));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addVoxelEye(head: THREE.Object3D, x: number, y: number, z: number, irisColor = 0x1e293b): void {
  addPart(head, 0.11, 0.1, 0.03, x, y, z, 0xffffff, 0.25, 0.05); // sclera
  addPart(head, 0.06, 0.075, 0.04, x, y, z - 0.008, irisColor, 0.15, 0.2); // pupil/iris
  addPart(head, 0.025, 0.025, 0.045, x + 0.015, y + 0.02, z - 0.012, 0xffffff, 0.1, 0.3); // glint
}

function addArticulatedHumanLimbs(
  body: THREE.Group,
  skinColor: number,
  sleeveColor: number,
  pantsColor: number,
  shoeColor: number,
  shoeAccent: number,
  scale = 1,
): { leftArm: THREE.Group; rightArm: THREE.Group; leftLeg: THREE.Group; rightLeg: THREE.Group } {
  const makeLeg = (sx: number) => {
    const leg = new THREE.Group();
    leg.position.set(sx * 0.13 * scale, 0.62 * scale, 0);
    // Thigh + knee + shin + sculpted sneaker
    addPart(leg, 0.19 * scale, 0.3 * scale, 0.2 * scale, 0, -0.15 * scale, 0, pantsColor, 0.85, 0.02);
    addPart(leg, 0.17 * scale, 0.24 * scale, 0.18 * scale, 0, -0.4 * scale, 0.01, pantsColor, 0.85, 0.02);
    addPart(leg, 0.19 * scale, 0.1 * scale, 0.28 * scale, 0, -0.56 * scale, -0.04 * scale, shoeColor, 0.55, 0.08);
    addPart(leg, 0.2 * scale, 0.04 * scale, 0.29 * scale, 0, -0.6 * scale, -0.04 * scale, 0xffffff, 0.45, 0.05);
    addPart(leg, 0.2 * scale, 0.04 * scale, 0.1 * scale, 0, -0.54 * scale, -0.1 * scale, shoeAccent, 0.4, 0.1);
    body.add(leg);
    return leg;
  };

  const makeArm = (sx: number) => {
    const arm = new THREE.Group();
    arm.position.set(sx * 0.31 * scale, 1.18 * scale, 0);
    // Shoulder cap + sleeve + forearm + sculpted hand with thumb
    addPart(arm, 0.16 * scale, 0.28 * scale, 0.16 * scale, 0, -0.12 * scale, 0, sleeveColor, 0.78, 0.03);
    addPart(arm, 0.13 * scale, 0.2 * scale, 0.13 * scale, 0, -0.34 * scale, -0.02, skinColor, 0.68, 0.0);
    // Hand & thumb
    addPart(arm, 0.12 * scale, 0.11 * scale, 0.12 * scale, 0, -0.48 * scale, -0.02, skinColor, 0.68, 0.0);
    addPart(arm, 0.05 * scale, 0.07 * scale, 0.06 * scale, -sx * 0.06 * scale, -0.47 * scale, -0.06, skinColor, 0.68, 0.0);
    body.add(arm);
    return arm;
  };

  return {
    leftLeg: makeLeg(-1),
    rightLeg: makeLeg(1),
    leftArm: makeArm(-1),
    rightArm: makeArm(1),
  };
}

function buildHumanProtagonistRig(
  charId: CharacterId,
  shadowTex: THREE.Texture,
): ArticulatedActorRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 18),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  const isEmanuel = charId === 'rat';
  const isPedroH = charId === 'duck';
  const skinColor = isPedroH ? 0x8d5524 : 0xffdfc4;
  const hairColor = isEmanuel ? 0x3b2314 : isPedroH ? 0x18181b : 0x1e293b;
  const jacketColor = isEmanuel ? 0xb91c1c : isPedroH ? 0x0284c7 : 0x047857;
  const shirtColor = isEmanuel ? 0xf8fafc : isPedroH ? 0xfef08a : 0xe2e8f0;
  const pantsColor = isEmanuel ? 0x1e293b : isPedroH ? 0x334155 : 0x475569;
  const shoeColor = isEmanuel ? 0xdc2626 : isPedroH ? 0xf97316 : 0x0f172a;
  const scale = isEmanuel ? 0.96 : isPedroH ? 1.0 : 1.04;

  // Torso with layered shirt + open jacket + collar + belt
  addPart(body, 0.44 * scale, 0.56 * scale, 0.26 * scale, 0, 0.92 * scale, 0, shirtColor, 0.82, 0.02);
  addPart(body, 0.14 * scale, 0.56 * scale, 0.28 * scale, -0.17 * scale, 0.92 * scale, 0.01, jacketColor, 0.72, 0.05);
  addPart(body, 0.14 * scale, 0.56 * scale, 0.28 * scale, 0.17 * scale, 0.92 * scale, 0.01, jacketColor, 0.72, 0.05);
  addPart(body, 0.48 * scale, 0.54 * scale, 0.12 * scale, 0, 0.92 * scale, 0.09, jacketColor, 0.72, 0.05);
  // Belt + buckle
  addPart(body, 0.45 * scale, 0.07 * scale, 0.27 * scale, 0, 0.64 * scale, 0, 0x0f172a, 0.4, 0.2);
  addPart(body, 0.1 * scale, 0.07 * scale, 0.04 * scale, 0, 0.64 * scale, -0.14 * scale, 0xfacc15, 0.25, 0.75);
  // School backpack
  addPart(body, 0.36 * scale, 0.42 * scale, 0.18 * scale, 0, 0.93 * scale, 0.22 * scale, isEmanuel ? 0xef4444 : isPedroH ? 0x0369a1 : 0x1e293b, 0.65, 0.08);
  addPart(body, 0.28 * scale, 0.14 * scale, 0.06 * scale, 0, 0.82 * scale, 0.31 * scale, 0xfbbf24, 0.4, 0.35);

  // Neck + Detailed 3D Head
  addPart(body, 0.16 * scale, 0.12 * scale, 0.16 * scale, 0, 1.24 * scale, 0, skinColor, 0.68, 0.0);

  const head = new THREE.Group();
  head.position.set(0, 1.48 * scale, 0);
  // Sculpted head + jawline + ears + nose + brows + eyes + smile
  addPart(head, 0.4 * scale, 0.42 * scale, 0.38 * scale, 0, 0, 0, skinColor, 0.68, 0.0);
  addPart(head, 0.32 * scale, 0.08 * scale, 0.34 * scale, 0, -0.21 * scale, -0.01, skinColor, 0.68, 0.0); // chin
  addPart(head, 0.07 * scale, 0.13 * scale, 0.08 * scale, -0.22 * scale, -0.02 * scale, 0.02, skinColor, 0.68, 0.0); // L ear
  addPart(head, 0.07 * scale, 0.13 * scale, 0.08 * scale, 0.22 * scale, -0.02 * scale, 0.02, skinColor, 0.68, 0.0); // R ear
  addPart(head, 0.06 * scale, 0.09 * scale, 0.07 * scale, 0, -0.04 * scale, -0.21 * scale, skinColor, 0.64, 0.0); // nose
  addPart(head, 0.1 * scale, 0.03 * scale, 0.04 * scale, -0.1 * scale, 0.08 * scale, -0.195 * scale, hairColor, 0.8, 0.0); // L brow
  addPart(head, 0.1 * scale, 0.03 * scale, 0.04 * scale, 0.1 * scale, 0.08 * scale, -0.195 * scale, hairColor, 0.8, 0.0); // R brow
  addVoxelEye(head, -0.1 * scale, 0.02 * scale, -0.19 * scale, isEmanuel ? 0x451a03 : isPedroH ? 0x1e293b : 0x0284c7);
  addVoxelEye(head, 0.1 * scale, 0.02 * scale, -0.19 * scale, isEmanuel ? 0x451a03 : isPedroH ? 0x1e293b : 0x0284c7);
  addPart(head, 0.12 * scale, 0.035 * scale, 0.03 * scale, 0, -0.13 * scale, -0.19 * scale, 0x991b1b, 0.55, 0.0); // mouth

  let hairFlow: THREE.Group | undefined;
  if (isEmanuel) {
    // HUMAN EMANUEL: Noticeably LONG, VOLUMINOUS layered hair!
    addPart(head, 0.46 * scale, 0.15 * scale, 0.44 * scale, 0, 0.22 * scale, 0.01, hairColor, 0.82, 0.02); // top crown
    addPart(head, 0.48 * scale, 0.12 * scale, 0.2 * scale, 0, 0.17 * scale, -0.16 * scale, hairColor, 0.82, 0.02); // sweeping front bangs
    addPart(head, 0.11 * scale, 0.42 * scale, 0.26 * scale, -0.23 * scale, -0.04 * scale, 0.04, hairColor, 0.82, 0.02); // L side lock
    addPart(head, 0.11 * scale, 0.42 * scale, 0.26 * scale, 0.23 * scale, -0.04 * scale, 0.04, hairColor, 0.82, 0.02); // R side lock
    addPart(head, 0.46 * scale, 0.42 * scale, 0.14 * scale, 0, -0.02 * scale, 0.2 * scale, hairColor, 0.82, 0.02); // upper back hair
    hairFlow = new THREE.Group();
    hairFlow.position.set(0, -0.16 * scale, 0.22 * scale);
    addPart(hairFlow, 0.44 * scale, 0.36 * scale, 0.13 * scale, 0, -0.16 * scale, 0.02, hairColor, 0.82, 0.02);
    addPart(hairFlow, 0.36 * scale, 0.24 * scale, 0.1 * scale, 0, -0.4 * scale, 0.04, 0x4a2c19, 0.82, 0.02); // long layered tips
    head.add(hairFlow);
  } else if (isPedroH) {
    // HUMAN PEDRO HENRIQUE: Brown skin + distinctive short textured fade/curly-top!
    addPart(head, 0.41 * scale, 0.14 * scale, 0.41 * scale, 0, 0.22 * scale, 0.0, hairColor, 0.9, 0.02);
    addPart(head, 0.35 * scale, 0.09 * scale, 0.35 * scale, -0.03 * scale, 0.28 * scale, -0.03 * scale, 0x27272a, 0.9, 0.02);
    addPart(head, 0.3 * scale, 0.07 * scale, 0.28 * scale, 0.04 * scale, 0.31 * scale, 0.02 * scale, hairColor, 0.9, 0.02);
    addPart(head, 0.42 * scale, 0.14 * scale, 0.08 * scale, 0, 0.12 * scale, 0.18 * scale, hairColor, 0.9, 0.02);
  } else {
    // HUMAN PEDRO ANTÔNIO: White skin + clearly shorter neat swept hairstyle!
    addPart(head, 0.42 * scale, 0.12 * scale, 0.4 * scale, 0, 0.22 * scale, 0.01, hairColor, 0.78, 0.03);
    addPart(head, 0.28 * scale, 0.08 * scale, 0.16 * scale, 0.05 * scale, 0.25 * scale, -0.12 * scale, hairColor, 0.78, 0.03); // neat side sweep
    addPart(head, 0.41 * scale, 0.18 * scale, 0.08 * scale, 0, 0.09 * scale, 0.17 * scale, hairColor, 0.78, 0.03); // short tapered back
  }

  body.add(head);
  const limbs = addArticulatedHumanLimbs(body, skinColor, jacketColor, pantsColor, shoeColor, 0xfacc15, scale);

  return {
    root,
    body,
    head,
    leftLimb: limbs.leftLeg,
    rightLimb: limbs.rightLeg,
    leftWingOrArm: limbs.leftArm,
    rightWingOrArm: limbs.rightArm,
    hairFlow,
  };
}

export function buildCharacterRig(
  charId: CharacterId,
  shadowTex: THREE.Texture,
  universe: UniverseMode = 'animal',
): ArticulatedActorRig {
  if (universe === 'human') {
    return buildHumanProtagonistRig(charId, shadowTex);
  }

  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.6, 18),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.52 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  if (charId === 'rat') {
    // REMASTERED ANIMAL EMANUEL: Anthropomorphic voxel rat with articulated paws, hoodie, backpack, whiskers & 3-part tail!
    addPart(body, 0.5, 0.48, 0.36, 0, 0.58, 0, 0x78716c, 0.85, 0.02); // fur torso
    addPart(body, 0.36, 0.38, 0.12, 0, 0.56, -0.15, 0xe7e5e4, 0.88, 0.0); // cream chest fur
    addPart(body, 0.54, 0.24, 0.4, 0, 0.66, 0.02, 0xdc2626, 0.68, 0.05); // red school hoodie vest
    addPart(body, 0.38, 0.34, 0.2, 0, 0.62, 0.25, 0xb91c1c, 0.55, 0.1); // red backpack
    addPart(body, 0.26, 0.08, 0.05, 0, 0.68, 0.36, 0xfbbf24, 0.3, 0.65);

    const head = new THREE.Group();
    head.position.set(0, 0.96, -0.06);
    addPart(head, 0.44, 0.36, 0.42, 0, 0, 0, 0x78716c, 0.82, 0.02);
    addPart(head, 0.26, 0.2, 0.26, 0, -0.05, -0.25, 0xa8a29e, 0.78, 0.02); // tapered snout
    addPart(head, 0.11, 0.09, 0.08, 0, -0.02, -0.39, 0xf472b6, 0.35, 0.05); // pink nose
    // Whiskers on both sides
    addPart(head, 0.24, 0.02, 0.02, -0.22, -0.05, -0.28, 0xf8fafc, 0.4, 0.0);
    addPart(head, 0.24, 0.02, 0.02, 0.22, -0.05, -0.28, 0xf8fafc, 0.4, 0.0);
    addPart(head, 0.22, 0.02, 0.02, -0.21, -0.09, -0.26, 0xf8fafc, 0.4, 0.0);
    addPart(head, 0.22, 0.02, 0.02, 0.21, -0.09, -0.26, 0xf8fafc, 0.4, 0.0);
    // Cupped outer + inner pink ears
    addPart(head, 0.2, 0.24, 0.08, -0.21, 0.22, 0.05, 0x78716c, 0.82, 0.02);
    addPart(head, 0.13, 0.17, 0.05, -0.21, 0.22, 0.01, 0xf9a8d4, 0.65, 0.0);
    addPart(head, 0.2, 0.24, 0.08, 0.21, 0.22, 0.05, 0x78716c, 0.82, 0.02);
    addPart(head, 0.13, 0.17, 0.05, 0.21, 0.22, 0.01, 0xf9a8d4, 0.65, 0.0);
    // Expressive eyes + brows
    addVoxelEye(head, -0.13, 0.06, -0.2, 0x0f172a);
    addVoxelEye(head, 0.13, 0.06, -0.2, 0x0f172a);
    addPart(head, 0.1, 0.03, 0.04, -0.13, 0.14, -0.2, 0x44403c, 0.8, 0.0);
    addPart(head, 0.1, 0.03, 0.04, 0.13, 0.14, -0.2, 0x44403c, 0.8, 0.0);
    body.add(head);

    const tail = new THREE.Group();
    tail.position.set(0, 0.4, 0.22);
    addPart(tail, 0.1, 0.1, 0.36, 0, 0.02, 0.18, 0xf472b6, 0.6, 0.0);
    addPart(tail, 0.08, 0.08, 0.34, 0, 0.1, 0.48, 0xf9a8d4, 0.6, 0.0);
    addPart(tail, 0.06, 0.06, 0.26, 0, 0.18, 0.72, 0xfbcfe8, 0.6, 0.0);
    body.add(tail);

    const leftWingOrArm = new THREE.Group();
    leftWingOrArm.position.set(-0.31, 0.72, 0);
    addPart(leftWingOrArm, 0.13, 0.28, 0.14, 0, -0.12, 0, 0xdc2626, 0.7, 0.04);
    addPart(leftWingOrArm, 0.12, 0.12, 0.14, 0, -0.28, -0.02, 0xf9a8d4, 0.65, 0.0);
    body.add(leftWingOrArm);

    const rightWingOrArm = new THREE.Group();
    rightWingOrArm.position.set(0.31, 0.72, 0);
    addPart(rightWingOrArm, 0.13, 0.28, 0.14, 0, -0.12, 0, 0xdc2626, 0.7, 0.04);
    addPart(rightWingOrArm, 0.12, 0.12, 0.14, 0, -0.28, -0.02, 0xf9a8d4, 0.65, 0.0);
    body.add(rightWingOrArm);

    const leftLimb = new THREE.Group();
    leftLimb.position.set(-0.16, 0.34, 0);
    addPart(leftLimb, 0.16, 0.26, 0.18, 0, -0.13, 0, 0x78716c, 0.85, 0.0);
    addPart(leftLimb, 0.18, 0.08, 0.26, 0, -0.3, -0.04, 0xf472b6, 0.6, 0.0);
    body.add(leftLimb);

    const rightLimb = new THREE.Group();
    rightLimb.position.set(0.16, 0.34, 0);
    addPart(rightLimb, 0.16, 0.26, 0.18, 0, -0.13, 0, 0x78716c, 0.85, 0.0);
    addPart(rightLimb, 0.18, 0.08, 0.26, 0, -0.3, -0.04, 0xf472b6, 0.6, 0.0);
    body.add(rightLimb);

    return { root, body, leftLimb, rightLimb, leftWingOrArm, rightWingOrArm, tail, head };
  }

  if (charId === 'duck') {
    // REMASTERED ANIMAL PEDRO HENRIQUE: Detailed anthropomorphic voxel duck with articulated bill & feathered wings!
    addPart(body, 0.58, 0.52, 0.56, 0, 0.58, 0, 0xf8fafc, 0.84, 0.0); // white torso
    addPart(body, 0.6, 0.26, 0.58, 0, 0.62, 0, 0x0284c7, 0.7, 0.05); // blue school vest
    addPart(body, 0.42, 0.22, 0.28, 0, 0.56, 0.34, 0xe2e8f0, 0.85, 0.0); // layered tail feathers
    addPart(body, 0.28, 0.16, 0.2, 0, 0.66, 0.44, 0xf8fafc, 0.85, 0.0);

    const head = new THREE.Group();
    head.position.set(0, 1.0, -0.08);
    addPart(head, 0.46, 0.42, 0.46, 0, 0, 0, 0xffffff, 0.8, 0.0);
    // Upper beak + animated lower jaw!
    addPart(head, 0.34, 0.09, 0.28, 0, -0.03, -0.32, 0xfacc15, 0.38, 0.05);
    const jaw = new THREE.Group();
    jaw.position.set(0, -0.09, -0.2);
    addPart(jaw, 0.3, 0.06, 0.24, 0, 0, -0.1, 0xf97316, 0.42, 0.05);
    head.add(jaw);
    // Blue school cap
    addPart(head, 0.5, 0.14, 0.5, 0, 0.24, 0, 0x0284c7, 0.6, 0.08);
    addPart(head, 0.44, 0.06, 0.24, 0, 0.18, -0.3, 0x0369a1, 0.5, 0.1);
    addVoxelEye(head, -0.14, 0.07, -0.22, 0x0f172a);
    addVoxelEye(head, 0.14, 0.07, -0.22, 0x0f172a);
    body.add(head);

    const leftWingOrArm = new THREE.Group();
    leftWingOrArm.position.set(-0.34, 0.72, 0);
    addPart(leftWingOrArm, 0.14, 0.38, 0.46, -0.04, -0.14, 0.04, 0xf1f5f9, 0.8, 0.0);
    addPart(leftWingOrArm, 0.1, 0.16, 0.32, -0.06, -0.32, 0.1, 0xcbd5e1, 0.82, 0.0);
    body.add(leftWingOrArm);

    const rightWingOrArm = new THREE.Group();
    rightWingOrArm.position.set(0.34, 0.72, 0);
    addPart(rightWingOrArm, 0.14, 0.38, 0.46, 0.04, -0.14, 0.04, 0xf1f5f9, 0.8, 0.0);
    addPart(rightWingOrArm, 0.1, 0.16, 0.32, 0.06, -0.32, 0.1, 0xcbd5e1, 0.82, 0.0);
    body.add(rightWingOrArm);

    const leftLimb = new THREE.Group();
    leftLimb.position.set(-0.18, 0.32, 0);
    addPart(leftLimb, 0.12, 0.24, 0.12, 0, -0.12, 0, 0xf97316, 0.5, 0.02);
    addPart(leftLimb, 0.24, 0.06, 0.3, 0, -0.28, -0.06, 0xf97316, 0.48, 0.02); // webbed foot
    body.add(leftLimb);

    const rightLimb = new THREE.Group();
    rightLimb.position.set(0.18, 0.32, 0);
    addPart(rightLimb, 0.12, 0.24, 0.12, 0, -0.12, 0, 0xf97316, 0.5, 0.02);
    addPart(rightLimb, 0.24, 0.06, 0.3, 0, -0.28, -0.06, 0xf97316, 0.48, 0.02);
    body.add(rightLimb);

    return { root, body, leftLimb, rightLimb, leftWingOrArm, rightWingOrArm, head, jaw };
  }

  // REMASTERED ANIMAL GAVIÃO PEDRO ANTÔNIO: Majestic Brazilian Harpy Eagle!
  addPart(body, 0.54, 0.66, 0.46, 0, 0.7, 0, 0xf8fafc, 0.8, 0.0); // white breast plumage
  addPart(body, 0.58, 0.38, 0.5, 0, 0.84, 0.04, 0x1e293b, 0.72, 0.08); // dark mantle
  addPart(body, 0.46, 0.12, 0.48, 0, 0.46, 0.34, 0x334155, 0.75, 0.05); // fanned tail feathers
  addPart(body, 0.34, 0.08, 0.24, 0, 0.48, 0.54, 0x475569, 0.75, 0.05);

  const head = new THREE.Group();
  head.position.set(0, 1.22, -0.06);
  addPart(head, 0.44, 0.4, 0.44, 0, 0, 0, 0xcbd5e1, 0.78, 0.02);
  addPart(head, 0.14, 0.3, 0.12, -0.16, 0.3, 0.1, 0x1e293b, 0.7, 0.05); // harpy twin crests
  addPart(head, 0.14, 0.3, 0.12, 0.16, 0.3, 0.1, 0x1e293b, 0.7, 0.05);
  addPart(head, 0.16, 0.13, 0.24, 0, -0.02, -0.28, 0xf59e0b, 0.35, 0.2); // hooked beak
  addPart(head, 0.1, 0.08, 0.1, 0, -0.1, -0.35, 0xd97706, 0.35, 0.2); // beak hook tip
  addVoxelEye(head, -0.14, 0.06, -0.21, 0xf59e0b);
  addVoxelEye(head, 0.14, 0.06, -0.21, 0xf59e0b);
  body.add(head);

  const leftWingOrArm = new THREE.Group();
  leftWingOrArm.position.set(-0.32, 0.9, 0);
  addPart(leftWingOrArm, 0.66, 0.14, 0.48, -0.32, 0, 0.04, 0x1e293b, 0.72, 0.08);
  addPart(leftWingOrArm, 0.36, 0.1, 0.42, -0.78, -0.02, 0.08, 0x475569, 0.75, 0.05);
  addPart(leftWingOrArm, 0.22, 0.07, 0.32, -1.04, -0.03, 0.12, 0x64748b, 0.75, 0.05); // primary wing tips
  body.add(leftWingOrArm);

  const rightWingOrArm = new THREE.Group();
  rightWingOrArm.position.set(0.32, 0.9, 0);
  addPart(rightWingOrArm, 0.66, 0.14, 0.48, 0.32, 0, 0.04, 0x1e293b, 0.72, 0.08);
  addPart(rightWingOrArm, 0.36, 0.1, 0.42, 0.78, -0.02, 0.08, 0x475569, 0.75, 0.05);
  addPart(rightWingOrArm, 0.22, 0.07, 0.32, 1.04, -0.03, 0.12, 0x64748b, 0.75, 0.05);
  body.add(rightWingOrArm);

  const leftLimb = new THREE.Group();
  leftLimb.position.set(-0.16, 0.36, 0);
  addPart(leftLimb, 0.14, 0.28, 0.16, 0, -0.14, 0, 0xfbbf24, 0.4, 0.15);
  addPart(leftLimb, 0.2, 0.07, 0.24, 0, -0.31, -0.04, 0xf59e0b, 0.35, 0.25); // talons
  body.add(leftLimb);

  const rightLimb = new THREE.Group();
  rightLimb.position.set(0.16, 0.36, 0);
  addPart(rightLimb, 0.14, 0.28, 0.16, 0, -0.14, 0, 0xfbbf24, 0.4, 0.15);
  addPart(rightLimb, 0.2, 0.07, 0.24, 0, -0.31, -0.04, 0xf59e0b, 0.35, 0.25);
  body.add(rightLimb);

  return { root, body, leftLimb, rightLimb, leftWingOrArm, rightWingOrArm, head };
}

const ANIMAL_SPECIES_COLORS: Record<AnimalSpecies, { fur: number; belly: number; accent: number }> = {
  dog: { fur: 0xd97706, belly: 0xfef3c7, accent: 0x78350f },
  cat: { fur: 0xfb923c, belly: 0xffffff, accent: 0x9a3412 },
  rabbit: { fur: 0xf1f5f9, belly: 0xffffff, accent: 0xf9a8d4 },
  fox: { fur: 0xea580c, belly: 0xf8fafc, accent: 0x1e293b },
  wolf: { fur: 0x64748b, belly: 0xcbd5e1, accent: 0x0f172a },
  bear: { fur: 0x78350f, belly: 0xb45309, accent: 0x451a03 },
  monkey: { fur: 0x92400e, belly: 0xfde68a, accent: 0x78350f },
  capybara: { fur: 0x854d0e, belly: 0xa16207, accent: 0x422006 },
  lion: { fur: 0xf59e0b, belly: 0xfef08a, accent: 0x7c2d12 },
  tiger: { fur: 0xf97316, belly: 0xffffff, accent: 0x0f172a },
  owl: { fur: 0x78350f, belly: 0xfef3c7, accent: 0xfacc15 },
  parrot: { fur: 0x16a34a, belly: 0xfacc15, accent: 0xdc2626 },
  turtle: { fur: 0x22c55e, belly: 0xfde047, accent: 0x15803d },
  horse: { fur: 0x92400e, belly: 0xb45309, accent: 0x1e293b },
  pig: { fur: 0xf9a8d4, belly: 0xfbcfe8, accent: 0xec4899 },
  cow: { fur: 0xf8fafc, belly: 0xffffff, accent: 0x1e293b },
};

export function buildNpcRig(
  role: NpcRole,
  shirtColor: number,
  hairColor: number,
  skinColor: number,
  shadowTex: THREE.Texture,
  universe: UniverseMode = 'animal',
  species: AnimalSpecies = 'dog',
): ArticulatedActorRig {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.48, 12),
    new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.42 }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  root.add(shadow);

  const scaleH = role === 'student' ? 0.92 : 1.05;
  const pantsColor = role === 'principal' ? 0x1e293b : role === 'cafeteria_cook' ? 0xffffff : 0x1d4ed8;
  const torsoColor =
    role === 'principal'
      ? 0x334155
      : role === 'cafeteria_cook'
        ? 0xf8fafc
        : role === 'janitor'
          ? 0x0284c7
          : shirtColor;

  if (universe === 'human') {
    // Detailed Human NPCs with varied hair & school attire!
    addPart(body, 0.46 * scaleH, 0.52 * scaleH, 0.28 * scaleH, 0, 0.88 * scaleH, 0, torsoColor, 0.78, 0.04);
    addPart(body, 0.16 * scaleH, 0.1 * scaleH, 0.16 * scaleH, 0, 1.18 * scaleH, 0, skinColor, 0.7, 0.0);

    const head = new THREE.Group();
    head.position.set(0, 1.42 * scaleH, 0);
    addPart(head, 0.38 * scaleH, 0.4 * scaleH, 0.36 * scaleH, 0, 0, 0, skinColor, 0.7, 0.0);
    addPart(head, 0.06 * scaleH, 0.11 * scaleH, 0.07 * scaleH, -0.21 * scaleH, -0.02 * scaleH, 0, skinColor, 0.7, 0.0);
    addPart(head, 0.06 * scaleH, 0.11 * scaleH, 0.07 * scaleH, 0.21 * scaleH, -0.02 * scaleH, 0, skinColor, 0.7, 0.0);
    addPart(head, 0.06 * scaleH, 0.08 * scaleH, 0.06 * scaleH, 0, -0.04 * scaleH, -0.2 * scaleH, skinColor, 0.65, 0.0);
    addVoxelEye(head, -0.09 * scaleH, 0.02 * scaleH, -0.18 * scaleH, 0x0f172a);
    addVoxelEye(head, 0.09 * scaleH, 0.02 * scaleH, -0.18 * scaleH, 0x0f172a);

    // Distinct hairstyles by role/hash
    addPart(head, 0.41 * scaleH, 0.13 * scaleH, 0.39 * scaleH, 0, 0.21 * scaleH, 0.01, hairColor, 0.86, 0.02);
    if (role === 'principal') {
      addPart(head, 0.18 * scaleH, 0.16 * scaleH, 0.16 * scaleH, 0, 0.12 * scaleH, 0.24 * scaleH, hairColor, 0.85, 0.02); // bun
      addPart(head, 0.34 * scaleH, 0.06 * scaleH, 0.04 * scaleH, 0, 0.02 * scaleH, -0.2 * scaleH, 0x0f172a, 0.2, 0.5);
    } else if (role === 'teacher') {
      addPart(head, 0.34 * scaleH, 0.06 * scaleH, 0.04 * scaleH, 0, 0.02 * scaleH, -0.2 * scaleH, 0x0f172a, 0.2, 0.5);
      addPart(body, 0.1 * scaleH, 0.32 * scaleH, 0.05 * scaleH, 0, 0.88 * scaleH, -0.16 * scaleH, 0xdc2626, 0.5, 0.1);
    } else if (role === 'cafeteria_cook') {
      addPart(head, 0.36 * scaleH, 0.24 * scaleH, 0.36 * scaleH, 0, 0.34 * scaleH, 0, 0xffffff, 0.8, 0.0);
    } else {
      addPart(body, 0.34 * scaleH, 0.38 * scaleH, 0.16 * scaleH, 0, 0.88 * scaleH, 0.21 * scaleH, 0x2563eb, 0.7, 0.05);
    }
    body.add(head);

    const limbs = addArticulatedHumanLimbs(body, skinColor, torsoColor, pantsColor, 0x0f172a, 0xffffff, scaleH);
    return {
      root,
      body,
      head,
      leftLimb: limbs.leftLeg,
      rightLimb: limbs.rightLeg,
      leftWingOrArm: limbs.leftArm,
      rightWingOrArm: limbs.rightArm,
    };
  }

  // ANIMAL WORLD NPCs: 16 Species with distinct silhouettes, proportions, shells, manes, wings & tails!
  const pal = ANIMAL_SPECIES_COLORS[species] ?? ANIMAL_SPECIES_COLORS.dog;
  const isBulky = species === 'bear' || species === 'capybara' || species === 'cow' || species === 'pig' || species === 'turtle';
  const isSlender = species === 'cat' || species === 'fox' || species === 'rabbit';
  const isBird = species === 'owl' || species === 'parrot';

  const torsoW = (isBulky ? 0.58 : isSlender ? 0.42 : 0.48) * scaleH;
  const torsoD = (isBulky ? 0.42 : 0.3) * scaleH;
  addPart(body, torsoW, 0.54 * scaleH, torsoD, 0, 0.82 * scaleH, 0, torsoColor, 0.78, 0.04);

  // Species-specific torso anatomy (Turtle shell, Tiger stripes, Capybara plumpness, etc.)
  if (species === 'turtle') {
    addPart(body, torsoW + 0.14, 0.52 * scaleH, 0.24 * scaleH, 0, 0.82 * scaleH, 0.2 * scaleH, pal.accent, 0.75, 0.05);
    addPart(body, torsoW + 0.06, 0.4 * scaleH, 0.1 * scaleH, 0, 0.82 * scaleH, 0.32 * scaleH, pal.belly, 0.8, 0.02);
  } else if (species === 'tiger') {
    addPart(body, torsoW + 0.02, 0.07 * scaleH, torsoD + 0.02, 0, 0.72 * scaleH, 0, pal.accent, 0.85, 0.0);
    addPart(body, torsoW + 0.02, 0.07 * scaleH, torsoD + 0.02, 0, 0.92 * scaleH, 0, pal.accent, 0.85, 0.0);
  } else if (role === 'student') {
    addPart(body, 0.34 * scaleH, 0.38 * scaleH, 0.15 * scaleH, 0, 0.82 * scaleH, torsoD * 0.65, 0x2563eb, 0.7, 0.05);
  }

  const head = new THREE.Group();
  head.position.set(0, 1.3 * scaleH, 0);
  addPart(head, 0.42 * scaleH, 0.38 * scaleH, 0.4 * scaleH, 0, 0, 0, pal.fur, 0.8, 0.02);
  addVoxelEye(head, -0.11 * scaleH, 0.05 * scaleH, -0.21 * scaleH, 0x0f172a);
  addVoxelEye(head, 0.11 * scaleH, 0.05 * scaleH, -0.21 * scaleH, 0x0f172a);

  // Species head features (ears, snouts, manes, beaks, horns)
  if (species === 'rabbit') {
    addPart(head, 0.1 * scaleH, 0.38 * scaleH, 0.08 * scaleH, -0.11 * scaleH, 0.34 * scaleH, 0, pal.fur, 0.8, 0.0);
    addPart(head, 0.1 * scaleH, 0.38 * scaleH, 0.08 * scaleH, 0.11 * scaleH, 0.34 * scaleH, 0, pal.fur, 0.8, 0.0);
  } else if (species === 'dog') {
    addPart(head, 0.1 * scaleH, 0.24 * scaleH, 0.12 * scaleH, -0.23 * scaleH, -0.02 * scaleH, 0, pal.accent, 0.8, 0.0);
    addPart(head, 0.1 * scaleH, 0.24 * scaleH, 0.12 * scaleH, 0.23 * scaleH, -0.02 * scaleH, 0, pal.accent, 0.8, 0.0);
    addPart(head, 0.22 * scaleH, 0.16 * scaleH, 0.2 * scaleH, 0, -0.06 * scaleH, -0.24 * scaleH, pal.belly, 0.78, 0.0);
  } else if (species === 'cat' || species === 'fox' || species === 'wolf' || species === 'tiger') {
    addPart(head, 0.12 * scaleH, 0.16 * scaleH, 0.08 * scaleH, -0.15 * scaleH, 0.24 * scaleH, 0, pal.fur, 0.8, 0.0);
    addPart(head, 0.12 * scaleH, 0.16 * scaleH, 0.08 * scaleH, 0.15 * scaleH, 0.24 * scaleH, 0, pal.fur, 0.8, 0.0);
    addPart(head, 0.2 * scaleH, 0.14 * scaleH, 0.18 * scaleH, 0, -0.06 * scaleH, -0.22 * scaleH, pal.belly, 0.78, 0.0);
  } else if (species === 'lion') {
    addPart(head, 0.56 * scaleH, 0.52 * scaleH, 0.26 * scaleH, 0, 0.02 * scaleH, 0.06 * scaleH, pal.accent, 0.85, 0.0);
    addPart(head, 0.2 * scaleH, 0.14 * scaleH, 0.18 * scaleH, 0, -0.06 * scaleH, -0.22 * scaleH, pal.belly, 0.78, 0.0);
  } else if (species === 'capybara') {
    addPart(head, 0.34 * scaleH, 0.22 * scaleH, 0.26 * scaleH, 0, -0.04 * scaleH, -0.26 * scaleH, pal.fur, 0.85, 0.0);
    addPart(head, 0.08 * scaleH, 0.08 * scaleH, 0.06 * scaleH, -0.16 * scaleH, 0.21 * scaleH, 0.08 * scaleH, pal.accent, 0.8, 0.0);
    addPart(head, 0.08 * scaleH, 0.08 * scaleH, 0.06 * scaleH, 0.16 * scaleH, 0.21 * scaleH, 0.08 * scaleH, pal.accent, 0.8, 0.0);
  } else if (species === 'cow') {
    addPart(head, 0.08 * scaleH, 0.18 * scaleH, 0.08 * scaleH, -0.16 * scaleH, 0.24 * scaleH, 0, 0xfef08a, 0.4, 0.1);
    addPart(head, 0.08 * scaleH, 0.18 * scaleH, 0.08 * scaleH, 0.16 * scaleH, 0.24 * scaleH, 0, 0xfef08a, 0.4, 0.1);
    addPart(head, 0.28 * scaleH, 0.16 * scaleH, 0.16 * scaleH, 0, -0.08 * scaleH, -0.24 * scaleH, 0xf9a8d4, 0.7, 0.0);
  } else if (species === 'pig') {
    addPart(head, 0.22 * scaleH, 0.16 * scaleH, 0.14 * scaleH, 0, -0.05 * scaleH, -0.24 * scaleH, pal.accent, 0.65, 0.0);
    addPart(head, 0.1 * scaleH, 0.12 * scaleH, 0.06 * scaleH, -0.16 * scaleH, 0.21 * scaleH, 0, pal.fur, 0.75, 0.0);
    addPart(head, 0.1 * scaleH, 0.12 * scaleH, 0.06 * scaleH, 0.16 * scaleH, 0.21 * scaleH, 0, pal.fur, 0.75, 0.0);
  } else if (species === 'horse') {
    addPart(head, 0.24 * scaleH, 0.2 * scaleH, 0.3 * scaleH, 0, -0.05 * scaleH, -0.28 * scaleH, pal.fur, 0.78, 0.0);
    addPart(head, 0.12 * scaleH, 0.34 * scaleH, 0.18 * scaleH, 0, 0.14 * scaleH, 0.18 * scaleH, pal.accent, 0.85, 0.0);
  } else if (isBird) {
    addPart(head, 0.14 * scaleH, 0.12 * scaleH, 0.18 * scaleH, 0, -0.04 * scaleH, -0.26 * scaleH, 0xf59e0b, 0.4, 0.15);
    if (species === 'parrot') {
      addPart(head, 0.12 * scaleH, 0.16 * scaleH, 0.22 * scaleH, 0, 0.24 * scaleH, 0, pal.accent, 0.75, 0.0);
    }
  } else {
    // Bear, Monkey
    addPart(head, 0.14 * scaleH, 0.14 * scaleH, 0.08 * scaleH, -0.22 * scaleH, 0.16 * scaleH, 0, pal.fur, 0.8, 0.0);
    addPart(head, 0.14 * scaleH, 0.14 * scaleH, 0.08 * scaleH, 0.22 * scaleH, 0.16 * scaleH, 0, pal.fur, 0.8, 0.0);
    addPart(head, 0.24 * scaleH, 0.16 * scaleH, 0.14 * scaleH, 0, -0.06 * scaleH, -0.2 * scaleH, pal.belly, 0.78, 0.0);
  }

  if (role === 'teacher' || role === 'principal') {
    addPart(head, 0.34 * scaleH, 0.06 * scaleH, 0.04 * scaleH, 0, 0.04 * scaleH, -0.22 * scaleH, 0x0f172a, 0.2, 0.5);
  } else if (role === 'cafeteria_cook') {
    addPart(head, 0.36 * scaleH, 0.22 * scaleH, 0.36 * scaleH, 0, 0.32 * scaleH, 0, 0xffffff, 0.8, 0.0);
  }
  body.add(head);

  // Tail (except capybara/bear/owl)
  let tail: THREE.Group | undefined;
  if (species !== 'capybara' && species !== 'owl') {
    tail = new THREE.Group();
    tail.position.set(0, 0.56 * scaleH, torsoD * 0.55);
    const tailLen = species === 'monkey' || species === 'cat' || species === 'fox' ? 0.45 : 0.24;
    addPart(tail, 0.1 * scaleH, 0.1 * scaleH, tailLen * scaleH, 0, 0.06 * scaleH, tailLen * 0.5 * scaleH, pal.fur, 0.8, 0.0);
    body.add(tail);
  }

  const leftLimb = addPart(body, 0.18 * scaleH, 0.55 * scaleH, 0.2 * scaleH, -0.14 * scaleH, 0.275 * scaleH, 0, pantsColor, 0.85, 0.02);
  const rightLimb = addPart(body, 0.18 * scaleH, 0.55 * scaleH, 0.2 * scaleH, 0.14 * scaleH, 0.275 * scaleH, 0, pantsColor, 0.85, 0.02);
  const leftWingOrArm = addPart(
    body,
    isBird ? 0.12 * scaleH : 0.14 * scaleH,
    0.46 * scaleH,
    isBird ? 0.3 * scaleH : 0.16 * scaleH,
    -(torsoW * 0.5 + 0.09 * scaleH),
    0.82 * scaleH,
    0,
    isBird ? pal.fur : torsoColor,
    0.78,
    0.04,
  );
  const rightWingOrArm = addPart(
    body,
    isBird ? 0.12 * scaleH : 0.14 * scaleH,
    0.46 * scaleH,
    isBird ? 0.3 * scaleH : 0.16 * scaleH,
    torsoW * 0.5 + 0.09 * scaleH,
    0.82 * scaleH,
    0,
    isBird ? pal.fur : torsoColor,
    0.78,
    0.04,
  );

  return { root, body, leftLimb, rightLimb, leftWingOrArm, rightWingOrArm, head, tail };
}

export function buildVoxelPropMesh(kind: PropKind): THREE.Group {
  const g = new THREE.Group();
  switch (kind) {
    case 'soccer_ball': {
      addPart(g, 0.46, 0.46, 0.46, 0, 0.23, 0, 0xffffff, 0.4, 0.05);
      addPart(g, 0.24, 0.48, 0.24, 0, 0.23, 0, 0x0f172a, 0.45, 0.05);
      addPart(g, 0.48, 0.22, 0.22, 0, 0.23, 0, 0x0f172a, 0.45, 0.05);
      break;
    }
    case 'basketball': {
      addPart(g, 0.48, 0.48, 0.48, 0, 0.24, 0, 0xea580c, 0.55, 0.02);
      addPart(g, 0.5, 0.06, 0.5, 0, 0.24, 0, 0x1e293b, 0.6, 0.0);
      addPart(g, 0.06, 0.5, 0.5, 0, 0.24, 0, 0x1e293b, 0.6, 0.0);
      break;
    }
    case 'cafeteria_tray': {
      addPart(g, 0.74, 0.06, 0.52, 0, 0.03, 0, 0xf97316, 0.35, 0.1);
      addPart(g, 0.24, 0.12, 0.24, -0.16, 0.12, 0, 0xfef08a, 0.6, 0.0);
      addPart(g, 0.18, 0.18, 0.18, 0.18, 0.15, -0.08, 0xef4444, 0.3, 0.05);
      break;
    }
    case 'trash_can': {
      addPart(g, 0.62, 0.78, 0.62, 0, 0.39, 0, 0x16a34a, 0.5, 0.2);
      addPart(g, 0.68, 0.12, 0.68, 0, 0.82, 0, 0x15803d, 0.4, 0.3);
      addPart(g, 0.22, 0.08, 0.12, 0, 0.9, 0, 0x0f172a, 0.4, 0.4);
      break;
    }
    case 'fire_extinguisher': {
      addPart(g, 0.28, 0.72, 0.28, 0, 0.36, 0, 0xdc2626, 0.3, 0.45);
      addPart(g, 0.14, 0.16, 0.14, 0, 0.78, 0, 0xfacc15, 0.25, 0.7);
      addPart(g, 0.1, 0.1, 0.34, 0.14, 0.72, -0.14, 0x0f172a, 0.5, 0.1);
      break;
    }
    case 'fire_alarm': {
      addPart(g, 0.38, 0.44, 0.16, 0, 0.22, 0, 0xdc2626, 0.35, 0.2);
      addPart(g, 0.22, 0.22, 0.18, 0, 0.22, 0.04, 0xfef08a, 0.2, 0.5);
      addPart(g, 0.12, 0.08, 0.2, 0, 0.16, 0.06, 0xffffff, 0.3, 0.1);
      break;
    }
    case 'beaker': {
      addPart(g, 0.3, 0.46, 0.3, 0, 0.23, 0, 0x38bdf8, 0.15, 0.2);
      addPart(g, 0.24, 0.28, 0.24, 0, 0.16, 0, 0x22c55e, 0.15, 0.1);
      addPart(g, 0.34, 0.06, 0.34, 0, 0.48, 0, 0xe2e8f0, 0.2, 0.3);
      break;
    }
    case 'megaphone': {
      addPart(g, 0.34, 0.34, 0.5, 0, 0.24, 0, 0xfacc15, 0.35, 0.2);
      addPart(g, 0.14, 0.22, 0.14, 0, 0.1, 0.12, 0x0f172a, 0.6, 0.1);
      addPart(g, 0.38, 0.38, 0.08, 0, 0.24, -0.26, 0xef4444, 0.35, 0.2);
      break;
    }
    case 'trophy': {
      addPart(g, 0.36, 0.14, 0.36, 0, 0.07, 0, 0x451a03, 0.5, 0.1);
      addPart(g, 0.14, 0.24, 0.14, 0, 0.26, 0, 0xfbbf24, 0.2, 0.85);
      addPart(g, 0.38, 0.34, 0.38, 0, 0.52, 0, 0xf59e0b, 0.18, 0.9);
      break;
    }
    case 'traffic_cone': {
      addPart(g, 0.54, 0.08, 0.54, 0, 0.04, 0, 0xea580c, 0.6, 0.05);
      addPart(g, 0.36, 0.34, 0.36, 0, 0.25, 0, 0xf97316, 0.5, 0.05);
      addPart(g, 0.24, 0.26, 0.24, 0, 0.52, 0, 0xffffff, 0.4, 0.05);
      break;
    }
    case 'speaker': {
      addPart(g, 0.62, 0.88, 0.5, 0, 0.44, 0, 0x0f172a, 0.65, 0.15);
      addPart(g, 0.42, 0.42, 0.06, 0, 0.34, 0.24, 0x334155, 0.4, 0.4);
      addPart(g, 0.22, 0.22, 0.06, 0, 0.72, 0.24, 0x0ea5e9, 0.2, 0.5);
      break;
    }
    case 'book': {
      addPart(g, 0.44, 0.12, 0.56, 0, 0.06, 0, 0x2563eb, 0.7, 0.05);
      addPart(g, 0.4, 0.12, 0.52, 0.02, 0.18, 0, 0xdc2626, 0.7, 0.05);
      addPart(g, 0.38, 0.1, 0.48, -0.02, 0.29, 0, 0x16a34a, 0.7, 0.05);
      break;
    }
    case 'chair': {
      addPart(g, 0.5, 0.08, 0.5, 0, 0.44, 0, 0xd97706, 0.55, 0.05);
      addPart(g, 0.5, 0.46, 0.08, 0, 0.7, 0.21, 0xb45309, 0.55, 0.05);
      addPart(g, 0.08, 0.42, 0.08, -0.18, 0.21, -0.18, 0x475569, 0.3, 0.6);
      addPart(g, 0.08, 0.42, 0.08, 0.18, 0.21, -0.18, 0x475569, 0.3, 0.6);
      break;
    }
    case 'plant_pot': {
      addPart(g, 0.48, 0.42, 0.48, 0, 0.21, 0, 0xb45309, 0.8, 0.02);
      addPart(g, 0.56, 0.48, 0.56, 0, 0.64, 0, 0x16a34a, 0.75, 0.0);
      addPart(g, 0.32, 0.32, 0.32, 0, 0.94, 0, 0x22c55e, 0.75, 0.0);
      break;
    }
    case 'radio': {
      addPart(g, 0.56, 0.34, 0.24, 0, 0.17, 0, 0xec4899, 0.4, 0.2);
      addPart(g, 0.18, 0.18, 0.04, -0.15, 0.17, 0.12, 0x0f172a, 0.3, 0.4);
      addPart(g, 0.18, 0.18, 0.04, 0.15, 0.17, 0.12, 0x0f172a, 0.3, 0.4);
      break;
    }
    default: {
      addPart(g, 0.46, 0.46, 0.46, 0, 0.23, 0, 0xf59e0b, 0.5, 0.2);
      addPart(g, 0.28, 0.12, 0.28, 0, 0.52, 0, 0xfef08a, 0.3, 0.5);
      addPart(g, 0.52, 0.1, 0.52, 0, 0.05, 0, 0x1e293b, 0.6, 0.1);
      break;
    }
  }
  return g;
}
