import * as THREE from 'three';
import {
  AnimalSpecies,
  NpcEmotion,
  NpcPersonality,
  NpcRole,
  SchedulePhaseId,
  UniverseMode,
} from './types';
import { CLASSROOMS } from './worldLayout';
import { ArticulatedActorRig, buildNpcRig } from './voxelModels';
import { NPC_PERSONALITIES, calculateSlapstickKnockback } from './proceduralChaos';

const FIRST_NAMES = [
  'Lucas', 'Gabriel', 'Matheus', 'Rafael', 'Enzo', 'João', 'Pedro', 'Thiago', 'Bruno', 'Cauã',
  'Maria', 'Ana', 'Beatriz', 'Larissa', 'Sofia', 'Mariana', 'Camila', 'Julia', 'Helena', 'Valentina',
  'Davi', 'Arthur', 'Heitor', 'Bernardo', 'Igor', 'Vinícius', 'Luan', 'Felipe', 'Gustavo', 'Rodrigo',
];

const LAST_NAMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima',
  'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ribeiro', 'Alves', 'Monteiro', 'Mendes',
];

const TEACHER_NAMES = [
  'Prof. Carlos', 'Profª. Márcia', 'Prof. Eduardo', 'Profª. Patrícia', 'Prof. Marcos',
  'Profª. Fernanda', 'Prof. Ricardo', 'Profª. Luciana', 'Prof. Sérgio', 'Profª. Cláudia',
  'Prof. Alexandre', 'Profª. Renata',
];

const ANIMAL_SPECIES_LIST: AnimalSpecies[] = [
  'dog', 'cat', 'rabbit', 'fox', 'wolf', 'bear', 'monkey', 'capybara',
  'lion', 'tiger', 'owl', 'parrot', 'turtle', 'horse', 'pig', 'cow',
];

const SHIRT_COLORS = [0xfef08a, 0x38bdf8, 0x4ade80, 0xfb7185, 0xffffff, 0xfbbf24, 0xa78bfa];
const HAIR_COLORS = [0x0f172a, 0x451a03, 0x78350f, 0xd97706, 0x94a3b8];
const SKIN_COLORS = [0xffdfc4, 0xfde68a, 0xfdba74, 0x8d5524, 0x6b3e26];

export interface NpcAgent {
  id: number;
  name: string;
  role: NpcRole;
  species: AnimalSpecies;
  shirtColor: number;
  hairColor: number;
  skinColor: number;
  personality: NpcPersonality;
  emotion: NpcEmotion;
  homeClassroomIdx: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  target: THREE.Vector3;
  yaw: number;
  walkPhase: number;
  stunTimer: number;
  emotionTimer: number;
  memoryOfPlayer: number;
  waitTimer: number;
  rig: ArticulatedActorRig;
  speechText: string | null;
  speechTimer: number;
  friendId: number;
}

const _tmpVec = new THREE.Vector3();
const _toNpc = new THREE.Vector3();

function disposeRigShadowOnly(rig: ArticulatedActorRig): void {
  rig.root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
}

export class NpcManager {
  public agents: NpcAgent[] = [];
  public group = new THREE.Group();
  private currentPhase: SchedulePhaseId = 'arrival';
  private universe: UniverseMode = 'animal';

  constructor(shadowTex: THREE.Texture, universe: UniverseMode = 'animal') {
    this.universe = universe;
    this.spawnInitialPopulation(shadowTex);
  }

