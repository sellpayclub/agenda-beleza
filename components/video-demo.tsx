'use client'

import { useEffect, useRef } from 'react'

export function VideoDemo() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Carregar SDK do SmartPlayer
    const script = document.createElement('script')
    script.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js'
    script.async = true
    document.head.appendChild(script)

    // Criar iframe após montar
    if (containerRef.current) {
      const wrapper = document.createElement('div')
      wrapper.id = 'ifr_693d7721b50e82e7e2e12f28_wrapper'
      wrapper.style.cssText = 'margin: 0 auto; width: 100%; max-width: 400px;'

      const aspect = document.createElement('div')
      aspect.id = 'ifr_693d7721b50e82e7e2e12f28_aspect'
      aspect.style.cssText = 'position: relative; padding-top: 177.77777777777777%;'

      const iframe = document.createElement('iframe')
      iframe.id = 'ifr_693d7721b50e82e7e2e12f28'
      iframe.frameBorder = '0'
      iframe.allowFullscreen = true
      iframe.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%;'
      iframe.referrerPolicy = 'origin'
      iframe.src = `https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/693d7721b50e82e7e2e12f28/v4/embed.html${window.location.search || '?'}&vl=${encodeURIComponent(window.location.href)}`

      aspect.appendChild(iframe)
      wrapper.appendChild(aspect)
      containerRef.current.appendChild(wrapper)
    }

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
      <div ref={containerRef} />
    </div>
  )
}
