/**
 * Объёмный логотип-арбуз (долька) на чистом SVG: радиальные градиенты дают
 * объём мякоти, блик — глянец, тонкая обводка — сочность корки. Лёгкий, без 3D-движка.
 */
export default function MelonLogo({ k = 'a', className = 'melon-logo' }: { k?: string; className?: string }) {
  const flesh = `flesh-${k}`;
  const rind = `rind-${k}`;
  const gloss = `gloss-${k}`;
  const seeds = [
    { x: 18, y: 25, r: -18 },
    { x: 24, y: 27.5, r: 4 },
    { x: 30, y: 25, r: 20 },
    { x: 21, y: 31, r: -10 },
    { x: 27, y: 31, r: 12 },
  ];
  return (
    <svg className={className} viewBox="0 0 48 48" role="img" aria-label="Арбуз" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={rind} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3AA85D" />
          <stop offset="0.55" stopColor="#1E7A3D" />
          <stop offset="1" stopColor="#0F4F26" />
        </linearGradient>
        <radialGradient id={flesh} cx="0.38" cy="0.12" r="0.95">
          <stop offset="0" stopColor="#FF6E7B" />
          <stop offset="0.55" stopColor="#EA394F" />
          <stop offset="1" stopColor="#C0293C" />
        </radialGradient>
        <radialGradient id={gloss} cx="0.32" cy="0.05" r="0.6">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g transform="rotate(-12 24 24)">
        {/* корка */}
        <path d="M5 19 A19 19 0 0 1 43 19 Z" fill={`url(#${rind})`} />
        {/* тёмный ободок снизу для объёма */}
        <path d="M5 19 A19 19 0 0 1 43 19" fill="none" stroke="#0B3A1C" strokeWidth="0.8" opacity="0.6" />
        {/* белая прослойка */}
        <path d="M8 19 A16 16 0 0 1 40 19 Z" fill="#EEF5DA" />
        {/* мякоть */}
        <path d="M10.2 19 A13.8 13.8 0 0 1 37.8 19 Z" fill={`url(#${flesh})`} />
        {/* семечки */}
        {seeds.map((s, i) => (
          <ellipse key={i} cx={s.x} cy={s.y} rx="1.05" ry="1.9" fill="#231a12"
            transform={`rotate(${s.r} ${s.x} ${s.y})`} />
        ))}
        {/* глянец */}
        <path d="M10.2 19 A13.8 13.8 0 0 1 37.8 19 Z" fill={`url(#${gloss})`} />
        {/* блик-полоска у верхнего края мякоти */}
        <path d="M12 19.6 A11.8 11.8 0 0 1 36 19.6" fill="none" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="0.9" strokeLinecap="round" />
      </g>
    </svg>
  );
}
