'use client'

import { useEffect } from 'react'

export function VideoDemo() {
  useEffect(() => {
    // Carregar SDK do SmartPlayer
    const script = document.createElement('script')
    script.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup
      const existingScript = document.querySelector(
        'script[src="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js"]'
      )
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="mb-10 flex justify-center">
      <div 
        id="ifr_693d7721b50e82e7e2e12f28_wrapper" 
        style={{ margin: '0 auto', width: '100%', maxWidth: '400px' }}
      >
        <div 
          style={{ position: 'relative', paddingTop: '177.77777777777777%' }} 
          id="ifr_693d7721b50e82e7e2e12f28_aspect"
        >
          <iframe
            frameBorder={0}
            allowFullScreen
            src="about:blank"
            id="ifr_693d7721b50e82e7e2e12f28"
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '100%', 
              height: '100%' 
            }}
            referrerPolicy="origin"
            onLoad={(e) => {
              const iframe = e.currentTarget
              iframe.src = `https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/693d7721b50e82e7e2e12f28/v4/embed.html${window.location.search || '?'}&vl=${encodeURIComponent(window.location.href)}`
            }}
          />
        </div>
      </div>
    </div>
  )
}
