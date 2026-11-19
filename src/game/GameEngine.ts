import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ActionVerb,
  CharacterId,
  DeviceCapabilities,
  EmergentEventRecord,
  GameScreenState,
  GameSettings,
  GraphicsConfig,
  HudSnapshot,
  InventoryItem,
  PerformanceMetrics,
  PropKind,
  SchedulePhaseId,
  UniverseMode,
} from './types';
import {
  CHARACTERS,
  TOTAL_PROCEDURAL_COMBINATIONS,
  computeInteractionOutcome,
  evaluateSchedulePhase,
  formatSchoolClock,
} from './proceduralChaos';
import {
  buildWorldColliders,
  buildWorldFloorSurfaces,
  getFloorHeightAt,
  getZoneAt,
  resolveCircleAABB,
} from './worldLayout';
import {
  ArticulatedActorRig,
  ProceduralTexturePack,
  buildCharacterRig,
  createProceduralTextures,
  disposeTexturePack,
} from './voxelModels';
import { InteractiveProp, WorldBuildResult, buildVoxelSchoolWorld } from './worldBuilder';
import { NpcManager } from './npcSystem';
import { AudioEngine } from './audioEngine';
import { detectDeviceCapabilities, getPresetConfig } from './graphicsProfile';
import {
  SAVE_STORAGE_KEY,
  SavePayload,
  loadSavedGame,
  persistSaveGame,
} from './saveSystem';

const _vecA = new THREE.Vector3();
const _vecB = new THREE.Vector3();
const _vecC = new THREE.Vector3();
const _camForward = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _skyColor = new THREE.Color(0x87cefa);
const _targetSkyColor = new THREE.Color(0x87cefa);

interface ParticleSlot {
  active: boolean;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  life: number;
  maxLife: number;
  size: number;
  color: THREE.Color;
}

export interface MobileInputState {
  moveX: number;
  moveY: number;
  lookDx: number;
  lookDy: number;
  sprint: boolean;
  jumpPressed: boolean;
  interactPressed: boolean;
  abilityPressed: boolean;
}

export class GameEngine {
  private container: HTMLElement;
  private onHudUpdate: (snapshot: HudSnapshot) => void;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private capabilities: DeviceCapabilities;
  private isSoftwareGl: boolean;
  private textures: ProceduralTexturePack;
  private audio = new AudioEngine();

  private sunLight!: THREE.DirectionalLight;
  private hemiLight!: THREE.HemisphereLight;
  private rimLight!: THREE.DirectionalLight;
  private colliders = buildWorldColliders();
  private floorSurfaces = buildWorldFloorSurfaces();
  private worldBuilt!: WorldBuildResult;
  private interactables: InteractiveProp[] = [];
  private npcManager!: NpcManager;

  // Player rigs & Universe
  private universe: UniverseMode = 'animal';
  private playerGroup = new THREE.Group();
  private playerRigs!: Record<CharacterId, ArticulatedActorRig>;
  private activeCharId: CharacterId = 'rat';
  private playerPos = new THREE.Vector3(0, 0, 18);
  private playerVel = new THREE.Vector3(0, 0, 0);
  private playerYaw = 0; // facing -Z toward main school facade
  private cameraYaw = 0;
  private cameraPitch = 0.28;
  private camDistCurrent = 6.2;
  private camPosCurrent = new THREE.Vector3(0, 4, 26);
  private camLookCurrent = new THREE.Vector3(0, 1.5, 12);

  // Squash, stretch, gait & remastered character animations
  private walkDist = 0;
  private idleTime = 0;
  private squashX = 1;
  private squashY = 1;
  private footstepAccum = 0;
  private onGround = true;
  private coyoteTimer = 0;
  private jumpBufferTimer = 0;
  private isGliding = false;
  private isClimbing = false;
  private isCrouching = false;
  private isHiding = false;
  private hideSpot: InteractiveProp | null = null;
  private heldProp: InteractiveProp | null = null;
  private interactAnimTimer = 0;
  private celebrateTimer = 0;

  // Abilities & stats
  private stamina = 100;
  private abilityCooldown = 0;
  private ratSpeedBoostTimer = 0;
  private quackWaveMesh!: THREE.Mesh;
  private quackWaveTimer = 0;

  // Camera shake / hitstop
  private trauma = 0;
  private hitstopTimer = 0;

  // Game & Chaos state
  private screen: GameScreenState = 'title';
  private schoolMinutes = 7 * 60 + 25;
  private lastPhaseId: SchedulePhaseId = 'arrival';
  private chaosScore = 0;
  private comboMultiplier = 1;
  private comboDecayTimer = 0;
  private uniqueComboSet = new Set<string>();
  private discoveredSecrets = new Set<string>();
  private recentEvents: EmergentEventRecord[] = [];
  private eventIdSeq = 1;
  private inventory: InventoryItem[] = [];
  private teacherAlertLevel = 0;
  private goalsScored = 0;
  private pranksPulled = 0;
  private npcsStartled = 0;
  private activeAnnouncement: string | null = null;
  private announcementTimer = 0;
  private nearbyPrompt: string | null = null;

  // Settings & Performance Metrics
  private settings: GameSettings;
  private currentTexQuality: 'low' | 'medium' | 'high';
  private currentShadowRes: number;
  private perfMetrics: PerformanceMetrics;
  private perfSampleFrames = 0;
  private perfSampleMs = 0;
  private activeNpcsAnimated = 0;
  private autoSaveAccum = 0;

  // Input state
  private keysHeld = new Set<string>();
  private keysJustPressed = new Set<string>();
  private pointerDown = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private mobileInput: MobileInputState = {
    moveX: 0,
    moveY: 0,
    lookDx: 0,
    lookDy: 0,
    sprint: false,
    jumpPressed: false,
    interactPressed: false,
    abilityPressed: false,
  };

  // Pooled particles
  private particleMesh!: THREE.InstancedMesh;
  private particles: ParticleSlot[] = [];
  private particleCursor = 0;

  // Loop
  private frameId = 0;
  private disposed = false;
  private lastTimeMs = 0;
  private hudEmitAccum = 0;
  private titleOrbitAngle = 0.25;
  private resizeObserver: ResizeObserver;

  constructor(
    container: HTMLElement,
    onHudUpdate: (snapshot: HudSnapshot) => void,
    onLoadProgress?: (pct: number, label: string) => void,
  ) {
    this.container = container;
    this.onHudUpdate = onHudUpdate;

    onLoadProgress?.(12, 'Detectando hardware e perfil gráfico...');
    this.capabilities = detectDeviceCapabilities();
    this.isSoftwareGl = this.capabilities.isSoftwareGl;

    const hasExistingSave =
      typeof window !== 'undefined' && Boolean(window.localStorage?.getItem(SAVE_STORAGE_KEY));
    const saved = loadSavedGame();
    if (!hasExistingSave) {
      saved.settings.graphics = getPresetConfig(this.capabilities.recommendedPreset);
    }

    this.universe = saved.universe;
    this.activeCharId = saved.characterId;
    this.chaosScore = saved.chaosScore;
    this.goalsScored = saved.goalsScored;
    this.pranksPulled = saved.pranksPulled;
    this.npcsStartled = saved.npcsStartled;
    this.schoolMinutes = saved.schoolMinutes;
    this.discoveredSecrets = new Set(saved.discoveredSecrets);
    this.uniqueComboSet = new Set(saved.uniqueCombos);
    this.inventory = saved.inventory.map((i) => ({ ...i }));
    this.settings = saved.settings;
    this.currentTexQuality = this.settings.graphics.textureQuality;
    this.currentShadowRes = this.settings.graphics.shadowResolution;

    this.perfMetrics = {
      fps: 60,
      frameTimeMs: 16.6,
      renderWidth: container.clientWidth || window.innerWidth,
      renderHeight: container.clientHeight || window.innerHeight,
      activeNpcsAnimated: 0,
      totalNpcs: 88,
      drawCalls: 0,
      preset: this.settings.graphics.preset,
      warning: null,
    };

    onLoadProgress?.(28, 'Inicializando motor 3D WebGL...');
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl && this.settings.graphics.antialias,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: this.isSoftwareGl,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = this.settings.graphics.postProcessing ? 1.14 : 1.06;
    this.applyPixelRatio(this.settings.graphics);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl && this.settings.graphics.shadowResolution > 0;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.scene.background = _skyColor.clone();
    this.scene.fog = new THREE.FogExp2(0x87cefa, this.computeFogDensity(this.settings.graphics.viewDistance));

    const aspect = (container.clientWidth || window.innerWidth) / Math.max(1, container.clientHeight || window.innerHeight);
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.15, this.settings.graphics.viewDistance);

