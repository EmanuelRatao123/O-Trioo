import {
  ActionVerb,
  ChainReactionOutcome,
  CharacterId,
  CharacterSpec,
  NpcPersonality,
  PropKind,
  SchedulePhaseId,
  SchedulePhaseInfo,
} from './types';

export const CHARACTERS: Record<CharacterId, CharacterSpec> = {
  rat: {
    id: 'rat',
    name: 'Rato Emanuel',
    shortName: 'Emanuel',
    species: 'Rato Voxel',
    humanName: 'Emanuel (Humano)',
    humanDesc: 'Cabelo longo volumoso, pele clara, moletom descolado e agilidade ninja.',
    tagline: 'Ágil, furtivo e mestre das passagens secretas.',
    abilityName: 'SUPER CORRIDA',
    abilityDesc: 'Dispara em velocidade absurda por 4s, sobe paredes marcadas e escorrega por dutos.',
    passiveDesc: 'Pode escalar superfícies verticais e se esconder em lixeiras e armários pequenos.',
    accentHex: '#F59E0B',
    speed: 10.2,
    sprintMultiplier: 1.65,
    jumpForce: 10.5,
    gravityScale: 1.0,
    canClimb: true,
    canHideSmall: true,
    canGlide: false,
    abilityCooldown: 6.5,
    height: 0.95,
    radius: 0.42,
  },
  duck: {
    id: 'duck',
    name: 'Pato Pedro Henrique',
    shortName: 'Pedro H.',
    species: 'Pato Voxel',
    humanName: 'Pedro Henrique (Humano)',
    humanDesc: 'Pele parda, cabelo curto estiloso, camisa escolar estilizada e rei da zoeira.',
    tagline: 'Caótico, barulhento e rei das distrações absurdas.',
    abilityName: 'QUACK DO CAOS',
    abilityDesc: 'Onda sonora cômica que assusta NPCs, empurra objetos e dispara alarmes próximos!',
    passiveDesc: 'Interage com objetos escolares de jeitos hilários e ganha bônus extra de caos.',
    accentHex: '#0EA5E9',
    speed: 8.6,
    sprintMultiplier: 1.45,
    jumpForce: 10.2,
    gravityScale: 0.95,
    canClimb: false,
    canHideSmall: false,
    canGlide: false,
    abilityCooldown: 5.0,
    height: 1.15,
    radius: 0.48,
  },
  eagle: {
    id: 'eagle',
    name: 'Gavião Pedro Antônio',
    shortName: 'Pedro A.',
    species: 'Gavião-Real Voxel',
    humanName: 'Pedro Antônio (Humano)',
    humanDesc: 'Pele clara, cabelo curto bem alinhado, jaqueta escolar e saltos acrobáticos.',
    tagline: 'Majestoso nos ares, dono dos telhados e pátios.',
    abilityName: 'PLANAR CELESTE',
    abilityDesc: 'Impulso aéreo poderoso para alcançar telhados, caixas d’água e sobrevoar a escola.',
    passiveDesc: 'Segure Espaço no ar para planar suavemente sem perder controle.',
    accentHex: '#10B981',
    speed: 9.0,
    sprintMultiplier: 1.5,
    jumpForce: 12.0,
    gravityScale: 0.85,
    canClimb: false,
    canHideSmall: false,
    canGlide: true,
    abilityCooldown: 5.5,
    height: 1.4,
    radius: 0.52,
  },
};

