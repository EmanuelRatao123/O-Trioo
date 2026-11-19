import { BoxCollider, FloorSurface, ZoneDef } from './types';

export const WORLD_BOUNDS = {
  minX: -105,
  maxX: 105,
  minZ: -85,
  maxZ: 98,
  minY: -6,
  maxY: 32,
};

export interface ClassroomDef {
  id: string;
  name: string;
  xMin: number;
  xMax: number;
  zMin: number;
  zMax: number;
  floorY: number;
  doorPos: [number, number]; // x, z opening
  doorAxis: 'x' | 'z';
}

export const CLASSROOMS: ClassroomDef[] = [
  // Bloco A - Térreo (8 salas: 101-108)
  { id: 'sala-101', name: 'Sala 101 (Português)', xMin: 8, xMax: 20, zMin: -24, zMax: -12, floorY: 0, doorPos: [14, -24], doorAxis: 'z' },
  { id: 'sala-102', name: 'Sala 102 (Matemática)', xMin: 20, xMax: 32, zMin: -24, zMax: -12, floorY: 0, doorPos: [26, -24], doorAxis: 'z' },
  { id: 'sala-103', name: 'Sala 103 (História)', xMin: -24, xMax: -12, zMin: -50, zMax: -30, floorY: 0, doorPos: [-18, -30], doorAxis: 'z' },
  { id: 'sala-104', name: 'Sala 104 (Geografia)', xMin: -12, xMax: 0, zMin: -50, zMax: -30, floorY: 0, doorPos: [-6, -30], doorAxis: 'z' },
  { id: 'sala-105', name: 'Sala 105 (Artes)', xMin: 0, xMax: 12, zMin: -50, zMax: -30, floorY: 0, doorPos: [6, -30], doorAxis: 'z' },
  { id: 'sala-106', name: 'Sala 106 (Música)', xMin: 12, xMax: 24, zMin: -50, zMax: -30, floorY: 0, doorPos: [18, -30], doorAxis: 'z' },
  { id: 'sala-107', name: 'Sala 107 (Biologia)', xMin: 24, xMax: 34, zMin: -50, zMax: -30, floorY: 0, doorPos: [29, -30], doorAxis: 'z' },
  { id: 'sala-108', name: 'Sala 108 (Inglês)', xMin: 34, xMax: 44, zMin: -50, zMax: -30, floorY: 0, doorPos: [39, -30], doorAxis: 'z' },

  // Bloco A - 2º Andar (10 salas: 201-210)
  { id: 'sala-201', name: 'Sala 201 (Física)', xMin: -20, xMax: -8, zMin: -24, zMax: -12, floorY: 5, doorPos: [-14, -24], doorAxis: 'z' },
  { id: 'sala-202', name: 'Sala 202 (Química)', xMin: 8, xMax: 20, zMin: -24, zMax: -12, floorY: 5, doorPos: [14, -24], doorAxis: 'z' },
  { id: 'sala-203', name: 'Sala 203 (Literatura)', xMin: -44, xMax: -33, zMin: -50, zMax: -30, floorY: 5, doorPos: [-38.5, -30], doorAxis: 'z' },
  { id: 'sala-204', name: 'Sala 204 (Redação)', xMin: -33, xMax: -22, zMin: -50, zMax: -30, floorY: 5, doorPos: [-27.5, -30], doorAxis: 'z' },
  { id: 'sala-205', name: 'Sala 205 (Filosofia)', xMin: -22, xMax: -11, zMin: -50, zMax: -30, floorY: 5, doorPos: [-16.5, -30], doorAxis: 'z' },
  { id: 'sala-206', name: 'Sala 206 (Sociologia)', xMin: -11, xMax: 0, zMin: -50, zMax: -30, floorY: 5, doorPos: [-5.5, -30], doorAxis: 'z' },
  { id: 'sala-207', name: 'Sala 207 (Espanhol)', xMin: 0, xMax: 11, zMin: -50, zMax: -30, floorY: 5, doorPos: [5.5, -30], doorAxis: 'z' },
  { id: 'sala-208', name: 'Sala 208 (Robótica)', xMin: 11, xMax: 22, zMin: -50, zMax: -30, floorY: 5, doorPos: [16.5, -30], doorAxis: 'z' },
  { id: 'sala-209', name: 'Sala 209 (Teatro)', xMin: 22, xMax: 33, zMin: -50, zMax: -30, floorY: 5, doorPos: [27.5, -30], doorAxis: 'z' },
  { id: 'sala-210', name: 'Sala 210 (Grêmio Estudantil)', xMin: 33, xMax: 44, zMin: -50, zMax: -30, floorY: 5, doorPos: [38.5, -30], doorAxis: 'z' },

  // Bloco B - Ala Leste (4 salas: 301-304) -> Total: 22 Salas de Aula!
  { id: 'sala-301', name: 'Sala 301 (1º Ano A)', xMin: 26, xMax: 36, zMin: 22, zMax: 36, floorY: 0, doorPos: [31, 22], doorAxis: 'z' },
  { id: 'sala-302', name: 'Sala 302 (1º Ano B)', xMin: 36, xMax: 46, zMin: 22, zMax: 36, floorY: 0, doorPos: [41, 22], doorAxis: 'z' },
  { id: 'sala-303', name: 'Sala 303 (2º Ano A)', xMin: 46, xMax: 56, zMin: 22, zMax: 36, floorY: 0, doorPos: [51, 22], doorAxis: 'z' },
  { id: 'sala-304', name: 'Sala 304 (3º Ano A)', xMin: 56, xMax: 66, zMin: 22, zMax: 36, floorY: 0, doorPos: [61, 22], doorAxis: 'z' },
];

