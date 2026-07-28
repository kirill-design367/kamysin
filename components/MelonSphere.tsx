/**
 * Декоративный объёмный арбуз-шар (SVG). Радиальная растушёвка даёт объём,
 * меридианы-полоски и блик — «арбузность» и глянец. Используется в фоне с параллаксом.
 */
export default function MelonSphere({ k = '0', className = '' }: { k?: string; className?: string }) {
  const s = `sph-${k}`, h = `hl-${k}`, c = `clip-${k}`;
  const stripes = [
    'M50 4 C30 26,30 74,50 96',
    'M41 5 C22 27,22 73,41 95',
    'M32 8 C13 30,13 70,32 92',
    'M59 5 C78 27,78 73,59 95',
    'M68 8 C87 30,87 70,68 92',
  ];
  return (
    <svg className={className} viewBox="0 0 100 100" role="img" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={s} cx="0.34" cy="0.28" r="0.85">
          <stop offset="0" stopColor="#4ac673" />
          <stop offset="0.45" stopColor="#2c9a4f" />
          <stop offset="0.8" stopColor="#15702f" />
          <stop offset="1" stopColor="#0a4a1f" />
        </radialGradient>
        <radialGradient id={h} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <clipPath id={c}><circle cx="50" cy="50" r="46" /></clipPath>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#${s})`} />
      <g clipPath={`url(#${c})`} stroke="#0c4321" strokeWidth="4.4" strokeLinecap="round" fill="none" opacity="0.5">
        {stripes.map((d, i) => <path key={i} d={d} />)}
      </g>
      <ellipse cx="34" cy="27" rx="19" ry="12" fill={`url(#${h})`} transform="rotate(-22 34 27)" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#083815" strokeOpacity="0.35" strokeWidth="1.5" />
    </svg>
  );
}