  private spawnInitialPopulation(shadowTex: THREE.Texture): void {
    const totalStudents = 68;
    const totalTeachers = 12;
    const totalStaff = 8; // 1 Principal, 3 Cooks, 2 Janitors, 2 Hall Monitors
    let idCounter = 0;

    const createAgent = (
      role: NpcRole,
      name: string,
      personality: NpcPersonality,
      homeClassroomIdx: number,
      startPos: [number, number, number],
      forcedSpecies?: AnimalSpecies,
    ) => {
      const shirtColor = SHIRT_COLORS[idCounter % SHIRT_COLORS.length];
      const hairColor = HAIR_COLORS[(idCounter * 3) % HAIR_COLORS.length];
      const skinColor = SKIN_COLORS[(idCounter * 7) % SKIN_COLORS.length];
      const species = forcedSpecies ?? ANIMAL_SPECIES_LIST[(idCounter * 5) % ANIMAL_SPECIES_LIST.length];

      const rig = buildNpcRig(
        role,
        shirtColor,
        hairColor,
        skinColor,
        shadowTex,
        this.universe,
        species,
      );
      rig.root.position.set(startPos[0], startPos[1], startPos[2]);
      this.group.add(rig.root);

      const agent: NpcAgent = {
        id: idCounter,
        name,
        role,
        species,
        shirtColor,
        hairColor,
        skinColor,
        personality,
        emotion: 'calmo',
        homeClassroomIdx,
        pos: new THREE.Vector3(startPos[0], startPos[1], startPos[2]),
        vel: new THREE.Vector3(),
        target: new THREE.Vector3(startPos[0], startPos[1], startPos[2]),
        yaw: Math.random() * Math.PI * 2,
        walkPhase: Math.random() * Math.PI * 2,
        stunTimer: 0,
        emotionTimer: 0,
        memoryOfPlayer: 0,
        waitTimer: Math.random() * 2,
        rig,
        speechText: null,
        speechTimer: 0,
        friendId: Math.max(0, idCounter - 1),
      };
      this.agents.push(agent);
      idCounter++;
    };

    // 1. Diretora Helena (Principal - Owl in Animal World)
    createAgent('principal', 'Diretora Helena', 'brava', 0, [-14, 0, -17], 'owl');

    // 2. Teachers across classrooms & corridors
    for (let i = 0; i < totalTeachers; i++) {
      const room = CLASSROOMS[i % CLASSROOMS.length];
      const cx = (room.xMin + room.xMax) / 2;
      const cz = (room.zMin + room.zMax) / 2;
      createAgent(
        'teacher',
        TEACHER_NAMES[i % TEACHER_NAMES.length],
        i % 2 === 0 ? 'rigido' : 'distraido',
        i % CLASSROOMS.length,
        [cx, room.floorY, cz],
      );
    }

    // 3. Staff (Cooks, Janitors, Monitors)
    for (let i = 0; i < totalStaff; i++) {
      if (i < 3) {
        createAgent('cafeteria_cook', `Tia ${FIRST_NAMES[10 + i]}`, 'simpatica', 0, [56 + i * 2, 0, -2 + i * 4], i === 0 ? 'bear' : undefined);
      } else if (i < 5) {
        createAgent('janitor', `Seu ${FIRST_NAMES[i]}`, 'desconfiado', 0, [-20 + i * 10, 0, 10], 'capybara');
      } else {
        createAgent('hall_monitor', `Monitor ${FIRST_NAMES[i + 5]}`, 'monitor', 0, [0, 0, -26], 'lion');
      }
    }

    // 4. Students spread across courtyard, playground, pitch, and classrooms
    for (let i = 0; i < totalStudents; i++) {
      const fname = FIRST_NAMES[i % FIRST_NAMES.length];
      const lname = LAST_NAMES[(i * 5 + 3) % LAST_NAMES.length];
      const personality = NPC_PERSONALITIES[i % NPC_PERSONALITIES.length];
      const roomIdx = i % CLASSROOMS.length;
      let sx = -16 + ((i * 7) % 32);
      let sz = 4 + ((i * 11) % 30);
      // Keep direct spawn corridor at (0, 18) open!
      if (Math.abs(sx) < 4 && Math.abs(sz - 18) < 5) {
        sx += 8;
      }
      if (i % 5 === 0) {
        sx = -65 + (i % 25);
        sz = 26 + (i % 20);
      }
      createAgent('student', `${fname} ${lname}`, personality, roomIdx, [sx, 0, sz]);
    }
  }

  /**
   * Switches every NPC seamlessly between Animal World (16 species) and Human World
   * while preserving identities, positions, schedules, emotions, and memories.
   */
  public setUniverse(universe: UniverseMode, shadowTex: THREE.Texture): void {
    if (this.universe === universe) return;
    this.universe = universe;

    for (const a of this.agents) {
      const wasVisible = a.rig.root.visible;
      this.group.remove(a.rig.root);
      disposeRigShadowOnly(a.rig);

      const newRig = buildNpcRig(
        a.role,
        a.shirtColor,
        a.hairColor,
        a.skinColor,
        shadowTex,
        universe,
        a.species,
      );
      newRig.root.position.copy(a.pos);
      newRig.root.rotation.y = a.yaw;
      newRig.root.visible = wasVisible;
      this.group.add(newRig.root);
      a.rig = newRig;
    }
  }

  public onScheduleChange(phase: SchedulePhaseId): void {
    this.currentPhase = phase;
    for (const a of this.agents) {
      a.waitTimer = 0.2 + Math.random() * 1.4;
      this.assignScheduleTarget(a);
    }
  }