export const SCHEDULE_PHASES: SchedulePhaseInfo[] = [
  {
    id: 'arrival',
    label: 'Chegada na Escola',
    description: 'Ônibus chegando, alunos entrando pelo portão principal.',
    startHour: 7,
    endHour: 8,
    skyTint: '#87CEFA',
    bellChime: true,
  },
  {
    id: 'morning_classes',
    label: 'Aulas da Manhã',
    description: 'Turmas nas 22 salas. Professores de olho nos corredores!',
    startHour: 8,
    endHour: 10,
    skyTint: '#60B6F7',
    bellChime: true,
  },
  {
    id: 'recess',
    label: 'Recreio Geral',
    description: 'Pátio, parquinho, campo e quadra lotados de energia!',
    startHour: 10,
    endHour: 11,
    skyTint: '#4DA6FF',
    bellChime: true,
  },
  {
    id: 'lunch',
    label: 'Almoço no Refeitório',
    description: 'Filas no refeitório, bandejas servidas e risco de guerra de comida.',
    startHour: 11,
    endHour: 13,
    skyTint: '#7EC8FF',
    bellChime: true,
  },
  {
    id: 'afternoon_classes',
    label: 'Aulas da Tarde',
    description: 'Laboratórios e salas em atividade. Hora perfeita para pegadinhas.',
    startHour: 13,
    endHour: 16,
    skyTint: '#FDBA74',
    bellChime: true,
  },
  {
    id: 'dismissal',
    label: 'Sinal da Saída',
    description: 'Mochilas nas costas, corrida até o portão e ruas vizinhas!',
    startHour: 16,
    endHour: 17.5,
    skyTint: '#FB923C',
    bellChime: true,
  },
  {
    id: 'after_school',
    label: 'Pós-Aula Livre',
    description: 'Treino no ginásio, biblioteca tranquila e exploração noturna.',
    startHour: 17.5,
    endHour: 24,
    skyTint: '#3B4D7A',
    bellChime: false,
  },
];

export const ACTION_VERBS: ActionVerb[] = [
  'throw', 'push', 'quack_blast', 'sneak_climb', 'sky_swoop', 'trigger_alarm',
  'mix_chemicals', 'score_goal', 'hide_inside', 'pull_chair', 'ring_bell', 'spill_tray',
  'blast_speaker', 'open_passage', 'taunt_npc', 'distract_teacher', 'rummage_locker', 'swap_sign',
];

export const PROP_KINDS: PropKind[] = [
  'soccer_ball', 'basketball', 'cafeteria_tray', 'trash_can', 'chair', 'desk',
  'fire_extinguisher', 'fire_alarm', 'beaker', 'computer', 'book', 'speaker',
  'plant_pot', 'traffic_cone', 'janitor_cart', 'megaphone', 'trophy', 'bicycle',
  'locker', 'water_fountain', 'hose', 'chalkboard', 'radio', 'master_key',
];

export const NPC_PERSONALITIES: NpcPersonality[] = [
  'nerd', 'atleta', 'bagunceiro', 'rigido', 'distraido', 'brava',
  'simpatica', 'desconfiado', 'monitor', 'artista', 'musico', 'fofoqueiro',
];

export const CHAIN_REACTIONS: ChainReactionOutcome[] = [
  'corridor_crowd', 'tag_chase', 'food_fight', 'false_alarm', 'rooftop_escape',
  'pitch_invasion', 'principal_commotion', 'foam_eruption', 'obstacle_frenzy', 'cheering_circle',
];

/**
 * Total procedural interaction matrix size:
 * 3 characters * 18 actions * 24 props * 7 schedule phases * 12 NPC personalities * 10 chain outcomes = 1,088,640 combinations.
 */
export const TOTAL_PROCEDURAL_COMBINATIONS =
  3 * ACTION_VERBS.length * PROP_KINDS.length * SCHEDULE_PHASES.length * NPC_PERSONALITIES.length * CHAIN_REACTIONS.length;

const VERB_PT: Record<ActionVerb, string> = {
  throw: 'Arremesso Maluco',
  push: 'Empurrão Estratégico',
  quack_blast: 'Quack Sônico',
  sneak_climb: 'Escalada Furtiva',
  sky_swoop: 'Rasante Aéreo',
  trigger_alarm: 'Alarme Disparado',
  mix_chemicals: 'Mistura Explosiva',
  score_goal: 'Golaço Escolar',
  hide_inside: 'Esconderijo Ninja',
  pull_chair: 'Cadeira Puxada',
  ring_bell: 'Sino Fora de Hora',
  spill_tray: 'Bandeja Voadora',
  blast_speaker: 'Som no Talento',
  open_passage: 'Passagem Secreta',
  taunt_npc: 'Provocação Cômica',
  distract_teacher: 'Distração Perfeita',
  rummage_locker: 'Vasculhar Armário',
  swap_sign: 'Placa Trocada',
};