export const SCHOOL_ZONES: ZoneDef[] = [
  { id: 'courtyard', name: 'Pátio Central', category: 'common', xMin: -24, xMax: 24, zMin: -12, zMax: 42, yMin: -0.5, yMax: 4.5, teleportPos: [0, 0, 18], mapColor: '#F59E0B' },
  { id: 'reception', name: 'Recepção Principal', category: 'common', xMin: -8, xMax: 8, zMin: -24, zMax: -12, yMin: -0.5, yMax: 4.5, teleportPos: [0, 0, -16], mapColor: '#38BDF8' },
  { id: 'principal', name: 'Diretoria', category: 'academic', xMin: -20, xMax: -8, zMin: -24, zMax: -12, yMin: -0.5, yMax: 4.5, teleportPos: [-14, 0, -18], mapColor: '#EF4444' },
  { id: 'teachers', name: 'Sala dos Professores', category: 'academic', xMin: -32, xMax: -20, zMin: -24, zMax: -12, yMin: -0.5, yMax: 4.5, teleportPos: [-26, 0, -18], mapColor: '#FB7185' },
  { id: 'storage', name: 'Almoxarifado', category: 'common', xMin: -44, xMax: -32, zMin: -24, zMax: -12, yMin: -0.5, yMax: 4.5, teleportPos: [-36, 0, -18], mapColor: '#94A3B8' },
  { id: 'bathrooms', name: 'Banheiros', category: 'common', xMin: 32, xMax: 44, zMin: -24, zMax: -12, yMin: -0.5, yMax: 4.5, teleportPos: [38, 0, -18], mapColor: '#22D3EE' },
  { id: 'library', name: 'Biblioteca Central', category: 'academic', xMin: -44, xMax: -24, zMin: -50, zMax: -30, yMin: -0.5, yMax: 4.5, teleportPos: [-34, 0, -36], mapColor: '#A78BFA' },
  { id: 'computer_lab', name: 'Lab. de Informática', category: 'academic', xMin: -44, xMax: -20, zMin: -24, zMax: -12, yMin: 4.5, yMax: 9.5, teleportPos: [-28, 5, -18], mapColor: '#3B82F6' },
  { id: 'science_lab', name: 'Lab. de Ciências', category: 'academic', xMin: 20, xMax: 44, zMin: -24, zMax: -12, yMin: 4.5, yMax: 9.5, teleportPos: [28, 5, -18], mapColor: '#10B981' },
  { id: 'rooftop', name: 'Telhado & Caixa d’Água', category: 'outdoor', xMin: -45, xMax: 45, zMin: -51, zMax: -11, yMin: 9.5, yMax: 24, teleportPos: [0, 10, -22], mapColor: '#64748B' },
  { id: 'cafeteria', name: 'Refeitório Gigante', category: 'common', xMin: 26, xMax: 54, zMin: -8, zMax: 16, yMin: -0.5, yMax: 4.5, teleportPos: [38, 0, 4], mapColor: '#F97316' },
  { id: 'kitchen', name: 'Cozinha da Merenda', category: 'common', xMin: 54, xMax: 66, zMin: -8, zMax: 16, yMin: -0.5, yMax: 4.5, teleportPos: [59, 0, 4], mapColor: '#FB923C' },
  { id: 'gym', name: 'Ginásio Poliesportivo', category: 'sports', xMin: -74, xMax: -46, zMin: -10, zMax: 18, yMin: -0.5, yMax: 12, teleportPos: [-60, 0, 4], mapColor: '#8B5CF6' },
  { id: 'basketball', name: 'Quadra de Basquete', category: 'sports', xMin: -44, xMax: -24, zMin: -8, zMax: 18, yMin: -0.5, yMax: 8, teleportPos: [-34, 0, 5], mapColor: '#EC4899' },
  { id: 'football', name: 'Campo de Futebol', category: 'sports', xMin: -74, xMax: -28, zMin: 22, zMax: 52, yMin: -0.5, yMax: 12, teleportPos: [-51, 0, 37], mapColor: '#22C55E' },
  { id: 'playground', name: 'Parquinho & Jardins', category: 'outdoor', xMin: -23, xMax: 23, zMin: -10, zMax: 10, yMin: -0.5, yMax: 6, teleportPos: [-15, 0, 2], mapColor: '#84CC16' },
  { id: 'secret_tunnel', name: 'Túneis Secretos & Grêmio Subterrâneo', category: 'secret', xMin: -44, xMax: 6, zMin: -50, zMax: 14, yMin: -5, yMax: -1.2, teleportPos: [-18, -3.5, -14], mapColor: '#EAB308' },
  { id: 'main_gate', name: 'Portão Principal', category: 'outdoor', xMin: -12, xMax: 12, zMin: 38, zMax: 48, yMin: -0.5, yMax: 8, teleportPos: [0, 0, 40], mapColor: '#14B8A6' },
  { id: 'parking', name: 'Estacionamento Escolar', category: 'outdoor', xMin: -56, xMax: 56, zMin: 44, zMax: 65, yMin: -0.5, yMax: 8, teleportPos: [20, 0, 52], mapColor: '#475569' },
  { id: 'streets', name: 'Ruas ao Redor da Escola', category: 'outdoor', xMin: -105, xMax: 105, zMin: 66, zMax: 98, yMin: -0.5, yMax: 16, teleportPos: [0, 0, 76], mapColor: '#334155' },
  // Add classrooms as zones too so getZoneAt returns exact room names!
  ...CLASSROOMS.map((c) => ({
    id: c.id,
    name: c.name,
    category: 'academic' as const,
    xMin: c.xMin,
    xMax: c.xMax,
    zMin: c.zMin,
    zMax: c.zMax,
    yMin: c.floorY - 0.5,
    yMax: c.floorY + 4.5,
    teleportPos: [(c.xMin + c.xMax) / 2, c.floorY, (c.zMin + c.zMax) / 2] as [number, number, number],
    mapColor: '#60A5FA',
  })),
];

