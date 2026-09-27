import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StreamData {
  tabName: string
  raw: string
  canonical: string
}

const STREAMS: Record<string, StreamData> = {
  device: {
    tabName: 'Device (USB / Storage)',
    raw: `# raw device.csv row #18,440,291
id,date,user,pc,activity
"{C4F1-9920-BA}","08/14/2010 19:42:11","CMP1402","PC-9104","Connect"
"{C4F1-9920-BA}","08/14/2010 19:43:02","CMP1402","PC-9104","File Copy"
"{C4F1-9920-BA}","08/14/2010 19:48:40","CMP1402","PC-9104","Disconnect"`,
    canonical: `{
  "event_id": "7e9f3b145d81b9e2...04b",
  "user_id": "CMP1402",
  "role": "System Administrator",
  "department": "IT-Infrastructure",
  "timestamp": "2010-08-14T19:42:11Z",
  "activity_type": "DEVICE_CONNECT",
  "entity_attributes": {
    "device_sn": "9283-AA12",
    "vendor": "SanDisk Ultra 64GB",
    "is_first_seen": true,
    "baseline_deviation_sigma": 3.82
  }
}`,
  },
  logon: {
    tabName: 'Authentication / Logon',
    raw: `# raw logon.csv row #42,102,895
id,date,user,pc,activity
"{9F02-4411-AA}","08/14/2010 23:47:12","CMP1402","PC-9104","Logon"
"{9F02-4411-AA}","08/15/2010 03:14:02","CMP1402","PC-9104","Logoff"`,
    canonical: `{
  "event_id": "3a11b988f002cd...11e",
  "user_id": "CMP1402",
  "timestamp": "2010-08-14T23:47:12Z",
  "activity_type": "LOGON_INTERACTIVE",
  "entity_attributes": {
    "logon_type": 2,
    "auth_package": "Kerberos",
    "temporal_drift_hours": 3.78,
    "is_off_hours": true
  }
}`,
  },
  http: {
    tabName: 'Web / HTTP Proxy',
    raw: `# raw http.csv row #89,114,002
id,date,user,pc,url
"{11BC-7721-DF}","08/15/2010 00:31:05","CMP1402","PC-9104","https://drop-share.io/api/upload"`,
    canonical: `{
  "event_id": "99cfa11032ee81...44a",
  "user_id": "CMP1402",
  "timestamp": "2010-08-15T00:31:05Z",
  "activity_type": "HTTP_EXFIL_BURST",
  "entity_attributes": {
    "destination_host": "drop-share.io",
    "method": "POST",
    "bytes_sent": 88714240,
    "category": "UNCATEGORIZED_PERSONAL_STORAGE",
    "tls_fingerprint": "JA3: e35dfb027..."
  }
}`,
  },
  file: {
    tabName: 'File System Audit',
    raw: `# raw file.csv row #12,891,402
id,date,user,pc,filename,content_size
"{77BA-1102-CC}","08/15/2010 00:04:48","CMP1402","PC-9104","D:\\Vol_Ext\\archive.tar",88714240`,
    canonical: `{
  "event_id": "f550992bbca401...88f",
  "user_id": "CMP1402",
  "timestamp": "2010-08-15T00:04:48Z",
  "activity_type": "FILE_STAGE_ARCHIVE",
  "entity_attributes": {
    "target_path": "D:\\\\Vol_Ext\\\\archive.tar",
    "bytes_written": 88714240,
    "extension": ".tar",
    "is_compressed_archive": true
  }
}`,
  },
  email: {
    tabName: 'Email Gateway Logs',
    raw: `# raw email.csv row #04,228,110
id,date,user,pc,to,cc,size,attachments
"{88AA-9901-EE}","08/14/2010 18:22:04","CMP1402","PC-9104","ext-contractor@gmail.com","",491024,1`,
    canonical: `{
  "event_id": "dd810034ee7100...22b",
  "user_id": "CMP1402",
  "timestamp": "2010-08-14T18:22:04Z",
  "activity_type": "EMAIL_EXTERNAL_DISPATCH",
  "entity_attributes": {
    "recipient_domain": "gmail.com",
    "is_external": true,
    "has_attachment": true,
    "attachment_type": "application/zip"
  }
}`,
  },
}

