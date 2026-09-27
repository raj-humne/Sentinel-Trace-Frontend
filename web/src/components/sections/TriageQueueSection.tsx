import { useState, useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Incident {
  id: string
  name: string
  initials: string
  time: string
  department: string
  description: string
  subtext: string
  riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk'
  riskColor: string
  lane: 'AUTO_FLAG' | 'ANALYST_REVIEW' | 'MONITOR' | 'SUPPRESSED'
  avatarBg: string
  avatarColor: string
  actionLabel: string
  actionStyle: string
}

const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-80942',
    name: 'David Marquardt',
    initials: 'DM',
    time: 'Today at 03:14 AM',
    department: 'R&D Propulsion',
    description: 'Connected unauthorized 64GB USB drive outside working hours and copied 1,400 confidential CAD drawings.',
    subtext: 'System action: Device locked automatically',
    riskLevel: 'High Risk',
    riskColor: 'bg-error-container text-primary font-bold',
    lane: 'AUTO_FLAG',
    avatarBg: 'bg-primary-container',
    avatarColor: 'text-on-primary-container',
    actionLabel: 'Review Lock',
    actionStyle: 'bg-primary-container hover:bg-primary text-on-primary-container font-bold',
  },
  {
    id: 'INC-80939',
    name: 'Rachel Laurent',
    initials: 'RL',
    time: 'Today at 02:49 AM',
    department: 'IT Infrastructure',
    description: 'Elevated administrator permissions across 4 core servers using an unmapped emergency key.',
    subtext: 'Change ticket exists, but scope does not match role',
    riskLevel: 'Medium Risk',
    riskColor: 'bg-secondary-container text-secondary font-bold',
    lane: 'ANALYST_REVIEW',
    avatarBg: 'bg-secondary-container',
    avatarColor: 'text-secondary',
    actionLabel: 'Review',
    actionStyle: 'bg-surface-container-high hover:bg-surface-bright text-on-surface',
  },
  {
    id: 'INC-80931',
    name: 'Kenji Tanaka',
    initials: 'KT',
    time: 'Today at 02:11 AM',
    department: 'Financial Audit',
    description: 'Uploaded an encrypted archive to an unapproved personal cloud service during quarterly close.',
    subtext: 'Archive size: 12.8 MB • Suspicious destination',
    riskLevel: 'Medium Risk',
    riskColor: 'bg-secondary-container text-secondary font-bold',
    lane: 'ANALYST_REVIEW',
    avatarBg: 'bg-secondary-container',
    avatarColor: 'text-secondary',
    actionLabel: 'Review',
    actionStyle: 'bg-surface-container-high hover:bg-surface-bright text-on-surface',
  },
  {
    id: 'INC-80912',
    name: 'Sarah Chen',
    initials: 'SC',
    time: 'Today at 01:22 AM',
    department: 'R&D Propulsion',
    description: 'Downloaded source code repository with 1.6x higher volume than usual weekly activity.',
    subtext: 'Verified internal VPN connection & two-factor approved',
    riskLevel: 'Low Risk',
    riskColor: 'bg-surface-container text-on-surface-variant font-bold',
    lane: 'MONITOR',
    avatarBg: 'bg-surface-container-high',
    avatarColor: 'text-on-surface-variant',
    actionLabel: 'Details',
    actionStyle: 'bg-surface-container-high hover:bg-surface-bright text-on-surface-variant',
  },
  {
    id: 'INC-80884',
    name: 'Alex Mendoza',
    initials: 'AM',
    time: 'Today at 00:44 AM',
    department: 'Administration',
    description: 'Single failed login password typo followed by immediate successful login.',
    subtext: 'Identified as routine human error; suppressed automatically',
    riskLevel: 'Low Risk',
    riskColor: 'bg-surface-container text-outline font-bold',
    lane: 'SUPPRESSED',
    avatarBg: 'bg-surface-container-high',
    avatarColor: 'text-outline',
    actionLabel: 'Details',
    actionStyle: 'bg-surface-container-high hover:bg-surface-bright text-outline',
  },
  {
    id: 'INC-80879',
    name: 'James Becker',
    initials: 'JB',
    time: 'Yesterday at 11:58 PM',
    department: 'R&D Propulsion',
    description: 'Attempted mass download of 42GB propulsion flight data via encrypted tunnel.',
    subtext: 'System action: User account suspended immediately',
    riskLevel: 'High Risk',
    riskColor: 'bg-error-container text-primary font-bold',
    lane: 'AUTO_FLAG',
    avatarBg: 'bg-primary-container',
    avatarColor: 'text-on-primary-container',
    actionLabel: 'Review Lock',
    actionStyle: 'bg-primary-container hover:bg-primary text-on-primary-container font-bold',
  },
]

