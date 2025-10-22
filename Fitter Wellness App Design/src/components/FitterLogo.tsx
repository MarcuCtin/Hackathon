export function FitterLogo({ size = 48 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3">
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="100%" stopColor="#6ee7b7" />
          </linearGradient>
        </defs>
        {/* Geometric F shape representing balance */}
        <path
          d="M12 8C12 6.89543 12.8954 6 14 6H34C35.1046 6 36 6.89543 36 8V12C36 13.1046 35.1046 14 34 14H18V20H30C31.1046 20 32 20.8954 32 22V26C32 27.1046 31.1046 28 30 28H18V40C18 41.1046 17.1046 42 16 42H14C12.8954 42 12 41.1046 12 40V8Z"
          fill="url(#logoGradient)"
        />
        {/* Balance dot */}
        <circle cx="34" cy="36" r="4" fill="url(#logoGradient)" opacity="0.7" />
      </svg>
      <span 
        className="tracking-tight"
        style={{ 
          fontSize: size * 0.5, 
          background: 'linear-gradient(135deg, #7dd3fc 0%, #6ee7b7 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}
      >
        Fitter
      </span>
    </div>
  );
}
