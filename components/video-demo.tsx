'use client'

import { useEffect } from 'react'

export function VideoDemo() {
  useEffect(() => {
    // Carregar script do player
    const script = document.createElement('script')
    script.src = 'https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/693d7721b50e82e7e2e12f28/v4/player.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/693d7721b50e82e7e2e12f28/v4/player.js"]'
      )
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="mb-6 sm:mb-10 flex justify-center px-4 sm:px-0">
      <div 
        className="w-full max-w-[320px] sm:max-w-[400px]"
        style={{ aspectRatio: '9/16' }}
        dangerouslySetInnerHTML={{
          __html: `<vturb-smartplayer id="vid-693d7721b50e82e7e2e12f28" style="display: block; margin: 0 auto; width: 100%; height: 100%;"></vturb-smartplayer>`
        }}
      />
    </div>
  )
}