export function buildWorldFloorSurfaces(): FloorSurface[] {
  const floors: FloorSurface[] = [
    // Ground level covers the entire walkable outdoor & ground-floor campus
    { id: 'ground', minX: -105, maxX: 105, minZ: -85, maxZ: 98, y: 0 },

    // Bloco A 2nd floor (y = 5) — leaving stair openings clear on West & East
    { id: 'floor2-corridor', minX: -37, maxX: 37, minZ: -30, maxZ: -24, y: 5 },
    { id: 'floor2-front', minX: -44, maxX: 44, minZ: -24, maxZ: -12, y: 5 },
    { id: 'floor2-back', minX: -44, maxX: 44, minZ: -50, maxZ: -30, y: 5 },

    // Bloco A West & East Stair Ramps (y = 0 -> 5)
    { id: 'stair-west-1', minX: -43.5, maxX: -37.2, minZ: -30, maxZ: -18, y: 0, rampAxis: 'z', yStart: 0, yEnd: 5 },
    { id: 'stair-east-1', minX: 37.2, maxX: 43.5, minZ: -30, maxZ: -18, y: 0, rampAxis: 'z', yStart: 0, yEnd: 5 },

    // Bloco A Rooftop (y = 10)
    { id: 'rooftop-north', minX: -44, maxX: 44, minZ: -50, maxZ: -38, y: 10 },
    { id: 'rooftop-south', minX: -44, maxX: 44, minZ: -28, maxZ: -12, y: 10 },
    { id: 'rooftop-wings-w', minX: -44, maxX: -6, minZ: -38, maxZ: -28, y: 10 },
    { id: 'rooftop-wings-e', minX: 6, maxX: 44, minZ: -38, maxZ: -28, y: 10 },
    // Stair Ramp Floor 2 -> Rooftop (y = 5 -> 10)
    { id: 'stair-roof', minX: -5.8, maxX: 5.8, minZ: -38, maxZ: -28, y: 5, rampAxis: 'z', yStart: 5, yEnd: 10 },

    // Bloco B Rooftop (y = 5) reachable by Eagle glide or Rat climb!
    { id: 'blocob-roof', minX: 26, maxX: 66, minZ: -8, maxZ: 36, y: 5 },

    // Secret Underground Tunnel System (y = -3.5)
    { id: 'tunnel-ramp-courtyard', minX: -2.5, maxX: 2.5, minZ: 2, maxZ: 10, y: -3.5, rampAxis: 'z', yStart: -3.5, yEnd: 0 },
    { id: 'tunnel-ramp-library', minX: -42, maxX: -36, minZ: -46, maxZ: -38, y: -3.5, rampAxis: 'z', yStart: 0, yEnd: -3.5 },
    { id: 'tunnel-main-ns', minX: -3, maxX: 3, minZ: -20, maxZ: 3, y: -3.5 },
    { id: 'tunnel-main-ew', minX: -42, maxX: 3, minZ: -20, maxZ: -12, y: -3.5 },
    { id: 'tunnel-secret-room', minX: -28, maxX: -10, minZ: -26, maxZ: -6, y: -3.5 },
    { id: 'tunnel-lib-branch', minX: -42, maxX: -35, minZ: -39, maxZ: -12, y: -3.5 },
  ];
  return floors;
}

