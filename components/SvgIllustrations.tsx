export const TricolorWaveHeader = () => (
  <svg viewBox="0 0 1200 120" className="w-full h-auto" aria-hidden="true">
    <defs>
      <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FF9933" />
        <stop offset="33%" stopColor="#FFFFFF" />
        <stop offset="66%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#138808" />
      </linearGradient>
    </defs>
    
    {/* Saffron wave */}
    <path
      d="M 0,80 Q 150,60 300,80 T 600,80 T 900,80 T 1200,80 L 1200,120 L 0,120 Z"
      fill="#FF9933"
    />
    
    {/* White middle section */}
    <rect x="0" y="50" width="1200" height="30" fill="#FFFFFF" opacity="0.3" />
    
    {/* Green wave */}
    <path
      d="M 0,100 Q 150,85 300,100 T 600,100 T 900,100 T 1200,100 L 1200,120 L 0,120 Z"
      fill="#138808"
    />
  </svg>
);

export const DelhiSkylineLineArt = () => (
  <svg viewBox="0 0 800 200" className="w-full h-auto" aria-hidden="true">
    <defs>
      <linearGradient id="skyline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#B0E8D4" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0B7DBA" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Skyline silhouette */}
    <path
      d="M 0,150 L 50,120 L 50,150 L 100,90 L 100,150 L 150,110 L 150,150 L 200,80 L 200,150 L 250,100 L 250,150 L 300,70 L 300,150 L 350,95 L 350,150 L 400,75 L 400,150 L 450,105 L 450,150 L 500,85 L 500,150 L 550,115 L 550,150 L 600,90 L 600,150 L 650,110 L 650,150 L 700,85 L 700,150 L 750,100 L 750,150 L 800,80 L 800,150 L 800,200 L 0,200 Z"
      fill="url(#skyline-gradient)"
      stroke="#138808"
      strokeWidth="2"
    />
    
    {/* Subtle window details */}
    {Array.from({ length: 8 }).map((_, i) => (
      <g key={i}>
        <rect x={i * 100 + 10} y="95" width="8" height="8" fill="#0B7DBA" opacity="0.3" />
        <rect x={i * 100 + 25} y="95" width="8" height="8" fill="#0B7DBA" opacity="0.3" />
      </g>
    ))}
  </svg>
);

export const AshokaChakraWatermark = ({ opacity = 0.08 }) => (
  <svg
    viewBox="0 0 100 100"
    className="absolute top-0 right-16 w-48 h-48 pointer-events-none text-foreground dark:text-white"
    style={{ opacity, zIndex: 0 }}
    aria-hidden="true"
  >
    {/* Outer circle */}
    <circle
      cx="50"
      cy="50"
      r="48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    />

    {/* 24 spokes for Ashoka Chakra */}
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const rad = (angle * Math.PI) / 180;
      const x2 = 50 + 45 * Math.cos(rad);
      const y2 = 50 + 45 * Math.sin(rad);
      return (
        <line
          key={i}
          x1="50"
          y1="50"
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth="1"
        />
      );
    })}

    {/* Inner circle */}
    <circle cx="50" cy="50" r="5" fill="currentColor" />
  </svg>
);

export const DelhiSkylineLineArt = () => (
  <svg viewBox="0 0 800 200" className="w-full h-auto">
    <defs>
      <linearGradient id="skyline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#B0E8D4" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#0B7DBA" stopOpacity="0.1" />
      </linearGradient>
    </defs>
    
    {/* Skyline silhouette */}
    <path
      d="M 0,150 L 50,120 L 50,150 L 100,90 L 100,150 L 150,110 L 150,150 L 200,80 L 200,150 L 250,100 L 250,150 L 300,70 L 300,150 L 350,95 L 350,150 L 400,75 L 400,150 L 450,105 L 450,150 L 500,85 L 500,150 L 550,115 L 550,150 L 600,90 L 600,150 L 650,110 L 650,150 L 700,85 L 700,150 L 750,100 L 750,150 L 800,80 L 800,150 L 800,200 L 0,200 Z"
      fill="url(#skyline-gradient)"
      stroke="#138808"
      strokeWidth="2"
    />
    
    {/* Subtle window details */}
    {Array.from({ length: 8 }).map((_, i) => (
      <g key={i}>
        <rect x={i * 100 + 10} y="95" width="8" height="8" fill="#0B7DBA" opacity="0.3" />
        <rect x={i * 100 + 25} y="95" width="8" height="8" fill="#0B7DBA" opacity="0.3" />
      </g>
    ))}
  </svg>
);

