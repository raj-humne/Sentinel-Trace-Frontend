import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    THREE: any
  }
}

export default function ThreatOrb() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animId: number
    let cleanup: (() => void) | null = null

    const initScene = () => {
      const THREE = window.THREE
      if (!THREE || !container) return

      const width = container.clientWidth || window.innerWidth
      const height = container.clientHeight || window.innerHeight

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
      camera.position.z = 24

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      renderer.setSize(width, height)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setClearColor(0x000000, 0)
      container.appendChild(renderer.domElement)

      const colCinnabar = new THREE.Color('#F13030')
      const colCherry = new THREE.Color('#5A0001')
      const colPink = new THREE.Color('#F45B69')
      const colLavender = new THREE.Color('#F6E8EA')

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
      scene.add(ambientLight)
      const pLight1 = new THREE.PointLight(colCinnabar, 4, 60)
      pLight1.position.set(16, 14, 20)
      scene.add(pLight1)
      const pLight2 = new THREE.PointLight(colPink, 3, 50)
      pLight2.position.set(-16, -12, 15)
      scene.add(pLight2)

      const modelRoot = new THREE.Group()
      scene.add(modelRoot)

      // Core sphere — the big red orb
      const coreGeo = new THREE.SphereGeometry(6.2, 64, 64)
      const coreMat = new THREE.MeshPhongMaterial({
        color: colCinnabar, emissive: colCherry, emissiveIntensity: 0.7,
        shininess: 90, transparent: true, opacity: 0.92, flatShading: false,
      })
      const coreMesh = new THREE.Mesh(coreGeo, coreMat)
      modelRoot.add(coreMesh)

      // Icosahedron wireframe cage
      const cageGeo = new THREE.IcosahedronGeometry(7.6, 2)
      const cageMat = new THREE.MeshBasicMaterial({ color: colPink, wireframe: true, transparent: true, opacity: 0.5 })
      const cageMesh = new THREE.Mesh(cageGeo, cageMat)
      modelRoot.add(cageMesh)

      // Orbital rings
      const rings: { mesh: any; speed: number }[] = []
      const ringConfigs = [
        { r: 9.6, tube: 0.05, color: colLavender, rotX: 0.5, rotY: 0.2, speed: 0.012 },
        { r: 10.8, tube: 0.06, color: colCinnabar, rotX: 1.1, rotY: -0.4, speed: -0.014 },
        { r: 11.8, tube: 0.04, color: colPink, rotX: -0.7, rotY: 0.8, speed: 0.01 },
      ]
      ringConfigs.forEach(cfg => {
        const rMesh = new THREE.Mesh(
          new THREE.TorusGeometry(cfg.r, cfg.tube, 8, 100),
          new THREE.MeshBasicMaterial({ color: cfg.color, wireframe: true, transparent: true, opacity: 0.65 })
        )
        rMesh.rotation.x = cfg.rotX
        rMesh.rotation.y = cfg.rotY
        modelRoot.add(rMesh)
        rings.push({ mesh: rMesh, speed: cfg.speed })
      })

      // Beacon nodes
      const beaconGroup = new THREE.Group()
      modelRoot.add(beaconGroup)
      const beaconGeo = new THREE.SphereGeometry(0.4, 16, 16)
      const beaconMat = new THREE.MeshBasicMaterial({ color: colLavender })
      const beacons: { mesh: any; angle: number; speed: number; rad: number }[] = []
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2
        const rad = 9.6
        const bMesh = new THREE.Mesh(beaconGeo, beaconMat)
        bMesh.position.set(Math.cos(angle) * rad, Math.sin(angle * 2) * 2.2, Math.sin(angle) * rad)
        beaconGroup.add(bMesh)
        beacons.push({ mesh: bMesh, angle, speed: 0.012 + (i % 2) * 0.006, rad })
      }

      // Particles
      const pCount = 350
      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(pCount * 3)
      const pColors = new Float32Array(pCount * 3)
      for (let i = 0; i < pCount; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        const r = 8.5 + Math.random() * 11.5
        pPos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
        pPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
        pPos[i * 3 + 2] = r * Math.cos(phi)
        const col = Math.random() > 0.5 ? colCinnabar : (Math.random() > 0.4 ? colPink : colLavender)
        pColors[i * 3] = col.r; pColors[i * 3 + 1] = col.g; pColors[i * 3 + 2] = col.b
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3))
      const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.22, vertexColors: true, transparent: true, opacity: 0.8 }))
      modelRoot.add(particles)

      // Mouse
      let targetRotX = 0, targetRotY = 0, curRotX = 0, curRotY = 0
      const onMouseMove = (e: MouseEvent) => {
        targetRotY = ((e.clientX / window.innerWidth) - 0.5) * 2 * 1.6
        targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 2 * 1.2
      }
      window.addEventListener('mousemove', onMouseMove)

      const onResize = () => {
        const w = container.clientWidth || window.innerWidth
        const h = container.clientHeight || window.innerHeight
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
      window.addEventListener('resize', onResize)

      const clock = new THREE.Clock()
      const animate = () => {
        animId = requestAnimationFrame(animate)
        const elapsed = clock.getElapsedTime()
        curRotX += (targetRotX - curRotX) * 0.08
        curRotY += (targetRotY - curRotY) * 0.08
        modelRoot.rotation.y = elapsed * 0.22 + curRotY
        modelRoot.rotation.x = Math.sin(elapsed * 0.15) * 0.12 + curRotX
        cageMesh.rotation.y = -elapsed * 0.35
        cageMesh.rotation.z = elapsed * 0.15
        const pulse = 1 + Math.sin(elapsed * 2.2) * 0.03
        coreMesh.scale.set(pulse, pulse, pulse)
        rings.forEach(r => { r.mesh.rotation.z += r.speed })
        beacons.forEach(b => {
          b.angle += b.speed
          b.mesh.position.x = Math.cos(b.angle) * b.rad
          b.mesh.position.z = Math.sin(b.angle) * b.rad
          b.mesh.position.y = Math.sin(b.angle * 2 + elapsed) * 2.2
        })
        particles.rotation.y = elapsed * 0.05
        renderer.render(scene, camera)
      }
      animate()

      cleanup = () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)
        renderer.dispose()
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement)
      }
    }

    if (window.THREE) {
      initScene()
    } else {
      const script = document.createElement('script')
      script.src = 'https://ajax.googleapis.com/ajax/libs/threejs/r125/three.min.js'
      script.onload = initScene
      document.head.appendChild(script)
      return () => { if (document.head.contains(script)) document.head.removeChild(script) }
    }

    return () => { if (cleanup) cleanup() }
  }, [])

  return <div ref={containerRef} className="fixed inset-0 w-full h-full pointer-events-none" />
}