    // Mandatory studio environment map on every device
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    onLoadProgress?.(46, 'Gerando texturas voxel e iluminação...');
    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
    this.textures = createProceduralTextures(maxAniso, this.currentTexQuality);
    this.setupLighting();

    onLoadProgress?.(68, 'Construindo escola brasileira e 22 salas...');
    this.setupWorld();

    onLoadProgress?.(85, 'Preparando protagonistas e alunos...');
    this.setupPlayer();
    this.setupParticles();
    this.audio.setUniverse(this.universe);
    this.audio.setSettings(this.settings.soundEnabled, this.settings.sfxVolume, this.settings.ambienceVolume);
    this.bindEvents();

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);

    onLoadProgress?.(96, 'Compilando shaders e ajustando câmera...');
    if (!this.isSoftwareGl) {
      this.renderer.compile(this.scene, this.camera);
    }

    this.lastTimeMs = performance.now();
    this.updateTitleCamera(0);
    this.renderer.render(this.scene, this.camera);
    onLoadProgress?.(100, 'Pronto para a bagunça!');
    this.emitHud();
    this.loop();
  }

  private computeFogDensity(viewDistance: number): number {
    return THREE.MathUtils.clamp(0.0085 - (viewDistance - 110) * 0.000024, 0.0032, 0.0085);
  }

  private applyPixelRatio(gfx: GraphicsConfig): void {
    const baseDpr = this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const scaled = THREE.MathUtils.clamp(baseDpr * gfx.renderScale, 0.5, 2.5);
    this.renderer.setPixelRatio(this.isSoftwareGl ? Math.min(1, scaled) : scaled);
  }

  private setupLighting(): void {
    this.hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x3f6212, 0.75);
    this.hemiLight.position.set(0, 60, 0);
    this.scene.add(this.hemiLight);

    const shadowRes = this.settings.graphics.shadowResolution || 1024;
    this.sunLight = new THREE.DirectionalLight(0xfff1d6, 1.48);
    this.sunLight.position.set(45, 70, 52);
    this.sunLight.castShadow = !this.isSoftwareGl && this.settings.graphics.shadowResolution > 0;
    this.sunLight.shadow.mapSize.set(shadowRes, shadowRes);
    this.sunLight.shadow.camera.near = 5;
    this.sunLight.shadow.camera.far = 210;
    const d = this.settings.graphics.shadowDistance;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    // Subtle cool rim fill for Ultra/Extreme depth separation
    this.rimLight = new THREE.DirectionalLight(0xbae6fd, this.settings.graphics.postProcessing ? 0.42 : 0.18);
    this.rimLight.position.set(-48, 36, -55);
    this.scene.add(this.rimLight);
  }

  private setupWorld(): void {
    this.worldBuilt = buildVoxelSchoolWorld(this.textures, this.colliders, this.settings.graphics);
    this.scene.add(this.worldBuilt.worldGroup);
    this.interactables = this.worldBuilt.interactables;

    this.npcManager = new NpcManager(this.textures.contactShadow, this.universe);
    this.scene.add(this.npcManager.group);
    this.npcManager.onScheduleChange(evaluateSchedulePhase(this.schoolMinutes).id);
  }

  private disposePlayerRigs(): void {
    if (!this.playerRigs) return;
    (Object.keys(this.playerRigs) as CharacterId[]).forEach((id) => {
      const rig = this.playerRigs[id];
      rig.root.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.geometry instanceof THREE.CircleGeometry) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      this.playerGroup.remove(rig.root);
    });
  }

  private rebuildPlayerRigs(): void {
    this.disposePlayerRigs();
    this.playerRigs = {
      rat: buildCharacterRig('rat', this.textures.contactShadow, this.universe),
      duck: buildCharacterRig('duck', this.textures.contactShadow, this.universe),
      eagle: buildCharacterRig('eagle', this.textures.contactShadow, this.universe),
    };
    (Object.keys(this.playerRigs) as CharacterId[]).forEach((id) => {
      this.playerRigs[id].root.visible = id === this.activeCharId;
      this.playerGroup.add(this.playerRigs[id].root);
    });
  }

  private setupPlayer(): void {
    this.rebuildPlayerRigs();
    this.playerGroup.position.copy(this.playerPos);
    this.scene.add(this.playerGroup);

    this.quackWaveMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.6, 1.1, 24),
      new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
    );
    this.quackWaveMesh.rotation.x = -Math.PI / 2;
    this.scene.add(this.quackWaveMesh);
  }

  private setupParticles(): void {
    const count = 150;
    const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.45 });
    this.particleMesh = new THREE.InstancedMesh(geo, mat, count);
    this.particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.particleMesh.frustumCulled = false;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        active: false,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        size: 1,
        color: new THREE.Color(0xfacc15),
      });
      _mat4.makeScale(0, 0, 0);
      this.particleMesh.setMatrixAt(i, _mat4);
      this.particleMesh.setColorAt(i, new THREE.Color(0xffffff));
    }
    this.particleMesh.instanceMatrix.needsUpdate = true;
    if (this.particleMesh.instanceColor) this.particleMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.particleMesh);
  }

  private spawnBurst(origin: THREE.Vector3, count: number, hexColor: number, speed = 7): void {
    const scaledCount = Math.max(2, Math.round(count * this.settings.graphics.particleDensity));
    for (let i = 0; i < scaledCount; i++) {
      const slot = this.particles[this.particleCursor];
      this.particleCursor = (this.particleCursor + 1) % this.particles.length;
      slot.active = true;
      slot.pos.copy(origin);
      slot.pos.y += 0.35;
      const a = Math.random() * Math.PI * 2;
      const sp = (0.4 + Math.random() * 0.8) * speed;
      slot.vel.set(Math.cos(a) * sp, 2.5 + Math.random() * speed * 0.8, Math.sin(a) * sp);
      slot.maxLife = 0.45 + Math.random() * 0.45;
      slot.life = slot.maxLife;
      slot.size = 0.65 + Math.random() * 0.85;
      slot.color.setHex(hexColor);
    }
  }

  private saveProgress(): void {
    const payload: SavePayload = {
      version: 2,
      universe: this.universe,
      characterId: this.activeCharId,
      chaosScore: Math.round(this.chaosScore),
      goalsScored: this.goalsScored,
      pranksPulled: this.pranksPulled,
      npcsStartled: this.npcsStartled,
      schoolMinutes: Math.floor(this.schoolMinutes),
      discoveredSecrets: Array.from(this.discoveredSecrets),
      uniqueCombos: Array.from(this.uniqueComboSet),
      inventory: this.inventory.map((i) => ({ ...i })),
      fullscreenPreferred: Boolean(document.fullscreenElement),
      settings: this.settings,
    };
    persistSaveGame(payload);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (this.screen !== 'playing') return;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
      e.preventDefault();
    }
    if (!this.keysHeld.has(e.code)) {
      this.keysJustPressed.add(e.code);
    }
    this.keysHeld.add(e.code);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keysHeld.delete(e.code);
    if (e.code === 'Space' && this.playerVel.y > 2.5 && !this.isGliding) {
      this.playerVel.y *= 0.48;
    }
  };

  private onWindowBlur = (): void => {
    this.keysHeld.clear();
    this.keysJustPressed.clear();
    this.pointerDown = false;
  };

  private onPointerDown = (e: PointerEvent): void => {
    if (this.screen !== 'playing') return;
    this.pointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    if (document.pointerLockElement === this.renderer.domElement && e.button === 0 && this.heldProp) {
      this.throwHeldProp();
    } else if (!this.isSoftwareGl && !this.capabilities.isMobile && e.target === this.renderer.domElement) {
      this.renderer.domElement.requestPointerLock?.();
    }
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (this.screen !== 'playing') return;
    const sens = 0.0026 * this.settings.cameraSensitivity;
    const ySign = this.settings.invertCameraY ? -1 : 1;
    if (document.pointerLockElement === this.renderer.domElement) {
      this.cameraYaw -= e.movementX * sens;
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + e.movementY * sens * ySign, -0.18, 1.15);
    } else if (this.pointerDown && e.pointerType === 'mouse') {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.cameraYaw -= dx * sens * 1.3;
      this.cameraPitch = THREE.MathUtils.clamp(this.cameraPitch + dy * sens * 1.3 * ySign, -0.18, 1.15);
    }
  };

  private onPointerUp = (): void => {
    this.pointerDown = false;
  };

  private bindEvents(): void {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  }

  private handleResize(): void {
    const w = this.container.clientWidth || window.innerWidth;
    const h = Math.max(1, this.container.clientHeight || window.innerHeight);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.applyPixelRatio(this.settings.graphics);
    this.renderer.setSize(w, h);
    if (this.screen === 'title') {
      this.updateTitleCamera(0);
    }
    this.renderer.render(this.scene, this.camera);
  }

  // --- PUBLIC API FOR REACT SHELL ---

  public getCapabilities(): DeviceCapabilities {
    return this.capabilities;
  }

  public getSettings(): GameSettings {
    return this.settings;
  }

  public getUniverse(): UniverseMode {
    return this.universe;
  }

  public startGame(): void {
    this.screen = 'playing';
    this.keysHeld.clear();
    this.keysJustPressed.clear();
    this.camPosCurrent.set(this.playerPos.x, this.playerPos.y + 3.6, this.playerPos.z + 7.5);
    this.camLookCurrent.set(this.playerPos.x, this.playerPos.y + 1.2, this.playerPos.z - 6);
    this.cameraYaw = 0;
    this.cameraPitch = 0.21;
    this.emitHud();
  }

  public pause(): void {
    if (this.screen === 'playing') {
      this.screen = 'paused';
      this.keysHeld.clear();
      document.exitPointerLock?.();
      this.saveProgress();
      this.emitHud();
    }
  }

  public resume(): void {
    if (this.screen === 'paused') {
      this.screen = 'playing';
      this.keysHeld.clear();
      this.emitHud();
    }
  }

  public returnToTitle(): void {
    this.screen = 'title';
    this.keysHeld.clear();
    document.exitPointerLock?.();
    this.saveProgress();
    this.emitHud();
  }

  public restartWorld(): void {
    this.playerPos.set(0, 0, 18);
    this.playerVel.set(0, 0, 0);
    this.playerYaw = 0;
    this.cameraYaw = 0;
    this.cameraPitch = 0.25;
    this.heldProp = null;
    this.isHiding = false;
    this.hideSpot = null;
    this.chaosScore = 0;
    this.comboMultiplier = 1;
    this.teacherAlertLevel = 0;
    this.recentEvents = [];
    this.uniqueComboSet.clear();
    this.discoveredSecrets.clear();
    this.schoolMinutes = 7 * 60 + 25;
    this.lastPhaseId = 'arrival';
    this.npcManager.onScheduleChange('arrival');
    this.interactables.forEach((p) => {
      p.pos.copy(p.homePos);
      p.vel.set(0, 0, 0);
      p.mesh.visible = true;
      p.mesh.position.copy(p.pos);
    });
    this.screen = 'playing';
    this.saveProgress();
    this.emitHud();
  }

  public setUniverse(universe: UniverseMode): void {
    if (this.universe === universe) return;
    this.universe = universe;
    this.rebuildPlayerRigs();
    this.npcManager.setUniverse(universe, this.textures.contactShadow);
    this.audio.setUniverse(universe);
    this.spawnBurst(this.playerPos, 16, universe === 'human' ? 0x38bdf8 : 0xfacc15, 6);
    this.announce(
      universe === 'human'
        ? 'Universo alterado para MUNDO HUMANO! Progresso preservado.'
        : 'Universo alterado para MUNDO ANIMAL! Progresso preservado.',
    );
    this.saveProgress();
    this.emitHud();
  }

  public switchCharacter(id: CharacterId): void {
    if (this.activeCharId === id) return;
    this.activeCharId = id;
    (Object.keys(this.playerRigs) as CharacterId[]).forEach((k) => {
      this.playerRigs[k].root.visible = k === id;
    });
    this.isHiding = false;
    this.hideSpot = null;
    this.squashX = 1.25;
    this.squashY = 0.78;
    this.spawnBurst(this.playerPos, 10, parseInt(CHARACTERS[id].accentHex.replace('#', ''), 16), 5);
    this.audio.playCharacterAbility(id);
    this.saveProgress();
    this.emitHud();
  }

  public teleportTo(pos: [number, number, number], zoneLabel: string): void {
    this.playerPos.set(pos[0], pos[1], pos[2]);
    this.playerVel.set(0, 0, 0);
    this.isHiding = false;
    this.hideSpot = null;
    this.camPosCurrent.set(pos[0], pos[1] + 4, pos[2] + 7);
    this.announce(`Você chegou em: ${zoneLabel}`);
    this.emitHud();
  }

  public updateSettings(partial: Partial<GameSettings>): void {
    const nextGraphics: GraphicsConfig = partial.graphics
      ? { ...this.settings.graphics, ...partial.graphics }
      : this.settings.graphics;

    this.settings = {
      ...this.settings,
      ...partial,
      graphics: nextGraphics,
    };

    this.audio.setSettings(this.settings.soundEnabled, this.settings.sfxVolume, this.settings.ambienceVolume);
    this.applyGraphicsSettings(nextGraphics);
    this.saveProgress();
    this.emitHud();
  }

  private applyGraphicsSettings(gfx: GraphicsConfig): void {
    this.applyPixelRatio(gfx);

    // Camera view distance & atmospheric fog
    if (Math.abs(this.camera.far - gfx.viewDistance) > 1) {
      this.camera.far = gfx.viewDistance;
      this.camera.updateProjectionMatrix();
    }
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.density = this.computeFogDensity(gfx.viewDistance);
    }

    // Shadow map resolution & distance
    if (!this.isSoftwareGl) {
      const shadowsOn = gfx.shadowResolution > 0;
      this.renderer.shadowMap.enabled = shadowsOn;
      this.sunLight.castShadow = shadowsOn;

      if (shadowsOn && gfx.shadowResolution !== this.currentShadowRes) {
        this.currentShadowRes = gfx.shadowResolution;
        this.sunLight.shadow.mapSize.set(gfx.shadowResolution, gfx.shadowResolution);
        if (this.sunLight.shadow.map) {
          this.sunLight.shadow.map.dispose();
          this.sunLight.shadow.map = null;
        }
      }
      const d = gfx.shadowDistance;
      this.sunLight.shadow.camera.left = -d;
      this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d;
      this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.camera.updateProjectionMatrix();
    }

    // Foliage instancing density
    for (const ref of this.worldBuilt.foliageRefs) {
      ref.mesh.count = Math.max(1, Math.round(ref.maxCount * gfx.foliageDensity));
    }

    // Ambient Occlusion trims
    this.worldBuilt.aoTrimGroup.visible = gfx.ambientOcclusion;

    // Texture quality regeneration
    if (gfx.textureQuality !== this.currentTexQuality) {
      this.currentTexQuality = gfx.textureQuality;
      const oldPack = this.textures;
      const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
      this.textures = createProceduralTextures(maxAniso, gfx.textureQuality);

      this.worldBuilt.wallMat.map = this.textures.schoolWall;
      this.worldBuilt.wallMat.bumpMap = this.textures.wallBump;
      this.worldBuilt.wallMat.bumpScale = gfx.textureQuality === 'low' ? 0 : 0.045;
      this.worldBuilt.wallMat.needsUpdate = true;

      this.worldBuilt.courtyardMat.map = this.textures.courtyardTile;
      this.worldBuilt.courtyardMat.needsUpdate = true;
      this.worldBuilt.grassMat.map = this.textures.grass;
      this.worldBuilt.grassMat.needsUpdate = true;
      this.worldBuilt.asphaltMat.map = this.textures.asphalt;
      this.worldBuilt.asphaltMat.needsUpdate = true;
      this.worldBuilt.floorMat.map = this.textures.classroomFloor;
      this.worldBuilt.floorMat.needsUpdate = true;
      this.worldBuilt.pitchMat.map = this.textures.pitch;
      this.worldBuilt.pitchMat.needsUpdate = true;
      this.worldBuilt.bballMat.map = this.textures.basketballCourt;
      this.worldBuilt.bballMat.needsUpdate = true;

      disposeTexturePack(oldPack);
    } else {
      this.worldBuilt.wallMat.bumpScale = gfx.textureQuality === 'low' ? 0 : 0.045;
    }

    // Post-processing / Ultra rim intensity boost
    this.renderer.toneMappingExposure = gfx.postProcessing ? 1.14 : 1.06;
    this.rimLight.intensity = gfx.postProcessing ? 0.45 : 0.18;
    this.perfMetrics.preset = gfx.preset;
  }

  public setMobileInput(partial: Partial<MobileInputState>): void {
    this.mobileInput = { ...this.mobileInput, ...partial };
  }

  public useInventoryItem(itemId: string): void {
    const item = this.inventory.find((i) => i.id === itemId);
    if (!item || item.quantity <= 0) return;
    item.quantity--;
    this.interactAnimTimer = 0.35;
    this.spawnBurst(this.playerPos, 18, item.kind === 'beaker' ? 0x22c55e : 0x38bdf8, 8);
    this.audio.playSlapstickBonk();
    this.recordProceduralChaos('throw', item.kind, this.playerPos);
    this.saveProgress();
    this.emitHud();
  }

  private announce(msg: string): void {
    this.activeAnnouncement = msg;
    this.announcementTimer = 4.2;
  }

  private recordProceduralChaos(verb: ActionVerb, propKind: PropKind, origin: THREE.Vector3): void {
    const zone = getZoneAt(origin.x, origin.y, origin.z);
    const reaction = this.npcManager.triggerAreaReaction(
      origin,
      verb === 'quack_blast' ? 16 : verb === 'trigger_alarm' ? 35 : 11,
      verb === 'quack_blast' ? 'quack' : verb === 'trigger_alarm' ? 'alarm' : verb === 'score_goal' ? 'goal' : 'slapstick',
      this.isHiding,
    );

    const outcome = computeInteractionOutcome({
      characterId: this.activeCharId,
      verb,
      prop: propKind,
      phase: this.lastPhaseId,
      personality: reaction.reactionPersonality,
      zoneName: zone.name,
      seedOffset: this.pranksPulled,
    });

    this.uniqueComboSet.add(outcome.comboHash);
    this.pranksPulled++;
    this.npcsStartled += reaction.startledCount;
    this.comboMultiplier = Math.min(8, this.comboMultiplier + 1);
    this.comboDecayTimer = 8.0;

    const gained = outcome.chaosPoints * this.comboMultiplier;
    this.chaosScore += gained;
    if (reaction.teacherTriggered || verb === 'trigger_alarm') {
      this.teacherAlertLevel = Math.min(100, this.teacherAlertLevel + outcome.npcPanicBoost);
    }
    if (gained >= 120 || verb === 'score_goal') {
      this.celebrateTimer = 1.1;
    }

    this.recentEvents = [
      {
        id: this.eventIdSeq++,
        comboHash: outcome.comboHash,
        title: outcome.title,
        description: outcome.description,
        chaosPoints: gained,
        zoneName: zone.name,
        timestamp: formatSchoolClock(this.schoolMinutes),
      },
      ...this.recentEvents.slice(0, 14),
    ];
  }

  private triggerSpecialAbility(): void {
    if (this.abilityCooldown > 0) return;
    const spec = CHARACTERS[this.activeCharId];
    this.abilityCooldown = spec.abilityCooldown;
    this.audio.playCharacterAbility(this.activeCharId);
    this.trauma = Math.min(1, this.trauma + 0.35);
    this.interactAnimTimer = 0.4;

    if (this.activeCharId === 'rat') {
      this.ratSpeedBoostTimer = 4.0;
      this.stamina = 100;
      this.squashX = 1.3;
      this.squashY = 0.72;
      this.spawnBurst(this.playerPos, 14, 0xf59e0b, 6);
      this.recordProceduralChaos('sneak_climb', 'traffic_cone', this.playerPos);
      this.announce('SUPER CORRIDA ativada!');
    } else if (this.activeCharId === 'duck') {
      this.quackWaveTimer = 0.65;
      this.quackWaveMesh.position.set(this.playerPos.x, this.playerPos.y + 0.3, this.playerPos.z);
      this.quackWaveMesh.scale.setScalar(1);
      for (const p of this.interactables) {
        const d = p.pos.distanceTo(this.playerPos);
        if (d < 9.5 && p.pushable) {
          _vecA.subVectors(p.pos, this.playerPos).normalize();
          p.vel.set(_vecA.x * 11, 5.5, _vecA.z * 11);
        }
      }
      this.spawnBurst(this.playerPos, 20, 0x38bdf8, 8);
      this.recordProceduralChaos('quack_blast', 'megaphone', this.playerPos);
      this.announce(
        this.universe === 'human'
          ? 'GRITO DO CAOS! Todo mundo assustado!'
          : 'QUACK DO CAOS! Todo mundo assustado!',
      );
    } else {
      this.playerVel.y = 14.5;
      const fx = -Math.sin(this.cameraYaw);
      const fz = -Math.cos(this.cameraYaw);
      this.playerVel.x = fx * 11;
      this.playerVel.z = fz * 11;
      this.onGround = false;
      this.isGliding = true;
      this.squashX = 0.82;
      this.squashY = 1.24;
      this.spawnBurst(this.playerPos, 16, 0x10b981, 7);
      this.recordProceduralChaos('sky_swoop', 'trophy', this.playerPos);
      this.announce('PLANAR CELESTE! Segure Espaço no ar!');
    }
    this.emitHud();
  }

  private throwHeldProp(): void {
    if (!this.heldProp) return;
    const prop = this.heldProp;
    this.heldProp = null;
    prop.mesh.visible = true;
    this.interactAnimTimer = 0.35;
    const fx = -Math.sin(this.cameraYaw);
    const fz = -Math.cos(this.cameraYaw);
    prop.pos.set(this.playerPos.x + fx * 0.9, this.playerPos.y + 1.1, this.playerPos.z + fz * 0.9);
    prop.vel.set(fx * 17 + this.playerVel.x * 0.4, 7.2, fz * 17 + this.playerVel.z * 0.4);
    this.audio.playSlapstickBonk();
    this.squashX = 1.18;
    this.squashY = 0.84;
    this.recordProceduralChaos('throw', prop.kind, prop.pos);
    this.emitHud();
  }

  private handleInteract(): void {
    if (this.isHiding) {
      this.isHiding = false;
      this.hideSpot = null;
      this.playerGroup.visible = true;
      this.announce('Saiu do esconderijo!');
      this.emitHud();
      return;
    }

    if (this.heldProp) {
      this.throwHeldProp();
      return;
    }

    let best: InteractiveProp | null = null;
    let bestDist = 3.2;
    for (const p of this.interactables) {
      const d = p.pos.distanceTo(this.playerPos);
      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }

    if (best) {
      this.interactAnimTimer = 0.32;
      if (best.isHideSpot && CHARACTERS[this.activeCharId].canHideSmall) {
        this.isHiding = true;
        this.hideSpot = best;
        this.playerGroup.visible = false;
        this.teacherAlertLevel = Math.max(0, this.teacherAlertLevel - 35);
        this.recordProceduralChaos('hide_inside', best.kind, best.pos);
        this.announce('Escondido! Professores não te veem!');
      } else if (best.isSwitch) {
        best.activated = !best.activated;
        if (best.kind === 'fire_alarm') {
          this.audio.playAlarm();
          this.trauma = 0.45;
          this.spawnBurst(best.pos, 22, 0xef4444, 8);
          this.recordProceduralChaos('trigger_alarm', 'fire_alarm', best.pos);
          this.announce('ALARME DISPARADO! Corre todo mundo!');
        } else {
          this.audio.playGoalCheer();
          this.spawnBurst(best.pos, 16, 0x38bdf8, 7);
          this.recordProceduralChaos('blast_speaker', best.kind, best.pos);
          this.announce('Som no máximo! Hora da festa no pátio!');
        }
      } else if (best.pickable) {
        this.heldProp = best;
        best.mesh.visible = false;
        this.audio.playPickup();
        this.announce(`Pegou: ${best.name} (Pressione E para jogar!)`);
      } else if (best.pushable) {
        _vecA.subVectors(best.pos, this.playerPos).normalize();
        best.vel.set(_vecA.x * 10, 3.5, _vecA.z * 10);
        this.audio.playSlapstickBonk();
        this.recordProceduralChaos('push', best.kind, best.pos);
      }
      this.emitHud();
      return;
    }

    const nearest = this.npcManager.agents.find((a) => a.pos.distanceTo(this.playerPos) < 2.8);
    if (nearest) {
      this.interactAnimTimer = 0.32;
      this.audio.playCharacterAbility(this.activeCharId);
      this.recordProceduralChaos('taunt_npc', 'megaphone', nearest.pos);
      this.emitHud();
    }
  }

  private loop = (): void => {
    if (this.disposed) return;
    const now = performance.now();
    const rawDtMs = now - this.lastTimeMs;
    const rawDt = rawDtMs / 1000;
    this.lastTimeMs = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.05);

    this.perfSampleFrames++;
    this.perfSampleMs += rawDtMs;
    if (this.perfSampleMs >= 450) {
      const avgMs = this.perfSampleMs / Math.max(1, this.perfSampleFrames);
      const fps = Math.round(1000 / Math.max(1, avgMs));
      this.perfMetrics = {
        fps,
        frameTimeMs: Number(avgMs.toFixed(1)),
        renderWidth: this.renderer.domElement.width,
        renderHeight: this.renderer.domElement.height,
        activeNpcsAnimated: this.activeNpcsAnimated,
        totalNpcs: this.npcManager.agents.length,
        drawCalls: this.renderer.info.render.calls,
        preset: this.settings.graphics.preset,
        warning:
          !this.isSoftwareGl && fps < 24
            ? 'FPS baixo — tente reduzir sombras ou escala gráfica nas Configurações.'
            : null,
      };
      this.perfSampleFrames = 0;
      this.perfSampleMs = 0;
    }

    if (this.screen === 'title') {
      this.updateTitleCamera(dt);
      this.camera.getWorldDirection(_camForward);
      const res = this.npcManager.update(
        dt * 0.7,
        this.playerPos,
        true,
        0,
        this.settings.graphics.npcSimDistance,
        this.camera.position,
        _camForward,
      );
      this.activeNpcsAnimated = res.activeNpcsAnimated;
      this.animatePropsAndFlag(dt);
    } else if (this.screen === 'playing') {
      this.stepSimulation(dt);
    }

    this.renderer.render(this.scene, this.camera);

    if (this.isSoftwareGl) {
      this.afterDraw(this.loop);
    } else {
      this.frameId = requestAnimationFrame(this.loop);
    }
  };

  private afterDraw(cb: () => void): void {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      if (this.disposed) return;
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        if (sync) gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 80);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateTitleCamera(dt: number): void {
    this.titleOrbitAngle += dt * 0.14;
    const cx = Math.sin(this.titleOrbitAngle) * 28;
    const cz = 16 + Math.cos(this.titleOrbitAngle) * 26;
    this.camera.position.set(cx, 13.5, cz);
    this.camera.lookAt(0, 3.2, -12);
  }

  private stepSimulation(dt: number): void {
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.updateCamera(dt);
      return;
    }

    // 1. Dynamic School Schedule Clock
    this.schoolMinutes += dt * 1.9 * this.settings.timeScale;
    if (this.schoolMinutes >= 22 * 60) {
      this.schoolMinutes = 7 * 60;
    }
    const phase = evaluateSchedulePhase(this.schoolMinutes);
    if (phase.id !== this.lastPhaseId) {
      this.lastPhaseId = phase.id;
      this.npcManager.onScheduleChange(phase.id);
      if (phase.bellChime) this.audio.playSchoolBell();
      this.announce(`${phase.label}: ${phase.description}`);
    }
    _targetSkyColor.set(phase.skyTint);
    _skyColor.lerp(_targetSkyColor, 1 - Math.exp(-1.5 * dt));
    (this.scene.background as THREE.Color).copy(_skyColor);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.copy(_skyColor);
    }

    // 2. Cooldowns & Timers
    if (this.abilityCooldown > 0) this.abilityCooldown = Math.max(0, this.abilityCooldown - dt);
    if (this.ratSpeedBoostTimer > 0) this.ratSpeedBoostTimer = Math.max(0, this.ratSpeedBoostTimer - dt);
    if (this.interactAnimTimer > 0) this.interactAnimTimer = Math.max(0, this.interactAnimTimer - dt);
    if (this.celebrateTimer > 0) this.celebrateTimer = Math.max(0, this.celebrateTimer - dt);
    if (this.announcementTimer > 0) {
      this.announcementTimer -= dt;
      if (this.announcementTimer <= 0) this.activeAnnouncement = null;
    }
    if (this.comboDecayTimer > 0) {
      this.comboDecayTimer -= dt;
      if (this.comboDecayTimer <= 0) this.comboMultiplier = 1;
    }
    if (this.teacherAlertLevel > 0) {
      this.teacherAlertLevel = Math.max(0, this.teacherAlertLevel - dt * (this.isHiding ? 14 : 3.2));
    }

    if (this.quackWaveTimer > 0) {
      this.quackWaveTimer -= dt;
      const prog = 1 - this.quackWaveTimer / 0.65;
      this.quackWaveMesh.scale.setScalar(1 + prog * 13);
      (this.quackWaveMesh.material as THREE.MeshBasicMaterial).opacity = (1 - prog) * 0.85;
    } else {
      (this.quackWaveMesh.material as THREE.MeshBasicMaterial).opacity = 0;
    }

    // 3. Process Mobile & Keyboard Inputs
    if (Math.abs(this.mobileInput.lookDx) > 0.01 || Math.abs(this.mobileInput.lookDy) > 0.01) {
      const ySign = this.settings.invertCameraY ? -1 : 1;
      this.cameraYaw -= this.mobileInput.lookDx * 0.005 * this.settings.cameraSensitivity;
      this.cameraPitch = THREE.MathUtils.clamp(
        this.cameraPitch + this.mobileInput.lookDy * 0.004 * this.settings.cameraSensitivity * ySign,
        -0.18,
        1.15,
      );
      this.mobileInput.lookDx = 0;
      this.mobileInput.lookDy = 0;
    }

    if (this.keysJustPressed.has('KeyE') || this.mobileInput.interactPressed) {
      this.mobileInput.interactPressed = false;
      this.handleInteract();
    }
    if (this.keysJustPressed.has('KeyF') || this.mobileInput.abilityPressed) {
      this.mobileInput.abilityPressed = false;
      this.triggerSpecialAbility();
    }
    if (this.keysJustPressed.has('Space') || this.mobileInput.jumpPressed) {
      this.mobileInput.jumpPressed = false;
      this.jumpBufferTimer = 0.13;
    }
    this.keysJustPressed.clear();

    this.isCrouching = this.keysHeld.has('KeyC') || this.keysHeld.has('ControlLeft');

    // 4. Player Movement & Character Physics
    const spec = CHARACTERS[this.activeCharId];
    let inX = 0;
    let inZ = 0;
    if (this.keysHeld.has('KeyW') || this.keysHeld.has('ArrowUp')) inZ -= 1;
    if (this.keysHeld.has('KeyS') || this.keysHeld.has('ArrowDown')) inZ += 1;
    if (this.keysHeld.has('KeyA') || this.keysHeld.has('ArrowLeft')) inX -= 1;
    if (this.keysHeld.has('KeyD') || this.keysHeld.has('ArrowRight')) inX += 1;

    if (Math.hypot(this.mobileInput.moveX, this.mobileInput.moveY) > 0.08) {
      inX += this.mobileInput.moveX;
      inZ += this.mobileInput.moveY;
    }

    const inputLen = Math.hypot(inX, inZ);
    if (inputLen > 1) {
      inX /= inputLen;
      inZ /= inputLen;
    }

    const wantsSprint = this.keysHeld.has('ShiftLeft') || this.keysHeld.has('ShiftRight') || this.mobileInput.sprint;
    const isSprinting = !this.isCrouching && wantsSprint && inputLen > 0.1 && this.stamina > 3;
    if (isSprinting && this.ratSpeedBoostTimer <= 0) {
      this.stamina = Math.max(0, this.stamina - dt * 22);
    } else {
      this.stamina = Math.min(100, this.stamina + dt * 16);
    }

    if (this.isHiding && inputLen > 0.25) {
      this.isHiding = false;
      this.hideSpot = null;
      this.playerGroup.visible = true;
    }

    const moveSpeed =
      spec.speed *
      (this.isCrouching ? 0.55 : isSprinting ? spec.sprintMultiplier : 1) *
      (this.ratSpeedBoostTimer > 0 ? 1.45 : 1);

    const sinY = Math.sin(this.cameraYaw);
    const cosY = Math.cos(this.cameraYaw);
    const worldDirX = inX * cosY + inZ * sinY;
    const worldDirZ = -inX * sinY + inZ * cosY;

    const accel = this.onGround ? 14 : 6.5;
    this.playerVel.x = THREE.MathUtils.damp(this.playerVel.x, worldDirX * moveSpeed, accel, dt);
    this.playerVel.z = THREE.MathUtils.damp(this.playerVel.z, worldDirZ * moveSpeed, accel, dt);

    if (this.onGround) this.coyoteTimer = 0.11;
    else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

    if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0) {
      this.playerVel.y = spec.jumpForce;
      this.onGround = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      this.squashX = 0.84;
      this.squashY = 1.2;
      this.audio.playJump(this.activeCharId);
      this.spawnBurst(this.playerPos, 5, 0xe2e8f0, 3);
    }

    const holdingJump = this.keysHeld.has('Space');
    this.isGliding = spec.canGlide && !this.onGround && holdingJump && this.playerVel.y < 1.5;

    const gravity = this.isGliding ? -4.2 : -26.0 * spec.gravityScale;
    this.playerVel.y += gravity * dt;
    if (this.isGliding) {
      this.playerVel.y = Math.max(this.playerVel.y, -2.6);
    }

    this.playerPos.x += this.playerVel.x * dt;
    this.playerPos.y += this.playerVel.y * dt;
    this.playerPos.z += this.playerVel.z * dt;

    const colRes = resolveCircleAABB(
      this.playerPos.x,
      this.playerPos.y,
      this.playerPos.z,
      spec.radius,
      spec.height,
      this.colliders,
    );
    this.playerPos.x = colRes.x;
    this.playerPos.z = colRes.z;

    this.isClimbing = spec.canClimb && colRes.touchingClimbable && inputLen > 0.2 && this.playerPos.y < 11.5;
    if (this.isClimbing) {
      this.playerVel.y = 6.8;
      this.onGround = false;
    }

    const floorY = getFloorHeightAt(this.playerPos.x, this.playerPos.y, this.playerPos.z, this.floorSurfaces);
    if (this.playerPos.y <= floorY) {
      if (!this.onGround && this.playerVel.y < -6) {
        this.squashX = 1.24;
        this.squashY = 0.76;
        this.audio.playFootstep(true);
        this.spawnBurst(this.playerPos, 5, 0xcbd5e1, 3);
      }
      this.playerPos.y = floorY;
      this.playerVel.y = 0;
      this.onGround = true;
      this.isGliding = false;
    } else if (this.playerPos.y > floorY + 0.15) {
      this.onGround = false;
    }

    const currentZone = getZoneAt(this.playerPos.x, this.playerPos.y, this.playerPos.z);
    if (
      ['secret_tunnel', 'rooftop', 'streets', 'principal', 'science_lab', 'computer_lab', 'kitchen'].includes(
        currentZone.id,
      ) &&
      !this.discoveredSecrets.has(currentZone.id)
    ) {
      this.discoveredSecrets.add(currentZone.id);
      this.chaosScore += 150;
      this.celebrateTimer = 0.9;
      this.announce(`Área Descoberta: ${currentZone.name}! (+150 Caos)`);
      this.saveProgress();
    }

    // 5. Remastered Articulated Character Animation System
    this.idleTime += dt;
    const horizSpeed = Math.hypot(this.playerVel.x, this.playerVel.z);
    if (horizSpeed > 0.4) {
      const targetYaw = Math.atan2(-this.playerVel.x, -this.playerVel.z);
      let diff = targetYaw - this.playerYaw;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.playerYaw += diff * (1 - Math.exp(-14 * dt));
    }

    this.walkDist += horizSpeed * dt;
    this.squashX = THREE.MathUtils.damp(this.squashX, 1, 12, dt);
    this.squashY = THREE.MathUtils.damp(this.squashY, 1, 12, dt);

    const rig = this.playerRigs[this.activeCharId];
    this.playerGroup.position.copy(this.playerPos);
    this.playerGroup.rotation.y = this.playerYaw;

    const crouchScaleY = this.isCrouching ? 0.74 : 1;
    rig.body.scale.set(this.squashX, this.squashY * crouchScaleY, this.squashX);
    rig.body.rotation.x = THREE.MathUtils.damp(
      rig.body.rotation.x,
      this.isCrouching ? 0.22 : horizSpeed > 6 ? 0.08 : 0,
      10,
      dt,
    );

    const moving = this.onGround && horizSpeed > 0.45;
    const gaitAmp = THREE.MathUtils.clamp(horizSpeed / 8.5, 0, 1) * 0.78;
    const swing = moving ? Math.sin(this.walkDist * 2.7) * gaitAmp : 0;
    const bounce = moving ? Math.abs(Math.sin(this.walkDist * 2.7)) * 0.075 : Math.sin(this.idleTime * 2.4) * 0.02;
    rig.body.position.y = bounce;

    rig.leftLimb.rotation.x = this.onGround ? swing : 0.35;
    rig.rightLimb.rotation.x = this.onGround ? -swing : -0.35;

    if (rig.tail) {
      rig.tail.rotation.y = Math.sin((moving ? this.walkDist * 3.5 : this.idleTime * 2.2)) * 0.36;
    }

    // Human Emanuel's long hair flows backward with speed & sways gently at idle!
    if (rig.hairFlow) {
      const targetHairX = THREE.MathUtils.clamp(horizSpeed * 0.045, 0.02, 0.52) + Math.sin(this.idleTime * 3.2) * 0.04;
      rig.hairFlow.rotation.x = THREE.MathUtils.damp(rig.hairFlow.rotation.x, targetHairX, 10, dt);
      rig.hairFlow.rotation.z = Math.sin(this.walkDist * 2.4 + this.idleTime * 2) * 0.08;
    }

    // Duck bill jaw opening during Chaos Quack!
    if (rig.jaw) {
      rig.jaw.rotation.x = this.quackWaveTimer > 0 ? 0.45 : Math.sin(this.idleTime * 2.5) * 0.03;
    }

    // Arms & Wings blending: Celebrate > Interact > Glide > Jump > Walk/Idle
    if (rig.leftWingOrArm && rig.rightWingOrArm) {
      if (this.celebrateTimer > 0) {
        const cheer = -2.4 + Math.sin(this.celebrateTimer * 16) * 0.25;
        rig.leftWingOrArm.rotation.x = cheer;
        rig.rightWingOrArm.rotation.x = cheer;
        rig.leftWingOrArm.rotation.z = 0.25;
        rig.rightWingOrArm.rotation.z = -0.25;
      } else if (this.interactAnimTimer > 0) {
        rig.rightWingOrArm.rotation.x = -1.65 * (this.interactAnimTimer / 0.4);
        rig.leftWingOrArm.rotation.x = -swing * 0.5;
      } else if (this.universe === 'human') {
        rig.leftWingOrArm.rotation.x = this.onGround ? -swing * 0.75 : -0.5;
        rig.rightWingOrArm.rotation.x = this.onGround ? swing * 0.75 : -0.5;
        rig.leftWingOrArm.rotation.z = Math.sin(this.idleTime * 2) * 0.03;
        rig.rightWingOrArm.rotation.z = -Math.sin(this.idleTime * 2) * 0.03;
      } else {
        const flap = this.isGliding
          ? Math.sin(performance.now() * 0.008) * 0.25 - 0.15
          : !this.onGround
            ? Math.sin(performance.now() * 0.02) * 0.7
            : swing * 0.3;
        rig.leftWingOrArm.rotation.z = flap;
        rig.rightWingOrArm.rotation.z = -flap;
        rig.leftWingOrArm.rotation.x = moving ? -swing * 0.4 : 0;
        rig.rightWingOrArm.rotation.x = moving ? swing * 0.4 : 0;
      }
    }

    if (this.onGround && horizSpeed > 1.5) {
      this.footstepAccum += horizSpeed * dt;
      if (this.footstepAccum > 2.4) {
        this.footstepAccum = 0;
        this.audio.playFootstep(isSprinting);
      }
    }

    // 6. Step Interactive Props Physics
    this.stepPropsPhysics(dt);

    // 7. Update NPCs with 4-tier LOD & camera frustum culling
    this.camera.getWorldDirection(_camForward);
    const npcRes = this.npcManager.update(
      dt,
      this.playerPos,
      this.isHiding,
      this.teacherAlertLevel,
      this.settings.graphics.npcSimDistance,
      this.camera.position,
      _camForward,
    );
    this.activeNpcsAnimated = npcRes.activeNpcsAnimated;

    if (npcRes.caughtPlayer) {
      this.playerVel.set((Math.random() - 0.5) * 14, 9.5, 10);
      this.hitstopTimer = 0.05;
      this.trauma = 0.55;
      this.teacherAlertLevel = 25;
      this.audio.playSlapstickBonk();
      this.spawnBurst(this.playerPos, 16, 0xfbbf24, 7);
      this.announce('Flagrado! Você levou um empurrão cômico — corra ou esconda-se!');
    }

    // 8. Update Particles, Flag, Fountain Water & Ambience
    this.updateParticles(dt);
    this.animatePropsAndFlag(dt);
    this.audio.tickAmbience(dt, currentZone.category === 'outdoor' || currentZone.id === 'courtyard');

    // 9. Update Camera with wall pull-in & trauma shake
    this.updateCamera(dt);

    // 10. Periodic auto-save & Throttled HUD sync <= 10Hz
    this.autoSaveAccum += dt;
    if (this.autoSaveAccum >= 4.0) {
      this.autoSaveAccum = 0;
      this.saveProgress();
    }

    this.hudEmitAccum += dt;
    if (this.hudEmitAccum >= 0.1) {
      this.hudEmitAccum = 0;
      this.emitHud();
    }
  }

  private stepPropsPhysics(dt: number): void {
    let prompt: string | null = null;
    if (this.isHiding) {
      prompt = '[E] Sair do esconderijo';
    } else if (this.heldProp) {
      prompt = `[E] Arremessar ${this.heldProp.name}`;
    }

    let closestDist = 3.2;
    for (const p of this.interactables) {
      if (p === this.heldProp) continue;
      if (p.cooldown > 0) p.cooldown -= dt;

      const d = p.pos.distanceTo(this.playerPos);
      if (d < 1.05 && p.pushable) {
        _vecA.subVectors(p.pos, this.playerPos);
        _vecA.y = 0;
        if (_vecA.lengthSq() > 0.001) {
          _vecA.normalize();
          const kickForce = Math.max(5.5, Math.hypot(this.playerVel.x, this.playerVel.z) * 1.35);
          p.vel.x = _vecA.x * kickForce;
          p.vel.z = _vecA.z * kickForce;
          p.vel.y = Math.max(p.vel.y, 2.2);
          if (p.cooldown <= 0) {
            p.cooldown = 1.4;
            this.audio.playSlapstickBonk();
            if (p.kind === 'soccer_ball' || p.kind === 'basketball') {
              this.recordProceduralChaos('push', p.kind, p.pos);
            }
          }
        }
      }

      if (!prompt && d < closestDist) {
        closestDist = d;
        if (p.isHideSpot && CHARACTERS[this.activeCharId].canHideSmall) {
          prompt = `[E] Esconder-se em ${p.name}`;
        } else if (p.isSwitch) {
          prompt = `[E] Ativar ${p.name}`;
        } else if (p.pickable) {
          prompt = `[E] Pegar ${p.name}`;
        } else if (p.pushable) {
          prompt = `[E] Empurrar ${p.name}`;
        }
      }

      if (p.vel.lengthSq() > 0.005 || p.pos.y > getFloorHeightAt(p.pos.x, p.pos.y, p.pos.z, this.floorSurfaces) + 0.02) {
        p.vel.y -= 24 * dt;
        p.pos.addScaledVector(p.vel, dt);
        const pf = getFloorHeightAt(p.pos.x, p.pos.y, p.pos.z, this.floorSurfaces);
        if (p.pos.y <= pf) {
          p.pos.y = pf;
          if (Math.abs(p.vel.y) > 2.5) {
            p.vel.y = -p.vel.y * 0.48;
            p.vel.x *= 0.72;
            p.vel.z *= 0.72;
          } else {
            p.vel.y = 0;
            p.vel.x *= Math.exp(-5 * dt);
            p.vel.z *= Math.exp(-5 * dt);
          }
        }

        const pCol = resolveCircleAABB(p.pos.x, p.pos.y, p.pos.z, p.radius, 0.5, this.colliders);
        p.pos.x = pCol.x;
        p.pos.z = pCol.z;
        p.mesh.position.copy(p.pos);
        p.mesh.rotation.x += p.vel.z * dt * 0.8;
        p.mesh.rotation.z -= p.vel.x * dt * 0.8;

        if (
          p.kind === 'soccer_ball' &&
          p.pos.z > 33.2 &&
          p.pos.z < 40.8 &&
          (p.pos.x < -71.5 || p.pos.x > -30.5) &&
          p.pos.x > -74.5 &&
          p.pos.x < -27.5 &&
          p.cooldown <= 0
        ) {
          p.cooldown = 3.0;
          this.goalsScored++;
          this.celebrateTimer = 1.3;
          this.audio.playGoalCheer();
          this.spawnBurst(p.pos, 26, 0xfacc15, 9);
          this.recordProceduralChaos('score_goal', 'soccer_ball', p.pos);
          this.announce('GOOOOL! A galera foi à loucura!');
          p.pos.set(-51, 1.5, 37);
          p.vel.set(0, 0, 0);
        }

        if (p.vel.lengthSq() > 16) {
          for (const a of this.npcManager.agents) {
            if (a.stunTimer <= 0 && a.pos.distanceTo(p.pos) < 1.2) {
              this.hitstopTimer = 0.04;
              this.trauma = Math.min(1, this.trauma + 0.3);
              this.spawnBurst(a.pos, 14, 0xfef08a, 7);
              this.audio.playSlapstickBonk();
              this.npcManager.triggerAreaReaction(p.pos, 6, 'slapstick', this.isHiding);
              p.vel.multiplyScalar(-0.35);
              break;
            }
          }
        }
      }
    }

    if (!prompt) {
      const nearNpc = this.npcManager.agents.find((a) => a.pos.distanceTo(this.playerPos) < 2.6);
      if (nearNpc) {
        prompt = `[E] Zoar ${nearNpc.name} (${nearNpc.emotion})`;
      }
    }
    this.nearbyPrompt = prompt;
  }

  private updateParticles(dt: number): void {
    let anyUpdated = false;
    for (let i = 0; i < this.particles.length; i++) {
      const slot = this.particles[i];
      if (!slot.active) continue;
      anyUpdated = true;
      slot.life -= dt;
      if (slot.life <= 0) {
        slot.active = false;
        _mat4.makeScale(0, 0, 0);
        this.particleMesh.setMatrixAt(i, _mat4);
        continue;
      }
      slot.vel.y -= 18 * dt;
      slot.pos.addScaledVector(slot.vel, dt);
      const s = slot.size * (slot.life / slot.maxLife);
      _scale.set(s, s, s);
      _mat4.compose(slot.pos, _quat, _scale);
      this.particleMesh.setMatrixAt(i, _mat4);
      this.particleMesh.setColorAt(i, slot.color);
    }
    if (anyUpdated) {
      this.particleMesh.instanceMatrix.needsUpdate = true;
      if (this.particleMesh.instanceColor) this.particleMesh.instanceColor.needsUpdate = true;
    }
  }

  private animatePropsAndFlag(dt: number): void {
    const t = performance.now() * 0.003;
    if (this.worldBuilt.flagMesh) {
      this.worldBuilt.flagMesh.rotation.y = Math.sin(t) * 0.25;
    }
    if (this.worldBuilt.waterRippleRing) {
      const pulse = (t * 0.65) % 1;
      const sc = 0.7 + pulse * 2.5;
      this.worldBuilt.waterRippleRing.scale.set(sc, sc, 1);
      const mat = this.worldBuilt.waterRippleRing.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - pulse) * 0.55;
    }
    void dt;
  }

  /**
   * Third-person camera with smooth collision wall pull-in and trauma shake.
   */
  private updateCamera(dt: number): void {
    const desiredDist = 6.2;
    const targetHeight = this.activeCharId === 'rat' && this.universe === 'animal' ? 0.9 : 1.35;
    _vecB.set(this.playerPos.x, this.playerPos.y + targetHeight, this.playerPos.z);

    // Step-sample toward desired orbit point against solid walls to avoid camera clipping
    let safeDist = desiredDist;
    const cosPitch = Math.cos(this.cameraPitch);
    const sinPitch = Math.sin(this.cameraPitch);
    const sinYaw = Math.sin(this.cameraYaw);
    const cosYaw = Math.cos(this.cameraYaw);

    for (let step = 1; step <= 6; step++) {
      const d = (desiredDist * step) / 6;
      const sx = _vecB.x + sinYaw * cosPitch * d;
      const sy = Math.max(this.playerPos.y + 0.55, _vecB.y + sinPitch * d);
      const sz = _vecB.z + cosYaw * cosPitch * d;

      let blocked = false;
      for (let cIdx = 0; cIdx < this.colliders.length; cIdx++) {
        const c = this.colliders[cIdx];
        if (c.open) continue;
        if (
          sx >= c.minX - 0.3 &&
          sx <= c.maxX + 0.3 &&
          sy >= c.minY &&
          sy <= c.maxY + 0.25 &&
          sz >= c.minZ - 0.3 &&
          sz <= c.maxZ + 0.3
        ) {
          blocked = true;
          break;
        }
      }
      if (blocked) {
        safeDist = Math.max(1.8, (desiredDist * (step - 0.6)) / 6);
        break;
      }
    }

    this.camDistCurrent = THREE.MathUtils.damp(this.camDistCurrent, safeDist, 14, dt);
    const horizDist = cosPitch * this.camDistCurrent;
    const vertDist = sinPitch * this.camDistCurrent;

    _vecA.set(
      _vecB.x + sinYaw * horizDist,
      Math.max(this.playerPos.y + 0.55, _vecB.y + vertDist),
      _vecB.z + cosYaw * horizDist,
    );

    const smooth = 1 - Math.exp(-13 * dt);
    this.camPosCurrent.lerp(_vecA, smooth);
    this.camLookCurrent.lerp(_vecB, smooth);

    this.camera.position.copy(this.camPosCurrent);
    if (this.trauma > 0) {
      const shake = this.trauma * this.trauma * 0.35;
      this.camera.position.x += (Math.random() - 0.5) * shake;
      this.camera.position.y += (Math.random() - 0.5) * shake;
      this.trauma = Math.max(0, this.trauma - dt * 2.2);
    }
    this.camera.lookAt(this.camLookCurrent);

    const targetFov = this.ratSpeedBoostTimer > 0 ? 72 : this.isGliding ? 68 : 62;
    if (Math.abs(this.camera.fov - targetFov) > 0.1) {
      this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 8, dt);
      this.camera.updateProjectionMatrix();
    }
  }

  private emitHud(): void {
    const zone = getZoneAt(this.playerPos.x, this.playerPos.y, this.playerPos.z);
    const phase = evaluateSchedulePhase(this.schoolMinutes);
    const spec = CHARACTERS[this.activeCharId];

    this.onHudUpdate({
      screen: this.screen,
      universe: this.universe,
      characterId: this.activeCharId,
      stamina: Math.round(this.stamina),
      abilityCooldownRemaining: Number(this.abilityCooldown.toFixed(1)),
      abilityCooldownMax: spec.abilityCooldown,
      isHiding: this.isHiding,
      isGliding: this.isGliding,
      isClimbing: this.isClimbing,
      heldItemName: this.heldProp ? this.heldProp.name : null,
      nearbyPrompt: this.nearbyPrompt,
      schoolTimeMinutes: Math.floor(this.schoolMinutes),
      schoolTimeFormatted: formatSchoolClock(this.schoolMinutes),
      schedulePhase: phase,
      currentZoneName: zone.name,
      chaosScore: Math.round(this.chaosScore),
      comboMultiplier: this.comboMultiplier,
      uniqueCombosTriggered: this.uniqueComboSet.size,
      totalPossibleCombos: TOTAL_PROCEDURAL_COMBINATIONS,
      discoveredSecrets: Array.from(this.discoveredSecrets),
      recentEvents: this.recentEvents,
      inventory: this.inventory.map((i) => ({ ...i })),
      teacherAlertLevel: Math.round(this.teacherAlertLevel),
      goalsScored: this.goalsScored,
      pranksPulled: this.pranksPulled,
      npcsStartled: this.npcsStartled,
      activeAnnouncement: this.activeAnnouncement,
      playerPos: {
        x: Math.round(this.playerPos.x),
        y: Math.round(this.playerPos.y),
        z: Math.round(this.playerPos.z),
      },
      perf: { ...this.perfMetrics },
    });
  }

  public destroy(): void {
    this.disposed = true;
    this.saveProgress();
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);
    this.resizeObserver.disconnect();
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);

    this.disposePlayerRigs();
    this.npcManager.dispose();
    disposeTexturePack(this.textures);
    this.audio.dispose();
    this.renderer.dispose();

    if (this.renderer.domElement.parentNode === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
