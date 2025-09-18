import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface VRMViewerProps {
  characterId: 'maria' | 'akira'
  emotion: string
  isThinking: boolean
  className?: string
}

const VRMViewer = ({ characterId, emotion, isThinking, className }: VRMViewerProps) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene>()
  const rendererRef = useRef<THREE.WebGLRenderer>()
  const cameraRef = useRef<THREE.PerspectiveCamera>()
  const vrmRef = useRef<any>()
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const animationIdRef = useRef<number>()

  // Character configurations
  const characterConfig = {
    maria: {
      modelPath: '/models/maria/maria.vrm',
      position: [0, -1.5, 0],
      scale: 1.2,
      flag: '🇪🇸'
    },
    akira: {
      modelPath: '/models/akira/akira.vrm', 
      position: [0, -1.5, 0],
      scale: 1.2,
      flag: '🇯🇵'
    }
  }

  useEffect(() => {
    if (!mountRef.current) return

    // Initialize Three.js scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      30,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    )
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance" 
    })

    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    
    mountRef.current.appendChild(renderer.domElement)

    // Store refs
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera

    // Set up lighting
    setupLighting(scene)

    // Position camera
    camera.position.set(0, 0, 2.5)
    camera.lookAt(0, -0.5, 0)

    // Try to load VRM model
    loadVRMModel()

    // Start render loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      // Update VRM animations based on emotion and thinking state
      updateVRMAnimations()
      
      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return
      
      const width = mountRef.current.clientWidth
      const height = mountRef.current.clientHeight
      
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [characterId])

  const setupLighting = (scene: THREE.Scene) => {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    // Directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3)
    fillLight.position.set(-1, 0, 1)
    scene.add(fillLight)
  }

  const loadVRMModel = async () => {
    try {
      setIsLoading(true)
      setHasError(false)

      const config = characterConfig[characterId]
      
      // Check if VRM file exists
      const response = await fetch(config.modelPath, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error('VRM file not found')
      }

      // Import VRM loader dynamically to reduce bundle size
      const { VRMLoaderPlugin } = await import('@pixiv/three-vrm')
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

      const loader = new GLTFLoader()
      loader.register((parser) => new VRMLoaderPlugin(parser))

      const gltf = await loader.loadAsync(config.modelPath)
      const vrm = gltf.userData.vrm

      if (!vrm) {
        throw new Error('Invalid VRM file')
      }

      // Configure VRM
      vrm.scene.position.set(...config.position)
      vrm.scene.scale.setScalar(config.scale)
      
      // Reset T-pose - set character to neutral standing position
      if (vrm.humanoid) {
        // Reset arms to natural position
        const leftUpperArm = vrm.humanoid.getBoneNode('leftUpperArm')
        const rightUpperArm = vrm.humanoid.getBoneNode('rightUpperArm')
        const leftLowerArm = vrm.humanoid.getBoneNode('leftLowerArm')
        const rightLowerArm = vrm.humanoid.getBoneNode('rightLowerArm')
        
        if (leftUpperArm) {
          leftUpperArm.rotation.z = -0.5  // Bring arms down
          leftUpperArm.rotation.x = 0.2   // Slight forward
        }
        if (rightUpperArm) {
          rightUpperArm.rotation.z = 0.5   // Bring arms down
          rightUpperArm.rotation.x = 0.2   // Slight forward
        }
        if (leftLowerArm) {
          leftLowerArm.rotation.z = 0.8    // Bend elbow naturally
        }
        if (rightLowerArm) {
          rightLowerArm.rotation.z = -0.8   // Bend elbow naturally
        }
        
        // Slight forward lean for more natural pose
        const spine = vrm.humanoid.getBoneNode('spine')
        if (spine) spine.rotation.x = 0.1
      }

      // Add to scene
      if (sceneRef.current) {
        // Remove previous model if exists
        if (vrmRef.current) {
          sceneRef.current.remove(vrmRef.current.scene)
        }
        
        sceneRef.current.add(vrm.scene)
        vrmRef.current = vrm
      }

      setIsLoading(false)
    } catch (error) {
      console.warn('VRM loading failed:', error)
      setHasError(true)
      setIsLoading(false)
    }
  }

  const updateVRMAnimations = () => {
    if (!vrmRef.current) return

    const vrm = vrmRef.current
    const time = performance.now() * 0.001

    // Update VRM (required for animations)
    vrm.update(1 / 60)

    // Apply emotion-based expressions
    if (vrm.expressionManager) {
      // Reset all expressions
      vrm.expressionManager.setValue('happy', 0)
      vrm.expressionManager.setValue('sad', 0)
      vrm.expressionManager.setValue('surprised', 0)
      vrm.expressionManager.setValue('angry', 0)

      // Apply current emotion
      switch (emotion) {
        case 'happy':
        case 'excited':
          vrm.expressionManager.setValue('happy', 0.8)
          break
        case 'thoughtful':
          vrm.expressionManager.setValue('surprised', 0.3)
          break
        case 'encouraging':
          vrm.expressionManager.setValue('happy', 0.6)
          break
        default:
          // Neutral expression
          break
      }

      // Add thinking animation (subtle head movement)
      if (isThinking) {
        const headBone = vrm.humanoid?.getBoneNode('head')
        if (headBone) {
          headBone.rotation.y = Math.sin(time * 2) * 0.1
          headBone.rotation.x = Math.sin(time * 1.5) * 0.05
        }
      }
    }

    // Subtle breathing animation
    if (vrm.scene) {
      vrm.scene.scale.y = 1 + Math.sin(time * 1.5) * 0.01
    }
  }

  // Fallback placeholder when VRM is not available
  const renderPlaceholder = () => {
    const config = characterConfig[characterId]
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-6xl mb-4 ${isThinking ? 'animate-bounce' : ''}`}>
          {config.flag}
        </div>
        <div className="text-center text-slate-400">
          <p className="text-sm mb-2">3D Character Model</p>
          {hasError ? (
            <div className="text-xs">
              <p>VRM file not found</p>
              <p>Place {characterId}.vrm in:</p>
              <p className="font-mono">public/models/{characterId}/</p>
            </div>
          ) : isLoading ? (
            <p className="text-xs">Loading VRM model...</p>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mountRef} 
        className="w-full h-full"
        style={{ background: 'transparent' }}
      />
      {(isLoading || hasError) && renderPlaceholder()}
    </div>
  )
}

export default VRMViewer