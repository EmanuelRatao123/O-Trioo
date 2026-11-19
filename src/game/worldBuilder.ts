import * as THREE from 'three';
import { BoxCollider, GraphicsConfig, PropKind } from './types';
import { CLASSROOMS } from './worldLayout';
import { ProceduralTexturePack, buildVoxelPropMesh } from './voxelModels';

export interface InteractiveProp {
  id: number;
  kind: PropKind;
  name: string;
  mesh: THREE.Group;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  homePos: THREE.Vector3;
  pickable: boolean;
  pushable: boolean;
  isSwitch: boolean;
  isHideSpot: boolean;
  activated: boolean;
  cooldown: number;
  radius: number;
}

export interface FoliageGroupRef {
  mesh: THREE.InstancedMesh;
  maxCount: number;
}

export interface WorldBuildResult {
  worldGroup: THREE.Group;
  interactables: InteractiveProp[];
  doorMeshes: Map<string, THREE.Mesh>;
  flagMesh: THREE.Mesh;
  waterMesh: THREE.Mesh;
  waterRippleRing: THREE.Mesh;
  aoTrimGroup: THREE.Group;
  foliageRefs: FoliageGroupRef[];
  wallMat: THREE.MeshStandardMaterial;
  courtyardMat: THREE.MeshStandardMaterial;
  grassMat: THREE.MeshStandardMaterial;
  asphaltMat: THREE.MeshStandardMaterial;
  floorMat: THREE.MeshStandardMaterial;
  pitchMat: THREE.MeshStandardMaterial;
  bballMat: THREE.MeshStandardMaterial;
  fanBlades: THREE.Object3D[];
}

