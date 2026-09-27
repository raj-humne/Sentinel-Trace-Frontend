import { useState, useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function EvaluationSection() {
  // Signal active states for the Counterfactual Attribution Model
  const [sigLogon, setSigLogon] = useState(true)
  const [sigUsb, setSigUsb] = useState(true)
  const [sigFiles, setSigFiles] = useState(true)
  const [sigCloud, setSigCloud] = useState(true)

  const THRESHOLD = 65
  const BASE_PRIOR = 25

  // Compute counterfactual score dynamically
  const { simulatedScore, isAlertActive, takeawayMessage } = useMemo(() => {
    let score = 73
    if (!sigLogon) score -= 7
    if (!sigUsb) score -= 18
    if (!sigFiles) score -= 15
    if (!sigCloud) score -= 10

    if (!sigLogon && !sigUsb && !sigFiles && !sigCloud) score = BASE_PRIOR
    if (score < BASE_PRIOR) score = BASE_PRIOR

    const alertActive = score >= THRESHOLD

    let message = ''
    if (sigLogon && sigUsb && sigFiles && sigCloud) {
      message =
        'All 4 signals are presently active, totaling an aggregate risk value of 73 (8 points above threshold 65). The single pivotal intervention is Removable USB Mount; suppressing only this indicator drops total risk to 55, definitively clearing the alert trigger.'
    } else if (!sigUsb && sigLogon && sigFiles && sigCloud) {
      message =
        'PIVOTAL COUNTERFACTUAL CONFIRMED: Without the Removable USB Mount event, total simulated threat drops to 55 (-18 pts). Even with off-hours temporal drift, file copies, and cloud POST active, the system remains below alert threshold.'
    } else if (!alertActive) {
      message = `INSUFFICIENT ATTRIBUTION: The current configuration yields a simulated risk of ${score}, which is ${
        THRESHOLD - score
      } pts below the SEC/NIST escalation threshold of 65. Under this hypothetical scenario, automated containment would NOT trigger.`
    } else {
      message = `Simulated risk stands at ${score}. The combination of remaining active signals continues to satisfy minimal risk criteria (≥65), sustaining alert status.`
    }

    return {
      simulatedScore: score,
      isAlertActive: alertActive,
      takeawayMessage: message,
    }
  }, [sigLogon, sigUsb, sigFiles, sigCloud])

  const sectionRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const headerBoxRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subtextRef = useRef<HTMLParagraphElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const panel = panelRef.current
    const heading = headingRef.current
    const headerBox = headerBoxRef.current
    const subtext = subtextRef.current
    const content = contentRef.current

    if (!section || !panel || !heading || !content) return

    const ctx = gsap.context(() => {
      const width = window.innerWidth
      const targetScale = width < 640 ? 1.18 : width < 1024 ? 1.35 : 1.48
      const initialY = Math.max(120, window.innerHeight * 0.32)

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top 70px',
          end: '+=750',
          scrub: 1.2,
          anticipatePin: 1,
        },
      })

      // 1. Heading starts enlarged in viewport center with NO background
      tl.fromTo(
        heading,
        {
          scale: targetScale,
          y: initialY,
          transformOrigin: 'center center',
          filter: 'drop-shadow(0 10px 40px rgba(90,0,1,1)) drop-shadow(0 4px 20px rgba(0,0,0,0.95))',
        },
        {
          scale: 1,
          y: 0,
          filter: 'drop-shadow(0 4px 20px rgba(90,0,1,0.95)) drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
          ease: 'power2.inOut',
          duration: 1,
        },
        0.2
      )

      // 2. The panel background & border materialize as you scroll further
      tl.fromTo(
        panel,
        {
          backgroundColor: 'rgba(26,17,21,0)',
          borderColor: 'rgba(90,0,1,0)',
          boxShadow: '0 0 0 rgba(0,0,0,0)',
        },
        {
          backgroundColor: 'rgba(26,17,21,0.98)',
          borderColor: 'rgba(90,0,1,0.6)',
          boxShadow: '0 12px 45px rgba(0,0,0,0.65)',
          ease: 'power2.out',
          duration: 0.65,
        },
        0.35
      )

      // Header dividing border appears ONLY when the whole page content arrives
      if (headerBox) {
        tl.fromTo(
          headerBox,
          { borderBottomColor: 'transparent' },
          { borderBottomColor: '#32272b', ease: 'power2.out', duration: 0.5 },
          0.4
        )
      }

      // 4. Subtext fades in
      if (subtext) {
        tl.fromTo(
          subtext,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, ease: 'power2.out', duration: 0.45 },
          0.5
        )
      }

      // 5. The rest of the content slides up and fades in
      tl.fromTo(
        content,
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, ease: 'power2.out', duration: 0.5 },
        0.25
      )
    }, section)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="relative w-full font-mont" style={{ fontFamily: "'Mont', sans-serif" }}>
      {/* Main Panel Container - starts transparent for floating heading, then forms dark card */}
      <div
        ref={panelRef}
        className="flex flex-col w-full text-[#f1dee3] rounded-2xl overflow-hidden border border-transparent font-mont will-change-transform"
        style={{
          fontFamily: "'Mont', sans-serif",
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          boxShadow: 'none',
        }}
      >
        <div className="p-6 lg:p-8 flex flex-col gap-8">
          {/* Page Header */}
          <div
            ref={headerBoxRef}
            className="flex flex-col items-center text-center gap-3 border-b border-transparent pb-6 relative z-20 will-change-transform"
            style={{ borderBottomColor: 'transparent' }}
          >
            <h2
              ref={headingRef}
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black uppercase leading-tight select-none my-1 text-[#F6E8EA] text-center will-change-transform max-w-[84vw] mx-auto px-2"
              style={{
                fontFamily: "'Monument Extended', sans-serif",
                letterSpacing: '0.06em',
                filter: 'drop-shadow(0 4px 20px rgba(90,0,1,0.95)) drop-shadow(0 2px 10px rgba(0,0,0,0.9))',
              }}
            >
              EVALUATION &amp; FORENSIC ATTRIBUTION
            </h2>
            <p
              ref={subtextRef}
              className="text-xs sm:text-sm md:text-base font-bold max-w-3xl text-center mx-auto will-change-transform"
              style={{
                fontFamily: "'Nexa', sans-serif",
                letterSpacing: '0.04em',
                lineHeight: '1.85',
                color: 'rgba(246,232,234,0.92)',
                textShadow: '0 2px 10px rgba(0,0,0,0.85)',
              }}
            >
              Live counterfactual validation proving exact mathematical score impact with cryptographically signed audit chains.
            </p>
          </div>

          {/* Body Content with slide up */}
          <div ref={contentRef} className="flex flex-col gap-8 will-change-transform">

        {/* Incident Header Bar */}
        <div className="bg-[#23191d] rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#5d3f3c]/40 font-mont">
          <div className="flex items-center gap-4">
            <div className="bg-[#930f29] p-3 rounded-lg text-[#ffb4ac] shrink-0">
              <span className="material-symbols-outlined text-[30px]">warning</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl font-bold text-[#f1dee3]">Unusual Data Copy to USB Drive</h3>
                <span
                  className={`px-2.5 py-0.5 rounded font-mont text-xs font-bold uppercase ${
                    isAlertActive ? 'bg-[#93000a] text-[#ffdad6]' : 'bg-[#32272b] text-[#ffb3b5]'
                  }`}
                >
                  {isAlertActive ? 'Critical Alert (Score 73)' : 'Threshold Cleared (Score 55)'}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mont text-xs text-[#e6bdb8] flex-wrap">
                <span>
                  Person: <strong className="text-[#f1dee3]">Cecil Vaughn (Finance)</strong>
                </span>
                <span className="text-[#5d3f3c]">•</span>
                <span>
                  Host: <strong className="text-[#f1dee3]">PC-4412</strong>
                </span>
                <span className="text-[#5d3f3c]">•</span>
                <span>Incident Ref: INC-80942</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto font-mont">
            <button
              onClick={() => setSigUsb(false)}
              className="px-4 py-2 rounded-lg bg-[#32272b] hover:bg-[#42363a] text-[#f1dee3] font-mont text-xs uppercase font-semibold transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>Test Without USB</span>
            </button>
            <button
              onClick={() => {
                setSigLogon(true)
                setSigUsb(true)
                setSigFiles(true)
                setSigCloud(true)
              }}
              className="px-4 py-2 rounded-lg bg-[#ff544c] hover:bg-[#fa3939] text-[#5c0005] font-mont text-xs uppercase font-bold transition-colors flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              <span>Reset Scenario</span>
            </button>
          </div>
        </div>

        {/* 2 Columns: What Happened & Counterfactual Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start font-mont">
          {/* What Happened (Plain English Story) */}
          <div className="bg-[#23191d] rounded-xl p-6 shadow-xl flex flex-col gap-4 border border-[#5d3f3c]/40 font-mont">
            <div className="flex items-center gap-2 pb-2 border-b border-[#32272b]">
              <span className="material-symbols-outlined text-[#ffb4ac] text-[22px]">info</span>
              <h4 className="text-base font-bold text-[#f1dee3]">What Happened</h4>
            </div>
            <p className="font-mont text-xs sm:text-sm text-[#e6bdb8] leading-relaxed">
              Our automated system flagged an anomalous multi-hop sequence of events on Cecil Vaughn's work machine:
            </p>

            <ul className="flex flex-col gap-3 font-mont">
              <li className="flex items-start gap-3 bg-[#150c0f] p-3.5 rounded-lg border border-[#5d3f3c]/20">
                <span className="material-symbols-outlined text-[#ffb3b5] text-[20px] shrink-0 mt-0.5">schedule</span>
                <div className="flex flex-col">
                  <span className="text-sm text-[#f1dee3] font-semibold">Logged in at 11:41 PM</span>
                  <span className="text-xs text-[#e6bdb8]">
                    Activity occurred late at night, outside of normal working hours (08:30–17:15).
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-[#150c0f] p-3.5 rounded-lg border border-[#5d3f3c]/20">
                <span className="material-symbols-outlined text-[#ff544c] text-[20px] shrink-0 mt-0.5">usb</span>
                <div className="flex flex-col">
                  <span className="text-sm text-[#f1dee3] font-semibold">
                    Connected an unauthorized 32GB USB flash drive
                  </span>
                  <span className="text-xs text-[#e6bdb8]">
                    An unapproved Kingston DataTraveler flash drive was inserted into the workstation.
                  </span>
                </div>
              </li>

              <li className="flex items-start gap-3 bg-[#150c0f] p-3.5 rounded-lg border border-[#5d3f3c]/20">
                <span className="material-symbols-outlined text-[#ffb3b5] text-[20px] shrink-0 mt-0.5">
                  folder_shared
                </span>
                <div className="flex flex-col">
                  <span className="text-sm text-[#f1dee3] font-semibold">
                    Copied 14 confidential quarterly balance sheets
                  </span>
                  <span className="text-xs text-[#e6bdb8]">
                    48 MB of sensitive financial files were transferred onto the plugged-in USB drive.
                  </span>
                </div>
              </li>
            </ul>
          </div>

          {/* Why It Matters (Counterfactual Attribution Simulator) */}
          <div className="bg-[#23191d] rounded-xl p-6 shadow-xl flex flex-col gap-4 border border-[#ff544c]/30 font-mont">
            <div className="flex items-center gap-2 pb-2 border-b border-[#32272b]">
              <span className="material-symbols-outlined text-[#ff544c] text-[22px]">tune</span>
              <h4 className="text-base font-bold text-[#f1dee3]">Why It Matters (Counterfactual Test)</h4>
            </div>
            <p className="font-mont text-xs sm:text-sm text-[#e6bdb8] leading-relaxed">
              We test whether this alert was caused primarily by the USB copy rather than ordinary late-night computer
              use:
            </p>

            {/* Interactive Signal Checkboxes */}
            <div className="bg-[#150c0f] p-4 rounded-xl flex flex-col gap-3 border border-[#5d3f3c]/30 font-mont text-xs">
              <span className="font-mont text-[10px] text-[#ad8884] uppercase tracking-wider font-bold">
                Toggle Signals to Test Alternative Realities:
              </span>

              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#23191d] rounded transition-colors">
                <span className="text-[#f1dee3]">Off-Hours Interactive Logon (+14 pts)</span>
                <input
                  type="checkbox"
                  checked={sigLogon}
                  onChange={e => setSigLogon(e.target.checked)}
                  className="accent-[#ff544c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#23191d] rounded transition-colors">
                <span className="text-[#f1dee3] font-bold">USB Mass Storage Mount (+28 pts, Pivotal)</span>
                <input
                  type="checkbox"
                  checked={sigUsb}
                  onChange={e => setSigUsb(e.target.checked)}
                  className="accent-[#ff544c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#23191d] rounded transition-colors">
                <span className="text-[#f1dee3]">Restricted Financial File Copy (+24 pts)</span>
                <input
                  type="checkbox"
                  checked={sigFiles}
                  onChange={e => setSigFiles(e.target.checked)}
                  className="accent-[#ff544c] w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-1.5 hover:bg-[#23191d] rounded transition-colors">
                <span className="text-[#f1dee3]">Cloud POST Transmission (+18 pts)</span>
                <input
                  type="checkbox"
                  checked={sigCloud}
                  onChange={e => setSigCloud(e.target.checked)}
                  className="accent-[#ff544c] w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Dynamic Result Box */}
            <div
              className={`p-4 rounded-xl flex items-center justify-between border transition-all ${
                isAlertActive
                  ? 'bg-[#150c0f] border-[#ff544c]/40'
                  : 'bg-[#150c0f] border-[#5d3f3c]/40'
              }`}
            >
              <div className="flex flex-col gap-1 font-mont">
                <span className="font-mont text-[10px] text-[#ad8884] uppercase">SIMULATION RESULT</span>
                <span className="text-sm sm:text-base text-[#f1dee3] font-bold">
                  {isAlertActive ? 'Alert Active — High Risk (Score ' + simulatedScore + ')' : 'Threshold Cleared (Score ' + simulatedScore + ')'}
                </span>
                <span className="font-mont text-xs text-[#e6bdb8]">
                  {isAlertActive
                    ? 'The unauthorized USB copy pushes the incident over the alert limit (65).'
                    : 'Without the USB copy, late-night login alone is rated safe.'}
                </span>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-4 font-mont">
                <span
                  className={`font-mont text-3xl font-black ${
                    isAlertActive ? 'text-[#ff544c]' : 'text-[#ffb3b5]'
                  }`}
                >
                  {simulatedScore}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mont text-[10px] uppercase font-bold ${
                    isAlertActive ? 'bg-[#93000a] text-[#ffdad6]' : 'bg-[#271d21] text-[#ffb3b5]'
                  }`}
                >
                  {isAlertActive ? 'Alert Active' : 'Normal / Safe'}
                </span>
              </div>
            </div>

            {/* Dynamic Legal Finding Formulation */}
            <div className="p-3.5 rounded-lg bg-[#150c0f] flex items-start gap-2.5 border border-[#5d3f3c]/20 font-mont">
              <span className="material-symbols-outlined text-[#ffb3b5] text-[20px] shrink-0 mt-0.5">lightbulb</span>
              <p className="font-mont text-xs text-[#e6bdb8] leading-relaxed">
                <strong className="text-[#f1dee3]">Key Takeaway: </strong>
                {takeawayMessage}
              </p>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  </div>
  )
}
