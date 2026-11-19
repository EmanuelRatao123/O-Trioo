import { useCallback, useEffect, useRef, useState } from 'react';
import { GameEngine, MobileInputState } from './game/GameEngine';
import { detectDeviceCapabilities } from './game/graphicsProfile';
import { SCHEDULE_PHASES, TOTAL_PROCEDURAL_COMBINATIONS } from './game/proceduralChaos';
import { createDefaultSettings } from './game/saveSystem';
import {
  ActiveModal,
  CharacterId,
  DeviceCapabilities,
  GameSettings,
  HudSnapshot,
  UniverseMode,
} from './game/types';
import { LoadingScreen } from './components/LoadingScreen';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { Modals } from './components/Modals';

const INITIAL_SETTINGS = createDefaultSettings();

const INITIAL_HUD: HudSnapshot = {
  screen: 'loading',
  universe: 'animal',
  characterId: 'rat',
  stamina: 100,
  abilityCooldownRemaining: 0,
  abilityCooldownMax: 6.5,
  isHiding: false,
  isGliding: false,
  isClimbing: false,
  heldItemName: null,
  nearbyPrompt: null,
  schoolTimeMinutes: 7 * 60 + 25,
  schoolTimeFormatted: '07:25',
  schedulePhase: SCHEDULE_PHASES[0],
  currentZoneName: 'Pátio Central',
  chaosScore: 0,
  comboMultiplier: 1,
  uniqueCombosTriggered: 0,
  totalPossibleCombos: TOTAL_PROCEDURAL_COMBINATIONS,
  discoveredSecrets: [],
  recentEvents: [],
  inventory: [],
  teacherAlertLevel: 0,
  goalsScored: 0,
  pranksPulled: 0,
  npcsStartled: 0,
  activeAnnouncement: null,
  playerPos: { x: 0, y: 0, z: 18 },
  perf: {
    fps: 60,
    frameTimeMs: 16.6,
    renderWidth: 1280,
    renderHeight: 720,
    activeNpcsAnimated: 0,
    totalNpcs: 88,
    drawCalls: 0,
    preset: INITIAL_SETTINGS.graphics.preset,
    warning: null,
  },
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(INITIAL_HUD);
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');
  const [settings, setSettings] = useState<GameSettings>(INITIAL_SETTINGS);
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => detectDeviceCapabilities());

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(8);
  const [loadStatus, setLoadStatus] = useState('Iniciando escola voxel...');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bootNonce, setBootNonce] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenNotice, setFullscreenNotice] = useState<string | null>(null);

  // Mount Three.js GameEngine cleanly with staged loading screen
  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;
    let cancelled = false;
    let finishTimer = 0;

    setIsLoading(true);
    setLoadError(null);
    setLoadProgress(10);
    setLoadStatus('Preparando motor 3D...');

    try {
      const engine = new GameEngine(
        mount,
        (snapshot) => {
          if (!cancelled) setHud(snapshot);
        },
        (pct, label) => {
          if (!cancelled) {
            setLoadProgress(pct);
            setLoadStatus(label);
          }
        },
      );
      engineRef.current = engine;
      setCapabilities(engine.getCapabilities());
      setSettings(engine.getSettings());

      const params = new URLSearchParams(window.location.search);
      const shouldAutostart = params.get('autostart') === '1';

      finishTimer = window.setTimeout(() => {
        if (cancelled) return;
        setIsLoading(false);
        if (shouldAutostart) {
          document.body.dataset.state = 'playing';
          engine.startGame();
        } else {
          document.body.dataset.state = 'title';
        }
      }, 120);

      return () => {
        cancelled = true;
        window.clearTimeout(finishTimer);
        engine.destroy();
        engineRef.current = null;
      };
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? `Falha ao iniciar o gráfico 3D: ${err.message}`
          : 'Não foi possível iniciar o WebGL neste dispositivo.',
      );
      return () => {
        cancelled = true;
      };
    }
  }, [bootNonce]);

  // Sync fullscreen state with browser Fullscreen API
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Keep body[data-state] synced for testing & accessibility
  useEffect(() => {
    document.body.dataset.state = isLoading ? 'loading' : hud.screen;
  }, [hud.screen, isLoading]);

  const handleToggleFullscreen = useCallback(async () => {
    setFullscreenNotice(null);
    try {
      if (!document.fullscreenEnabled && !document.documentElement.requestFullscreen) {
        setFullscreenNotice('Tela cheia não é suportada neste navegador ou janela.');
        return;
      }
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setFullscreenNotice('Navegador bloqueou tela cheia automática neste ambiente.');
    }
  }, []);

  useEffect(() => {
    if (!fullscreenNotice) return;
    const t = window.setTimeout(() => setFullscreenNotice(null), 4000);
    return () => window.clearTimeout(t);
  }, [fullscreenNotice]);

  const handleStart = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    document.body.dataset.state = 'playing';
    setActiveModal('none');
    engineRef.current?.startGame();
  }, []);

  const handleSelectCharacter = useCallback((id: CharacterId) => {
    engineRef.current?.switchCharacter(id);
  }, []);

  const handleSwitchUniverse = useCallback((u: UniverseMode) => {
    engineRef.current?.setUniverse(u);
  }, []);

  const handleUpdateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => {
      const next: GameSettings = {
        ...prev,
        ...partial,
        graphics: partial.graphics ? { ...prev.graphics, ...partial.graphics } : prev.graphics,
      };
      engineRef.current?.updateSettings(next);
      return next;
    });
  }, []);

  const handleMobileInput = useCallback((partial: Partial<MobileInputState>) => {
    engineRef.current?.setMobileInput(partial);
  }, []);

  // Global keyboard shortcuts (Title Start, Pause Esc/P, Tab Trio, M Map, I Inventory)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isLoading) return;

      if (hud.screen === 'title') {
        if ((e.code === 'Enter' || e.code === 'Space') && activeModal === 'none') {
          e.preventDefault();
          handleStart();
        } else if (e.code === 'Escape' && activeModal !== 'none') {
          setActiveModal('none');
        }
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (activeModal !== 'none') {
          setActiveModal('none');
          engineRef.current?.resume();
        } else if (hud.screen === 'playing') {
          engineRef.current?.pause();
        } else if (hud.screen === 'paused') {
          engineRef.current?.resume();
        }
        return;
      }

      if (e.code === 'Tab') {
        e.preventDefault();
        setActiveModal((m) => (m === 'characters' ? 'none' : 'characters'));
      } else if (e.code === 'KeyM') {
        setActiveModal((m) => (m === 'map' ? 'none' : 'map'));
      } else if (e.code === 'KeyI') {
        setActiveModal((m) => (m === 'inventory' ? 'none' : 'inventory'));
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hud.screen, activeModal, isLoading, handleStart]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* Isolated WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        data-testid="game-canvas-container"
        className="absolute inset-0 w-full h-full"
      />

      {/* Loading Screen */}
      {isLoading && (
        <LoadingScreen
          progress={loadProgress}
          statusText={loadStatus}
          hardwareSummary={capabilities.hardwareSummary}
          errorMsg={loadError}
          onRetry={() => setBootNonce((n) => n + 1)}
        />
      )}

      {/* Title Screen */}
      {!isLoading && hud.screen === 'title' && (
        <TitleScreen
          universe={hud.universe}
          selectedCharacter={hud.characterId}
          isFullscreen={isFullscreen}
          fullscreenNotice={fullscreenNotice}
          onSelectUniverse={handleSwitchUniverse}
          onOpenUniverseModal={() => setActiveModal('universe')}
          onSelectCharacter={handleSelectCharacter}
          onStart={handleStart}
          onOpenSettings={() => setActiveModal('settings')}
          onToggleFullscreen={handleToggleFullscreen}
        />
      )}

      {/* Playing HUD */}
      {!isLoading && hud.screen === 'playing' && (
        <GameHUD
          hud={hud}
          settings={settings}
          isFullscreen={isFullscreen}
          fullscreenNotice={fullscreenNotice}
          onToggleSound={() => handleUpdateSettings({ soundEnabled: !settings.soundEnabled })}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenMap={() => setActiveModal((m) => (m === 'map' ? 'none' : 'map'))}
          onOpenInventory={() => setActiveModal((m) => (m === 'inventory' ? 'none' : 'inventory'))}
          onOpenCharacters={() => setActiveModal((m) => (m === 'characters' ? 'none' : 'characters'))}
          onOpenUniverse={() => setActiveModal((m) => (m === 'universe' ? 'none' : 'universe'))}
          onPause={() => engineRef.current?.pause()}
          onMobileInput={handleMobileInput}
        />
      )}

      {/* Modals (Pause, Universe, Character Trio, Map, Inventory, Settings) */}
      {!isLoading && (
        <Modals
          hud={hud}
          activeModal={activeModal}
          settings={settings}
          capabilities={capabilities}
          isFullscreen={isFullscreen}
          fullscreenNotice={fullscreenNotice}
          onCloseModal={() => {
            setActiveModal('none');
            if (hud.screen === 'paused') engineRef.current?.resume();
          }}
          onResume={() => {
            setActiveModal('none');
            engineRef.current?.resume();
          }}
          onRestart={() => {
            setActiveModal('none');
            engineRef.current?.restartWorld();
          }}
          onReturnToTitle={() => {
            setActiveModal('none');
            engineRef.current?.returnToTitle();
          }}
          onSwitchCharacter={handleSelectCharacter}
          onSwitchUniverse={handleSwitchUniverse}
          onTeleport={(pos, label) => {
            engineRef.current?.teleportTo(pos, label);
          }}
          onUseItem={(itemId) => {
            engineRef.current?.useInventoryItem(itemId);
          }}
          onUpdateSettings={handleUpdateSettings}
          onToggleFullscreen={handleToggleFullscreen}
          onOpenModal={(m) => setActiveModal(m)}
        />
      )}
    </div>
  );
}
