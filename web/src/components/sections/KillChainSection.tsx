import { useState, useMemo, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface Rule {
  id: string
  title: string
  description: string
  stage: 'recon' | 'credentials' | 'privesc' | 'collection' | 'exfil'
  severity: 'High Severity' | 'Elevated' | 'Critical'
  icon: string
  badgeColor: string
}

const RULES: Rule[] = [
  {
    id: 'R-01',
    title: 'First-Time USB Device',
    description: 'Flags storage drives never before used by this person on this workstation.',
    stage: 'collection',
    severity: 'High Severity',
    icon: 'usb',
    badgeColor: 'bg-[#93000a] text-[#ffdad6]',
  },
  {
    id: 'R-02',
    title: 'After-Hours Activity Spike',
    description: 'Detects major activity outside standard shift times exceeding 3 standard deviations.',
    stage: 'recon',
    severity: 'Elevated',
    icon: 'schedule',
    badgeColor: 'bg-[#930f29] text-[#ff9da1]',
  },
  {
    id: 'R-03',
    title: 'Bulk Sensitive File Copy',
    description: 'Detects rapid copying of confidential files or archives (>10 files in <30 seconds).',
    stage: 'collection',
    severity: 'High Severity',
    icon: 'folder_copy',
    badgeColor: 'bg-[#93000a] text-[#ffdad6]',
  },
  {
    id: 'R-04',
    title: 'Direct Cloud Storage Upload',
    description: 'Flags uploads to unauthorized personal cloud services and file-drop sites.',
    stage: 'exfil',
    severity: 'High Severity',
    icon: 'cloud_upload',
    badgeColor: 'bg-[#93000a] text-[#ffdad6]',
  },
  {
    id: 'R-05',
    title: 'Repeated Password Failures',
    description: 'Flags multiple login failures followed by immediate emergency privilege change.',
    stage: 'credentials',
    severity: 'Elevated',
    icon: 'password',
    badgeColor: 'bg-[#930f29] text-[#ff9da1]',
  },
  {
    id: 'R-06',
    title: 'Unmapped Emergency Admin Key',
    description: 'Detects elevation of root credentials without corresponding IT change management ticket.',
    stage: 'privesc',
    severity: 'Critical',
    icon: 'admin_panel_settings',
    badgeColor: 'bg-[#ff544c] text-[#5c0005]',
  },
]

interface TimelineNode {
  key: string
  title: string
  badge: string
  time: string
  risk: string
  confidence: string
  desc: string
  art1: string
  val1: string
  art2: string
  val2: string
}

const TIMELINE_NODES: Record<string, TimelineNode> = {
  logon: {
    key: 'logon',
    title: 'Off-Hours Interactive Logon',
    badge: 'STEP 01: INITIAL ACCESS (LOGON)',
    time: '23:47:12',
    risk: '38',
    confidence: '78%',
    desc: 'User logged onto endpoint PC-0941 at 11:47 PM local workstation time. Prior 90-day baseline shows 0% logins between 20:00 and 06:00.',
    art1: 'Logon_Type:',
    val1: 'Type 2 (Interactive Local)',
    art2: 'Auth_Package:',
    val2: 'Kerberos / Workstation-0941',
  },
  file_open: {
    key: 'file_open',
    title: 'Confidential Finance Sheet Access',
    badge: 'STEP 02: DISCOVERY (FILE READ)',
    time: '23:51:30',
    risk: '44',
    confidence: '82%',
    desc: 'Opened 3 high-sensitivity spreadsheets in quick succession (Q3_Forecast.xlsx, Executive_Salaries.xlsx, Treasury_Pool.accdb).',
    art1: 'Handle_Id:',
    val1: '0x3F8A (Direct Access)',
    art2: 'Process_Name:',
    val2: 'EXCEL.EXE / PID 4092',
  },
  device: {
    key: 'device',
    title: 'Mass Storage Ingestion (USB-Thumb)',
    badge: 'STEP 03: DEVICE ANOMALY',
    time: '23:59:04',
    risk: '73',
    confidence: '84%',
    desc: "Vendor: SanDisk Ultra 64GB (SN: 9283-AA12). Device class hasn't been mounted on PC-0941 for 244 days. Occurred immediately following financial doc opens.",
    art1: 'SysEvent_Log:',
    val1: 'EvtID: 20001 (PlugPlay)',
    art2: 'Registry_Key:',
    val2: 'USBSTOR\\DiskSanDisk...',
  },
  file_copy: {
    key: 'file_copy',
    title: 'Rapid Direct Volume File Copy',
    badge: 'STEP 04: COLLECTION',
    time: '00:04:48',
    risk: '68',
    confidence: '89%',
    desc: '14 files copied from local C:\\Users\\cvaughn\\Finance to removable mount point D:\\Vol_Ext\\ in under 12 seconds.',
    art1: 'Bytes_Transferred:',
    val1: '88,714,240 Bytes (84.6 MB)',
    art2: 'Target_Path:',
    val2: 'D:\\Vol_Ext\\archive.tar',
  },
  http_upload: {
    key: 'http_upload',
    title: 'Cloud Direct Exfiltration Burst',
    badge: 'STEP 05: EXFILTRATION',
    time: '00:31:05',
    risk: '82',
    confidence: '94%',
    desc: 'Outbound HTTP POST payload matching file copy byte size streamed to drop-share.io/api endpoint. Uncategorized external IP.',
    art1: 'Dest_Endpoint:',
    val1: '198.51.100.44:443 (drop-share)',
    art2: 'TLS_Fingerprint:',
    val2: 'JA3: e35dfb027... (Unknown CLI)',
  },
}

export default function KillChainSection() {
  const [activeStageFilter, setActiveStageFilter] = useState('all')
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('device')

  // Live Threat Simulator Sliders
  const [hoursDeviation, setHoursDeviation] = useState(3.2)
  const [usbVolumeMb, setUsbVolumeMb] = useState(380)
  const [toggleFirstTimeUsb, setToggleFirstTimeUsb] = useState(true)
  const [toggleCloud, setToggleCloud] = useState(true)

  // Threat score mathematical model (Log-odds sigmoid)
  const simulation = useMemo(() => {
    const basePrior = -4.6
    const hoursOdds = hoursDeviation > 1.0 ? Math.min(2.1, hoursDeviation * 0.32) : 0.1
    let usbWeight = usbVolumeMb > 50 ? Math.log10(usbVolumeMb + 1) * 0.95 : 0
    if (toggleFirstTimeUsb) usbWeight += 1.85
    if (toggleCloud) usbWeight += 1.75
    const cappedUsbOdds = Math.min(4.8, usbWeight)
    const mlOdds = 1.15
    const totalX = basePrior + hoursOdds + cappedUsbOdds + mlOdds

    const k = 0.85
    const x0 = 1.4
    const probability = 1 / (1 + Math.exp(-k * (totalX - x0)))
    const finalScore = Math.round(Math.min(99, Math.max(5, probability * 100)))

    let verdict = 'NOMINAL: NO ACTION'
    let verdictStyle = 'bg-[#32272b] text-[#e6bdb8]'
    let scoreColor = 'text-[#e6bdb8]'
    if (finalScore >= 70) {
      verdict = 'ESCALATION: SEV-1 CRITICAL'
      verdictStyle = 'bg-[#93000a] text-[#ffdad6] animate-pulse font-bold'
      scoreColor = 'text-[#ff544c]'
    } else if (finalScore >= 45) {
      verdict = 'ELEVATED: SEV-2 TRIAGE'
      verdictStyle = 'bg-[#930f29] text-[#ff9da1] font-bold'
      scoreColor = 'text-[#ffb3b5]'
    }

    return {
      finalScore,
      verdict,
      verdictStyle,
      scoreColor,
      hoursOdds: hoursOdds.toFixed(2),
      cappedUsbOdds: cappedUsbOdds.toFixed(2),
    }
  }, [hoursDeviation, usbVolumeMb, toggleFirstTimeUsb, toggleCloud])

  const filteredRules = useMemo(() => {
    if (activeStageFilter === 'all') return RULES
    return RULES.filter(r => r.stage === activeStageFilter)
  }, [activeStageFilter])

  const selectedNode = TIMELINE_NODES[selectedNodeKey]

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
        <div className="p-6 lg:p-8 flex flex-col gap-10">
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
              KILL-CHAIN DETECTION &amp; SCORING
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
              Combining deterministic security rules with bounded machine learning. The AI learns department habits so routine team spikes never trigger false alarms.
            </p>
          </div>

          {/* Body Content with slide up */}
          <div ref={contentRef} className="flex flex-col gap-10 will-change-transform">

        {/* AI Safeguard Banner */}
        <div className="bg-[#23191d] p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#5d3f3c]/40 font-mont">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#930f29]/50 flex items-center justify-center text-[#ffb3b5] shrink-0">
              <span className="material-symbols-outlined text-[24px]">smart_toy</span>
            </div>
            <div>
              <div className="text-sm font-bold text-[#f1dee3] font-mont">Bounded AI Influence (Capped at 18% Maximum)</div>
              <p className="font-mont text-xs text-[#e6bdb8] mt-0.5">
                Rules always remain explainable and transparent. Machine learning provides contextual weighting, not
                black-box decisions.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-[#930f29] text-[#ff9da1] text-xs uppercase font-mont rounded font-bold shrink-0">
            Protected by Design
          </span>
        </div>

        {/* 2-Column Section: Left = Security Rules Matrix, Right = Interactive Threat Playground */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-mont">
          {/* Left Column: Rules (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mont text-xs text-[#ad8884] uppercase tracking-wider font-bold">
                Security Rules Library
              </span>

              {/* Stage Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1 bg-[#150c0f] p-1 rounded-lg border border-[#5d3f3c]/30 text-xs font-mont">
                {['all', 'recon', 'credentials', 'privesc', 'collection', 'exfil'].map(stage => (
                  <button
                    key={stage}
                    onClick={() => setActiveStageFilter(stage)}
                    className={`px-2.5 py-1 rounded uppercase transition-colors font-mont ${
                      activeStageFilter === stage
                        ? 'bg-[#ff544c] text-[#5c0005] font-bold'
                        : 'text-[#e6bdb8] hover:text-[#f1dee3]'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 font-mont">
              {filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className="bg-[#23191d] hover:bg-[#271d21] p-4 rounded-xl flex items-center justify-between gap-3 transition-colors border border-[#5d3f3c]/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#32272b] flex items-center justify-center text-[#ffb4ac] shrink-0">
                      <span className="material-symbols-outlined text-[20px]">{rule.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#f1dee3] font-mont">{rule.title}</div>
                      <p className="font-mont text-xs text-[#e6bdb8] mt-0.5">{rule.description}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] uppercase font-mont font-bold shrink-0 ${rule.badgeColor}`}
                  >
                    {rule.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Interactive Threat Playground (5 Cols) */}
          <div className="lg:col-span-5 bg-[#23191d] p-6 rounded-xl flex flex-col gap-5 border border-[#ff544c]/30 shadow-2xl font-mont">
            <div className="flex items-center justify-between pb-3 border-b border-[#32272b]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#ff544c] text-[20px]">tune</span>
                <span className="font-mont text-sm font-bold text-[#f1dee3] uppercase tracking-wider">
                  Live Threat Playground
                </span>
              </div>
              <span className="font-mont text-[10px] text-[#ffb4ac] uppercase">Interactive Simulator</span>
            </div>

            {/* Score Output Banner */}
            <div className="bg-[#150c0f] p-4 rounded-xl flex items-center justify-between border border-[#5d3f3c]/30 font-mont">
              <div className="flex flex-col">
                <span className="font-mont text-[10px] text-[#ad8884] uppercase tracking-wider">
                  CALCULATED RISK SCORE
                </span>
                <span className={`font-mont text-4xl font-black ${simulation.scoreColor}`}>
                  {simulation.finalScore}
                </span>
                <span className="font-mont text-[11px] text-[#e6bdb8] mt-0.5">
                  Threshold: 65 for Alert
                </span>
              </div>
              <div className="flex flex-col items-end gap-1.5 font-mont">
                <span className={`px-2.5 py-1 rounded text-[10px] font-mont ${simulation.verdictStyle}`}>
                  {simulation.verdict}
                </span>
                <span className="font-mont text-[10px] text-[#ad8884]">
                  Hours (+{simulation.hoursOdds}) • USB (+{simulation.cappedUsbOdds})
                </span>
              </div>
            </div>

            {/* Sliders */}
            <div className="flex flex-col gap-4 font-mont text-xs">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[#f1dee3]">
                  <span className="font-bold">After-Hours Temporal Deviation:</span>
                  <span className="font-mont text-[#ffb4ac]">{hoursDeviation.toFixed(1)} hrs shift</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.2"
                  value={hoursDeviation}
                  onChange={e => setHoursDeviation(parseFloat(e.target.value))}
                  className="w-full accent-[#ff544c] cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[#f1dee3]">
                  <span className="font-bold">Removable Media Volume (MB):</span>
                  <span className="font-mont text-[#ffb4ac]">{usbVolumeMb} MB transferred</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1200"
                  step="25"
                  value={usbVolumeMb}
                  onChange={e => setUsbVolumeMb(parseInt(e.target.value))}
                  className="w-full accent-[#ff544c] cursor-pointer"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#32272b] font-mont">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#f1dee3]">Unrecognized First-Time USB Drive</span>
                  <input
                    type="checkbox"
                    checked={toggleFirstTimeUsb}
                    onChange={e => setToggleFirstTimeUsb(e.target.checked)}
                    className="accent-[#ff544c] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[#f1dee3]">Unapproved Personal Cloud Destination</span>
                  <input
                    type="checkbox"
                    checked={toggleCloud}
                    onChange={e => setToggleCloud(e.target.checked)}
                    className="accent-[#ff544c] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Attack Campaign Chrono-Correlation Sequence & Graph */}
        <div className="flex flex-col gap-5 pt-4 border-t border-[#32272b] font-mont">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[#ffb4ac] font-mont text-xs uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">timeline</span>
              <span>Incident Sequence &amp; Multi-Hop Chrono-Correlation</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#f1dee3] font-mont">
              Connecting Scattered Clues into One Complete Incident
            </h3>
            <p className="font-mont text-xs sm:text-sm text-[#e6bdb8]">
              Traditional tools inspect individual events in isolation and dismiss them as harmless. SentinelTrace connects
              them across hours into an unambiguous incident chain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Timeline Milestones (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-2.5 font-mont">
              {[
                { key: 'logon', num: 1, title: 'Late Night Login', time: '11:47 PM', tag: 'Initial Access' },
                { key: 'file_open', num: 2, title: 'Opened Financial Spreadsheets', time: '11:51 PM', tag: 'Discovery' },
                { key: 'device', num: 3, title: 'Plugged in USB Drive', time: '11:59 PM', tag: 'Device Anomaly' },
                { key: 'file_copy', num: 4, title: 'Copied 14 Confidential Files', time: '12:04 AM', tag: 'Collection' },
                { key: 'http_upload', num: 5, title: 'Uploaded Encrypted File to Web', time: '12:31 AM', tag: 'Exfiltration' },
              ].map(node => (
                <div
                  key={node.key}
                  onClick={() => setSelectedNodeKey(node.key)}
                  className={`p-3.5 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all border ${
                    selectedNodeKey === node.key
                      ? 'bg-[#271d21] border-[#ff544c] shadow-lg ring-1 ring-[#ff544c]'
                      : 'bg-[#23191d] border-[#5d3f3c]/30 hover:bg-[#271d21]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mont font-bold text-xs shrink-0 ${
                        selectedNodeKey === node.key
                          ? 'bg-[#ff544c] text-[#5c0005]'
                          : 'bg-[#32272b] text-[#ffb4ac]'
                      }`}
                    >
                      {node.num}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#f1dee3] flex items-center gap-2 font-mont">
                        <span>{node.title}</span>
                        <span className="font-mont text-xs text-[#ff544c]">({node.time})</span>
                      </div>
                      <span className="font-mont text-xs text-[#e6bdb8]">Click to inspect telemetry</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#150c0f] text-[#ffb3b5] text-[10px] uppercase font-mont rounded font-semibold shrink-0">
                    {node.tag}
                  </span>
                </div>
              ))}
            </div>

            {/* Selected Node Telemetry Inspector Drawer (5 Cols) */}
            <div className="lg:col-span-5 bg-[#23191d] p-5 rounded-xl flex flex-col gap-4 border border-[#5d3f3c]/40 shadow-xl font-mont">
              <div className="flex items-center justify-between pb-2 border-b border-[#32272b]">
                <span className="font-mont text-[10px] text-[#ffb4ac] uppercase font-bold">
                  {selectedNode.badge}
                </span>
                <span className="font-mont text-xs text-[#ff544c] font-bold">{selectedNode.time}</span>
              </div>

              <div>
                <h4 className="text-base font-bold text-[#f1dee3] font-mont">{selectedNode.title}</h4>
                <p className="font-mont text-xs text-[#e6bdb8] mt-1.5 leading-relaxed">
                  {selectedNode.desc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 font-mont">
                <div className="bg-[#150c0f] p-3 rounded-lg border border-[#5d3f3c]/30">
                  <span className="font-mont text-[10px] text-[#ad8884] block">RISK SCORE</span>
                  <span className="font-mont text-xl font-bold text-[#ff544c]">{selectedNode.risk}</span>
                </div>
                <div className="bg-[#150c0f] p-3 rounded-lg border border-[#5d3f3c]/30">
                  <span className="font-mont text-[10px] text-[#ad8884] block">CONFIDENCE</span>
                  <span className="font-mont text-xl font-bold text-[#ffb3b5]">
                    {selectedNode.confidence}
                  </span>
                </div>
              </div>

              <div className="bg-[#150c0f] p-3 rounded-lg flex flex-col gap-1 text-[11px] font-mont border border-[#5d3f3c]/30">
                <div className="flex justify-between">
                  <span className="text-[#ad8884]">{selectedNode.art1}</span>
                  <span className="text-[#f1dee3] font-medium">{selectedNode.val1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#ad8884]">{selectedNode.art2}</span>
                  <span className="text-[#ffb4ac] font-medium">{selectedNode.val2}</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
