import { useEffect, useState } from 'react'

const checkIsDesktop = () => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768 && window.innerWidth > window.innerHeight
}

export default function SplashScreen({ onFinish }) {
  const [isDesktop, setIsDesktop] = useState(checkIsDesktop)
  const [progress, setProgress] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(checkIsDesktop())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return Math.min(100, prev + 6)
      })
    }, 90)

    const fadeTimer = setTimeout(() => {
      setFading(true)
    }, 1750)

    const doneTimer = setTimeout(() => {
      onFinish()
    }, 2150)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeTimer)
      clearTimeout(doneTimer)
    }
  }, [onFinish])

  const handleSkip = () => {
    setFading(true)
    setTimeout(onFinish, 250)
  }

  const splashSrc = isDesktop ? '/splash-desktop.png' : '/splash-mobile.png'

  return (
    <div
      className={`splash-screen ${fading ? 'fade-out' : ''}`}
      onClick={handleSkip}
      title="Ketuk untuk melewati"
    >
      <img
        src={splashSrc}
        alt="MLBBPocket Splash Screen"
        className="splash-bg-img"
      />

      {/* Overlay Loading Bar Bergerak */}
      <div className="splash-loading-overlay">
        <div className="splash-loading-track">
          <div
            className="splash-loading-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="splash-loading-pct">{progress}%</span>
      </div>
    </div>
  )
}