export default function ArchitectureSection() {
  const [activeTab, setActiveTab] = useState<string>('device')
  const [copied, setCopied] = useState(false)

  const activeStream = STREAMS[activeTab]

  const handleCopy = () => {
    navigator.clipboard.writeText(activeStream.canonical)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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
              ARCHITECTURE &amp; DATA PROCESSING
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
              An end-to-end telemetry pipeline designed to detect real insider risk without slowing down employee systems or drowning security teams in false alerts.
            </p>
          </div>

          {/* Body Content with slide up */}
          <div ref={contentRef} className="flex flex-col gap-10 will-change-transform">

        {/* 3 Core Architecture Stages Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mont">
          {/* Stage 1 */}
          <div className="bg-[#23191d] p-6 rounded-xl flex flex-col justify-between gap-6 border border-[#5d3f3c]/40 hover:border-[#ffb4ac]/50 transition-colors shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mont text-xs uppercase tracking-wider px-3 py-1 rounded bg-[#32272b] text-[#ffb4ac] font-bold">
                  STAGE 01
                </span>
                <span className="material-symbols-outlined text-[#ffb4ac] text-[26px]">move_to_inbox</span>
              </div>
              <h3 className="text-lg font-bold text-[#f1dee3]">All Logs in One Place</h3>
              <p className="font-mont text-xs sm:text-sm text-[#e6bdb8] leading-relaxed">
                Ingests logins, USB drives, file edits, web requests, and emails without slowing down systems. Every
                event is unified into a consistent JSON structure in milliseconds.
              </p>
            </div>
            <div className="bg-[#150c0f] p-3 rounded-lg flex flex-col gap-1.5 font-mont text-xs border border-[#5d3f3c]/20">
              <div className="flex items-center justify-between">
                <span className="text-[#ad8884]">SCALE TESTED</span>
                <span className="text-[#ff544c] font-bold">32.7M Events</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ad8884]">COVERAGE</span>
                <span className="text-[#f1dee3]">5 Key Activity Feeds</span>
              </div>
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-[#23191d] p-6 rounded-xl flex flex-col justify-between gap-6 border border-[#5d3f3c]/40 hover:border-[#ffb3b5]/50 transition-colors shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mont text-xs uppercase tracking-wider px-3 py-1 rounded bg-[#32272b] text-[#ffb3b5] font-bold">
                  STAGE 02
                </span>
                <span className="material-symbols-outlined text-[#ffb3b5] text-[26px]">tune</span>
              </div>
              <h3 className="text-lg font-bold text-[#f1dee3]">Personal &amp; Team Baselines</h3>
              <p className="font-mont text-xs sm:text-sm text-[#e6bdb8] leading-relaxed">
                Learns what normal daily activity looks like for each individual and their peer group over 30 days.
                Automatically ignores whole-team spikes during audits or deadlines.
              </p>
            </div>
            <div className="bg-[#150c0f] p-3 rounded-lg flex flex-col gap-1.5 font-mont text-xs border border-[#5d3f3c]/20">
              <div className="flex items-center justify-between">
                <span className="text-[#ad8884]">CALIBRATION WINDOW</span>
                <span className="text-[#ffb3b5] font-bold">30-Day Rolling</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ad8884]">ALERT QUALITY</span>
                <span className="text-[#f1dee3]">Zero False Noise</span>
              </div>
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-[#23191d] p-6 rounded-xl flex flex-col justify-between gap-6 border border-[#5d3f3c]/40 hover:border-[#ffb4a9]/50 transition-colors shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-mont text-xs uppercase tracking-wider px-3 py-1 rounded bg-[#32272b] text-[#ffb4a9] font-bold">
                  STAGE 03
                </span>
                <span className="material-symbols-outlined text-[#ffb4a9] text-[26px]">hub</span>
              </div>
              <h3 className="text-lg font-bold text-[#f1dee3]">Instant Correlation</h3>
              <p className="font-mont text-xs sm:text-sm text-[#e6bdb8] leading-relaxed">
                Connects suspicious signals across different tools in real time into a single incident story, giving
                analysts the full timeline and context without manual investigation.
              </p>
            </div>
            <div className="bg-[#150c0f] p-3 rounded-lg flex flex-col gap-1.5 font-mont text-xs border border-[#5d3f3c]/20">
              <div className="flex items-center justify-between">
                <span className="text-[#ad8884]">DETECTION SPEED</span>
                <span className="text-[#ff544c] font-bold">&lt; 15 ms Response</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#ad8884]">OUTPUT</span>
                <span className="text-[#f1dee3]">Unified Incident Stories</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stream Inspector (Raw CSV vs Canonical JSON Schema) */}
        <div className="bg-[#23191d] p-6 rounded-xl flex flex-col gap-4 border border-[#5d3f3c]/30 shadow-xl font-mont">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#32272b]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ffb4ac] text-[20px]">terminal</span>
              <span className="font-bold text-sm text-[#f1dee3] uppercase tracking-wider font-mont">
                Live Telemetry Stream Inspector
              </span>
            </div>

            {/* Stream tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-[#150c0f] p-1 rounded-lg border border-[#5d3f3c]/30 font-mont text-xs">
              {Object.keys(STREAMS).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-3 py-1 rounded uppercase transition-colors ${
                    activeTab === key
                      ? 'bg-[#ff544c] text-[#5c0005] font-bold'
                      : 'text-[#e6bdb8] hover:text-[#f1dee3]'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
            {/* Left: Raw Ingest Stream */}
            <div className="bg-[#150c0f] p-4 rounded-xl flex flex-col gap-2 border border-[#5d3f3c]/30">
              <div className="flex items-center justify-between font-mont text-xs text-[#ad8884] pb-2 border-b border-[#271d21]">
                <span>RAW INGEST STREAM ({activeStream.tabName.toUpperCase()})</span>
                <span className="text-[#ff544c]">INPUT FORMAT</span>
              </div>
              <pre className="font-mont text-xs text-[#f1dee3]/90 overflow-x-auto whitespace-pre p-2 leading-relaxed">
                {activeStream.raw}
              </pre>
            </div>

            {/* Right: Unified Canonical Telemetry Schema */}
            <div className="bg-[#150c0f] p-4 rounded-xl flex flex-col gap-2 border border-[#ff544c]/30">
              <div className="flex items-center justify-between font-mont text-xs text-[#ffb4ac] pb-2 border-b border-[#271d21]">
                <span>CANONICAL NORMALIZED SCHEMA (SENTINEL TRACE)</span>
                <button
                  onClick={handleCopy}
                  className="px-2 py-0.5 bg-[#271d21] hover:bg-[#32272b] text-[#f1dee3] text-[10px] rounded transition-colors font-mont"
                >
                  {copied ? 'COPIED!' : 'COPY JSON'}
                </button>
              </div>
              <pre className="font-mont text-xs text-[#ffb3b5] overflow-x-auto whitespace-pre p-2 leading-relaxed">
                {activeStream.canonical}
              </pre>
            </div>
          </div>
        </div>

        {/* Guarantees & Safeguards Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mont">
          <div className="bg-[#150c0f] p-4 rounded-xl flex items-center gap-3 border border-[#5d3f3c]/20">
            <div className="w-9 h-9 rounded-lg bg-[#93000a]/50 flex items-center justify-center text-[#ffb4ac] shrink-0">
              <span className="material-symbols-outlined text-[22px]">lock</span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#f1dee3] block">Tamper-Proof Logs</span>
              <span className="font-mont text-xs text-[#e6bdb8]">
                Cryptographic Blake2b verification ensures records cannot be altered.
              </span>
            </div>
          </div>

          <div className="bg-[#150c0f] p-4 rounded-xl flex items-center gap-3 border border-[#5d3f3c]/20">
            <div className="w-9 h-9 rounded-lg bg-[#930f29]/50 flex items-center justify-center text-[#ffb3b5] shrink-0">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#f1dee3] block">Context-Aware</span>
              <span className="font-mont text-xs text-[#e6bdb8]">
                Understands job roles, departments, and working hours automatically.
              </span>
            </div>
          </div>

          <div className="bg-[#150c0f] p-4 rounded-xl flex items-center gap-3 border border-[#5d3f3c]/20">
            <div className="w-9 h-9 rounded-lg bg-[#ff544c]/20 flex items-center justify-center text-[#ff544c] shrink-0">
              <span className="material-symbols-outlined text-[22px]">bolt</span>
            </div>
            <div>
              <span className="text-sm font-bold text-[#f1dee3] block">Ultra Low Overhead</span>
              <span className="font-mont text-xs text-[#e6bdb8]">
                Sub-second processing with zero impact on workstation performance.
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
  )
}