  private assignScheduleTarget(a: NpcAgent): void {
    const room = CLASSROOMS[a.homeClassroomIdx % CLASSROOMS.length];
    const jitterX = (Math.random() - 0.5) * 4.5;
    const jitterZ = (Math.random() - 0.5) * 4.5;

    if (a.role === 'cafeteria_cook') {
      a.target.set(57 + (Math.random() - 0.5) * 6, 0, 4 + (Math.random() - 0.5) * 14);
      return;
    }

    if (a.role === 'principal') {
      if (this.currentPhase === 'recess' || this.currentPhase === 'arrival') {
        a.target.set((Math.random() - 0.5) * 18, 0, 8 + Math.random() * 16);
      } else {
        a.target.set(-14 + jitterX * 0.4, 0, -18 + jitterZ * 0.4);
      }
      return;
    }

    switch (this.currentPhase) {
      case 'arrival':
        if (a.role === 'student') {
          a.target.set((Math.random() - 0.5) * 28, 0, 10 + Math.random() * 28);
        } else {
          a.target.set(-26 + jitterX, 0, -18 + jitterZ);
        }
        break;
      case 'morning_classes':
      case 'afternoon_classes':
        if (room.floorY === 0 || a.pos.y > 4) {
          a.target.set(
            (room.xMin + room.xMax) / 2 + jitterX * 0.7,
            room.floorY,
            (room.zMin + room.zMax) / 2 + jitterZ * 0.7,
          );
        } else {
          const gndRooms = CLASSROOMS.filter((c) => c.floorY === 0);
          const gr = gndRooms[a.id % gndRooms.length];
          a.target.set((gr.xMin + gr.xMax) / 2 + jitterX * 0.6, 0, (gr.zMin + gr.zMax) / 2 + jitterZ * 0.6);
        }
        break;
      case 'recess':
        if (a.id % 4 === 0) {
          a.target.set(-50 + (Math.random() - 0.5) * 32, 0, 36 + (Math.random() - 0.5) * 20);
        } else if (a.id % 4 === 1) {
          a.target.set(-34 + (Math.random() - 0.5) * 14, 0, 5 + (Math.random() - 0.5) * 16);
        } else {
          a.target.set((Math.random() - 0.5) * 36, 0, -6 + Math.random() * 34);
        }
        break;
      case 'lunch':
        a.target.set(30 + Math.random() * 22, 0, -5 + Math.random() * 18);
        break;
      case 'dismissal':
        a.target.set((Math.random() - 0.5) * 30, 0, 44 + Math.random() * 28);
        break;
      case 'after_school':
        if (a.id % 3 === 0) {
          a.target.set(-58 + (Math.random() - 0.5) * 18, 0, 4 + (Math.random() - 0.5) * 18);
        } else if (a.id % 3 === 1) {
          a.target.set(-34 + jitterX, 0, -38 + jitterZ);
        } else {
          a.target.set((Math.random() - 0.5) * 70, 0, 72 + (Math.random() - 0.5) * 10);
        }
        break;
    }
  }

