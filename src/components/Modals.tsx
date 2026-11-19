import React, { useEffect, useState } from 'react';
import { Check, Maximize2, Minimize2, X } from 'lucide-react';
import { CHARACTERS } from '../game/proceduralChaos';
import { SCHOOL_ZONES } from '../game/worldLayout';
import { getPresetConfig } from '../game/graphicsProfile';
import {
  ActiveModal,
  CharacterId,
  DeviceCapabilities,
  GameSettings,
  GraphicsConfig,
  GraphicsPreset,
  HudSnapshot,
  UniverseMode,
} from '../game/types';
import { CharacterAvatarSvg } from './CharacterAvatarSvg';

interface ModalsProps {
  hud: HudSnapshot;
  activeModal: ActiveModal;
  settings: GameSettings;
  capabilities: DeviceCapabilities;
  isFullscreen: boolean;
  fullscreenNotice: string | null;
  onCloseModal: () => void;
  onResume: () => void;
  onRestart: () => void;
  onReturnToTitle: () => void;
  onSwitchCharacter: (id: CharacterId) => void;
  onSwitchUniverse: (u: UniverseMode) => void;
  onTeleport: (pos: [number, number, number], label: string) => void;
  onUseItem: (id: string) => void;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onToggleFullscreen: () => void;
  onOpenModal: (m: ActiveModal) => void;
}

const PRESET_LABELS: { id: GraphicsPreset; label: string; desc: string }[] = [
  { id: 'low', label: 'Baixo (LOW)', desc: 'Máximo FPS em celulares econômicos' },
  { id: 'medium', label: 'Médio (MEDIUM)', desc: 'Equilíbrio leve para mobile e notebook' },
  { id: 'high', label: 'Alto (HIGH)', desc: 'Padrão nítido com sombras e AO' },
  { id: 'ultra', label: 'Ultra (ULTRA)', desc: 'Sombras 2048px e iluminação realçada' },
  { id: 'extreme', label: 'Extremo (EXTREME)', desc: 'Máxima fidelidade em PC potente' },
  { id: 'custom', label: 'Personalizado', desc: 'Controle fino de cada opção' },
];

