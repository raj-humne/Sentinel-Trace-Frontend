import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import ThreatOrb from '../components/HeroCanvas'
import KineticGrid from '@/components/ui/kinetic-grid'
import TriageQueueSection from '../components/sections/TriageQueueSection'
import KillChainSection from '../components/sections/KillChainSection'
import ArchitectureSection from '../components/sections/ArchitectureSection'
import EvaluationSection from '../components/sections/EvaluationSection'
import LocomotiveScroll from 'locomotive-scroll'
import 'locomotive-scroll/locomotive-scroll.css'

gsap.registerPlugin(ScrollTrigger)

// ─── Feature Badge Card ───────────────────────────────────────────────────────

interface FeatureCardProps {
  heading: string
  subtext: string
  className?: string
}

function FeatureCard({ heading, subtext, className = '' }: FeatureCardProps) {
  return (
    <div className={`group w-full max-w-[260px] sm:max-w-[280px] lg:max-w-[290px] p-4 rounded-xl backdrop-blur-md transition-all duration-300 cursor-default will-change-transform ${className}`}
      style={{
        background: 'rgba(38,26,31,0.78)',
        border: '1px solid rgba(244,91,105,0.22)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 15px rgba(90,0,1,0.25)',
        transformStyle: 'preserve-3d',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.border = '1px solid rgba(241,48,48,0.85)'
        el.style.boxShadow = '0 0 24px rgba(241,48,48,0.35)'
      }}
      onMouseMove={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        gsap.to(e.currentTarget, {
          rotateY: x * 18,
          rotateX: -y * 18,
          transformPerspective: 800,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.border = '1px solid rgba(244,91,105,0.22)'
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.55), 0 0 15px rgba(90,0,1,0.25)'
        gsap.to(el, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }}
    >
      <h3 className="font-mont text-sm sm:text-[15px] font-bold text-[#F6E8EA] group-hover:text-[#F13030] transition-colors leading-snug">
        {heading}
      </h3>
      <p className="font-mont text-xs text-[#F6E8EA]/70 leading-relaxed mt-1.5">
        {subtext}
      </p>
    </div>
  )
}

// ─── GSAP Animated CTA Buttons ───────────────────────────────────────────────

function PrimaryCtaButton({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1.05,
        y: -3,
        backgroundColor: '#fa3939',
        boxShadow: '0 10px 32px rgba(241,48,48,0.75), 0 0 18px rgba(244,91,105,0.55)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1.22,
        rotate: -10,
        duration: 0.35,
        ease: 'back.out(2.2)',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseLeave = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1,
        y: 0,
        backgroundColor: '#F13030',
        boxShadow: '0 0 20px rgba(241,48,48,0.5)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        rotate: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseDown = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 0.96,
        y: 0,
        duration: 0.1,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseUp = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1.05,
        y: -3,
        duration: 0.2,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      })
    }
  }

  return (
    <a
      ref={btnRef}
      href={href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded font-mont text-sm font-bold uppercase tracking-wider text-[#F6E8EA] cursor-pointer will-change-transform select-none"
      style={{
        background: '#F13030',
        boxShadow: '0 0 20px rgba(241,48,48,0.5)',
      }}
    >
      <span ref={iconRef} className="material-symbols-outlined text-[19px] inline-block will-change-transform leading-none">
        emergency_home
      </span>
      <span>{label}</span>
    </a>
  )
}

function SecondaryCtaButton({
  href,
  label,
  onClick,
}: {
  href: string
  label: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1.05,
        y: -3,
        backgroundColor: 'rgba(72,32,42,0.98)',
        borderColor: 'rgba(241,48,48,0.85)',
        boxShadow: '0 8px 26px rgba(241,48,48,0.35), 0 0 18px rgba(90,0,1,0.5)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1.22,
        rotate: 8,
        color: '#F13030',
        duration: 0.35,
        ease: 'back.out(2.2)',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseLeave = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1,
        y: 0,
        backgroundColor: 'rgba(56,35,43,0.90)',
        borderColor: '#5A0001',
        boxShadow: '0 0 0px rgba(0,0,0,0)',
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    if (iconRef.current) {
      gsap.to(iconRef.current, {
        scale: 1,
        rotate: 0,
        color: '#F45B69',
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseDown = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 0.96,
        y: 0,
        duration: 0.1,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
  }

  const handleMouseUp = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, {
        scale: 1.05,
        y: -3,
        duration: 0.2,
        ease: 'back.out(1.5)',
        overwrite: 'auto',
      })
    }
  }

  return (
    <a
      ref={btnRef}
      href={href}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded font-mont text-sm font-semibold tracking-wider text-[#F6E8EA] cursor-pointer will-change-transform select-none"
      style={{
        background: 'rgba(56,35,43,0.90)',
        border: '1px solid #5A0001',
      }}
    >
      <span ref={iconRef} className="material-symbols-outlined text-[#F45B69] text-[19px] inline-block will-change-transform leading-none">
        security
      </span>
      <span>{label}</span>
    </a>
  )
}

// ─── Navigation Items Definition ──────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
  { id: 'triage-queue', label: 'Triage Queue', href: '#triage-queue' },
  { id: 'kill-chain', label: 'Kill-Chain Engine', href: '#kill-chain' },
  { id: 'architecture', label: 'Architecture', href: '#architecture' },
  { id: 'evaluation', label: 'Evaluation', href: '#evaluation' },
]

// ─── Landing Page ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const heroHeadingRef = useRef<HTMLHeadingElement>(null)
  const heroCenterRef = useRef<HTMLDivElement>(null)
  const cardsLayerRef = useRef<HTMLDivElement>(null)
  const svgArcsRef = useRef<SVGSVGElement>(null)
  const navbarRef = useRef<HTMLElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const card3Ref = useRef<HTMLDivElement>(null)
  const card4Ref = useRef<HTMLDivElement>(null)
  const card5Ref = useRef<HTMLDivElement>(null)
  const card6Ref = useRef<HTMLDivElement>(null)

  const [activeSection, setActiveSection] = useState<string>('overview')
  const [isScrolled, setIsScrolled] = useState(false)
  const lenisRef = useRef<any>(null)
  const isManualScrollingRef = useRef(false)
  const manualScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Smooth scroll handler that sets active portion immediately and scrolls to target
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    isManualScrollingRef.current = true
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current)
    }
    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false
    }, 1000)

    const target = document.getElementById(sectionId)
    if (!target) return

    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, { offset: -70, duration: 1.1 })
    } else {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top: topOffset, behavior: 'smooth' })
    }
    window.history.pushState(null, '', `#${sectionId}`)
  }

  // Scroll spy to dynamically update active section navbar background on scroll
  useEffect(() => {
    const handleScrollSpy = () => {
      setIsScrolled(window.scrollY > 140)

      if (isManualScrollingRef.current) return

      if (window.scrollY < 240) {
        setActiveSection('overview')
        return
      }

      const sectionIds = ['triage-queue', 'kill-chain', 'architecture', 'evaluation']
      let current = 'overview'
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 240) {
            current = id
          }
        }
      }
      setActiveSection(current)
    }

    // Set initial active section from hash if valid
    const initialHash = window.location.hash.replace('#', '')
    if (initialHash && NAV_ITEMS.some(item => item.id === initialHash)) {
      setActiveSection(initialHash)
    }

    window.addEventListener('scroll', handleScrollSpy, { passive: true })
    handleScrollSpy()

    const handleHashChange = () => {
      const h = window.location.hash.replace('#', '')
      if (h && NAV_ITEMS.some(item => item.id === h)) {
        setActiveSection(h)
      }
    }
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('scroll', handleScrollSpy)
      window.removeEventListener('hashchange', handleHashChange)
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (window.scrollY > 120) return
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2

      if (heroHeadingRef.current) {
        gsap.to(heroHeadingRef.current, {
          rotateY: x * 15,
          rotateX: -y * 12,
          transformPerspective: 1000,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: 'auto',
        })
      }

      const cards = [
        { ref: card1Ref, rotY: x * 12 + 2, rotX: -y * 10 - 2 },
        { ref: card4Ref, rotY: x * 12 - 2, rotX: -y * 10 - 2 },
        { ref: card2Ref, rotY: x * 14 + 3, rotX: -y * 9 },
        { ref: card5Ref, rotY: x * 14 - 3, rotX: -y * 9 },
        { ref: card3Ref, rotY: x * 10 + 2, rotX: -y * 12 + 2 },
        { ref: card6Ref, rotY: x * 10 - 2, rotX: -y * 12 + 2 },
      ]

      cards.forEach(({ ref, rotY, rotX }) => {
        if (ref.current) {
          gsap.to(ref.current, {
            rotateY: rotY,
            rotateX: rotX,
            transformPerspective: 1000,
            duration: 0.5,
            ease: 'power2.out',
            overwrite: 'auto',
          })
        }
      })
    }

    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  // Advanced Hero Scroll Animation:
  // 1. Center stage (title, subtext, CTAs) flies away smoothly on initial scroll.
  // 2. The 6 feature cards and SVG arcs STAY on screen while scrolling down and while
  //    SECURITY TRIAGE QUEUE heading arrives in center.
  // 3. ONLY when the whole content of the second page comes up do the 6 cards scroll up and disappear!
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Center stage leaves early on scroll
      if (heroCenterRef.current) {
        gsap.to(heroCenterRef.current, {
          scrollTrigger: {
            trigger: '#overview',
            start: 'top top',
            end: '+=450',
            scrub: 1.1,
          },
          y: -240,
          opacity: 0,
          scale: 0.9,
          ease: 'power1.in',
        })
      }

      // 6 cards stay visible during scroll down and while second page heading appears in center.
      // They disperse upwards and disappear as the full second page content enters.
      const cardsTl = gsap.timeline({
        scrollTrigger: {
          trigger: '#triage-queue',
          start: 'top 70px',
          end: '+=420',
          scrub: 1.1,
        },
      })

      // The cards layer and SVG arcs remain stationary while the heading is centered,
      // and smoothly fly upwards and fade out completely as the second page content reveals
      cardsTl.to(
        [cardsLayerRef.current, svgArcsRef.current],
        {
          y: -420,
          opacity: 0,
          ease: 'power2.in',
          duration: 1,
        },
        0.08
      )
    })

    return () => ctx.revert()
  }, [])

  // Initialize Locomotive Scroll for smooth scrolling
  useEffect(() => {
    const locomotiveScroll = new LocomotiveScroll({
      lenisOptions: {
        duration: 1.25,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1.05,
        touchMultiplier: 2,
      },
    })

    const lenis = locomotiveScroll.lenisInstance
    lenisRef.current = lenis

    if (lenis) {
      lenis.on('scroll', (e: { scroll: number }) => {
        setIsScrolled(e.scroll > 140)
        ScrollTrigger.update()
      })
    }

    const timer = setTimeout(() => {
      ScrollTrigger.refresh()
    }, 300)

    return () => {
      clearTimeout(timer)
      lenisRef.current = null
      locomotiveScroll.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden relative" style={{ backgroundColor: '#22181C', color: '#F6E8EA' }}>

      {/* ── Kinetic Interactive Grid (behind all elements, minimal opacity) ── */}
      <KineticGrid transparent className="fixed inset-0 pointer-events-none z-0" />

      {/* ── 3D Background Orb (fixed, behind everything) ── */}
      <ThreatOrb />

      {/* ── Ambient radial threat glow ── */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: `
          radial-gradient(circle at center, rgba(241,48,48,0.08) 0%, transparent 68%),
          radial-gradient(circle at center, rgba(90,0,1,0.22) 0%, transparent 80%)
        `,
      }} />

      {/* ── Concentric reticle rings ── */}
      {[
        { size: 'w-[480px] h-[480px] lg:w-[620px] lg:h-[620px]', opacity: 'opacity-40' },
        { size: 'w-[780px] h-[780px] lg:w-[940px] lg:h-[940px]', opacity: 'opacity-25' },
        { size: 'w-[1080px] h-[1080px] lg:w-[1240px] lg:h-[1240px]', opacity: 'opacity-15' },
      ].map((r, i) => (
        <div key={i} className={`fixed pointer-events-none z-0 rounded-full ${r.size} ${r.opacity}`} style={{
          border: '1px dashed rgba(244,91,105,0.25)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
        }} />
      ))}

      {/* ── SVG curved arcs connecting the feature cards ── */}
      <svg
        ref={svgArcsRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-[5] will-change-transform"
        preserveAspectRatio="none"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {/* Left arc: Top-Left → Mid-Left → Bottom-Left */}
        <path d="M 195 145 C 115 285, 105 520, 195 780" fill="none" filter="url(#arcGlow)"
          stroke="#F45B69" strokeDasharray="6 6" strokeOpacity="0.65" strokeWidth="1.5" />
        {/* Right arc: Top-Right → Mid-Right → Bottom-Right */}
        <path d="M 1245 145 C 1325 285, 1335 520, 1245 780" fill="none" filter="url(#arcGlow)"
          stroke="#F45B69" strokeDasharray="6 6" strokeOpacity="0.65" strokeWidth="1.5" />
        {/* Junction dots */}
        <circle cx="195" cy="145" r="3" fill="#F13030" opacity="0.8" />
        <circle cx="112" cy="450" r="3" fill="#F45B69" opacity="0.8" />
        <circle cx="195" cy="780" r="3" fill="#F13030" opacity="0.8" />
        <circle cx="1245" cy="145" r="3" fill="#F13030" opacity="0.8" />
        <circle cx="1328" cy="450" r="3" fill="#F45B69" opacity="0.8" />
        <circle cx="1245" cy="780" r="3" fill="#F13030" opacity="0.8" />
      </svg>

      {/* ══════════════════════════════════════════════
          NAVBAR (Poppins font, centered elements, transparent)
      ══════════════════════════════════════════════ */}
      <header
        ref={navbarRef}
        className={`fixed top-0 left-0 right-0 z-50 font-['Poppins',sans-serif] border-b transition-all duration-300 pointer-events-auto ${
          isScrolled
            ? 'bg-[#1a1115]/70 backdrop-blur-md border-[#32272b]/40 shadow-lg'
            : 'bg-transparent backdrop-blur-none border-transparent shadow-none'
        }`}
      >
        <div className="h-16 w-full max-w-[1560px] mx-auto px-6 lg:px-10 flex items-center justify-between relative">
          {/* Brand */}
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('overview')
            }}
            className="flex items-center group shrink-0"
          >
            <span className="font-['Poppins',sans-serif] text-base sm:text-lg font-bold uppercase tracking-wider text-[#F6E8EA] leading-none transition-colors group-hover:text-[#F13030] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              SENTINEL TRACE
            </span>
          </a>

          {/* Centered Nav elements with active background portion highlight */}
          <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 sm:gap-1.5 p-1 rounded-full bg-[#1b1216]/80 backdrop-blur-md border border-[#3e272e]/60 shadow-[0_4px_24px_rgba(0,0,0,0.5)] max-w-[calc(100vw-140px)] overflow-x-auto no-scrollbar">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToSection(item.id)
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`font-['Poppins',sans-serif] text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-full transition-all duration-300 select-none cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'font-semibold text-[#F6E8EA]'
                      : 'font-medium text-[#F6E8EA]/75 hover:text-[#F6E8EA]'
                  }`}
                  style={
                    isActive
                      ? {
                          background: '#5A0001',
                          color: '#F6E8EA',
                          border: '1px solid rgba(241,48,48,0.7)',
                          boxShadow: '0 0 14px rgba(241,48,48,0.45), inset 0 1px 1px rgba(255,255,255,0.25)',
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#F6E8EA'
                      e.currentTarget.style.background = 'rgba(56,35,43,0.75)'
                      e.currentTarget.style.borderColor = 'rgba(244,91,105,0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(246,232,234,0.75)'
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }
                  }}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
        </div>
      </header>

      {/* ── Fixed 6-Card Radial Overlay Layer (Stays on screen until second page content arrives) ── */}
      <div
        ref={cardsLayerRef}
        className="fixed inset-0 pointer-events-none z-10 pt-24 sm:pt-28 pb-6 sm:pb-8 px-6 lg:px-12 flex flex-col justify-between max-w-[1680px] mx-auto will-change-transform"
        style={{ height: '100vh', boxSizing: 'border-box' }}
      >
        {/* TOP ROW: Feature 01 (left) + Feature 04 (right) */}
        <div className="w-full flex justify-between items-start">
          <div ref={card1Ref} className="pointer-events-auto will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <FeatureCard
              heading="All Logs in One Place"
              subtext="Combines logins, USB drives, files, emails, and web activity into a single clean timeline."
              className="float-card-1"
            />
          </div>
          <div ref={card4Ref} className="pointer-events-auto will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <FeatureCard
              heading="Dot-Connecting Engine"
              subtext="Groups scattered clues across hours and weeks into one complete incident to catch slow, quiet theft."
              className="float-card-4"
            />
          </div>
        </div>

        {/* MIDDLE ROW: Feature 02 (left) + Center Spacer + Feature 05 (right) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-6">
          <div className="lg:col-span-3 flex justify-start">
            <div ref={card2Ref} className="pointer-events-auto will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
              <FeatureCard
                heading="Personal & Peer Habits"
                subtext="Learns each employee's 30-day normal routine and compares them against coworkers to catch sudden shifts."
                className="float-card-2"
              />
            </div>
          </div>
          <div className="lg:col-span-6 pointer-events-none" />
          <div className="lg:col-span-3 flex justify-end">
            <div ref={card5Ref} className="pointer-events-auto will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
              <FeatureCard
                heading="Clear-Text Reasoning"
                subtext="Gives a plain-English explanation for every alert and proves exactly what triggered the risk score."
                className="float-card-5"
              />
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Feature 03 (left) + Feature 06 (right) */}
        <div className="w-full flex justify-between items-end">
          <div ref={card3Ref} className="pointer-events-auto will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <FeatureCard
              heading="Dual-Layer Security"
              subtext="Combines 27 clear security rules with smart AI checks so no alert is ever a black-box mystery."
              className="float-card-3"
            />
          </div>
          <div ref={card6Ref} className="pointer-events-auto will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
            <FeatureCard
              heading="Zero False-Alarm Triage"
              subtext="Only raises red flags when confident; routes doubtful or incomplete cases for human review."
              className="float-card-6"
            />
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MAIN RADIAL HERO (Center Stage)
      ══════════════════════════════════════════════ */}
      <main id="overview" className="w-full flex-1 pt-16 flex flex-col justify-center items-center relative z-10 min-h-screen">
        <div className="relative w-full max-w-[1680px] mx-auto px-6 lg:px-12 py-6 lg:py-8 flex-1 flex flex-col justify-center items-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <div ref={heroCenterRef} className="flex flex-col items-center justify-center text-center px-2 py-4 will-change-transform max-w-4xl mx-auto">
            {/* Hero title with 3D tilt */}
            <h1
              ref={heroHeadingRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[4.2rem] xl:text-[4.85rem] 2xl:text-[5.25rem] font-black uppercase leading-none select-none mb-8 whitespace-nowrap inline-flex items-center justify-center gap-8 sm:gap-10 md:gap-12 will-change-transform"
              style={{
                fontFamily: "'Monument Extended', sans-serif",
                letterSpacing: '0.14em',
                color: '#F6E8EA',
                filter: 'drop-shadow(0 4px 20px rgba(90,0,1,0.95)) drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
                transformStyle: 'preserve-3d',
              }}>
              <span>SENTINEL</span>
              <span style={{
                fontFamily: "'Monument Extended', sans-serif",
                letterSpacing: '0.14em',
                color: '#ffffff',
                filter: 'drop-shadow(0 4px 20px rgba(90,0,1,0.95)) drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
              }}>
                TRACE
              </span>
            </h1>

            {/* Subheading in Nexa */}
            <p className="text-xs sm:text-sm md:text-base font-bold max-w-xl sm:max-w-2xl mb-10"
              style={{
                fontFamily: "'Nexa', sans-serif",
                letterSpacing: '0.04em',
                lineHeight: '1.85',
                color: 'rgba(246,232,234,0.92)',
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
              }}>
              Connecting weak behavioral signals into one explainable threat story.
            </p>

            {/* CTA buttons with smooth GSAP animations */}
            <div className="flex flex-wrap items-center justify-center gap-4">
              <PrimaryCtaButton
                href="#triage-queue"
                label="View Live Alerts"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('triage-queue')
                }}
              />
              <SecondaryCtaButton
                href="#kill-chain"
                label="Explore Security Rules"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToSection('kill-chain')
                }}
              />
            </div>
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════
          PLATFORM SCREENS (Full-Width Interactive Modules)
      ══════════════════════════════════════════════ */}
      <div className="relative z-20 w-full flex flex-col gap-20 py-16 px-4 sm:px-6 lg:px-12 max-w-[1720px] mx-auto">
        {/* Screen 1: Triage Queue */}
        <section id="triage-queue" className="w-full scroll-mt-24">
          <TriageQueueSection />
        </section>

        {/* Screen 2: Kill-Chain Engine */}
        <section id="kill-chain" className="w-full scroll-mt-24">
          <div id="kill-chain-engine" className="w-full scroll-mt-24">
            <KillChainSection />
          </div>
        </section>

        {/* Screen 3: Architecture & Data Flow */}
        <section id="architecture" className="w-full scroll-mt-24">
          <ArchitectureSection />
        </section>

        {/* Screen 4: Evaluation & Forensics */}
        <section id="evaluation" className="w-full scroll-mt-24">
          <EvaluationSection />
        </section>
      </div>

    </div>
  )
}
