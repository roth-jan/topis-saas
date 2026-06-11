/**
 * TOPIS Logomark — „Route-Mark": roter Kasten mit weißem L-Weg + zwei Knoten
 * (steht für Wegoptimierung). Themefähig über Tokens (fill-primary +
 * primary-foreground), skaliert über `size`.
 */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`text-primary-foreground ${className}`}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M11 10 L11 18 L21 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="11" cy="10" r="2.6" fill="currentColor" />
      <circle cx="21" cy="18" r="2.6" fill="currentColor" />
    </svg>
  );
}
