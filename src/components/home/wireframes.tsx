'use client';

export function WireframeBento() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="8" y="8" width="88" height="60" stroke="#D4A84B" strokeWidth="1.2" opacity="0.7" />
      <rect x="8" y="74" width="42" height="58" stroke="#D4A84B" strokeWidth="1.2" opacity="0.5" />
      <rect x="56" y="74" width="40" height="28" stroke="#D4A84B" strokeWidth="1.2" opacity="0.6" />
      <rect x="56" y="108" width="40" height="24" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.05" opacity="0.5" />
      <rect x="102" y="8" width="90" height="40" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.04" opacity="0.6" />
      <rect x="102" y="54" width="90" height="78" stroke="#D4A84B" strokeWidth="1.2" opacity="0.7" />
      <line x1="16" y1="20" x2="60" y2="20" stroke="#D4A84B" strokeWidth="0.6" opacity="0.3" />
      <line x1="16" y1="28" x2="48" y2="28" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <line x1="110" y1="70" x2="170" y2="70" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <line x1="110" y1="78" x2="155" y2="78" stroke="#D4A84B" strokeWidth="0.6" opacity="0.15" />
      <circle cx="118" cy="28" r="10" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

export function WireframeIceberg() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <path d="M0 55 Q50 50 100 55 Q150 60 200 55" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" strokeDasharray="4 3" />
      <polygon points="100,12 120,55 80,55" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.06" opacity="0.8" />
      <polygon points="65,58 135,58 155,95 145,125 55,125 45,95" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.04" opacity="0.6" />
      <line x1="72" y1="72" x2="128" y2="72" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <line x1="68" y1="86" x2="132" y2="86" stroke="#D4A84B" strokeWidth="0.6" opacity="0.15" />
      <line x1="62" y1="100" x2="138" y2="100" stroke="#D4A84B" strokeWidth="0.6" opacity="0.15" />
      <line x1="58" y1="114" x2="142" y2="114" stroke="#D4A84B" strokeWidth="0.6" opacity="0.12" />
      <line x1="122" y1="35" x2="155" y2="25" stroke="#D4A84B" strokeWidth="0.5" opacity="0.3" />
      <line x1="155" y1="25" x2="178" y2="25" stroke="#D4A84B" strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

export function WireframeHubSpoke() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <polygon points="100,45 118,52 125,70 118,88 100,95 82,88 75,70 82,52" stroke="#D4A84B" strokeWidth="1.4" fill="#D4A84B" fillOpacity="0.06" opacity="0.8" />
      <circle cx="100" cy="70" r="6" fill="#D4A84B" fillOpacity="0.3" />
      {[[40, 25], [160, 25], [170, 105], [30, 105], [100, 130]].map(([cx, cy], i) => (
        <g key={i}>
          <line x1={100} y1={70} x2={cx} y2={cy} stroke="#D4A84B" strokeWidth="0.8" opacity="0.25" strokeDasharray="3 2" />
          <circle cx={cx} cy={cy} r="10" stroke="#D4A84B" strokeWidth="1" opacity="0.5" />
          <circle cx={cx} cy={cy} r="3" fill="#D4A84B" fillOpacity="0.25" />
        </g>
      ))}
    </svg>
  );
}

export function WireframeTimeline() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <path d="M10 70 Q40 40 70 70 Q100 100 130 70 Q160 40 190 70" stroke="#D4A84B" strokeWidth="1.2" opacity="0.5" fill="none" />
      {[30, 70, 110, 150, 190].map((x, i) => {
        return (
          <g key={i}>
            <rect x={x - 6} y={64} width="12" height="12" stroke="#D4A84B" strokeWidth="1" fill="#D4A84B" fillOpacity={i === 2 ? 0.15 : 0.05} opacity="0.7" transform={`rotate(45 ${x} 70)`} />
            <line x1={x} y1={i % 2 === 0 ? 30 : 46} x2={x} y2={58} stroke="#D4A84B" strokeWidth="0.5" opacity="0.2" />
            <line x1={x - 12} y1={i % 2 === 0 ? 26 : 42} x2={x + 12} y2={i % 2 === 0 ? 26 : 42} stroke="#D4A84B" strokeWidth="0.5" opacity="0.15" />
            <line x1={x} y1={82} x2={x} y2={i % 2 === 0 ? 105 : 98} stroke="#D4A84B" strokeWidth="0.5" opacity="0.2" />
            <line x1={x - 14} y1={i % 2 === 0 ? 108 : 102} x2={x + 14} y2={i % 2 === 0 ? 108 : 102} stroke="#D4A84B" strokeWidth="0.5" opacity="0.12" />
          </g>
        );
      })}
    </svg>
  );
}

