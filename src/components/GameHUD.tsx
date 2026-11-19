import React, { useEffect, useRef, useState } from 'react';
import {
  Backpack,
  Globe,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Pause,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CHARACTERS } from '../game/proceduralChaos';
import { GameSettings, HudSnapshot } from '../game/types';
import { MobileInputState } from '../game/GameEngine';
import { CharacterAvatarSvg } from './CharacterAvatarSvg';

interface GameHUDProps {
  hud: HudSnapshot;
  settings: GameSettings;
  isFullscreen: boolean;
  fullscreenNotice: string | null;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onOpenMap: () => void;
  onOpenInventory: () => void;
  onOpenCharacters: () => void;
  onOpenUniverse: () => void;
  onPause: () => void;
  onMobileInput: (partial: Partial<MobileInputState>) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  hud,
  settings,
  isFullscreen,
  fullscreenNotice,
  onToggleSound,
  onToggleFullscreen,
  onOpenMap,
  onOpenInventory,
  onOpenCharacters,
  onOpenUniverse,
  onPause,
  onMobileInput,
}) => {
  const char = CHARACTERS[hud.characterId];
  const isHuman = hud.universe === 'human';
  const displayName = isHuman ? char.humanName : char.shortName;
  const abilityLabel = isHuman && char.id === 'duck' ? 'GRITO' : char.abilityName;

  const [isTouchViewport, setIsTouchViewport] = useState(false);
  const stickRef = useRef<HTMLDivElement | null>(null);
  const [stickOffset, setStickOffset] = useState({ x: 0, y: 0 });
  const stickTouchIdRef = useRef<number | null>(null);
  const lookTouchRef = useRef<{ id: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const check = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchViewport(window.innerWidth < 820 || hasTouch);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const showMobile =
    settings.mobileControls === 'on' || (settings.mobileControls === 'auto' && isTouchViewport);

  const abilityReady = hud.abilityCooldownRemaining <= 0;
  const abilityRatio = abilityReady
    ? 1
    : 1 - hud.abilityCooldownRemaining / Math.max(0.1, hud.abilityCooldownMax);

  const latestEvent = hud.recentEvents[0] ?? null;
  const stickPx = Math.round(108 * settings.joystickSize);

  const handleStickMove = (clientX: number, clientY: number) => {
    const el = stickRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const maxR = rect.width * 0.38;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > maxR) {
      dx = (dx / dist) * maxR;
      dy = (dy / dist) * maxR;
    }
    setStickOffset({ x: dx, y: dy });
    onMobileInput({ moveX: dx / maxR, moveY: dy / maxR });
  };

  return (
    <div
      className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-2 sm:p-4"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
      }}
    >
      {/* TOP BAR CLUSTERS */}
      <div
        className="flex items-start justify-between gap-1.5 sm:gap-2 origin-top"
        style={{ transform: `scale(${settings.hudScale})` }}
      >
        {/* TOP-LEFT: Active Character, Stamina, Ability & Chaos */}
        <div
          className="pointer-events-auto flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border-2 border-slate-800 shadow-lg min-w-0 max-w-[152px] sm:max-w-none"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
        >
          <button
            type="button"
            onClick={onOpenCharacters}
            title="Trocar Personagem (Tab)"
            className="shrink-0 cursor-pointer hover:scale-105 transition-transform"
            aria-label={`Trocar personagem, atual ${displayName}`}
          >
            <CharacterAvatarSvg
              characterId={hud.characterId}
              universe={hud.universe}
              size={32}
              className="sm:w-[42px] sm:h-[42px]"
            />
          </button>

          <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0 sm:min-w-[175px]">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0 sm:gap-1.5">
              <span className="font-display font-bold text-[11px] sm:text-sm text-white truncate">
                {displayName}
              </span>
              <span className="font-mono-num text-[10px] sm:text-xs font-bold text-amber-400 whitespace-nowrap">
                {hud.chaosScore} CAOS
                {hud.comboMultiplier > 1 ? ` x${hud.comboMultiplier}` : ''}
              </span>
            </div>

            {/* Stamina Bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-transform duration-100 origin-left"
                style={{ transform: `scaleX(${Math.max(0, Math.min(1, hud.stamina / 100))})` }}
              />
            </div>

            {/* Special Ability Bar */}
            <div className="flex items-center justify-between gap-1 text-[9px] sm:text-[11px]">
              <span className={`truncate ${abilityReady ? 'text-sky-300 font-bold' : 'text-slate-400 font-mono-num'}`}>
                {abilityLabel} {abilityReady ? '[F]' : `${hud.abilityCooldownRemaining.toFixed(1)}s`}
              </span>
              {hud.teacherAlertLevel > 10 && (
                <span className="text-rose-400 font-bold font-mono-num shrink-0">
                  {hud.teacherAlertLevel}%
                </span>
              )}
            </div>
            <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-transform duration-100 origin-left"
                style={{ transform: `scaleX(${Math.max(0, Math.min(1, abilityRatio))})` }}
              />
            </div>
          </div>
        </div>

        {/* TOP-CENTER: Dynamic School Clock, Event Schedule & Announcements */}
        <div className="hidden md:flex flex-col items-center gap-1.5">
          <div
            className="flex items-center gap-2.5 px-4 py-1.5 rounded-xl border-2 border-slate-800 shadow-lg"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
          >
            <span className="font-mono-num text-base font-bold text-amber-300">
              {hud.schoolTimeFormatted}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="text-xs font-semibold text-slate-100 whitespace-nowrap">
              {hud.schedulePhase.label}
            </span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className={`text-[11px] font-bold uppercase ${isHuman ? 'text-sky-300' : 'text-amber-300'}`}>
              {isHuman ? 'Mundo Humano' : 'Mundo Animal'}
            </span>
          </div>

          {(hud.activeAnnouncement || fullscreenNotice) && (
            <div
              className="px-4 py-1.5 rounded-lg border border-amber-400/70 text-xs font-semibold text-amber-200 shadow-md max-w-md text-center"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.94)' }}
            >
              {fullscreenNotice ?? hud.activeAnnouncement}
            </div>
          )}
        </div>

        {/* TOP-RIGHT: Compact Utility Buttons + Zone Badge */}
        <div className="pointer-events-auto flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <button
              type="button"
              onClick={onOpenMap}
              tabIndex={-1}
              aria-label="Abrir Mapa da Escola"
              title="Mapa (M)"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-slate-100 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              <MapIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenInventory}
              tabIndex={-1}
              aria-label="Abrir Mochila e Diário de Caos"
              title="Mochila e Caos (I)"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-slate-100 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              <Backpack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenCharacters}
              tabIndex={-1}
              aria-label="Trocar Personagem do Trio"
              title="Trocar Personagem (Tab)"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-slate-100 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              data-testid="hud-universe-btn"
              onClick={onOpenUniverse}
              tabIndex={-1}
              aria-label="Trocar Universo (Animal / Humano)"
              title="Trocar Universo"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-sky-300 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              data-testid="hud-fullscreen-btn"
              onClick={onToggleFullscreen}
              tabIndex={-1}
              aria-label={isFullscreen ? 'Sair da Tela Cheia' : 'Entrar em Tela Cheia'}
              title="Tela Cheia"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-slate-100 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onToggleSound}
              tabIndex={-1}
              aria-label={settings.soundEnabled ? 'Silenciar Áudio' : 'Ativar Áudio'}
              title="Som"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-slate-100 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
              )}
            </button>
            <button
              type="button"
              onClick={onPause}
              tabIndex={-1}
              aria-label="Pausar Jogo"
              title="Pausar (Esc)"
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl border-2 border-slate-800 flex items-center justify-center text-slate-100 hover:border-amber-400 cursor-pointer transition-colors"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.9)' }}
            >
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div
            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-slate-800 text-[10px] sm:text-xs font-semibold text-slate-200 max-w-[148px] sm:max-w-[230px] truncate"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
          >
            {hud.currentZoneName}
          </div>

          {/* OPTIONAL PERFORMANCE OVERLAY */}
          {settings.showPerformanceOverlay && (
            <div
              data-testid="perf-overlay"
              className="p-2 rounded-lg border border-slate-700 text-[10px] sm:text-[11px] font-mono-num text-slate-200 shadow-md flex flex-col gap-0.5 min-w-[168px]"
              style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)' }}
            >
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">FPS / Frame</span>
                <span className={hud.perf.fps < 25 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {hud.perf.fps} ({hud.perf.frameTimeMs}ms)
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">Resolução</span>
                <span>{hud.perf.renderWidth}x{hud.perf.renderHeight}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">NPCs / Draws</span>
                <span>{hud.perf.activeNpcsAnimated}/{hud.perf.totalNpcs} · {hud.perf.drawCalls}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-slate-400">Gráficos</span>
                <span className="text-amber-300 uppercase">{hud.perf.preset}</span>
              </div>
              {hud.perf.warning && (
                <div className="text-amber-300 text-[10px] font-sans mt-0.5">{hud.perf.warning}</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE SWIPE LOOK ZONE (right side only, touch-none, isolated identifier!) */}
      {showMobile && (
        <div
          data-testid="mobile-camera-drag-zone"
          className="fixed right-0 top-16 bottom-36 left-1/2 pointer-events-auto touch-none"
          onTouchStart={(e) => {
            if (lookTouchRef.current !== null) return;
            const t = e.changedTouches[0];
            if (!t) return;
            lookTouchRef.current = { id: t.identifier, x: t.clientX, y: t.clientY };
          }}
          onTouchMove={(e) => {
            if (!lookTouchRef.current) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
              const t = e.changedTouches[i];
              if (t.identifier === lookTouchRef.current.id) {
                onMobileInput({
                  lookDx: (t.clientX - lookTouchRef.current.x) * 1.15,
                  lookDy: (t.clientY - lookTouchRef.current.y) * 1.15,
                });
                lookTouchRef.current.x = t.clientX;
                lookTouchRef.current.y = t.clientY;
                break;
              }
            }
          }}
          onTouchEnd={(e) => {
            if (!lookTouchRef.current) return;
            for (let i = 0; i < e.changedTouches.length; i++) {
              if (e.changedTouches[i].identifier === lookTouchRef.current.id) {
                lookTouchRef.current = null;
                break;
              }
            }
          }}
          onTouchCancel={() => {
            lookTouchRef.current = null;
          }}
        />
      )}

      {/* BOTTOM AREA: Interaction Prompt, Recent Chaos Feed & Mobile/Desktop Controls */}
      <div className="flex flex-col items-center gap-2">
        {(hud.nearbyPrompt || hud.heldItemName) && (
          <div
            className="px-4 py-1.5 rounded-xl border-2 border-amber-400 text-xs sm:text-sm font-bold text-white shadow-lg"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.92)' }}
          >
            {hud.nearbyPrompt ?? `Segurando: ${hud.heldItemName}`}
          </div>
        )}

        {latestEvent && !showMobile && (
          <div
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 max-w-xl text-center truncate"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.86)' }}
          >
            <span className="font-bold text-amber-300">+{latestEvent.chaosPoints} Caos</span>
            <span className="mx-1.5 text-slate-500">·</span>
            <span>{latestEvent.title}</span>
            <span className="mx-1.5 text-slate-500">·</span>
            <span className="text-slate-300">{latestEvent.description}</span>
          </div>
        )}

        {showMobile ? (
          <div className="w-full flex items-end justify-between px-1 pb-1 pointer-events-auto">
            {/* Virtual Joystick (Left Touch ID isolated) */}
            <div
              ref={stickRef}
              data-testid="mobile-joystick"
              onTouchStart={(e) => {
                e.stopPropagation();
                if (stickTouchIdRef.current !== null) return;
                const t = e.changedTouches[0];
                if (!t) return;
                stickTouchIdRef.current = t.identifier;
                handleStickMove(t.clientX, t.clientY);
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                if (stickTouchIdRef.current === null) return;
                for (let i = 0; i < e.changedTouches.length; i++) {
                  const t = e.changedTouches[i];
                  if (t.identifier === stickTouchIdRef.current) {
                    handleStickMove(t.clientX, t.clientY);
                    break;
                  }
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                for (let i = 0; i < e.changedTouches.length; i++) {
                  if (e.changedTouches[i].identifier === stickTouchIdRef.current) {
                    stickTouchIdRef.current = null;
                    setStickOffset({ x: 0, y: 0 });
                    onMobileInput({ moveX: 0, moveY: 0 });
                    break;
                  }
                }
              }}
              onTouchCancel={() => {
                stickTouchIdRef.current = null;
                setStickOffset({ x: 0, y: 0 });
                onMobileInput({ moveX: 0, moveY: 0 });
              }}
              className="relative rounded-full border-2 border-slate-500 flex items-center justify-center touch-none"
              style={{
                width: `${stickPx}px`,
                height: `${stickPx}px`,
                backgroundColor: 'rgba(15, 23, 42, 0.72)',
              }}
            >
              <div
                className="w-11 h-11 rounded-full bg-amber-400 border-2 border-slate-950 pointer-events-none"
                style={{ transform: `translate(${stickOffset.x}px, ${stickOffset.y}px)` }}
              />
            </div>

            {/* Mobile Action Buttons (e.stopPropagation prevents accidental camera drag!) */}
            <div
              className="grid grid-cols-2 gap-2 touch-none"
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onMobileInput({ interactPressed: true });
                }}
                onClick={() => onMobileInput({ interactPressed: true })}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-amber-400 text-slate-950 font-bold text-xs border-2 border-slate-950"
              >
                Usar
              </button>
              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onMobileInput({ jumpPressed: true });
                }}
                onClick={() => onMobileInput({ jumpPressed: true })}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs border-2 border-slate-950"
              >
                Pular
              </button>
              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onMobileInput({ abilityPressed: true });
                }}
                onClick={() => onMobileInput({ abilityPressed: true })}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-sky-500 text-slate-950 font-bold text-xs border-2 border-slate-950"
              >
                Poder
              </button>
              <button
                type="button"
                onTouchStart={(e) => {
                  e.stopPropagation();
                  onMobileInput({ sprint: true });
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  onMobileInput({ sprint: false });
                }}
                onClick={() => onMobileInput({ sprint: false })}
                className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-slate-800 text-white font-bold text-xs border-2 border-slate-600"
              >
                Correr
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-medium text-slate-200 hud-stroke">
            WASD Mover · Espaço Pular/Planar · Shift Correr · C Agachar · E Interagir/Jogar · F Poder · Tab Trio · M Mapa · I Mochila · Esc Pausar
          </div>
        )}
      </div>
    </div>
  );
};
