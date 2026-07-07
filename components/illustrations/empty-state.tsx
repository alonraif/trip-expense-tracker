export function EmptyStateIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="80"
        cy="80"
        r="54"
        stroke="currentColor"
        strokeWidth="3"
        className="text-muted-foreground/30"
      />
      <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-muted-foreground/30">
        <line x1="80" y1="20" x2="80" y2="30" />
        <line x1="80" y1="130" x2="80" y2="140" />
        <line x1="20" y1="80" x2="30" y2="80" />
        <line x1="130" y1="80" x2="140" y2="80" />
      </g>
      <g className="text-primary">
        <path d="M100 55 L88 78 L60 105 L72 82 Z" fill="currentColor" />
        <path d="M100 55 L88 78 L72 82 Z" fill="currentColor" opacity="0.5" />
        <circle cx="80" cy="80" r="4" fill="currentColor" />
      </g>
    </svg>
  );
}
