import React from 'react';
import { Globe, Maximize2, Minimize2, Play, Settings } from 'lucide-react';
import { CHARACTERS } from '../game/proceduralChaos';
import { CharacterId, UniverseMode } from '../game/types';
import { CharacterAvatarSvg } from './CharacterAvatarSvg';

interface TitleScreenProps {
  universe: UniverseMode;
  selectedCharacter: CharacterId;
  isFullscreen: boolean;
  fullscreenNotice: string | null;
  onSelectUniverse: (u: UniverseMode) => void;
  onOpenUniverseModal: () => void;
  onSelectCharacter: (id: CharacterId) => void;
  onStart: () => void;
  onOpenSettings: () => void;
  onToggleFullscreen: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  universe,
  selectedCharacter,
  isFullscreen,
  fullscreenNotice,
  onSelectUniverse,
  onOpenUniverseModal,
  onSelectCharacter,
  onStart,
  onOpenSettings,
  onToggleFullscreen,
}) => {
  const charList = Object.values(CHARACTERS);
  const isHuman = universe === 'human';

  return (
    <div className="fixed inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-10 pointer-events-none overflow-y-auto">
      {/* Left-side scrim for crisp typography over live 3D school flyover */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(95deg, rgba(15,23,42,0.88) 0%, rgba(15,23,42,0.56) 52%, rgba(15,23,42,0.08) 100%)',
        }}
      />

      <div className="relative z-10 max-w-2xl my-auto flex flex-col gap-4 sm:gap-5 pointer-events-auto py-2">
        {/* Bespoke inline SVG Title Emblem Lockup */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-3.5">
            <svg viewBox="0 0 64 64" className="w-12 h-12 sm:w-14 sm:h-14 shrink-0" aria-hidden="true">
              <path
                d="M10 10 H54 V34 C54 48 32 58 32 58 C32 58 10 48 10 34 Z"
                fill="#1D4ED8"
                stroke="#FACC15"
                strokeWidth="4"
              />
              <path d="M18 20 H46 V33 C46 42 32 49 32 49 C32 49 18 42 18 33 Z" fill="#16A34A" />
              <polygon points="32,22 43,32 32,42 21,32" fill="#FACC15" />
              <circle cx="32" cy="32" r="4.5" fill="#1E3A8A" />
            </svg>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-none hud-stroke">
                RT: O TRIO
              </h1>
              <p className="mt-1 text-xs sm:text-sm md:text-base font-bold tracking-wide text-amber-300">
                {isHuman
                  ? 'TRÊS AMIGOS. UMA ESCOLA. ZERO SOSSEGO.'
                  : 'TRÊS ANIMAIS. UMA ESCOLA. ZERO SOSSEGO.'}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed max-w-xl">
            Explore livremente uma escola brasileira gigante em 3D voxel: 22 salas, quadras, refeitório, telhados, túneis secretos e ruas ao redor. Escolha seu universo e crie o caos sem regras!
          </p>
        </div>

        {/* GAME MODE / UNIVERSE SELECTOR */}
        <div
          className="p-3 rounded-xl border border-slate-700/90 flex flex-wrap items-center justify-between gap-2.5"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.88)' }}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
              Modo de Jogo (Universo)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="universe-animal-btn"
              onClick={() => onSelectUniverse('animal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                universe === 'animal'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              MUNDO ANIMAL
            </button>
            <button
              type="button"
              data-testid="universe-human-btn"
              onClick={() => onSelectUniverse('human')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                universe === 'human'
                  ? 'bg-sky-400 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              MUNDO HUMANO
            </button>
            <button
              type="button"
              onClick={onOpenUniverseModal}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-semibold text-amber-300 cursor-pointer"
            >
              Prévia
            </button>
          </div>
        </div>

        {/* Character Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {charList.map((char) => {
            const active = selectedCharacter === char.id;
            const displayName = isHuman ? char.humanName : char.name;
            const displayDesc = isHuman ? char.humanDesc : char.tagline;
            const abilityLabel = isHuman && char.id === 'duck' ? 'GRITO DO CAOS' : char.abilityName;

            return (
              <button
                key={char.id}
                type="button"
                onClick={() => onSelectCharacter(char.id)}
                className={`text-left p-3 rounded-xl border-2 transition-transform duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  active
                    ? 'bg-slate-900/95 border-amber-400 -translate-y-0.5 shadow-lg'
                    : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CharacterAvatarSvg
                    characterId={char.id}
                    universe={universe}
                    size={38}
                    className="shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-display font-bold text-[13px] leading-tight text-white">
                      {displayName}
                    </div>
                    <div className="text-[11px] font-semibold text-amber-300 mt-0.5">
                      {abilityLabel}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-snug">{displayDesc}</p>
              </button>
            );
          })}
        </div>

        {/* Primary Start, Settings & Fullscreen Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            data-start="true"
            onClick={onStart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-slate-950 font-display font-extrabold text-base sm:text-lg shadow-lg transition-all cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            Entrar na Escola
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Settings className="w-4 h-4" />
            Configurações
          </button>

          <button
            type="button"
            data-testid="title-fullscreen-btn"
            onClick={onToggleFullscreen}
            className="inline-flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}
          </button>
        </div>

        {fullscreenNotice && (
          <div className="text-xs text-amber-300 font-medium">{fullscreenNotice}</div>
        )}
      </div>

      {/* Single flat control-hint line in bottom safe margin */}
      <div className="relative z-10 text-[11px] sm:text-xs text-slate-300 font-medium tracking-wide pt-2">
        WASD Mover · Mouse Câmera · Espaço Pular / Planar · Shift Correr · C Agachar · E Interagir · F Poder · Tab Trio · M Mapa · Esc Pausar
      </div>
    </div>
  );
};
