'use client'

export function Watermark() {
  return (
    <div 
      className="fixed bottom-4 right-4 pointer-events-none z-50 opacity-10 hover:opacity-20 transition-opacity"
      style={{ mixBlendMode: 'multiply' }}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute"
          >
            <rect
              x="2"
              y="4"
              width="16"
              height="14"
              rx="2"
              fill="url(#calendarGradientWatermark)"
            />
            <rect x="4" y="2" width="3" height="2" rx="1" fill="url(#calendarGradientWatermark)" />
            <rect x="9" y="2" width="3" height="2" rx="1" fill="url(#calendarGradientWatermark)" />
            <path
              d="M6 10L8.5 12.5L14 7"
              stroke="#1e3a8a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <defs>
              <linearGradient id="calendarGradientWatermark" x1="0" y1="0" x2="0" y2="20">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-700">Agendify</span>
      </div>
    </div>
  )
}