export function buildWorldColliders(): BoxCollider[] {
  const cols: BoxCollider[] = [];
  const addWall = (id: string, x1: number, x2: number, y1: number, y2: number, z1: number, z2: number, climbable = false) => {
    cols.push({
      id,
      minX: Math.min(x1, x2),
      maxX: Math.max(x1, x2),
      minY: Math.min(y1, y2),
      maxY: Math.max(y1, y2),
      minZ: Math.min(z1, z2),
      maxZ: Math.max(z1, z2),
      climbable,
    });
  };

  // Helper: wall along X with a doorway gap
  const addWallXWithDoor = (prefix: string, x1: number, x2: number, z: number, y1: number, y2: number, doorCenterX: number, doorHalfW = 1.8) => {
    const t = 0.45;
    if (doorCenterX - doorHalfW > x1 + 0.2) {
      addWall(`${prefix}-L`, x1, doorCenterX - doorHalfW, y1, y2, z - t, z + t);
    }
    if (x2 - 0.2 > doorCenterX + doorHalfW) {
      addWall(`${prefix}-R`, doorCenterX + doorHalfW, x2, y1, y2, z - t, z + t);
    }
  };

  const addWallZWithDoor = (prefix: string, x: number, z1: number, z2: number, y1: number, y2: number, doorCenterZ: number, doorHalfW = 1.8) => {
    const t = 0.45;
    if (doorCenterZ - doorHalfW > z1 + 0.2) {
      addWall(`${prefix}-T`, x - t, x + t, y1, y2, z1, doorCenterZ - doorHalfW);
    }
    if (z2 - 0.2 > doorCenterZ + doorHalfW) {
      addWall(`${prefix}-B`, x - t, x + t, y1, y2, doorCenterZ + doorHalfW, z2);
    }
  };

  // --- BLOCO A OUTER SHELL (y: 0..10) ---
  // North back wall
  addWall('blocoA-N', -44, 44, 0, 10, -50.4, -49.6, true);
  // West & East outer walls (climbable for Rat!)
  addWall('blocoA-W', -44.4, -43.6, 0, 10, -50, -12, true);
  addWall('blocoA-E', 43.6, 44.4, 0, 10, -50, -12, true);
  // South front wall Ground Floor with wide Recepção entrance (x: -4..4)
  addWallXWithDoor('blocoA-S-gnd', -44, 44, -12, 0, 5, 0, 4.2);
  // South front wall 2nd Floor (solid windows)
  addWall('blocoA-S-f2', -44, 44, 5, 10, -12.4, -11.6, true);

  // Rooftop safety parapet (low 0.9m rim with climbable drainpipes)
  addWallXWithDoor('roof-parapet-S', -44, 44, -12, 10, 11.0, 0, 3.5);
  addWall('roof-parapet-N', -44, 44, 10, 11.0, -50.3, -49.7);

  // Ground Floor interior dividers (y: 0..5)
  // Front rooms along z = -24 (doors into corridor z=-24..-30)
  addWallXWithDoor('gnd-almox', -44, -32, -24, 0, 5, -36, 1.6);
  addWallXWithDoor('gnd-prof', -32, -20, -24, 0, 5, -26, 1.6);
  addWallXWithDoor('gnd-dir', -20, -8, -24, 0, 5, -14, 1.6);
  addWallXWithDoor('gnd-rec', -8, 8, -24, 0, 5, 0, 3.5);
  addWallXWithDoor('gnd-s101', 8, 20, -24, 0, 5, 14, 1.6);
  addWallXWithDoor('gnd-s102', 20, 32, -24, 0, 5, 26, 1.6);
  addWallXWithDoor('gnd-banh', 32, 44, -24, 0, 5, 36, 1.6);

  // Front room Z dividers (leaving corridor z=-30..-24 clear!)
  [-32, -20, -8, 8, 20, 32].forEach((x) => {
    addWall(`gnd-fdiv-${x}`, x - 0.35, x + 0.35, 0, 5, -24, -12);
  });

  // Back rooms along z = -30
  addWallXWithDoor('gnd-bib', -44, -24, -30, 0, 5, -32, 2.2);
  addWallXWithDoor('gnd-s103', -24, -12, -30, 0, 5, -18, 1.6);
  addWallXWithDoor('gnd-s104', -12, 0, -30, 0, 5, -6, 1.6);
  addWallXWithDoor('gnd-s105', 0, 12, -30, 0, 5, 6, 1.6);
  addWallXWithDoor('gnd-s106', 12, 24, -30, 0, 5, 18, 1.6);
  addWallXWithDoor('gnd-s107', 24, 34, -30, 0, 5, 29, 1.6);
  addWallXWithDoor('gnd-s108', 34, 44, -30, 0, 5, 39, 1.6);

  [-24, -12, 0, 12, 24, 34].forEach((x) => {
    addWall(`gnd-bdiv-${x}`, x - 0.35, x + 0.35, 0, 5, -50, -30);
  });

  // 2nd Floor interior dividers (y: 5..10)
  addWallXWithDoor('f2-inf', -37, -20, -24, 5, 10, -28, 1.8);
  addWallXWithDoor('f2-s201', -20, -8, -24, 5, 10, -14, 1.6);
  addWallXWithDoor('f2-s202', 8, 20, -24, 5, 10, 14, 1.6);
  addWallXWithDoor('f2-cien', 20, 37, -24, 5, 10, 28, 1.8);
  [-20, -8, 8, 20].forEach((x) => {
    addWall(`f2-fdiv-${x}`, x - 0.35, x + 0.35, 5, 10, -24, -12);
  });

  [-33, -22, -11, 0, 11, 22, 33].forEach((x) => {
    addWall(`f2-bdiv-${x}`, x - 0.35, x + 0.35, 5, 10, -50, -30);
  });
  [-38.5, -27.5, -16.5, -5.5, 5.5, 16.5, 27.5, 38.5].forEach((dx, idx) => {
    const x1 = -44 + idx * 11;
    // Leave x: -5.8..5.8 open near z=-30..-38 for roof stair!
    if (Math.abs(dx) > 6) {
      addWallXWithDoor(`f2-back-${idx}`, x1, x1 + 11, -30, 5, 10, dx, 1.6);
    }
  });

  // --- BLOCO B (REFEITÓRIO, COZINHA & SALAS 301-304) ---
  addWallZWithDoor('blocob-W', 26, -8, 36, 0, 5, 4, 3.5);
  addWallZWithDoor('blocob-W2', 26, 16, 22, 0, 5, 19, 2.5);
  addWall('blocob-N', 26, 66, 0, 5, -8.4, -7.6, true);
  addWall('blocob-E', 65.6, 66.4, 0, 5, -8, 36, true);
  addWall('blocob-S', 26, 66, 0, 5, 35.6, 36.4, true);
  addWallZWithDoor('blocob-cozinha', 54, -8, 16, 0, 5, 4, 2.2);
  addWallXWithDoor('blocob-cor-N', 26, 66, 16, 0, 5, 40, 3.0);
  [26, 36, 46, 56].forEach((x, idx) => {
    if (idx > 0) addWall(`blocob-sdiv-${x}`, x - 0.35, x + 0.35, 0, 5, 22, 36);
    addWallXWithDoor(`blocob-sdoor-${idx}`, x, x + 10, 22, 0, 5, x + 5, 1.6);
  });

  // --- GINÁSIO POLIESPORTIVO (WEST) ---
  addWall('gym-N', -74, -46, 0, 8, -10.4, -9.6, true);
  addWall('gym-W', -74.4, -73.6, 0, 8, -10, 18, true);
  addWallZWithDoor('gym-E', -46, -10, 18, 0, 8, 4, 3.5);
  addWallXWithDoor('gym-S', -74, -46, 18, 0, 8, -60, 3.5);

  // --- PERIMETER FENCE WITH WIDE MAIN GATE & SIDE GATES ---
  addWall('fence-S-W', -82, -8, 0, 2.6, 41.7, 42.3, true);
  addWall('fence-S-E', 8, 82, 0, 2.6, 41.7, 42.3, true);
  addWall('fence-W', -82.3, -81.7, 0, 2.6, -60, 42, true);
  addWall('fence-E', 81.7, 82.3, 0, 2.6, -60, 42, true);
  addWall('fence-N', -82, 82, 0, 2.6, -60.3, -59.7, true);

  return cols;
}

