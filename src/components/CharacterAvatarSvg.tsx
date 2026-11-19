import React from 'react';
import { CharacterId, UniverseMode } from '../game/types';

interface Props {
  characterId: CharacterId;
  universe?: UniverseMode;
  size?: number;
  className?: string;
}

export const CharacterAvatarSvg: React.FC<Props> = ({
  characterId,
  universe = 'animal',
  size = 44,
  className = '',
}) => {
  if (universe === 'human') {
    if (characterId === 'rat') {
      // HUMAN EMANUEL: White skin, noticeably LONG flowing dark-brown hair, red jacket
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
          <rect x="4" y="6" width="40" height="36" rx="8" fill="#450A0A" stroke="#0F172A" strokeWidth="2.5" />
          {/* Long flowing back/side hair down to shoulders */}
          <rect x="8" y="9" width="32" height="31" rx="7" fill="#3B2314" stroke="#0F172A" strokeWidth="1.8" />
          {/* Red school jacket shoulders */}
          <rect x="11" y="34" width="26" height="8" rx="3" fill="#B91C1C" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="20" y="34" width="8" height="8" fill="#F8FAFC" />
          {/* White skin face */}
          <rect x="14" y="14" width="20" height="20" rx="4" fill="#FFDFC4" stroke="#0F172A" strokeWidth="1.8" />
          {/* Long sweeping bangs & side locks */}
          <rect x="11" y="9" width="26" height="9" rx="3" fill="#3B2314" />
          <rect x="10" y="14" width="6" height="24" rx="2" fill="#4A2C19" />
          <rect x="32" y="14" width="6" height="24" rx="2" fill="#4A2C19" />
          {/* Eyes & smile */}
          <rect x="17" y="21" width="4" height="4.5" rx="1" fill="#1E293B" />
          <rect x="27" y="21" width="4" height="4.5" rx="1" fill="#1E293B" />
          <rect x="20" y="28" width="8" height="2.5" rx="1" fill="#991B1B" />
        </svg>
      );
    }

    if (characterId === 'duck') {
      // HUMAN PEDRO HENRIQUE: Brown skin, short textured fade/curly dark hair, sky-blue jacket
      return (
        <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
          <rect x="4" y="6" width="40" height="36" rx="8" fill="#0C4A6E" stroke="#0F172A" strokeWidth="2.5" />
          {/* Sky-blue jacket */}
          <rect x="11" y="34" width="26" height="8" rx="3" fill="#0284C7" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="20" y="34" width="8" height="8" fill="#FEF08A" />
          {/* Brown skin face */}
          <rect x="13" y="15" width="22" height="20" rx="4" fill="#8D5524" stroke="#0F172A" strokeWidth="1.8" />
          {/* Short textured curly/fade hair */}
          <rect x="13" y="9" width="22" height="8" rx="3" fill="#18181B" stroke="#0F172A" strokeWidth="1.5" />
          <rect x="15" y="7" width="18" height="4" rx="2" fill="#27272A" />
          {/* Eyes & smile */}
          <rect x="17" y="21" width="4" height="4.5" rx="1" fill="#0F172A" />
          <rect x="27" y="21" width="4" height="4.5" rx="1" fill="#0F172A" />
          <rect x="20" y="28" width="8" height="2.5" rx="1" fill="#451A03" />
        </svg>
      );
    }

    // HUMAN PEDRO ANTÔNIO: White skin, clearly SHORTER neat swept hairstyle, emerald jacket
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
        <rect x="4" y="6" width="40" height="36" rx="8" fill="#064E3B" stroke="#0F172A" strokeWidth="2.5" />
        {/* Emerald jacket */}
        <rect x="11" y="34" width="26" height="8" rx="3" fill="#047857" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="20" y="34" width="8" height="8" fill="#E2E8F0" />
        {/* White skin face */}
        <rect x="13" y="14" width="22" height="21" rx="4" fill="#FFDFC4" stroke="#0F172A" strokeWidth="1.8" />
        {/* Short neat swept dark-slate hair (clearly shorter than Emanuel) */}
        <rect x="13" y="10" width="22" height="7" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="20" y="9" width="13" height="4" rx="2" fill="#334155" />
        {/* Eyes & smile */}
        <rect x="17" y="21" width="4" height="4.5" rx="1" fill="#0284C7" />
        <rect x="27" y="21" width="4" height="4.5" rx="1" fill="#0284C7" />
        <rect x="20" y="28" width="8" height="2.5" rx="1" fill="#991B1B" />
      </svg>
    );
  }

  // ANIMAL WORLD AVATARS (Remastered)
  if (characterId === 'rat') {
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
        <rect x="4" y="6" width="40" height="36" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="8" y="8" width="11" height="12" rx="3" fill="#F472B6" stroke="#0F172A" strokeWidth="2" />
        <rect x="29" y="8" width="11" height="12" rx="3" fill="#F472B6" stroke="#0F172A" strokeWidth="2" />
        <rect x="11" y="15" width="26" height="21" rx="5" fill="#78716C" stroke="#0F172A" strokeWidth="2" />
        <rect x="16" y="24" width="16" height="12" rx="4" fill="#A8A29E" />
        <rect x="16" y="19" width="4" height="5" rx="1" fill="#0F172A" />
        <rect x="28" y="19" width="4" height="5" rx="1" fill="#0F172A" />
        <rect x="21" y="28" width="6" height="5" rx="2" fill="#EC4899" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="12" y="34" width="24" height="4" rx="1" fill="#EF4444" />
      </svg>
    );
  }

  if (characterId === 'duck') {
    return (
      <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
        <rect x="4" y="6" width="40" height="36" rx="8" fill="#0C4A6E" stroke="#0F172A" strokeWidth="2.5" />
        <rect x="11" y="14" width="26" height="24" rx="5" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2" />
        <rect x="10" y="9" width="28" height="9" rx="3" fill="#0284C7" stroke="#0F172A" strokeWidth="2" />
        <rect x="14" y="15" width="24" height="4" rx="1" fill="#0369A1" />
        <rect x="16" y="20" width="4" height="5" rx="1" fill="#0F172A" />
        <rect x="28" y="20" width="4" height="5" rx="1" fill="#0F172A" />
        <rect x="15" y="27" width="18" height="8" rx="3" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true">
      <rect x="4" y="6" width="40" height="36" rx="8" fill="#064E3B" stroke="#0F172A" strokeWidth="2.5" />
      <polygon points="12,16 16,6 21,16" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
      <polygon points="27,16 32,6 36,16" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
      <rect x="11" y="15" width="26" height="23" rx="5" fill="#CBD5E1" stroke="#0F172A" strokeWidth="2" />
      <rect x="13" y="28" width="22" height="9" rx="3" fill="#F8FAFC" />
      <rect x="15" y="20" width="5" height="4" rx="1" fill="#0F172A" />
      <rect x="28" y="20" width="5" height="4" rx="1" fill="#0F172A" />
      <rect x="20" y="24" width="8" height="9" rx="2" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
    </svg>
  );
};
