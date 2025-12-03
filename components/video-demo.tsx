'use client'

import { useEffect } from 'react'

// Declarar elemento customizado para TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'vturb-smartplayer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        id?: string
      }
    }
  }
}

export function VideoDemo() {
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/69304bc7bf1c3c5d0f93ef8a/v4/player.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector(
        'script[src="https://scripts.converteai.net/23a12c68-c1f4-4484-8d24-176d22e3e1c7/players/69304bc7bf1c3c5d0f93ef8a/v4/player.js"]'
      )
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  return (
    <div className="mb-10 flex justify-center">
      <div className="w-full max-w-md">
        <vturb-smartplayer 
          id="vid-69304bc7bf1c3c5d0f93ef8a" 
          style={{ display: 'block', margin: '0 auto', width: '100%', maxWidth: '400px' }}
        />
      </div>
    </div>
  )
}

