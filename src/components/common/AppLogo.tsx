import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AppLogoProps['size']>, string> = {
  xs: 'w-8 h-8 rounded-lg',
  sm: 'w-10 h-10 rounded-xl',
  md: 'w-12 h-12 rounded-xl',
  lg: 'w-14 h-14 rounded-2xl',
  xl: 'w-20 h-20 rounded-2xl',
};

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'sm',
  showText = false,
  showSubtitle = false,
  className = '',
}) => {
  const iconBoxClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;
  const uid = React.useId().replace(/:/g, '');

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <div
        className={`${iconBoxClass} relative overflow-hidden shrink-0 shadow-sm ring-1 ring-sky-400/40 bg-[#061224] flex items-center justify-center`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 256"
          className="w-full h-full"
          fill="none"
          aria-label="Logo PromptForge IA"
        >
          <defs>
            <radialGradient id={`bgGlow-${uid}`} cx="50%" cy="48%" r="54%">
              <stop offset="0%" stopColor="#0F3057" />
              <stop offset="55%" stopColor="#08182B" />
              <stop offset="100%" stopColor="#050C16" />
            </radialGradient>

            <linearGradient id={`cyanNeon-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E0F7FF" />
              <stop offset="45%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <linearGradient id={`fireGold-${uid}`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id={`anvilMetal-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="45%" stopColor="#334155" />
              <stop offset="85%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id={`anvilRim-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="35%" stopColor="#FEF08A" />
              <stop offset="70%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>

            <radialGradient id={`sparkBurst-${uid}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="30%" stopColor="#FDE047" stopOpacity="0.95" />
              <stop offset="65%" stopColor="#F97316" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#EA580C" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Fond Bleu Nuit Profond */}
          <rect
            x="4"
            y="4"
            width="248"
            height="248"
            rx="44"
            fill={`url(#bgGlow-${uid})`}
          />

          {/* Réseau neuronal géométrique en arrière-plan */}
          <g stroke="#38BDF8" strokeWidth="2.2" strokeOpacity="0.6">
            <polygon
              points="128,24 198,56 218,126 186,192 70,192 38,126 58,56"
              fill="none"
            />
            <line x1="128" y1="24" x2="94" y2="54" />
            <line x1="128" y1="24" x2="162" y2="54" />
            <line x1="58" y1="56" x2="94" y2="54" />
            <line x1="198" y1="56" x2="162" y2="54" />
            <line x1="38" y1="126" x2="70" y2="112" />
            <line x1="218" y1="126" x2="186" y2="112" />
          </g>

          {/* Nœuds lumineux de la constellation */}
          <g fill="#38BDF8">
            <circle cx="128" cy="24" r="4.5" />
            <circle cx="198" cy="56" r="5" />
            <circle cx="218" cy="126" r="4" />
            <circle cx="186" cy="192" r="4.5" />
            <circle cx="70" cy="192" r="4.5" />
            <circle cx="38" cy="126" r="4" />
            <circle cx="58" cy="56" r="5" />
          </g>

          {/* Lettre "P" (Gauche, Bleu Cyan Néon) */}
          <path
            d="M62 124 V64 H92 C107 64 116 72 116 85 C116 98 107 106 92 106 H77 V124 Z M77 77 V93 H90 C97 93 101 90 101 85 C101 80 97 77 90 77 Z"
            fill={`url(#cyanNeon-${uid})`}
            stroke="#E0F2FE"
            strokeWidth="1.5"
          />

          {/* Lettre "F" avec flèche centrale (Centre-Droit, Or/Orange incandescent) */}
          <path
            d="M140 124 V64 H178 V77 H155 V89 H169 V84 L182 95 L169 106 V101 H155 V124 Z"
            fill={`url(#fireGold-${uid})`}
            stroke="#FEF08A"
            strokeWidth="1.5"
          />

          {/* Lettre "A" (Droite, Bleu Cyan Néon) */}
          <path
            d="M174 128 L194 72 H209 L229 128 H214 L210 115 H192 L188 128 Z M195 104 H207 L201 86 Z"
            fill={`url(#cyanNeon-${uid})`}
            stroke="#E0F2FE"
            strokeWidth="1.5"
          />

          {/* Éclair central frappant l'enclume */}
          <path
            d="M142 32 L110 88 H128 L114 134 L154 78 H135 Z"
            fill={`url(#fireGold-${uid})`}
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />

          {/* Halo d'étincelles de forge sur l'enclume */}
          <circle cx="125" cy="134" r="32" fill={`url(#sparkBurst-${uid})`} />

          {/* Rayons d'étincelles */}
          <g stroke="#FEF08A" strokeWidth="2.5" strokeLinecap="round">
            <line x1="125" y1="134" x2="94" y2="115" />
            <line x1="125" y1="134" x2="156" y2="115" />
            <line x1="125" y1="134" x2="103" y2="104" />
            <line x1="125" y1="134" x2="147" y2="106" />
          </g>

          {/* Enclume de forge métallique */}
          <g>
            {/* Bigorne gauche de l'enclume */}
            <path
              d="M48 136 H94 V162 C72 162 55 151 48 136 Z"
              fill={`url(#anvilMetal-${uid})`}
              stroke="#94A3B8"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M54 140 C60 151 73 157 90 157"
              stroke="#F97316"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Corps principal et pied de l'enclume */}
            <path
              d="M94 132 H200 V147 C185 149 167 157 161 174 L169 200 H182 V218 H84 V200 H97 L105 174 C101 159 97 149 94 147 Z"
              fill={`url(#anvilMetal-${uid})`}
              stroke="#CBD5E1"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Ligne supérieure incandescente de l'enclume */}
            <line
              x1="94"
              y1="133"
              x2="200"
              y2="133"
              stroke={`url(#anvilRim-${uid})`}
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Socles gauche et droit */}
            <rect
              x="82"
              y="200"
              width="28"
              height="18"
              rx="3"
              fill="#1E293B"
              stroke="#F97316"
              strokeWidth="2.2"
            />
            <rect
              x="156"
              y="200"
              width="28"
              height="18"
              rx="3"
              fill="#1E293B"
              stroke="#38BDF8"
              strokeWidth="2.2"
            />
            {/* Arche centrale du socle */}
            <path
              d="M115 218 C115 200 151 200 151 218 Z"
              fill="#050C16"
              stroke="#475569"
              strokeWidth="2"
            />
          </g>

          {/* Particules incandescentes */}
          <g>
            <circle cx="105" cy="48" r="3" fill="#F97316" />
            <circle cx="149" cy="46" r="3" fill="#FACC15" />
            <circle cx="80" cy="174" r="3" fill="#F97316" />
            <circle cx="178" cy="170" r="3" fill="#38BDF8" />
            <circle cx="125" cy="164" r="2.5" fill="#FDE047" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none min-w-0">
          <div className="font-display font-extrabold tracking-tight text-sm sm:text-base flex items-center">
            <span className="text-[var(--text-main)]">PROMPT</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 bg-clip-text text-transparent">
              FORGE
            </span>
            <span className="ml-1 text-xs font-mono font-bold text-sky-400">IA</span>
          </div>
          {showSubtitle && (
            <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--text-secondary)] mt-1 truncate">
              Intelligence Artificielle
            </span>
          )}
        </div>
      )}
    </div>
  );
};