export function buildVoxelSchoolWorld(
  tex: ProceduralTexturePack,
  colliders: BoxCollider[],
  graphics: GraphicsConfig,
): WorldBuildResult {
  const worldGroup = new THREE.Group();
  const aoTrimGroup = new THREE.Group();
  aoTrimGroup.visible = graphics.ambientOcclusion;
  worldGroup.add(aoTrimGroup);

  const interactables: InteractiveProp[] = [];
  const doorMeshes = new Map<string, THREE.Mesh>();
  const fanBlades: THREE.Object3D[] = [];
  const foliageRefs: FoliageGroupRef[] = [];

  // Shared remastered materials with procedural bump maps
  const wallMat = new THREE.MeshStandardMaterial({
    map: tex.schoolWall,
    bumpMap: tex.wallBump,
    bumpScale: graphics.textureQuality === 'low' ? 0 : 0.045,
    color: 0xffffff,
    roughness: 0.84,
    metalness: 0.02,
  });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.62, metalness: 0.1 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.76, metalness: 0.06 });
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.86, metalness: 0.04 });
  const floorMat = new THREE.MeshStandardMaterial({ map: tex.classroomFloor, color: 0xffffff, roughness: 0.76, metalness: 0.02 });
  const darkTunnelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9, metalness: 0.08 });
  const aoPlinthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.92, metalness: 0.04 });

  const grassMat = new THREE.MeshStandardMaterial({ map: tex.grass, color: 0xffffff, roughness: 0.94, metalness: 0.0 });
  const courtyardMat = new THREE.MeshStandardMaterial({ map: tex.courtyardTile, color: 0xffffff, roughness: 0.8 });
  const asphaltMat = new THREE.MeshStandardMaterial({ map: tex.asphalt, color: 0xffffff, roughness: 0.88 });
  const pitchMat = new THREE.MeshStandardMaterial({ map: tex.pitch, color: 0xffffff, roughness: 0.84 });
  const bballMat = new THREE.MeshStandardMaterial({ map: tex.basketballCourt, color: 0xffffff, roughness: 0.72 });

  // 1. GROUND SURFACES (disjoint Y >= 0.02 to prevent Z-fighting)
  const grassPlane = new THREE.Mesh(new THREE.PlaneGeometry(360, 360), grassMat);
  grassPlane.rotation.x = -Math.PI / 2;
  grassPlane.position.y = 0;
  grassPlane.receiveShadow = true;
  worldGroup.add(grassPlane);

  // Courtyard tiled plaza
  const courtyard = new THREE.Mesh(new THREE.BoxGeometry(52, 0.06, 56), courtyardMat);
  courtyard.position.set(0, 0.01, 16);
  courtyard.receiveShadow = true;
  worldGroup.add(courtyard);

  // Surrounding Brazilian Street (South z=66..96)
  const mainStreet = new THREE.Mesh(new THREE.BoxGeometry(240, 0.08, 22), asphaltMat);
  mainStreet.position.set(0, 0.02, 78);
  mainStreet.receiveShadow = true;
  worldGroup.add(mainStreet);

  // Sidewalk, curb & crosswalk stripes
  const sidewalk = new THREE.Mesh(new THREE.BoxGeometry(240, 0.12, 5), concreteMat);
  sidewalk.position.set(0, 0.03, 65.5);
  sidewalk.receiveShadow = true;
  worldGroup.add(sidewalk);

  for (let i = -3; i <= 3; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.03, 8),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }),
    );
    stripe.position.set(i * 3.2, 0.07, 78);
    worldGroup.add(stripe);
  }

  // Parking lot pad
  const parkingPad = new THREE.Mesh(
    new THREE.BoxGeometry(114, 0.07, 21),
    new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 }),
  );
  parkingPad.position.set(0, 0.02, 53);
  parkingPad.receiveShadow = true;
  worldGroup.add(parkingPad);

  // Football pitch
  const pitchMesh = new THREE.Mesh(new THREE.BoxGeometry(46, 0.08, 30), pitchMat);
  pitchMesh.position.set(-51, 0.03, 37);
  pitchMesh.receiveShadow = true;
  worldGroup.add(pitchMesh);

  // Basketball court
  const bballMesh = new THREE.Mesh(new THREE.BoxGeometry(20, 0.08, 26), bballMat);
  bballMesh.position.set(-34, 0.03, 5);
  bballMesh.receiveShadow = true;
  worldGroup.add(bballMesh);

  // 2. RENDER ALL WALL COLLIDERS AS VOXEL MASONRY + AO PLINTHS
  for (const c of colliders) {
    const w = c.maxX - c.minX;
    const h = c.maxY - c.minY;
    const d = c.maxZ - c.minZ;
    const isFence = c.id.startsWith('fence');
    const mat = isFence ? trimMat : c.id.startsWith('roof') ? roofMat : wallMat;

    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set((c.minX + c.maxX) / 2, (c.minY + c.maxY) / 2, (c.minZ + c.maxZ) / 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    worldGroup.add(mesh);

    // Architectural AO grounding strip along exterior ground walls
    if (!isFence && c.minY <= 0.1 && h >= 3) {
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.12, 0.24, d + 0.12), aoPlinthMat);
      plinth.position.set((c.minX + c.maxX) / 2, 0.12, (c.minZ + c.maxZ) / 2);
      aoTrimGroup.add(plinth);
    }

    if (c.climbable && !isFence) {
      const pipe = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, h, 0.32),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.3 }),
      );
      pipe.position.set(c.minX + 0.4, (c.minY + c.maxY) / 2, c.maxZ + 0.15);
      worldGroup.add(pipe);
    }
  }

  // 3. FLOORS, STAIRS & ROOFTOPS
  const blocoAF1 = new THREE.Mesh(new THREE.BoxGeometry(88, 0.12, 38), floorMat);
  blocoAF1.position.set(0, 0.04, -31);
  blocoAF1.receiveShadow = true;
  worldGroup.add(blocoAF1);

  const blocoAF2Center = new THREE.Mesh(new THREE.BoxGeometry(74, 0.35, 38), floorMat);
  blocoAF2Center.position.set(0, 4.82, -31);
  blocoAF2Center.receiveShadow = true;
  blocoAF2Center.castShadow = true;
  worldGroup.add(blocoAF2Center);

  const roofN = new THREE.Mesh(new THREE.BoxGeometry(88, 0.35, 12), concreteMat);
  roofN.position.set(0, 9.82, -44);
  roofN.receiveShadow = true;
  worldGroup.add(roofN);
  const roofS = new THREE.Mesh(new THREE.BoxGeometry(88, 0.35, 16), concreteMat);
  roofS.position.set(0, 9.82, -20);
  roofS.receiveShadow = true;
  worldGroup.add(roofS);
  const roofW = new THREE.Mesh(new THREE.BoxGeometry(38, 0.35, 10), concreteMat);
  roofW.position.set(-25, 9.82, -33);
  roofW.receiveShadow = true;
  worldGroup.add(roofW);
  const roofE = new THREE.Mesh(new THREE.BoxGeometry(38, 0.35, 10), concreteMat);
  roofE.position.set(25, 9.82, -33);
  roofE.receiveShadow = true;
  worldGroup.add(roofE);

  // Iconic Blue Brazilian Water Tank (Caixa d'Água) on Rooftop
  const tankGroup = new THREE.Group();
  tankGroup.position.set(22, 10, -40);
  const tankLegs = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.2, 4.2), concreteMat);
  tankLegs.position.y = 1.1;
  const tankBody = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.3, 3.2, 16),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4, metalness: 0.1 }),
  );
  tankBody.position.y = 3.8;
  const tankLid = new THREE.Mesh(
    new THREE.ConeGeometry(2.75, 0.8, 16),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.35 }),
  );
  tankLid.position.y = 5.8;
  tankGroup.add(tankLegs, tankBody, tankLid);
  worldGroup.add(tankGroup);

  // Iconic Clock Tower & Brazilian School Entrance Porch above Recepção
  const facadeTower = new THREE.Group();
  facadeTower.position.set(0, 10, -12.6);
  const towerBox = new THREE.Mesh(new THREE.BoxGeometry(10, 4.4, 2.8), wallMat);
  towerBox.position.y = 2.2;
  const towerRoof = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.9, 3.6), roofMat);
  towerRoof.position.y = 4.8;
  const clockDial = new THREE.Mesh(
    new THREE.CylinderGeometry(1.35, 1.35, 0.3, 20),
    new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.3 }),
  );
  clockDial.rotation.x = Math.PI / 2;
  clockDial.position.set(0, 2.4, 1.45);
  const clockRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.4, 0.16, 8, 24),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4, metalness: 0.4 }),
  );
  clockRim.position.set(0, 2.4, 1.55);
  facadeTower.add(towerBox, towerRoof, clockDial, clockRim);
  worldGroup.add(facadeTower);

  // Entrance Porch Canopy, Columns & Brazilian Colors Band on Bloco A Front Facade
  const awning = new THREE.Mesh(new THREE.BoxGeometry(12, 0.45, 3.2), trimMat);
  awning.position.set(0, 4.6, -10.5);
  awning.castShadow = true;
  worldGroup.add(awning);
  const awningAccent = new THREE.Mesh(
    new THREE.BoxGeometry(12.2, 0.25, 3.3),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }),
  );
  awningAccent.position.set(0, 4.9, -10.5);
  worldGroup.add(awningAccent);
  [-5.2, 5.2].forEach((px) => {
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.65, 4.6, 0.65), trimMat);
    col.position.set(px, 2.3, -9.3);
    col.castShadow = true;
    worldGroup.add(col);
  });

  // Colorful Brazilian School Facade Band between 1st and 2nd floor
  const facadeBand = new THREE.Mesh(
    new THREE.BoxGeometry(88.4, 0.45, 0.3),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 }),
  );
  facadeBand.position.set(0, 5.0, -11.55);
  worldGroup.add(facadeBand);

  // Cornice AO trim under roof overhang
  const corniceAo = new THREE.Mesh(new THREE.BoxGeometry(88.6, 0.28, 0.35), aoPlinthMat);
  corniceAo.position.set(0, 9.65, -11.6);
  aoTrimGroup.add(corniceAo);

  // Instanced Voxel Windows across Bloco A (Ground & 2nd Floor front + back)
  const winPositions: [number, number, number][] = [];
  const frontXs = [-38, -32, -26, -20, -14, -9.5, 9.5, 14, 20, 26, 32, 38];
  for (const wx of frontXs) {
    winPositions.push([wx, 2.7, -11.5], [wx, 7.6, -11.5]);
  }
  const backXs = [-38, -30, -22, -14, -6, 6, 14, 22, 30, 38];
  for (const wx of backXs) {
    winPositions.push([wx, 2.7, -50.5], [wx, 7.6, -50.5]);
  }
  const winFrameGeo = new THREE.BoxGeometry(2.6, 1.8, 0.22);
  const winFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.5, metalness: 0.2 });
  const winGlassGeo = new THREE.BoxGeometry(2.1, 1.35, 0.26);
  const winGlassMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.12, metalness: 0.55 });
  const winFrames = new THREE.InstancedMesh(winFrameGeo, winFrameMat, winPositions.length);
  const winGlass = new THREE.InstancedMesh(winGlassGeo, winGlassMat, winPositions.length);
  const winDummy = new THREE.Object3D();
  winPositions.forEach(([wx, wy, wz], idx) => {
    winDummy.position.set(wx, wy, wz);
    winDummy.updateMatrix();
    winFrames.setMatrixAt(idx, winDummy.matrix);
    winGlass.setMatrixAt(idx, winDummy.matrix);
  });
  winFrames.instanceMatrix.needsUpdate = true;
  winGlass.instanceMatrix.needsUpdate = true;
  winFrames.computeBoundingSphere();
  winGlass.computeBoundingSphere();
  worldGroup.add(winFrames, winGlass);

  // Stair ramps visuals (stepped voxel stairs)
  const buildVoxelStair = (x: number, w: number, zMin: number, zMax: number, yStart: number, yEnd: number) => {
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      const t = (i + 0.5) / steps;
      const stepY = yStart + (yEnd - yStart) * t;
      const stepZ = zMin + (zMax - zMin) * t;
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.45, (zMax - zMin) / steps + 0.15),
        concreteMat,
      );
      step.position.set(x, stepY - 0.2, stepZ);
      step.receiveShadow = true;
      step.castShadow = true;
      worldGroup.add(step);
    }
  };
  buildVoxelStair(-40.3, 5.8, -30, -18, 0, 5);
  buildVoxelStair(40.3, 5.8, -30, -18, 0, 5);
  buildVoxelStair(0, 10.6, -38, -28, 5, 10);

  // Bloco B Floor & Roof
  const blocoBF1 = new THREE.Mesh(new THREE.BoxGeometry(40, 0.12, 44), floorMat);
  blocoBF1.position.set(46, 0.04, 14);
  blocoBF1.receiveShadow = true;
  worldGroup.add(blocoBF1);
  const blocoBRoof = new THREE.Mesh(new THREE.BoxGeometry(40.8, 0.4, 44.8), roofMat);
  blocoBRoof.position.set(46, 4.95, 14);
  blocoBRoof.receiveShadow = true;
  worldGroup.add(blocoBRoof);

  // Ginásio Floor & Roof Arch
  const gymFloor = new THREE.Mesh(
    new THREE.BoxGeometry(28, 0.1, 28),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 }),
  );
  gymFloor.position.set(-60, 0.04, 4);
  gymFloor.receiveShadow = true;
  worldGroup.add(gymFloor);
  const gymRoof = new THREE.Mesh(
    new THREE.BoxGeometry(29, 0.6, 29),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5, metalness: 0.2 }),
  );
  gymRoof.position.set(-60, 8.2, 4);
  worldGroup.add(gymRoof);

  // Secret Underground Tunnel System (y = -3.5)
  const tunnelFloor = new THREE.Mesh(new THREE.BoxGeometry(48, 0.2, 46), darkTunnelMat);
  tunnelFloor.position.set(-20, -3.6, -22);
  tunnelFloor.receiveShadow = true;
  worldGroup.add(tunnelFloor);
  buildVoxelStair(0, 4.8, 2, 10, -3.5, 0);
  buildVoxelStair(-39, 5.5, -46, -38, 0, -3.5);
  const secretLantern = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.4, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xf59e0b, emissiveIntensity: 1.4 }),
  );
  secretLantern.position.set(-19, -0.5, -16);
  worldGroup.add(secretLantern);

  // 4. INSTANCED CLASSROOM DESKS, CHAIRS & CHALKBOARDS ACROSS ALL 22 CLASSROOMS + LIBRARY BOOKSHELVES & COMPUTER LAB
  const deskGeo = new THREE.BoxGeometry(1.2, 0.72, 0.75);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65 });
  const deskCount = CLASSROOMS.length * 4;
  const instancedDesks = new THREE.InstancedMesh(deskGeo, deskMat, deskCount);
  instancedDesks.castShadow = true;
  instancedDesks.receiveShadow = true;
  const dummy = new THREE.Object3D();
  let dIdx = 0;

  const boardGeo = new THREE.BoxGeometry(3.6, 1.4, 0.14);
  const boardMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.8 });
  const instancedBoards = new THREE.InstancedMesh(boardGeo, boardMat, CLASSROOMS.length);

  CLASSROOMS.forEach((c, cIdx) => {
    const cx = (c.xMin + c.xMax) / 2;
    const cz = (c.zMin + c.zMax) / 2;
    dummy.position.set(cx, c.floorY + 2.1, c.zMin + 0.65);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    instancedBoards.setMatrixAt(cIdx, dummy.matrix);

    const offsets = [
      [-2.2, -1.6],
      [2.2, -1.6],
      [-2.2, 1.8],
      [2.2, 1.8],
    ];
    for (const [ox, oz] of offsets) {
      dummy.position.set(cx + ox, c.floorY + 0.36, cz + oz);
      dummy.updateMatrix();
      instancedDesks.setMatrixAt(dIdx++, dummy.matrix);
    }
  });
  instancedDesks.instanceMatrix.needsUpdate = true;
  instancedDesks.computeBoundingSphere();
  instancedBoards.instanceMatrix.needsUpdate = true;
  instancedBoards.computeBoundingSphere();
  worldGroup.add(instancedDesks, instancedBoards);

  // Library Bookshelves (Biblioteca x:-42..-26, z:-48..-34)
  const shelfGeo = new THREE.BoxGeometry(1.1, 2.6, 3.6);
  const shelfMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.78 });
  const shelfPositions: [number, number, number][] = [
    [-40, 1.3, -44], [-35, 1.3, -44], [-30, 1.3, -44], [-40, 1.3, -37], [-30, 1.3, -37],
  ];
  const instShelves = new THREE.InstancedMesh(shelfGeo, shelfMat, shelfPositions.length);
  shelfPositions.forEach(([sx, sy, sz], i) => {
    dummy.position.set(sx, sy, sz);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    instShelves.setMatrixAt(i, dummy.matrix);
  });
  instShelves.instanceMatrix.needsUpdate = true;
  worldGroup.add(instShelves);

  // Computer Lab Monitors (2nd Floor East x:14..24, z:-46..-34)
  const monGeo = new THREE.BoxGeometry(0.7, 0.55, 0.16);
  const monMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0369a1, emissiveIntensity: 0.45, roughness: 0.2 });
  const monPositions: [number, number, number][] = [
    [16, 6.05, -45], [20, 6.05, -45], [16, 6.05, -40], [20, 6.05, -40], [16, 6.05, -35], [20, 6.05, -35],
  ];
  const instMons = new THREE.InstancedMesh(monGeo, monMat, monPositions.length);
  monPositions.forEach(([mx, my, mz], i) => {
    dummy.position.set(mx, my, mz);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    instMons.setMatrixAt(i, dummy.matrix);
  });
  instMons.instanceMatrix.needsUpdate = true;
  worldGroup.add(instMons);

  // 5. INSTANCED TREES & FOLIAGE BUSHES (Controllable via foliageDensity!)
  const treeCoords: [number, number][] = [
    [-18, 6], [-14, 14], [14, 14], [18, 6],
    [-20, 32], [20, 32], [-78, 22], [-78, 42],
    [72, 10], [72, 28], [-64, 66], [-32, 66], [32, 66], [64, 66],
    [-76, -34], [76, -34], [-55, -62], [0, -64], [55, -62],
    [-88, 66], [88, 66], [-88, 88], [88, 88],
    [-10, 34], [10, 34], [-72, -16], [72, -16],
  ];
  const trunkGeo = new THREE.BoxGeometry(0.9, 3.6, 0.9);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const canopyGeo = new THREE.BoxGeometry(3.8, 3.2, 3.8);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.75 });
  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treeCoords.length);
  const canopyInst = new THREE.InstancedMesh(canopyGeo, canopyMat, treeCoords.length);
  trunkInst.castShadow = true;
  canopyInst.castShadow = true;
  const color = new THREE.Color();

  treeCoords.forEach(([tx, tz], i) => {
    const scale = 0.88 + ((i * 7) % 5) * 0.06;
    dummy.position.set(tx, 1.8 * scale, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);

    dummy.position.set(tx, 4.4 * scale, tz);
    dummy.scale.set(scale, scale, scale);
    dummy.updateMatrix();
    canopyInst.setMatrixAt(i, dummy.matrix);

    color.setHSL(0.34 + ((i % 4) - 1.5) * 0.02, 0.65, 0.36 + (i % 3) * 0.04);
    canopyInst.setColorAt(i, color);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  canopyInst.instanceMatrix.needsUpdate = true;
  if (canopyInst.instanceColor) canopyInst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  canopyInst.computeBoundingSphere();
  trunkInst.count = Math.max(8, Math.round(treeCoords.length * graphics.foliageDensity));
  canopyInst.count = trunkInst.count;
  foliageRefs.push(
    { mesh: trunkInst, maxCount: treeCoords.length },
    { mesh: canopyInst, maxCount: treeCoords.length },
  );
  worldGroup.add(trunkInst, canopyInst);

  // Decorative Courtyard Shrubs & Flowerbeds (Instanced)
  const bushCoords: [number, number][] = [
    [-10, -9], [10, -9], [-16, 12], [16, 12], [-21, 22], [21, 22],
    [-12, 39], [12, 39], [-28, 66], [28, 66], [-45, 66], [45, 66],
  ];
  const bushGeo = new THREE.BoxGeometry(1.4, 0.9, 1.4);
  const bushMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.78 });
  const bushInst = new THREE.InstancedMesh(bushGeo, bushMat, bushCoords.length);
  bushCoords.forEach(([bx, bz], i) => {
    dummy.position.set(bx, 0.45, bz);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    bushInst.setMatrixAt(i, dummy.matrix);
    color.setHex(i % 3 === 0 ? 0x22c55e : i % 3 === 1 ? 0x16a34a : 0x4ade80);
    bushInst.setColorAt(i, color);
  });
  bushInst.instanceMatrix.needsUpdate = true;
  if (bushInst.instanceColor) bushInst.instanceColor.needsUpdate = true;
  bushInst.count = Math.max(4, Math.round(bushCoords.length * graphics.foliageDensity));
  foliageRefs.push({ mesh: bushInst, maxCount: bushCoords.length });
  worldGroup.add(bushInst);

  // 6. COURTYARD BRAZILIAN FLAG MAST, REMASTERED FOUNTAIN WATER POOL, BENCHES & PLAYGROUND
  const mast = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 9, 8),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7, roughness: 0.25 }),
  );
  mast.position.set(-8, 4.5, 16);
  const flagMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.7, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.6 }),
  );
  flagMesh.position.set(-6.5, 8.0, 16);
  const flagDiamond = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.0, 0.1),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 }),
  );
  flagMesh.add(flagDiamond);
  worldGroup.add(mast, flagMesh);

  // Courtyard Fountain Pool (x: 12, z: 22) with glossy water & ripple ring
  const fountainGroup = new THREE.Group();
  fountainGroup.position.set(12, 0, 22);
  const basinOuter = new THREE.Mesh(
    new THREE.CylinderGeometry(3.4, 3.6, 0.65, 8),
    concreteMat,
  );
  basinOuter.position.y = 0.32;
  basinOuter.castShadow = true;
  basinOuter.receiveShadow = true;
  const waterMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(2.9, 2.9, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.08, metalness: 0.35, transparent: true, opacity: 0.88 }),
  );
  waterMesh.position.y = 0.54;
  const waterRippleRing = new THREE.Mesh(
    new THREE.RingGeometry(0.65, 0.9, 20),
    new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  );
  waterRippleRing.rotation.x = -Math.PI / 2;
  waterRippleRing.position.y = 0.65;
  const fountainSpout = new THREE.Mesh(
    new THREE.BoxGeometry(0.85, 1.6, 0.85),
    concreteMat,
  );
  fountainSpout.position.y = 0.8;
  fountainGroup.add(basinOuter, waterMesh, waterRippleRing, fountainSpout);
  worldGroup.add(fountainGroup);

  // Courtyard Benches
  const benchMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
  [
    [-12, 22],
    [12, 6],
    [-12, 6],
  ].forEach(([bx, bz]) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.16, 0.75), benchMat);
    seat.position.set(bx, 0.5, bz);
    seat.castShadow = true;
    worldGroup.add(seat);
  });

  // Playground Slide & Swing Set at (-14, 0, -2)
  const slideGroup = new THREE.Group();
  slideGroup.position.set(-14, 0, -2);
  const slideDeck = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.2, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }),
  );
  slideDeck.position.y = 1.1;
  const slideChute = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.25, 3.8),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }),
  );
  slideChute.position.set(0, 1.1, 2.3);
  slideChute.rotation.x = 0.52;
  // Swing frame next to slide
  const swingFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.25, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }),
  );
  swingFrame.position.set(4.5, 2.8, 0);
  const swingPostL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.8, 0.24), trimMat);
  swingPostL.position.set(2.9, 1.4, 0);
  const swingPostR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.8, 0.24), trimMat);
  swingPostR.position.set(6.1, 1.4, 0);
  slideGroup.add(slideDeck, slideChute, swingFrame, swingPostL, swingPostR);
  worldGroup.add(slideGroup);

  // Football Goals at Pitch West (-72.5) and East (-29.5)
  const buildGoal = (gx: number) => {
    const goal = new THREE.Group();
    goal.position.set(gx, 0, 37);
    const barMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.3 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 0.25), barMat);
    p1.position.set(0, 1.4, -3.5);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 0.25), barMat);
    p2.position.set(0, 1.4, 3.5);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 7.2), barMat);
    top.position.set(0, 2.8, 0);
    goal.add(p1, p2, top);
    worldGroup.add(goal);
  };
  buildGoal(-72.5);
  buildGoal(-29.5);

  // Basketball Hoops
  const buildHoop = (hx: number, hz: number, dirZ: number) => {
    const hoop = new THREE.Group();
    hoop.position.set(hx, 0, hz);
    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3.8, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5 }),
    );
    pole.position.y = 1.9;
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.3, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
    );
    board.position.set(0, 3.6, dirZ * 0.4);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.45, 0.07, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xea580c, metalness: 0.4 }),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 3.1, dirZ * 0.9);
    hoop.add(pole, board, rim);
    worldGroup.add(hoop);
  };
  buildHoop(-34, -6.5, 1);
  buildHoop(-34, 16.5, -1);

  // Yellow Brazilian School Buses & Cars in Parking & Street!
  const buildVoxelBus = (bx: number, bz: number, rotY: number, bodyColor: number) => {
    const bus = new THREE.Group();
    bus.position.set(bx, 0, bz);
    bus.rotation.y = rotY;
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(7.2, 2.4, 2.6),
      new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.42, metalness: 0.15 }),
    );
    chassis.position.y = 1.6;
    chassis.castShadow = true;
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(7.25, 0.35, 2.66),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }),
    );
    stripe.position.y = 1.4;
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.9, 2.64),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.35 }),
    );
    glass.position.y = 2.1;
    const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 12);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    [
      [-2.2, -1.2],
      [2.2, -1.2],
      [-2.2, 1.2],
      [2.2, 1.2],
    ].forEach(([wx, wz]) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.x = Math.PI / 2;
      w.position.set(wx, 0.55, wz);
      bus.add(w);
    });
    bus.add(chassis, stripe, glass);
    worldGroup.add(bus);
  };
  buildVoxelBus(-26, 54, 0, 0xfacc15);
  buildVoxelBus(26, 54, Math.PI, 0xfacc15);
  buildVoxelBus(-42, 76, 0, 0xef4444);
  buildVoxelBus(44, 80, Math.PI, 0x2563eb);

  // Street Lamp Posts & Bus Stop Shelter
  [-36, -12, 12, 36].forEach((lx) => {
    const pole = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 5.2, 0.26),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 }),
    );
    pole.position.set(lx, 2.6, 65.5);
    const bulb = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.25, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfacc15, emissiveIntensity: 0.6 }),
    );
    bulb.position.set(lx, 5.2, 66.2);
    worldGroup.add(pole, bulb);
  });

  // Main Gate Archway at (0, 0, 42)
  const gatePillarL = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.2, 1.4), wallMat);
  gatePillarL.position.set(-8.2, 2.6, 42);
  const gatePillarR = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.2, 1.4), wallMat);
  gatePillarR.position.set(8.2, 2.6, 42);
  const gateBanner = new THREE.Mesh(new THREE.BoxGeometry(17.8, 1.3, 1.0), trimMat);
  gateBanner.position.set(0, 5.4, 42);
  worldGroup.add(gatePillarL, gatePillarR, gateBanner);

  // Cafeteria Tables & Counters
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const tbl = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 0.8, 1.6),
        new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 }),
      );
      tbl.position.set(34 + col * 10, 0.4, -2 + row * 5);
      tbl.castShadow = true;
      worldGroup.add(tbl);
    }
  }

  // 7. INTERACTIVE PROPS SPAWNING ACROSS EVERY ZONE
  let propId = 0;
  const spawnProp = (
    kind: PropKind,
    name: string,
    x: number,
    y: number,
    z: number,
    opts: { pickable?: boolean; pushable?: boolean; isSwitch?: boolean; isHideSpot?: boolean } = {},
  ) => {
    const mesh = buildVoxelPropMesh(kind);
    mesh.position.set(x, y, z);
    worldGroup.add(mesh);
    interactables.push({
      id: propId++,
      kind,
      name,
      mesh,
      pos: new THREE.Vector3(x, y, z),
      vel: new THREE.Vector3(),
      homePos: new THREE.Vector3(x, y, z),
      pickable: opts.pickable ?? true,
      pushable: opts.pushable ?? false,
      isSwitch: opts.isSwitch ?? false,
      isHideSpot: opts.isHideSpot ?? false,
      activated: false,
      cooldown: 0,
      radius: 0.55,
    });
  };

  spawnProp('soccer_ball', 'Bola de Futebol', 5.5, 0, 12, { pickable: true, pushable: true });
  spawnProp('soccer_ball', 'Bola de Futebol do Campo', -51, 0, 37, { pickable: true, pushable: true });
  spawnProp('basketball', 'Bola de Basquete', -34, 0, 5, { pickable: true, pushable: true });
  spawnProp('basketball', 'Bola do Ginásio', -60, 0, 4, { pickable: true, pushable: true });
  spawnProp('trash_can', 'Lixeira do Pátio', -6.5, 0, 10, { pickable: false, pushable: true, isHideSpot: true });
  spawnProp('trash_can', 'Lixeira do Corredor', 12, 0, -26, { pickable: false, pushable: true, isHideSpot: true });
  spawnProp('traffic_cone', 'Cone Laranja', 7, 0, 36, { pickable: true, pushable: true });
  spawnProp('traffic_cone', 'Cone da Rua', -7, 0, 36, { pickable: true, pushable: true });
  spawnProp('speaker', 'Caixa de Som do Pátio', 11, 0, 12, { pickable: false, isSwitch: true });
  spawnProp('megaphone', 'Megafone da Diretoria', -14, 0, -17, { pickable: true });
  spawnProp('trophy', 'Troféu Secreto do Grêmio', -19, -3.5, -16, { pickable: true });
  spawnProp('trophy', 'Troféu da Diretoria', -11, 0, -14, { pickable: true });
  spawnProp('fire_alarm', 'Alarme de Incêndio (Recepção)', 5.5, 1.4, -13, { pickable: false, isSwitch: true });
  spawnProp('fire_alarm', 'Alarme do 2º Andar', 0, 6.4, -24.6, { pickable: false, isSwitch: true });
  spawnProp('fire_extinguisher', 'Extintor de Espuma', -9, 0, -25, { pickable: true });
  spawnProp('fire_extinguisher', 'Extintor do Lab', 22, 5, -23, { pickable: true });
  spawnProp('beaker', 'Béquer Espumante', 28, 5, -17, { pickable: true });
  spawnProp('beaker', 'Béquer Colorido', 31, 5, -19, { pickable: true });
  spawnProp('cafeteria_tray', 'Bandeja da Merenda', 36, 0.8, 3, { pickable: true });
  spawnProp('cafeteria_tray', 'Bandeja de Suco', 44, 0.8, 8, { pickable: true });
  spawnProp('book', 'Pilha de Livros', -33, 0, -37, { pickable: true });
  spawnProp('radio', 'Rádio do Telhado', 0, 10, -20, { pickable: true, isSwitch: true });
  spawnProp('plant_pot', 'Vaso da Recepção', -5, 0, -14, { pickable: true, pushable: true });
  spawnProp('plant_pot', 'Vaso da Sala dos Profs', -26, 0, -16, { pickable: true, pushable: true });
  spawnProp('chair', 'Cadeira da Sala 101', 14, 0, -18, { pickable: true, pushable: true });

  return {
    worldGroup,
    interactables,
    doorMeshes,
    flagMesh,
    waterMesh,
    waterRippleRing,
    aoTrimGroup,
    foliageRefs,
    wallMat,
    courtyardMat,
    grassMat,
    asphaltMat,
    floorMat,
    pitchMat,
    bballMat,
    fanBlades,
  };
}