const PROP_PT: Record<PropKind, string> = {
  soccer_ball: 'Bola de Futebol',
  basketball: 'Bola de Basquete',
  cafeteria_tray: 'Bandeja do Lanche',
  trash_can: 'Lixeira',
  chair: 'Cadeira Escolar',
  desk: 'Carteira',
  fire_extinguisher: 'Extintor de Espuma',
  fire_alarm: 'Alarme de Incêndio',
  beaker: 'Béquer de Química',
  computer: 'Computador do Lab',
  book: 'Livro Gigante',
  speaker: 'Caixa de Som',
  plant_pot: 'Vaso de Planta',
  traffic_cone: 'Cone Laranja',
  janitor_cart: 'Carrinho do Zelador',
  megaphone: 'Megafone da Diretoria',
  trophy: 'Troféu Dourado',
  bicycle: 'Bicicleta',
  locker: 'Armário Metálico',
  water_fountain: 'Bebedouro',
  hose: 'Mangueira do Jardim',
  chalkboard: 'Quadro Negro',
  radio: 'Rádio Portátil',
  master_key: 'Chave Mestra',
  door: 'Porta da Sala',
  secret_hatch: 'Alçapão Secreto',
};

const PERSONALITY_REACTIONS: Record<NpcPersonality, string> = {
  nerd: 'anota a física do caos no caderno',
  atleta: 'sai correndo tentando bater o recorde',
  bagunceiro: 'aplaude e chama a galera toda',
  rigido: 'apita furioso pedindo ordem imediata',
  distraido: 'olha para o teto sem entender nada',
  brava: 'ameaça advertência tripla no boletim',
  simpatica: 'dá risada escondendo o sorriso',
  desconfiado: 'espia atrás da coluna procurando o culpado',
  monitor: 'tenta organizar uma fila no meio da bagunça',
  artista: 'acha a cena inspiradora e começa a desenhar',
  musico: 'improvisa uma batucada na mesa',
  fofoqueiro: 'já espalha a notícia pelo corredor inteiro',
};

const OUTCOME_DESCRIPTIONS: Record<ChainReactionOutcome, string> = {
  corridor_crowd: 'O corredor lota de alunos curiosos bloqueando a passagem!',
  tag_chase: 'Começa um pega-pega generalizado pelos blocos!',
  food_fight: 'Bandejas e sucos voam em câmera lenta pelo pátio!',
  false_alarm: 'A sirene toca e todo mundo corre para fora achando que é simulado!',
  rooftop_escape: 'A atenção sobe para os telhados enquanto a turma olha para cima!',
  pitch_invasion: 'A torcida invade o campo gritando gol fora de hora!',
  principal_commotion: 'A Diretora aparece no megafone tentando acalmar o caos!',
  foam_eruption: 'Uma nuvem de espuma cômica toma conta do ambiente!',
  obstacle_frenzy: 'Carteiras e cones viram pista de obstáculos improvisada!',
  cheering_circle: 'Uma roda de aplausos e risadas se forma na hora!',
};

export interface ProceduralInteractionInput {
  characterId: CharacterId;
  verb: ActionVerb;
  prop: PropKind;
  phase: SchedulePhaseId;
  personality: NpcPersonality;
  zoneName: string;
  seedOffset?: number;
}

export interface ProceduralInteractionResult {
  comboHash: string;
  title: string;
  description: string;
  outcome: ChainReactionOutcome;
  chaosPoints: number;
  npcPanicBoost: number;
}