export default function TriageQueueSection() {
  const [incidents] = useState<Incident[]>(INITIAL_INCIDENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLane, setSelectedLane] = useState<string>('ALL')

  // Inspector Tray state
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  // Verdict Modal state
  const [modalIncident, setModalIncident] = useState<Incident | null>(null)
  const [verdictType, setVerdictType] = useState('CONFIRM_MALICIOUS')
  const [verdictNotes, setVerdictNotes] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  const filteredIncidents = useMemo(() => {
    return incidents.filter(item => {
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLane = selectedLane === 'ALL' || item.lane === selectedLane
      return matchesSearch && matchesLane
    })
  }, [incidents, searchQuery, selectedLane])

  const openVerdict = (inc: Incident) => {
    setModalIncident(inc)
    setVerdictNotes('')
    setVerdictType('CONFIRM_MALICIOUS')
  }

  const handleCommitVerdict = () => {
    if (!modalIncident) return
    const id = modalIncident.id
    setNotification(`Verdict committed for ${id}: ${verdictType.replace('_', ' ')}`)
    setTimeout(() => setNotification(null), 4000)
    setModalIncident(null)
  }

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
      // Calibrated scale: large and imposing, but safely bounded within screen width
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

      // 2. The second page panel background & border materialize as you scroll further
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

      // 5. The rest of the second page content (cards, filter bar, table) slides up and fades in
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
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-secondary-container text-on-secondary-container px-4 py-2.5 rounded-lg shadow-2xl border border-primary/40 font-mont text-xs flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-primary text-[18px]">check_circle</span>
          <span>{notification}</span>
        </div>
      )}

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

      <div className="p-6 lg:p-8 flex flex-col gap-6">
        {/* Page Header - border-b is transparent until whole page content arrives */}
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
            SECURITY TRIAGE QUEUE
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
            Prioritizes multi-source behavioral anomalies across Risk and Confidence axes. Zero false-alarm escalation with human-in-the-loop review.
          </p>
        </div>

        {/* Content Wrapper for Scroll Scrub Transition */}
        <div ref={contentRef} className="flex flex-col gap-6 will-change-transform">
          {/* Top Analytical Grid: 2x2 Matrix HUD */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => setSelectedLane('AUTO_FLAG')}
            className={`bg-[#23191d] hover:bg-[#271d21] transition-all p-5 rounded-xl flex flex-col justify-between cursor-pointer border ${
              selectedLane === 'AUTO_FLAG' ? 'border-[#ff544c] ring-1 ring-[#ff544c]' : 'border-[#5d3f3c]/40'
            }`}
          >
            <div>
              <h3 className="text-base text-[#f1dee3] font-bold font-mont">Automatic Lock</h3>
              <p className="font-mont text-xs text-[#e6bdb8] mt-0.5">High risk, immediate containment</p>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-mont text-[#ffb4ac] font-bold text-2xl">14</span>
              <span className="font-mont text-xs text-[#e6bdb8]">needs dispatch</span>
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setSelectedLane('ANALYST_REVIEW')}
            className={`bg-[#23191d] hover:bg-[#271d21] transition-all p-5 rounded-xl flex flex-col justify-between cursor-pointer border ${
              selectedLane === 'ANALYST_REVIEW' ? 'border-[#f45b69] ring-1 ring-[#f45b69]' : 'border-[#5d3f3c]/40'
            }`}
          >
            <div>
              <h3 className="text-base text-[#f1dee3] font-bold font-mont">Needs Human Review</h3>
              <p className="font-mont text-xs text-[#e6bdb8] mt-0.5">Suspicious activity requiring check</p>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-mont text-[#ffb3b5] font-bold text-2xl">38</span>
              <span className="font-mont text-xs text-[#e6bdb8]">pending triage</span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setSelectedLane('MONITOR')}
            className={`bg-[#23191d] hover:bg-[#271d21] transition-all p-5 rounded-xl flex flex-col justify-between cursor-pointer border ${
              selectedLane === 'MONITOR' ? 'border-[#ad8884] ring-1 ring-[#ad8884]' : 'border-[#5d3f3c]/40'
            }`}
          >
            <div>
              <h3 className="text-base text-[#f1dee3] font-bold font-mont">Routine Monitoring</h3>
              <p className="font-mont text-xs text-[#e6bdb8] mt-0.5">Low risk normal baseline shifts</p>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-mont text-[#f1dee3] font-bold text-2xl">142</span>
              <span className="font-mont text-xs text-[#e6bdb8]">logged</span>
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => setSelectedLane('SUPPRESSED')}
            className={`bg-[#23191d] hover:bg-[#271d21] transition-all p-5 rounded-xl flex flex-col justify-between cursor-pointer border ${
              selectedLane === 'SUPPRESSED' ? 'border-[#ad8884] ring-1 ring-[#ad8884]' : 'border-[#5d3f3c]/40'
            }`}
          >
            <div>
              <h3 className="text-base text-[#f1dee3] font-bold font-mont">Filtered Noise</h3>
              <p className="font-mont text-xs text-[#e6bdb8] mt-0.5">Automated false positives cleared</p>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-mont text-[#ad8884] font-bold text-2xl">891</span>
              <span className="font-mont text-xs text-[#e6bdb8]">archived</span>
            </div>
          </div>
        </div>

        {/* Real-time Metric Mosaic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#150c0f] p-4 rounded-xl flex items-center justify-between border border-[#5d3f3c]/20">
            <div>
              <span className="font-mont text-xs text-[#e6bdb8] block">Incidents Requiring Action</span>
              <span className="font-mont text-[#ffb4ac] font-bold text-2xl">52</span>
            </div>
            <span className="material-symbols-outlined text-[#ffb4ac] text-[28px]">notification_important</span>
          </div>
          <div className="bg-[#150c0f] p-4 rounded-xl flex items-center justify-between border border-[#5d3f3c]/20">
            <div>
              <span className="font-mont text-xs text-[#e6bdb8] block">Reviewed Today</span>
              <span className="font-mont text-[#f1dee3] font-bold text-2xl">184</span>
            </div>
            <span className="material-symbols-outlined text-[#ffb3b5] text-[28px]">task_alt</span>
          </div>
          <div className="bg-[#150c0f] p-4 rounded-xl flex items-center justify-between border border-[#5d3f3c]/20">
            <div>
              <span className="font-mont text-xs text-[#e6bdb8] block">False Positive Rate</span>
              <span className="font-mont text-[#f1dee3] font-bold text-2xl">&lt;0.02%</span>
            </div>
            <span className="material-symbols-outlined text-[#ad8884] text-[28px]">verified</span>
          </div>
        </div>

        {/* Active Filtering Matrix Toolbar */}
        <div className="bg-[#23191d] p-4 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-[#5d3f3c]/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex items-center flex-1 max-w-xl">
              <span className="material-symbols-outlined absolute left-3 text-[#e6bdb8] text-[18px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by employee name or incident details..."
                className="bg-[#150c0f] text-[#f1dee3] font-mont text-sm pl-9 pr-3 py-1.5 rounded-lg outline-none w-full border border-[#5d3f3c]/30 focus:border-[#ff544c] transition-colors"
              />
            </div>
            <select
              value={selectedLane}
              onChange={e => setSelectedLane(e.target.value)}
              className="bg-[#150c0f] text-[#f1dee3] font-mont text-xs px-3 py-2 rounded-lg outline-none cursor-pointer border border-[#5d3f3c]/30 focus:border-[#ff544c]"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTO_FLAG">Automatic Lock (14)</option>
              <option value="ANALYST_REVIEW">Needs Human Review (38)</option>
              <option value="MONITOR">Routine Monitoring (142)</option>
              <option value="SUPPRESSED">Filtered Noise (891)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-[#e6bdb8] font-mont">
            <span>
              Showing <strong className="text-[#f1dee3]">{filteredIncidents.length}</strong> incidents
            </span>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedLane('ALL')
              }}
              className="px-3 py-1 bg-[#271d21] hover:bg-[#32272b] rounded text-[#f1dee3] transition-colors flex items-center gap-1 border border-[#5d3f3c]/30 font-mont"
            >
              <span className="material-symbols-outlined text-[15px]">refresh</span> Reset
            </button>
          </div>
        </div>

        {/* Live Incident Queue Table */}
        <div className="bg-[#23191d] rounded-xl overflow-hidden border border-[#5d3f3c]/30 shadow-2xl flex flex-col font-mont">
          {/* Table Header */}
          <div className="bg-[#150c0f] px-6 py-3 grid grid-cols-12 gap-3 items-center font-mont text-[11px] text-[#ad8884] uppercase tracking-wider border-b border-[#271d21]">
            <div className="col-span-12 sm:col-span-3">Time &amp; User</div>
            <div className="col-span-12 sm:col-span-5">What Happened</div>
            <div className="col-span-6 sm:col-span-2 text-center">Risk Level</div>
            <div className="col-span-6 sm:col-span-2 text-right">Action</div>
          </div>

          {/* Incident Rows */}
          <div className="flex flex-col divide-y divide-[#32272b]/50 font-mont">
            {filteredIncidents.map(inc => (
              <div
                key={inc.id}
                className="px-6 py-4 grid grid-cols-12 gap-3 items-center hover:bg-[#271d21]/70 transition-colors"
              >
                <div className="col-span-12 sm:col-span-3 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg ${inc.avatarBg} ${inc.avatarColor} flex items-center justify-center font-bold text-xs shrink-0 font-mont shadow-sm`}
                  >
                    {inc.initials}
                  </div>
                  <div>
                    <div className="text-[#f1dee3] font-bold text-sm font-mont">{inc.name}</div>
                    <div className="text-[#e6bdb8] font-mont text-xs">
                      {inc.time} • {inc.department}
                    </div>
                  </div>
                </div>

                <div className="col-span-12 sm:col-span-5">
                  <p className="text-[#f1dee3] font-mont text-sm leading-snug">{inc.description}</p>
                  <span className="font-mont text-xs text-[#ff544c] font-medium mt-1 block">
                    {inc.subtext}
                  </span>
                </div>

                <div className="col-span-6 sm:col-span-2 flex justify-start sm:justify-center">
                  <span
                    className={`px-2.5 py-1 rounded font-mont text-[11px] uppercase tracking-wider ${inc.riskColor}`}
                  >
                    {inc.riskLevel}
                  </span>
                </div>

                <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-2">
                  {inc.actionLabel === 'Details' ? (
                    <button
                      onClick={() => setSelectedIncident(inc)}
                      className="px-3 py-1.5 bg-[#32272b] hover:bg-[#42363a] text-[#f1dee3] rounded text-xs font-semibold transition-colors font-mont"
                    >
                      Details
                    </button>
                  ) : (
                    <button
                      onClick={() => openVerdict(inc)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors font-mont ${inc.actionStyle}`}
                    >
                      {inc.actionLabel}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {filteredIncidents.length === 0 && (
              <div className="p-8 text-center text-[#e6bdb8] font-mont text-sm">
                No incidents match the active search or lane filter.
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-[#150c0f] flex flex-wrap items-center justify-between gap-4 font-mont text-xs text-[#e6bdb8] border-t border-[#271d21]">
            <div className="flex items-center gap-2">
              <span>PAGE 01 / 181</span>
              <span className="text-[#5d3f3c]">•</span>
              <span>1,085 TOTAL INCIDENTS STORED</span>
              <span className="text-[#5d3f3c]">•</span>
              <span className="text-[#ff544c] font-bold">CERT r4.2 REPLAY ENGINE RUNNING</span>
            </div>
            <div className="flex items-center gap-1.5 font-mont">
              <button className="px-2.5 py-1 bg-[#271d21] hover:bg-[#32272b] text-[#f1dee3] rounded transition-colors text-xs font-mont">
                « PREV
              </button>
              <button className="px-2.5 py-1 bg-[#930f29] text-[#f1dee3] rounded font-bold text-xs font-mont">1</button>
              <button className="px-2.5 py-1 bg-[#271d21] hover:bg-[#32272b] text-[#f1dee3] rounded transition-colors text-xs font-mont">
                2
              </button>
              <button className="px-2.5 py-1 bg-[#271d21] hover:bg-[#32272b] text-[#f1dee3] rounded transition-colors text-xs font-mont">
                3
              </button>
              <span className="px-1 text-[#ad8884]">…</span>
              <button className="px-2.5 py-1 bg-[#271d21] hover:bg-[#32272b] text-[#f1dee3] rounded transition-colors text-xs font-mont">
                NEXT »
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Forensic Incident Detail Drawer */}
        {selectedIncident && (
          <div className="bg-[#23191d] p-6 rounded-xl shadow-2xl flex flex-col gap-4 border border-[#f45b69]/40 animate-fadeIn font-mont">
            <div className="flex items-center justify-between pb-3 border-b border-[#32272b]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[#ffb3b5] text-[26px]">troubleshoot</span>
                <div>
                  <span className="font-mont text-[10px] text-[#ffb3b5] uppercase tracking-widest block font-bold">
                    DETAILED FORENSIC AUDIT VIEW // {selectedIncident.id}
                  </span>
                  <span className="font-mont text-base text-[#f1dee3] font-bold">
                    Incident Audit: {selectedIncident.name} ({selectedIncident.department})
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="p-1.5 hover:bg-[#32272b] rounded-lg text-[#e6bdb8] hover:text-[#f1dee3] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#271d21] p-4 rounded-lg flex flex-col gap-1.5 border border-[#5d3f3c]/20">
                <span className="font-mont text-[10px] text-[#ad8884] uppercase tracking-wider">
                  GRAPH TOPOLOGY ANOMALY
                </span>
                <span className="font-mont text-xl text-[#ffb4ac] font-bold">0.942 Deviation</span>
                <p className="font-mont text-xs text-[#e6bdb8] leading-relaxed">
                  Node centrality increased by 380% over 48h rolling average. Lateral reach touches 12 non-whitelisted assets.
                </p>
              </div>

              <div className="bg-[#271d21] p-4 rounded-lg flex flex-col gap-1.5 border border-[#5d3f3c]/20">
                <span className="font-mont text-[10px] text-[#ad8884] uppercase tracking-wider">
                  SEMANTIC LOG TELEMETRY
                </span>
                <span className="font-mont text-xl text-[#ffb3b5] font-bold">High Jaccard Distance</span>
                <p className="font-mont text-xs text-[#e6bdb8] leading-relaxed">
                  CLI commands observed: <code className="text-[#ff544c] font-mont">tar -czvf</code>,{' '}
                  <code className="text-[#ff544c] font-mont">dd if=/dev/sdb</code>,{' '}
                  <code className="text-[#ff544c] font-mont">ssh-keygen -t ed25519</code>.
                </p>
              </div>

              <div className="bg-[#271d21] p-4 rounded-lg flex flex-col gap-1.5 border border-[#5d3f3c]/20">
                <span className="font-mont text-[10px] text-[#ad8884] uppercase tracking-wider">
                  RECOMMENDED TACTICAL ACTION
                </span>
                <span className="font-mont text-xl text-[#ffb4ac] font-bold">
                  Revoke &amp; Quarantined Isolation
                </span>
                <p className="font-mont text-xs text-[#e6bdb8] leading-relaxed">
                  Zero-trust network assertion suggests revoking Active Directory session ticket and triggering physical badge suspension.
                </p>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>

      {/* Modal: One-Click Triage Verdict (Human-In-The-Loop) */}
      {modalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn font-mont">
          <div className="bg-[#23191d] max-w-xl w-full p-6 rounded-2xl shadow-2xl flex flex-col gap-4 border border-[#f45b69]/40 relative font-mont">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#32272b]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#ff544c] flex items-center justify-center text-[#5c0005]">
                  <span className="material-symbols-outlined text-[19px]">verified</span>
                </div>
                <div>
                  <span className="font-mont text-[10px] text-[#ff544c] uppercase tracking-widest block font-bold">
                    L3 INCIDENT VERDICT DISPATCH // {modalIncident.id}
                  </span>
                  <span className="text-base text-[#f1dee3] font-bold font-mont">Adjudication: {modalIncident.name}</span>
                </div>
              </div>
              <button
                onClick={() => setModalIncident(null)}
                className="p-1 hover:bg-[#32272b] rounded-lg text-[#e6bdb8] hover:text-[#f1dee3] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="font-mont text-xs text-[#e6bdb8] leading-relaxed">
              Execute verified adjudication. Decision will be logged in the cryptographically chained audit log for
              HackIndore 4.0 // PS2 insider-threat verification.
            </div>

            {/* Verdict Radio Options */}
            <div className="flex flex-col gap-2 font-mont">
              <label
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-all border ${
                  verdictType === 'CONFIRM_MALICIOUS'
                    ? 'bg-[#271d21] border-[#ff544c]'
                    : 'bg-[#271d21]/60 border-[#5d3f3c]/30 hover:bg-[#271d21]'
                }`}
              >
                <input
                  type="radio"
                  name="verdict-decision"
                  value="CONFIRM_MALICIOUS"
                  checked={verdictType === 'CONFIRM_MALICIOUS'}
                  onChange={e => setVerdictType(e.target.value)}
                  className="mt-1 accent-[#ff544c]"
                />
                <div className="flex flex-col">
                  <span className="font-mont text-[11px] text-[#ffb4ac] font-bold uppercase">
                    CONFIRM INCIDENT (TRUE POSITIVE)
                  </span>
                  <span className="font-mont text-xs text-[#f1dee3] mt-0.5">
                    Escalate to Tier 4 Incident Response team &amp; trigger automated token revoking.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-all border ${
                  verdictType === 'BENIGN_JUSTIFIED'
                    ? 'bg-[#271d21] border-[#f45b69]'
                    : 'bg-[#271d21]/60 border-[#5d3f3c]/30 hover:bg-[#271d21]'
                }`}
              >
                <input
                  type="radio"
                  name="verdict-decision"
                  value="BENIGN_JUSTIFIED"
                  checked={verdictType === 'BENIGN_JUSTIFIED'}
                  onChange={e => setVerdictType(e.target.value)}
                  className="mt-1 accent-[#ff544c]"
                />
                <div className="flex flex-col">
                  <span className="font-mont text-[11px] text-[#ffb3b5] font-bold uppercase">
                    BENIGN JUSTIFICATION (EXPLAINED DEVIATION)
                  </span>
                  <span className="font-mont text-xs text-[#f1dee3] mt-0.5">
                    Authorized emergency change ticket verified. Update user baseline graph.
                  </span>
                </div>
              </label>

              <label
                className={`p-3 rounded-lg flex items-start gap-3 cursor-pointer transition-all border ${
                  verdictType === 'FALSE_ALARM'
                    ? 'bg-[#271d21] border-[#ad8884]'
                    : 'bg-[#271d21]/60 border-[#5d3f3c]/30 hover:bg-[#271d21]'
                }`}
              >
                <input
                  type="radio"
                  name="verdict-decision"
                  value="FALSE_ALARM"
                  checked={verdictType === 'FALSE_ALARM'}
                  onChange={e => setVerdictType(e.target.value)}
                  className="mt-1 accent-[#ff544c]"
                />
                <div className="flex flex-col">
                  <span className="font-mont text-[11px] text-[#ad8884] font-bold uppercase">
                    FALSE ALARM FEEDBACK (MODEL CORRECTION)
                  </span>
                  <span className="font-mont text-xs text-[#f1dee3] mt-0.5">
                    Telemetry down-weighted. Weights feedback stream dispatched to sliding model.
                  </span>
                </div>
              </label>
            </div>

            {/* Justification Notes */}
            <div className="flex flex-col gap-1.5 font-mont">
              <label className="font-mont text-[10px] text-[#ad8884] uppercase tracking-wider">
                ANALYST AUDIT JUSTIFICATION &amp; TICKET REF
              </label>
              <textarea
                value={verdictNotes}
                onChange={e => setVerdictNotes(e.target.value)}
                placeholder="Provide forensic rationale (e.g., confirmed out-of-band with Dept Lead, ticket ref #CHG-4921)..."
                rows={3}
                className="w-full bg-[#150c0f] text-[#f1dee3] font-mont text-xs p-3 rounded-lg outline-none border border-[#5d3f3c]/30 focus:border-[#ff544c] transition-colors resize-none"
              />
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#32272b] font-mont">
              <span className="font-mont text-xs text-[#e6bdb8]">
                SIGNER: <span className="text-[#ffb4ac] font-bold">L3_ANALYST_09</span>
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setModalIncident(null)}
                  className="px-4 py-2 bg-[#271d21] hover:bg-[#32272b] text-[#f1dee3] font-mont text-xs uppercase rounded-lg transition-colors border border-[#5d3f3c]/30"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCommitVerdict}
                  className="px-5 py-2 bg-[#ff544c] hover:bg-[#fa3939] text-[#5c0005] font-mont text-xs font-bold uppercase rounded-lg transition-colors shadow-lg"
                >
                  Commit Verdict
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
