export default function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ec-g" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ade80" />
          <stop offset="1" stopColor="#15803d" />
        </linearGradient>
      </defs>
      <rect width="36" height="36" rx="9" fill="url(#ec-g)" />
      {/* Three strata bars → reads as both "E" and layered earth */}
      <rect x="8" y="10"   width="20" height="3.2" rx="1.6" fill="white" />
      <rect x="8" y="16.4" width="13" height="3.2" rx="1.6" fill="white" />
      <rect x="8" y="22.8" width="20" height="3.2" rx="1.6" fill="white" />
    </svg>
  )
}