export function evaluateSchedulePhase(schoolMinutes: number): SchedulePhaseInfo {
  const normalized = ((schoolMinutes % 1440) + 1440) % 1440;
  const hour = normalized / 60;
  for (const phase of SCHEDULE_PHASES) {
    if (hour >= phase.startHour && hour < phase.endHour) {
      return phase;
    }
  }
  return SCHEDULE_PHASES[0];
}

export function formatSchoolClock(schoolMinutes: number): string {
  const normalized = ((Math.floor(schoolMinutes) % 1440) + 1440) % 1440;
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function computeInteractionOutcome(
  input: ProceduralInteractionInput,
): ProceduralInteractionResult {
  const cIdx = input.characterId === 'rat' ? 0 : input.characterId === 'duck' ? 1 : 2;
  const vIdx = Math.max(0, ACTION_VERBS.indexOf(input.verb));
  const pIdx = Math.max(0, PROP_KINDS.indexOf(input.prop));
  const sIdx = Math.max(0, SCHEDULE_PHASES.findIndex((s) => s.id === input.phase));
  const nIdx = Math.max(0, NPC_PERSONALITIES.indexOf(input.personality));

  // Deterministic outcome index from all 5 axes + optional spatial seed
  const hashNum =
    (cIdx * 7919 +
      vIdx * 104729 +
      pIdx * 3571 +
      sIdx * 613 +
      nIdx * 197 +
      (input.seedOffset ?? 0)) >>>
    0;
  const oIdx = hashNum % CHAIN_REACTIONS.length;
  const outcome = CHAIN_REACTIONS[oIdx];

  const comboHash = `${cIdx}-${vIdx}-${pIdx}-${sIdx}-${nIdx}-${oIdx}`;
  const charName = CHARACTERS[input.characterId].shortName;
  const verbLabel = VERB_PT[input.verb];
  const propLabel = PROP_PT[input.prop] ?? 'Objeto';
  const personalityLine = PERSONALITY_REACTIONS[input.personality];
  const outcomeLine = OUTCOME_DESCRIPTIONS[outcome];

  // Character synergy multipliers
  let basePoints = 25 + ((vIdx * 7 + pIdx * 5) % 45);
  if (input.characterId === 'duck' && (input.verb === 'quack_blast' || input.verb === 'distract_teacher')) {
    basePoints = Math.round(basePoints * 1.45);
  } else if (input.characterId === 'rat' && (input.verb === 'sneak_climb' || input.verb === 'open_passage')) {
    basePoints = Math.round(basePoints * 1.4);
  } else if (input.characterId === 'eagle' && (input.verb === 'sky_swoop' || input.verb === 'throw')) {
    basePoints = Math.round(basePoints * 1.35);
  }

  // Schedule multiplier: peak crowds during recess & lunch create bigger chain reactions
  const crowdBonus = input.phase === 'recess' || input.phase === 'lunch' ? 1.3 : 1.0;
  const chaosPoints = Math.round(basePoints * crowdBonus);
  const npcPanicBoost =
    outcome === 'false_alarm' || outcome === 'tag_chase' || outcome === 'principal_commotion'
      ? 22
      : 10;

  return {
    comboHash,
    title: `${charName}: ${verbLabel} (${propLabel})`,
    description: `Em ${input.zoneName}, alguém ${personalityLine}. ${outcomeLine}`,
    outcome,
    chaosPoints,
    npcPanicBoost,
  };
}

export function calculateSlapstickKnockback(
  sourcePos: { x: number; y: number; z: number },
  targetPos: { x: number; y: number; z: number },
  power: number,
): { vx: number; vy: number; vz: number } {
  const dx = targetPos.x - sourcePos.x;
  const dz = targetPos.z - sourcePos.z;
  const len = Math.hypot(dx, dz) || 1;
  return {
    vx: (dx / len) * power,
    vy: Math.max(4.5, power * 0.55),
    vz: (dz / len) * power,
  };
}