  public triggerAreaReaction(
    origin: THREE.Vector3,
    radius: number,
    type: 'quack' | 'alarm' | 'slapstick' | 'goal',
    playerHidden: boolean,
  ): { startledCount: number; teacherTriggered: boolean; reactionPersonality: NpcPersonality } {
    let startledCount = 0;
    let teacherTriggered = false;
    let reactionPersonality: NpcPersonality = 'bagunceiro';

    for (const a of this.agents) {
      const dist = a.pos.distanceTo(origin);
      if (dist > radius) continue;

      startledCount++;
      reactionPersonality = a.personality;
      a.emotionTimer = 5.5;

      if (type === 'quack') {
        if (a.role === 'teacher' || a.role === 'principal' || a.role === 'hall_monitor') {
          a.emotion = 'bravo';
          a.speechText = this.universe === 'human' ? 'Quem gritou isso?!' : 'Quem fez esse QUACK?!';
          a.speechTimer = 3.2;
          if (!playerHidden) {
            a.target.copy(origin);
            teacherTriggered = true;
          }
        } else {
          a.emotion = a.id % 2 === 0 ? 'rindo' : 'assustado';
          a.speechText =
            a.emotion === 'rindo'
              ? this.universe === 'human'
                ? 'Hahaha que grito foi esse!'
                : 'Hahaha olha o pato!'
              : 'Eita!!';
          a.speechTimer = 2.5;
          if (dist < 6.5) {
            const kb = calculateSlapstickKnockback(origin, a.pos, 7.5);
            a.vel.set(kb.vx, kb.vy, kb.vz);
            a.stunTimer = 1.2;
          }
        }
      } else if (type === 'alarm') {
        a.emotion = 'assustado';
        a.speechText = 'CORRE! SINAL DE EMERGÊNCIA!';
        a.speechTimer = 4.0;
        a.target.set((Math.random() - 0.5) * 28, 0, 12 + Math.random() * 18);
        if (a.role === 'teacher' || a.role === 'principal') teacherTriggered = true;
      } else if (type === 'goal') {
        a.emotion = 'rindo';
        a.speechText = 'GOOOOL!!';
        a.speechTimer = 3.0;
      } else if (type === 'slapstick') {
        if (dist < 4.5) {
          const kb = calculateSlapstickKnockback(origin, a.pos, 9.5);
          a.vel.set(kb.vx, kb.vy, kb.vz);
          a.stunTimer = 1.8;
          a.emotion = 'atordoado';
          a.speechText = 'Ai minha cabeça!';
          a.speechTimer = 2.6;
          if (a.role === 'teacher' || a.role === 'principal') {
            a.memoryOfPlayer = 12;
            teacherTriggered = true;
          }
        } else {
          a.emotion = a.role === 'student' ? 'rindo' : 'bravo';
          a.speechText = a.role === 'student' ? 'Toma essa! kkk' : 'Ei! Sem bagunça!';
          a.speechTimer = 2.5;
        }
      }
    }

    return { startledCount, teacherTriggered, reactionPersonality };
  }

