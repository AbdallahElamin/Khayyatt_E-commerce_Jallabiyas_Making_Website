export function Ornament({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 16" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M0 8 H70" stroke="currentColor" strokeWidth="1" />
      <path d="M130 8 H200" stroke="currentColor" strokeWidth="1" />
      <path d="M100 2 L106 8 L100 14 L94 8 Z" stroke="currentColor" strokeWidth="1" fill="none" />
      <circle cx="84" cy="8" r="1.5" fill="currentColor" />
      <circle cx="116" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}