export function WireframeDashboard() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="8" y="8" width="184" height="16" stroke="#D4A84B" strokeWidth="1" opacity="0.4" />
      <circle cx="18" cy="16" r="3" fill="#D4A84B" fillOpacity="0.3" />
      <line x1="28" y1="16" x2="70" y2="16" stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
      <rect x="8" y="30" width="120" height="72" stroke="#D4A84B" strokeWidth="1.2" opacity="0.6" />
      {[20, 38, 56, 74, 92, 110].map((x, i) => (
        <rect key={i} x={x} y={102 - [30, 45, 35, 55, 40, 50][i]} width="10" height={[30, 45, 35, 55, 40, 50][i]} fill="#D4A84B" fillOpacity={0.08 + i * 0.02} stroke="#D4A84B" strokeWidth="0.5" opacity="0.5" />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="136" y={30 + i * 26} width="56" height="20" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
          <line x1="142" y1={38 + i * 26} x2="168" y2={38 + i * 26} stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
          <line x1="142" y1={44 + i * 26} x2="158" y2={44 + i * 26} stroke="#D4A84B" strokeWidth="0.4" opacity="0.15" />
        </g>
      ))}
      <rect x="8" y="108" width="88" height="24" stroke="#D4A84B" strokeWidth="0.8" opacity="0.35" />
      <rect x="102" y="108" width="90" height="24" stroke="#D4A84B" strokeWidth="0.8" opacity="0.35" />
    </svg>
  );
}

export function WireframeTree() {
  return (
    <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
      <rect x="80" y="8" width="40" height="18" stroke="#D4A84B" strokeWidth="1.2" fill="#D4A84B" fillOpacity="0.06" opacity="0.8" />
      <line x1="88" y1="16" x2="110" y2="16" stroke="#D4A84B" strokeWidth="0.6" opacity="0.3" />
      <line x1="100" y1="26" x2="100" y2="38" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
      <line x1="40" y1="38" x2="160" y2="38" stroke="#D4A84B" strokeWidth="0.8" opacity="0.3" />
      {[40, 100, 160].map((x, i) => (
        <g key={i}>
          <line x1={x} y1={38} x2={x} y2={48} stroke="#D4A84B" strokeWidth="0.8" opacity="0.3" />
          <rect x={x - 18} y={48} width="36" height="14" stroke="#D4A84B" strokeWidth="1" opacity="0.6" />
          <line x1={x - 12} y1={54} x2={x + 10} y2={54} stroke="#D4A84B" strokeWidth="0.5" opacity="0.2" />
        </g>
      ))}
      {[20, 60, 80, 120, 140, 180].map((x, i) => (
        <g key={i}>
          <line x1={[40, 40, 100, 100, 160, 160][i]} y1={62} x2={x} y2={78} stroke="#D4A84B" strokeWidth="0.6" opacity="0.2" />
          <rect x={x - 14} y={78} width="28" height="12" stroke="#D4A84B" strokeWidth="0.8" opacity="0.4" />
        </g>
      ))}
      {[15, 35, 55, 75, 95, 115, 135, 155, 175].map((x, i) => (
        <g key={i}>
          <line x1={[20, 20, 60, 80, 80, 120, 140, 180, 180][i]} y1={90} x2={x} y2={105} stroke="#D4A84B" strokeWidth="0.4" opacity="0.15" />
          <circle cx={x} cy={110} r="5" stroke="#D4A84B" strokeWidth="0.6" opacity="0.3" />
        </g>
      ))}
    </svg>
  );
}