export function getFloorHeightAt(x: number, y: number, z: number, surfaces: FloorSurface[]): number {
  let bestY = 0;
  for (const s of surfaces) {
    if (x >= s.minX && x <= s.maxX && z >= s.minZ && z <= s.maxZ) {
      let surfaceY = s.y;
      if (s.rampAxis && s.yStart !== undefined && s.yEnd !== undefined) {
        const t =
          s.rampAxis === 'z'
            ? (z - s.minZ) / Math.max(0.001, s.maxZ - s.minZ)
            : (x - s.minX) / Math.max(0.001, s.maxX - s.minX);
        const clampedT = Math.max(0, Math.min(1, t));
        surfaceY = s.yStart + (s.yEnd - s.yStart) * clampedT;
      }
      // Only snap to floors below or slightly above feet (step height <= 1.2m)
      if (surfaceY <= y + 1.25 && surfaceY > bestY - 4.5) {
        if (surfaceY > bestY || (y < -1.0 && surfaceY < -1.0)) {
          bestY = surfaceY;
        }
      }
    }
  }
  return bestY;
}

export function getZoneAt(x: number, y: number, z: number): ZoneDef {
  for (let i = SCHOOL_ZONES.length - 1; i >= 0; i--) {
    const zone = SCHOOL_ZONES[i];
    if (
      x >= zone.xMin &&
      x <= zone.xMax &&
      z >= zone.zMin &&
      z <= zone.zMax &&
      y >= zone.yMin &&
      y <= zone.yMax
    ) {
      return zone;
    }
  }
  return {
    id: 'campus',
    name: 'Campus Escolar',
    category: 'outdoor',
    xMin: -105,
    xMax: 105,
    zMin: -85,
    zMax: 98,
    yMin: -6,
    yMax: 32,
    teleportPos: [0, 0, 18],
    mapColor: '#64748B',
  };
}