export const JaliPatternBackground = () => (
  <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-5">
    <defs>
      <pattern id="jali-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Geometric jali pattern */}
        <circle cx="20" cy="20" r="4" fill="#0B1B3A" />
        <path d="M 20,20 L 30,10 L 30,30 L 20,20 L 10,10 L 10,30 Z" fill="none" stroke="#0B1B3A" strokeWidth="0.5" />
        <circle cx="20" cy="20" r="12" fill="none" stroke="#0B1B3A" strokeWidth="0.5" opacity="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#jali-pattern)" />
  </svg>
);

export const ActivityIcon = ({
  type,
  className = 'w-6 h-6',
}: {
  type: 'running' | 'walking' | 'cycling' | 'yoga' | 'outdoor';
  className?: string;
}) => {
  const icons: Record<string, React.ReactNode> = {
    running: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13" cy="4" r="1.5" />
        <path d="M7.5 20l2-9 3 3 2-4 2 10" />
        <path d="M11 11l-1-4 4 1.5" />
      </svg>
    ),
    walking: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="1.5" />
        <path d="M9 20l1-5 2 2 1-5" />
        <path d="M7 9l5 1 2 4" />
      </svg>
    ),
    cycling: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="16" r="3" />
        <circle cx="18" cy="16" r="3" />
        <path d="M6 16l4-6h4l2 6" />
        <path d="M12 10V6" />
        <circle cx="12" cy="5" r="1.5" />
      </svg>
    ),
    yoga: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="4" r="1.5" />
        <path d="M12 6v4" />
        <path d="M8 14l4-4 4 4" />
        <path d="M6 18l2-4h8l2 4" />
      </svg>
    ),
    outdoor: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 18l9-12 9 12H3z" />
        <path d="M3 18h18" />
      </svg>
    ),
  };

  return <div className={className}>{icons[type]}</div>;
};

export const ActivityConditionTags: Record<string, { label: string; color: string }[]> = {
  running: [
    { label: 'Low AQI', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { label: 'Cool temp', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { label: 'Low wind', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  ],
  walking: [
    { label: 'Any weather', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    { label: 'Moderate AQI', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
  ],
  cycling: [
    { label: 'Low AQI', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { label: 'Low humidity', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    { label: 'No rain', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  ],
  yoga: [
    { label: 'Indoor ok', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { label: 'Calm wind', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  ],
  outdoor: [
    { label: 'Good air', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { label: 'Sunny', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { label: 'Clear skies', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
  ],
};

export const AQIIndicator = ({ category }: { category: string }) => {
  const colors: Record<string, { bg: string; text: string; emoji: string }> = {
    good: { bg: 'bg-green-100', text: 'text-green-700', emoji: '😊' },
    satisfactory: { bg: 'bg-emerald-100', text: 'text-emerald-700', emoji: '😌' },
    'moderately-polluted': { bg: 'bg-yellow-100', text: 'text-yellow-700', emoji: '😐' },
    poor: { bg: 'bg-orange-100', text: 'text-orange-700', emoji: '😷' },
    'very-poor': { bg: 'bg-red-100', text: 'text-red-700', emoji: '🤢' },
    severe: { bg: 'bg-red-200', text: 'text-red-800', emoji: '⚠️' },
  };

  const color = colors[category] || colors.good;

  return (
    <div className={`${color.bg} ${color.text} px-3 py-1 rounded-full text-sm font-medium`}>
      <span>{color.emoji}</span> {category.replace('-', ' ')}
    </div>
  );
};

export const OptimalWindowBadge = () => (
  <div className="inline-flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
    </svg>
    Best time to workout
  </div>
);
