export function LifestyleIcons() {
  const icons = [
    {
      name: "Sleep",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M26 10C26 10 18 16 18 24C18 32 26 38 26 38C26 38 22 34 22 24C22 14 26 10 26 10Z"
            fill="url(#gradient1)"
          />
          <circle cx="30" cy="12" r="2" fill="url(#gradient1)" />
          <circle cx="28" cy="36" r="2" fill="url(#gradient1)" />
          <circle cx="34" cy="24" r="1.5" fill="url(#gradient1)" />
        </svg>
      ),
    },
    {
      name: "Nutrition",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 8C18 8 14 12 14 18C14 22 16 26 18 28L24 38L30 28C32 26 34 22 34 18C34 12 30 8 24 8Z"
            fill="url(#gradient1)"
          />
          <circle cx="24" cy="18" r="4" fill="white" fillOpacity="0.3" />
        </svg>
      ),
    },
    {
      name: "Energy",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M28 8L16 26H24L20 40L32 22H24L28 8Z"
            fill="url(#gradient1)"
          />
        </svg>
      ),
    },
    {
      name: "Focus",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="14" stroke="url(#gradient1)" strokeWidth="2" fill="none" />
          <circle cx="24" cy="24" r="8" stroke="url(#gradient1)" strokeWidth="2" fill="none" />
          <circle cx="24" cy="24" r="3" fill="url(#gradient1)" />
        </svg>
      ),
    },
    {
      name: "Recovery",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M24 10C16.268 10 10 16.268 10 24C10 31.732 16.268 38 24 38C31.732 38 38 31.732 38 24"
            stroke="url(#gradient1)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M38 24L34 20M38 24L42 20"
            stroke="url(#gradient1)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      name: "Balance",
      icon: (
        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="24" r="8" fill="url(#gradient1)" fillOpacity="0.5" />
          <circle cx="32" cy="24" r="8" fill="url(#gradient1)" fillOpacity="0.5" />
          <circle cx="24" cy="24" r="5" fill="url(#gradient1)" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <defs>
        <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>
      </defs>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
        {icons.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-sky-100 to-emerald-50 flex items-center justify-center p-4 hover:scale-110 transition-transform duration-300">
              {item.icon}
            </div>
            <span className="text-slate-600">{item.name}</span>
          </div>
        ))}
      </div>
    </>
  );
}