export function resolveCircleAABB(
  x: number,
  y: number,
  z: number,
  radius: number,
  height: number,
  colliders: BoxCollider[],
): { x: number; z: number; touchingClimbable: boolean } {
  let nx = x;
  let nz = z;
  let touchingClimbable = false;

  for (const c of colliders) {
    if (c.isDoor && c.open) continue;
    // Vertical overlap check
    if (y + height <= c.minY + 0.05 || y >= c.maxY - 0.05) continue;

    const closestX = Math.max(c.minX, Math.min(nx, c.maxX));
    const closestZ = Math.max(c.minZ, Math.min(nz, c.maxZ));
    const dx = nx - closestX;
    const dz = nz - closestZ;
    const distSq = dx * dx + dz * dz;

    if (distSq < radius * radius) {
      if (c.climbable) touchingClimbable = true;
      const dist = Math.sqrt(distSq);
      if (dist > 0.0001) {
        const push = radius - dist;
        nx += (dx / dist) * push;
        nz += (dz / dist) * push;
      } else {
        // Inside AABB: push out along shallowest axis
        const dLeft = Math.abs(nx - c.minX);
        const dRight = Math.abs(c.maxX - nx);
        const dTop = Math.abs(nz - c.minZ);
        const dBot = Math.abs(c.maxZ - nz);
        const m = Math.min(dLeft, dRight, dTop, dBot);
        if (m === dLeft) nx = c.minX - radius;
        else if (m === dRight) nx = c.maxX + radius;
        else if (m === dTop) nz = c.minZ - radius;
        else nz = c.maxZ + radius;
      }
    }
  }

  nx = Math.max(WORLD_BOUNDS.minX + 1, Math.min(WORLD_BOUNDS.maxX - 1, nx));
  nz = Math.max(WORLD_BOUNDS.minZ + 1, Math.min(WORLD_BOUNDS.maxZ - 1, nz));
  return { x: nx, z: nz, touchingClimbable };
}
