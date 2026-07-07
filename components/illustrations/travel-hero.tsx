export function TravelHero({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g className="text-primary" stroke="currentColor" strokeWidth="3">
        <circle cx="190" cy="40" r="18" />
        <g strokeLinecap="round">
          <line x1="190" y1="10" x2="190" y2="2" />
          <line x1="190" y1="70" x2="190" y2="78" />
          <line x1="160" y1="40" x2="152" y2="40" />
          <line x1="220" y1="40" x2="228" y2="40" />
          <line x1="169" y1="19" x2="163" y2="13" />
          <line x1="211" y1="61" x2="217" y2="67" />
          <line x1="169" y1="61" x2="163" y2="67" />
          <line x1="211" y1="19" x2="217" y2="13" />
        </g>
      </g>

      <path
        d="M20 140 Q 80 100 120 120 T 200 90"
        stroke="currentColor"
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        className="text-secondary"
      />

      <g className="text-secondary">
        <path
          d="M200 90c0-9-7-16-16-16s-16 7-16 16c0 12 16 26 16 26s16-14 16-26Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="184" cy="88" r="4" fill="currentColor" />
      </g>

      <g className="text-primary">
        <rect
          x="40"
          y="80"
          width="70"
          height="55"
          rx="8"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          d="M62 80v-10a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="40" y1="105" x2="110" y2="105" stroke="currentColor" strokeWidth="3" />
        <line
          x1="75"
          y1="80"
          x2="75"
          y2="135"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.5"
        />
      </g>
    </svg>
  );
}