  /**
   * 4-Tier LOD NPC simulation:
   * - Tier 1 Near (< 0.45 * simDist): Full AI + rich bone/tail/head/emotion animation
   * - Tier 2 Medium (< 0.85 * simDist): Standard gait + navigation
   * - Tier 3 Far (< 1.4 * simDist): Schedule stepping only (0 bone math)
   * - Tier 4 Culled (outside visible cone or > 1.4 * simDist): rig.root.visible = false
   */
  public update(
    dt: number,
    playerPos: THREE.Vector3,
    playerHidden: boolean,
    teacherAlertLevel: number,
    npcSimDistance = 56,
    cameraPos?: THREE.Vector3,
    cameraForward?: THREE.Vector3,
  ): { closestNpc: NpcAgent | null; caughtPlayer: boolean; activeNpcsAnimated: number; totalNpcs: number } {
    let closestNpc: NpcAgent | null = null;
    let closestDist = Infinity;
    let caughtPlayer = false;
    let activeNpcsAnimated = 0;

    const nearDist = npcSimDistance * 0.45;
    const medDist = npcSimDistance * 0.85;
    const farDist = Math.max(62, npcSimDistance * 1.4);

    for (let i = 0; i < this.agents.length; i++) {
      const a = this.agents[i];
      const distToPlayer = a.pos.distanceTo(playerPos);
      if (distToPlayer < closestDist) {
        closestDist = distToPlayer;
        closestNpc = a;
      }

      if (a.speechTimer > 0) {
        a.speechTimer -= dt;
        if (a.speechTimer <= 0) a.speechText = null;
      }
      if (a.emotionTimer > 0) {
        a.emotionTimer -= dt;
        if (a.emotionTimer <= 0) a.emotion = 'calmo';
      }
      if (a.memoryOfPlayer > 0) {
        a.memoryOfPlayer = Math.max(0, a.memoryOfPlayer - dt);
      }

      // Check camera frustum / distance visibility (Tier 4 Cull)
      let culled = distToPlayer >= farDist;
      if (!culled && cameraPos && cameraForward && distToPlayer > 28) {
        _toNpc.subVectors(a.pos, cameraPos);
        const camDist = _toNpc.length();
        if (camDist > 28) {
          _toNpc.divideScalar(camDist);
          if (_toNpc.dot(cameraForward) < -0.35) {
            culled = true;
          }
        }
      }
      a.rig.root.visible = !culled;

      // Stunned slapstick physics (always step so knocked NPCs land properly)
      if (a.stunTimer > 0) {
        a.stunTimer -= dt;
        a.vel.y -= 24 * dt;
        a.pos.addScaledVector(a.vel, dt);
        if (a.pos.y <= 0) {
          a.pos.y = 0;
          a.vel.set(0, 0, 0);
        }
        a.rig.root.position.copy(a.pos);
        if (!culled) {
          a.rig.body.rotation.y += dt * 11;
          a.rig.body.rotation.z = Math.sin(a.stunTimer * 14) * 0.35;
          activeNpcsAnimated++;
        }
        continue;
      } else if (!culled) {
        a.rig.body.rotation.z = THREE.MathUtils.damp(a.rig.body.rotation.z, 0, 10, dt);
      }

      // Teachers/Principal chase player if alert is high & player visible & on same floor
      const isAuthority = a.role === 'teacher' || a.role === 'principal' || a.role === 'hall_monitor';
      if (
        isAuthority &&
        !playerHidden &&
        (teacherAlertLevel > 45 || a.memoryOfPlayer > 0) &&
        distToPlayer < 26 &&
        Math.abs(playerPos.y - a.pos.y) < 2.2
      ) {
        a.target.copy(playerPos);
        a.emotion = 'bravo';
        if (distToPlayer < 1.35) {
          caughtPlayer = true;
          a.memoryOfPlayer = 0;
          a.speechText = 'Te peguei, espertinho!';
          a.speechTimer = 3.0;
        }
      }

      // Tier 3+ movement stepping
      _tmpVec.subVectors(a.target, a.pos);
      _tmpVec.y = 0;
      const distToTarget = _tmpVec.length();
      const isMoving = distToTarget > 0.6;

      if (isMoving) {
        _tmpVec.divideScalar(distToTarget);
        const moveSpeed = a.emotion === 'assustado' ? 5.8 : a.emotion === 'bravo' ? 5.2 : 2.9;
        a.pos.x += _tmpVec.x * moveSpeed * dt;
        a.pos.z += _tmpVec.z * moveSpeed * dt;

        if (!culled && distToPlayer < medDist) {
          const targetYaw = Math.atan2(-_tmpVec.x, -_tmpVec.z);
          let diff = targetYaw - a.yaw;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          a.yaw += diff * (1 - Math.exp(-10 * dt));
          a.walkPhase += moveSpeed * dt * 2.4;
        }
      } else {
        a.waitTimer -= dt;
        if (a.waitTimer <= 0) {
          a.waitTimer = 2.5 + Math.random() * 4.0;
          this.assignScheduleTarget(a);
        }
      }

      if (culled) continue;

      a.rig.root.position.copy(a.pos);
      a.rig.root.rotation.y = a.yaw;

      if (distToPlayer < medDist) {
        activeNpcsAnimated++;
        const swing = isMoving ? Math.sin(a.walkPhase) * 0.65 : 0;
        a.rig.leftLimb.rotation.x = swing;
        a.rig.rightLimb.rotation.x = -swing;

        if (a.rig.leftWingOrArm && a.rig.rightWingOrArm) {
          if (a.emotion === 'assustado' && distToPlayer < nearDist) {
            a.rig.leftWingOrArm.rotation.x = -2.3 + Math.sin(a.walkPhase * 1.5) * 0.25;
            a.rig.rightWingOrArm.rotation.x = -2.3 - Math.sin(a.walkPhase * 1.5) * 0.25;
          } else {
            a.rig.leftWingOrArm.rotation.x = -swing * 0.7;
            a.rig.rightWingOrArm.rotation.x = swing * 0.7;
          }
        }

        if (distToPlayer < nearDist) {
          // Near tier: rich tail wag, head expressiveness, idle breathing & cheerful bounce
          const nowT = performance.now() * 0.004 + a.id;
          const idleBob = Math.sin(nowT) * 0.02;
          a.rig.body.position.y = isMoving ? Math.abs(Math.sin(a.walkPhase)) * 0.07 : idleBob;
          if (a.rig.tail) {
            a.rig.tail.rotation.y = Math.sin(isMoving ? a.walkPhase * 1.3 : nowT) * 0.35;
          }
          a.rig.head.rotation.y =
            a.emotion === 'curioso' || a.emotion === 'rindo' ? Math.sin(nowT * 1.4) * 0.2 : 0;
          a.rig.head.rotation.x = a.emotion === 'bravo' ? 0.14 : 0;
        } else {
          a.rig.body.position.y = isMoving ? Math.abs(Math.sin(a.walkPhase)) * 0.05 : 0;
        }
      }
    }

    return {
      closestNpc,
      caughtPlayer,
      activeNpcsAnimated,
      totalNpcs: this.agents.length,
    };
  }

  public dispose(): void {
    for (const a of this.agents) {
      this.group.remove(a.rig.root);
      disposeRigShadowOnly(a.rig);
    }
    this.agents = [];
  }
}
