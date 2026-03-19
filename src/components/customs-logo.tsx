export function CustomsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" className="fill-primary" />
      <path d="M20 6L34 14V26L20 34L6 26V14L20 6Z" className="fill-primary-foreground" fillOpacity="0.15" />
      <path d="M20 10L30 16V24L20 30L10 24V16L20 10Z" stroke="currentColor" strokeWidth="1.5" className="text-primary-foreground" fill="none" />
      <path d="M14 18L18 22L26 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
    </svg>
  );
}
