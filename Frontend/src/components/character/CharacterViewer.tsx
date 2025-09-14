

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Html } from '@react-three/drei';
import ModelErrorBoundary from './ModelErrorBoundary';
import * as THREE from 'three';

interface ModelProps {
  modelUrl: string;
}

function Model({ modelUrl }: ModelProps) {
  const [error, setError] = useState(false);
  const { scene } = useGLTF(modelUrl) as { scene: THREE.Group };

  if (error) {
    return (
      <Html center>
        <div className="text-red-500">Error loading model</div>
      </Html>
    );
  }

  return (
    <primitive 
      object={scene} 
      scale={2} 
      position={[0, -2, 0]} 
      onError={() => setError(true)}
    />
  );
}

interface CharacterViewerProps {
  modelUrl: string;
  className?: string;
}

const LoadingSpinner = () => (
  <Html center>
    <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 shadow rounded-md text-sky-500 bg-white/5 transition ease-in-out duration-150 cursor-not-allowed">
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading model...
    </div>
  </Html>
);

const CharacterViewer = ({ modelUrl, className = '' }: CharacterViewerProps) => {
  return (
    <ModelErrorBoundary>
      <div className={`relative ${className}`}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: 'transparent' as const }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <Suspense fallback={<LoadingSpinner />}>
            <Model modelUrl={modelUrl} />
            <Environment preset="city" />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 2.5}
              maxPolarAngle={Math.PI / 1.5}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>
    </ModelErrorBoundary>
  );
};

export default CharacterViewer;