/**
 * CustomsLogo — CODI PRO MAX
 * Navy→teal gradient logomark with a customs-clearance check.
 */
export function CustomsLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="codi-logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a5f" />
          <stop offset="0.55" stopColor="#0d9488" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
        <linearGradient id="codi-logo-shine" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#codi-logo-grad)" />
      <rect width="40" height="40" rx="10" fill="url(#codi-logo-shine)" />
      <path
        d="M20 9L30.5 14.7V25.3L20 31L9.5 25.3V14.7L20 9Z"
        stroke="#FFFFFF"
        strokeOpacity="0.55"
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M14.5 20L18.2 23.6L26 16.2"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