export const Modals: React.FC<ModalsProps> = ({
  hud,
  activeModal,
  settings,
  capabilities,
  isFullscreen,
  fullscreenNotice,
  onCloseModal,
  onResume,
  onRestart,
  onReturnToTitle,
  onSwitchCharacter,
  onSwitchUniverse,
  onTeleport,
  onUseItem,
  onUpdateSettings,
  onToggleFullscreen,
  onOpenModal,
}) => {
  const [pendingUniverse, setPendingUniverse] = useState<UniverseMode>(hud.universe);

  useEffect(() => {
    if (activeModal === 'universe') {
      setPendingUniverse(hud.universe);
    }
  }, [activeModal, hud.universe]);

  const isPaused = hud.screen === 'paused';
  const isHuman = hud.universe === 'human';

  if (!isPaused && activeModal === 'none') return null;

  const modalBoxStyle: React.CSSProperties = {
    backgroundColor: 'rgba(15, 23, 42, 0.97)',
  };

  const updateGfx = (partial: Partial<GraphicsConfig>) => {
    onUpdateSettings({
      graphics: {
        ...settings.graphics,
        ...partial,
        preset: 'custom',
      },
    });
  };

  // Pause menu modal when paused and no sub-modal open
  if (isPaused && activeModal === 'none') {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(2, 6, 23, 0.72)' }}>
        <div className="w-full max-w-md rounded-2xl border-2 border-slate-700 p-6 shadow-2xl" style={modalBoxStyle}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-extrabold text-white">Jogo Pausado</h2>
            <span className="font-mono-num text-sm font-bold text-amber-300">{hud.schoolTimeFormatted}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <div>
              <div className="font-mono-num text-lg font-bold text-amber-400">{hud.chaosScore}</div>
              <div className="text-[11px] text-slate-400">Caos Total</div>
            </div>
            <div>
              <div className="font-mono-num text-lg font-bold text-emerald-400">{hud.uniqueCombosTriggered}</div>
              <div className="text-[11px] text-slate-400">Combinações</div>
            </div>
            <div>
              <div className="font-mono-num text-lg font-bold text-sky-400">{hud.discoveredSecrets.length}</div>
              <div className="text-[11px] text-slate-400">Segredos</div>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onResume}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-bold text-base cursor-pointer"
            >
              Continuar Bagunça
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenModal('characters')}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold cursor-pointer"
              >
                {isHuman ? 'Trocar Amigo' : 'Trocar Animal'}
              </button>
              <button
                type="button"
                onClick={() => onOpenModal('map')}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold cursor-pointer"
              >
                Mapa da Escola
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onOpenModal('universe')}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 text-sm font-semibold cursor-pointer"
              >
                Trocar Universo
              </button>
              <button
                type="button"
                onClick={onToggleFullscreen}
                className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}
              </button>
            </div>
            <button
              type="button"
              onClick={() => onOpenModal('settings')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold cursor-pointer"
            >
              Configurações e Gráficos
            </button>
            <button
              type="button"
              onClick={onRestart}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold cursor-pointer"
            >
              Reiniciar Dia Escolar
            </button>
            <button
              type="button"
              onClick={onReturnToTitle}
              className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-sm font-semibold cursor-pointer"
            >
              Voltar ao Menu Inicial
            </button>
          </div>
          {fullscreenNotice && (
            <p className="mt-3 text-xs text-amber-300 text-center">{fullscreenNotice}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-3 sm:p-4" style={{ backgroundColor: 'rgba(2, 6, 23, 0.75)' }}>
      <div
        className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-2xl border-2 border-slate-700 p-4 sm:p-6 shadow-2xl"
        style={modalBoxStyle}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <h2 className="font-display text-xl sm:text-2xl font-extrabold text-white">
            {activeModal === 'universe' && 'Selecionar Universo do Jogo'}
            {activeModal === 'characters' &&
              `Escolher Integrante do Trio (${isHuman ? 'Mundo Humano' : 'Mundo Animal'})`}
            {activeModal === 'map' && 'Mapa da Escola Estadual Voxel & Vizinhança'}
            {activeModal === 'inventory' && 'Mochila & Diário de Caos Livre'}
            {activeModal === 'settings' && 'Configurações, Gráficos e Controles'}
          </h2>
          <button
            type="button"
            onClick={onCloseModal}
            aria-label="Fechar janela"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* UNIVERSE SWITCHER MODAL */}
        {activeModal === 'universe' && (
          <div className="flex flex-col gap-4">
            <p className="text-xs sm:text-sm text-slate-300">
              Alterne entre dois universos visuais completos usando a mesma escola, inventário, descobertas e pontuação de caos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['animal', 'human'] as UniverseMode[]).map((mode) => {
                const selected = pendingUniverse === mode;
                const modeHuman = mode === 'human';
                return (
                  <button
                    key={mode}
                    type="button"
                    data-testid={`modal-universe-${mode}`}
                    onClick={() => setPendingUniverse(mode)}
                    className={`text-left p-4 rounded-xl border-2 flex flex-col gap-3 cursor-pointer transition-colors ${
                      selected
                        ? modeHuman
                          ? 'border-sky-400 bg-slate-900'
                          : 'border-amber-400 bg-slate-900'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-display text-lg font-extrabold ${
                          modeHuman ? 'text-sky-300' : 'text-amber-300'
                        }`}
                      >
                        {modeHuman ? 'MUNDO HUMANO' : 'MUNDO ANIMAL'}
                      </span>
                      {selected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500 text-slate-950 text-[11px] font-bold">
                          <Check className="w-3.5 h-3.5" /> Selecionado
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300">
                      {modeHuman
                        ? 'Todos os personagens e NPCs são humanos voxel detalhados com cabelos e roupas escolares.'
                        : 'O universo original: Trio animal e alunos de 16 espécies diferentes pela escola.'}
                    </p>

                    <div className="flex flex-col gap-2">
                      {(Object.values(CHARACTERS) as (typeof CHARACTERS)['rat'][]).map((c) => (
                        <div key={c.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950 border border-slate-800">
                          <CharacterAvatarSvg characterId={c.id} universe={mode} size={36} className="shrink-0" />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white">
                              {modeHuman ? c.humanName : c.name}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {modeHuman ? c.humanDesc : c.species}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onCloseModal}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                data-testid="confirm-universe-btn"
                onClick={() => {
                  onSwitchUniverse(pendingUniverse);
                  onCloseModal();
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-display font-extrabold text-sm cursor-pointer"
              >
                Confirmar Universo
              </button>
            </div>
          </div>
        )}

        {/* CHARACTER SWITCHER */}
        {activeModal === 'characters' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(Object.values(CHARACTERS) as (typeof CHARACTERS)['rat'][]).map((c) => {
              const selected = hud.characterId === c.id;
              const name = isHuman ? c.humanName : c.name;
              const subtitle = isHuman ? 'Estudante Humano' : c.species;
              const desc = isHuman ? c.humanDesc : c.tagline;
              const abilityLabel = isHuman && c.id === 'duck' ? 'GRITO DO CAOS' : c.abilityName;

              return (
                <div
                  key={c.id}
                  className={`p-4 rounded-xl border-2 flex flex-col justify-between gap-3 ${
                    selected ? 'border-amber-400 bg-slate-900' : 'border-slate-700 bg-slate-900/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <CharacterAvatarSvg characterId={c.id} universe={hud.universe} size={48} />
                      <div>
                        <div className="font-display font-bold text-base text-white">{name}</div>
                        <div className="text-xs text-slate-400">{subtitle}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-200 mb-2">{desc}</p>
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                      <div className="font-bold text-amber-300 mb-0.5">Poder [F]: {abilityLabel}</div>
                      <div className="text-slate-300 leading-snug">{c.abilityDesc}</div>
                    </div>
                    <p className="mt-2 text-[11px] text-emerald-300 leading-snug">{c.passiveDesc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onSwitchCharacter(c.id);
                      onCloseModal();
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm cursor-pointer ${
                      selected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                    }`}
                  >
                    {selected ? 'Ativo Agora' : `Jogar com ${c.shortName}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* INTERACTIVE SCHOOL MAP WITH TELEPORT */}
        {activeModal === 'map' && (
          <div className="flex flex-col gap-4">
            <div className="relative w-full h-64 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <svg viewBox="-105 -70 210 165" className="w-full h-full">
                <rect x="-105" y="-70" width="210" height="165" fill="#14532d" />
                <rect x="-105" y="66" width="210" height="26" fill="#334155" />
                <rect x="-56" y="44" width="112" height="21" fill="#475569" />
                <rect x="-44" y="-50" width="88" height="38" fill="#1d4ed8" stroke="#f8fafc" strokeWidth="1" />
                <rect x="26" y="-8" width="40" height="44" fill="#ea580c" stroke="#f8fafc" strokeWidth="1" />
                <rect x="-24" y="-12" width="48" height="54" fill="#d6d3d1" />
                <rect x="-74" y="22" width="46" height="30" fill="#22c55e" stroke="#ffffff" strokeWidth="0.8" />
                <rect x="-44" y="-8" width="20" height="26" fill="#2563eb" stroke="#ffffff" strokeWidth="0.6" />
                <rect x="-74" y="-10" width="28" height="28" fill="#7c3aed" stroke="#ffffff" strokeWidth="0.8" />
                <rect x="-42" y="-46" width="44" height="48" fill="none" stroke="#facc15" strokeWidth="1.2" strokeDasharray="3 2" />
                <text x="0" y="-30" fill="#f8fafc" fontSize="6" fontWeight="bold" textAnchor="middle">BLOCO A (22 SALAS)</text>
                <text x="46" y="15" fill="#f8fafc" fontSize="5.5" fontWeight="bold" textAnchor="middle">REFEITÓRIO</text>
                <text x="0" y="15" fill="#0f172a" fontSize="5.5" fontWeight="bold" textAnchor="middle">PÁTIO</text>
                <text x="-51" y="39" fill="#0f172a" fontSize="5.5" fontWeight="bold" textAnchor="middle">CAMPO</text>
                <text x="-60" y="5" fill="#f8fafc" fontSize="5" fontWeight="bold" textAnchor="middle">GINÁSIO</text>
                <text x="0" y="81" fill="#e2e8f0" fontSize="5.5" fontWeight="bold" textAnchor="middle">RUAS DA VIZINHANÇA</text>
                <circle cx={hud.playerPos.x} cy={hud.playerPos.z} r="4.5" fill="#facc15" stroke="#0f172a" strokeWidth="1.5" />
              </svg>
              <div className="absolute bottom-2 left-3 text-xs font-semibold text-white bg-slate-950/90 px-2.5 py-1 rounded-md border border-slate-700">
                Você está em: {hud.currentZoneName} (Andar Y={hud.playerPos.y}m)
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {SCHOOL_ZONES.slice(0, 20).map((z) => (
                <button
                  key={z.id}
                  type="button"
                  onClick={() => {
                    onTeleport(z.teleportPos, z.name);
                    onCloseModal();
                  }}
                  className="text-left px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-white truncate">{z.name}</div>
                  <div className="text-[11px] text-amber-300">Ir para cá</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INVENTORY & OBJECTIVE-FREE ACTIVITY TRACKER */}
        {activeModal === 'inventory' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-mono-num text-xl font-bold text-amber-400">
                  {hud.uniqueCombosTriggered}
                </div>
                <div className="text-xs text-slate-300">
                  de {hud.totalPossibleCombos.toLocaleString('pt-BR')} combinações
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-mono-num text-xl font-bold text-emerald-400">
                  {hud.discoveredSecrets.length} / 7
                </div>
                <div className="text-xs text-slate-300">Áreas Especiais</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-mono-num text-xl font-bold text-sky-400">{hud.goalsScored}</div>
                <div className="text-xs text-slate-300">Gols Marcados</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="font-mono-num text-xl font-bold text-rose-400">{hud.npcsStartled}</div>
                <div className="text-xs text-slate-300">NPCs Surpresos</div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-2">Itens da Mochila</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {hud.inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">
                        {item.name} ({item.quantity}x)
                      </div>
                      <div className="text-xs text-slate-400">{item.description}</div>
                    </div>
                    <button
                      type="button"
                      disabled={item.quantity <= 0}
                      onClick={() => onUseItem(item.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Usar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-200 mb-2">
                Histórico de Situações Emergentes (Sem Missão Obrigatória)
              </h3>
              {hud.recentEvents.length === 0 ? (
                <p className="text-xs text-slate-400 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  Nenhuma bagunça registrada ainda! Interaja com bolas, alarmes, bandejas, professores ou use seu poder [F].
                </p>
              ) : (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {hud.recentEvents.map((ev) => (
                    <div key={ev.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between gap-2 font-bold">
                        <span className="text-amber-300">{ev.title}</span>
                        <span className="font-mono-num text-emerald-400">+{ev.chaosPoints} pts · {ev.timestamp}</span>
                      </div>
                      <div className="text-slate-300 mt-0.5">{ev.description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS & GRAPHICS */}
        {activeModal === 'settings' && (
          <div className="flex flex-col gap-4">
            {/* Hardware & Fullscreen Header */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase">Dispositivo Detectado</div>
                <div className="text-sm font-semibold text-white">{capabilities.hardwareSummary}</div>
              </div>
              <button
                type="button"
                data-testid="settings-fullscreen-btn"
                onClick={onToggleFullscreen}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-white cursor-pointer"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                {isFullscreen ? 'Sair da Tela Cheia' : 'Ativar Tela Cheia'}
              </button>
            </div>

            {fullscreenNotice && (
              <div className="text-xs text-amber-300 font-medium px-1">{fullscreenNotice}</div>
            )}

            {/* Graphics Presets */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">Perfil Gráfico (PC e Mobile)</span>
                {!capabilities.supportsExtreme && (
                  <span className="text-[11px] text-amber-300">
                    Extremo/Personalizado requer PC com GPU WebGL hardware
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_LABELS.map((p) => {
                  const gated = (p.id === 'extreme' || p.id === 'custom') && !capabilities.supportsExtreme;
                  const active = settings.graphics.preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={gated}
                      data-testid={`gfx-preset-${p.id}`}
                      onClick={() =>
                        onUpdateSettings({
                          graphics: getPresetConfig(p.id, settings.graphics),
                        })
                      }
                      className={`text-left p-2.5 rounded-lg border transition-colors ${
                        gated
                          ? 'bg-slate-950/60 border-slate-800 text-slate-600 cursor-not-allowed'
                          : active
                            ? 'bg-amber-400 text-slate-950 border-amber-300 cursor-pointer'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 cursor-pointer'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{p.label}</div>
                      <div className={`text-[10px] mt-0.5 ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Graphics Controls (Custom or Inspectable) */}
              {capabilities.supportsExtreme && (
                <div className="mt-2 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Resolução de Sombras</span>
                      <span className="font-mono-num text-amber-300">
                        {settings.graphics.shadowResolution === 0 ? 'Desligada' : `${settings.graphics.shadowResolution}px`}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {([0, 512, 1024, 2048] as const).map((res) => (
                        <button
                          key={res}
                          type="button"
                          onClick={() => updateGfx({ shadowResolution: res })}
                          className={`flex-1 py-1 rounded font-bold cursor-pointer ${
                            settings.graphics.shadowResolution === res
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {res === 0 ? 'Off' : res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Qualidade das Texturas</span>
                      <span className="font-mono-num text-amber-300 uppercase">{settings.graphics.textureQuality}</span>
                    </div>
                    <div className="flex gap-1">
                      {(['low', 'medium', 'high'] as const).map((tq) => (
                        <button
                          key={tq}
                          type="button"
                          onClick={() => updateGfx({ textureQuality: tq })}
                          className={`flex-1 py-1 rounded font-bold uppercase cursor-pointer ${
                            settings.graphics.textureQuality === tq
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {tq === 'low' ? 'Baixa' : tq === 'medium' ? 'Média' : 'Alta'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Escala de Renderização</span>
                      <span className="font-mono-num text-amber-300">{Math.round(settings.graphics.renderScale * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="1.5"
                      step="0.05"
                      value={settings.graphics.renderScale}
                      onChange={(e) => updateGfx({ renderScale: parseFloat(e.target.value) })}
                      className="accent-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Distância de Visão</span>
                      <span className="font-mono-num text-amber-300">{settings.graphics.viewDistance}m</span>
                    </div>
                    <input
                      type="range"
                      min="110"
                      max="290"
                      step="10"
                      value={settings.graphics.viewDistance}
                      onChange={(e) => updateGfx({ viewDistance: parseInt(e.target.value, 10) })}
                      className="accent-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Densidade de Vegetação</span>
                      <span className="font-mono-num text-amber-300">{Math.round(settings.graphics.foliageDensity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.35"
                      max="1.0"
                      step="0.05"
                      value={settings.graphics.foliageDensity}
                      onChange={(e) => updateGfx({ foliageDensity: parseFloat(e.target.value) })}
                      className="accent-amber-400"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-slate-200">
                      <span>Simulação de NPCs (LOD)</span>
                      <span className="font-mono-num text-amber-300">{settings.graphics.npcSimDistance}m</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="85"
                      step="2"
                      value={settings.graphics.npcSimDistance}
                      onChange={(e) => updateGfx({ npcSimDistance: parseInt(e.target.value, 10) })}
                      className="accent-amber-400"
                    />
                  </div>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <span className="text-slate-200 font-semibold">Oclusão Ambiental (AO)</span>
                    <input
                      type="checkbox"
                      checked={settings.graphics.ambientOcclusion}
                      onChange={(e) => updateGfx({ ambientOcclusion: e.target.checked })}
                      className="w-4 h-4 accent-amber-400"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                    <span className="text-slate-200 font-semibold">Realce / Pós-Processamento</span>
                    <input
                      type="checkbox"
                      checked={settings.graphics.postProcessing}
                      onChange={(e) => updateGfx({ postProcessing: e.target.checked })}
                      className="w-4 h-4 accent-amber-400"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Audio & Performance Overlay */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-sm font-semibold text-white">Áudio e Efeitos Sonoros</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-400"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-sm font-semibold text-white">Painel de Desempenho (FPS)</span>
                <input
                  type="checkbox"
                  data-testid="toggle-perf-overlay"
                  checked={settings.showPerformanceOverlay}
                  onChange={(e) => onUpdateSettings({ showPerformanceOverlay: e.target.checked })}
                  className="w-5 h-5 accent-amber-400"
                />
              </label>
            </div>

            {/* Camera & Mobile Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-white">
                  <span>Sensibilidade da Câmera</span>
                  <span className="font-mono-num text-amber-300">{settings.cameraSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.2"
                  step="0.1"
                  value={settings.cameraSensitivity}
                  onChange={(e) => onUpdateSettings({ cameraSensitivity: parseFloat(e.target.value) })}
                  className="accent-amber-400"
                />
                <label className="flex items-center justify-between text-xs text-slate-300 pt-1 cursor-pointer">
                  <span>Inverter Eixo Y da Câmera</span>
                  <input
                    type="checkbox"
                    checked={settings.invertCameraY}
                    onChange={(e) => onUpdateSettings({ invertCameraY: e.target.checked })}
                    className="w-4 h-4 accent-amber-400"
                  />
                </label>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between text-sm text-white">
                  <span>Tamanho Joystick / HUD</span>
                  <span className="font-mono-num text-amber-300">
                    {Math.round(settings.joystickSize * 100)}% / {Math.round(settings.hudScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.35"
                  step="0.05"
                  value={settings.joystickSize}
                  onChange={(e) => onUpdateSettings({ joystickSize: parseFloat(e.target.value) })}
                  className="accent-amber-400"
                />
                <input
                  type="range"
                  min="0.85"
                  max="1.15"
                  step="0.05"
                  value={settings.hudScale}
                  onChange={(e) => onUpdateSettings({ hudScale: parseFloat(e.target.value) })}
                  className="accent-sky-400"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between text-sm text-white">
                <span>Velocidade do Relógio Escolar</span>
                <span className="font-mono-num text-amber-300">{settings.timeScale.toFixed(1)}x</span>
              </div>
              <div className="flex gap-2">
                {[0.5, 1.0, 2.0, 4.0].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onUpdateSettings({ timeScale: v })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      settings.timeScale === v ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {v}x
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col gap-2">
              <span className="text-sm font-semibold text-white">Controles na Tela (Mobile / Touch)</span>
              <div className="flex gap-2">
                {(
                  [
                    ['auto', 'Automático'],
                    ['on', 'Sempre Visível'],
                    ['off', 'Desativado'],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onUpdateSettings({ mobileControls: val })}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      settings.mobileControls === val ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
