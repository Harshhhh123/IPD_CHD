import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, MeshDistortMaterial, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';






// Minimal Heart for background
function MinimalHeart() {
  const heartRef = useRef();
  
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (heartRef.current) {
      heartRef.current.rotation.y = t * 0.1;
      const heartbeat = Math.sin(t * 1.5) * 0.02 + 1;
      heartRef.current.scale.set(heartbeat, heartbeat, heartbeat);
    }
  });

  return (
    <group ref={heartRef} position={[0, 2, 0]}>
      <mesh position={[-0.4, 0.2, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color="#dc2626"
          metalness={0.3}
          roughness={0.4}
          distort={0.1}
          speed={1}
        />
      </mesh>
      
      <mesh position={[0.4, 0.2, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <MeshDistortMaterial
          color="#dc2626"
          metalness={0.3}
          roughness={0.4}
          distort={0.1}
          speed={1}
        />
      </mesh>
      
      <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}>
        <coneGeometry args={[0.8, 1.2, 32]} />
        <MeshDistortMaterial
          color="#dc2626"
          metalness={0.3}
          roughness={0.4}
          distort={0.15}
          speed={1}
        />
      </mesh>
    </group>
  );
}

function SubtleFloatingField({ count = 120, spread = 8 }) {
  const mesh = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        // random start
        pos: [ (Math.random() - 0.5) * spread, (Math.random() - 0.5) * spread*0.6, (Math.random() - 0.5) * spread ],
        speed: 0.2 + Math.random() * 0.6,
        rot: Math.random() * Math.PI * 2,
        scale: 0.06 + Math.random() * 0.12,
        sway: 0.5 + Math.random() * 1.5
      });
    }
    return arr;
  }, [count, spread]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!mesh.current) return;
    particles.forEach((p, i) => {
      const [x0, y0, z0] = p.pos;
      const yy = y0 + Math.sin(t * p.speed + p.rot) * (0.4 * p.sway) + Math.sin(i + t * 0.1) * 0.02;
      const xx = x0 + Math.cos(t * (p.speed * 0.5) + p.rot) * 0.08;
      const zz = z0 + Math.sin(t * (p.speed * 0.6) + p.rot) * 0.08;
      dummy.position.set(xx, yy + 1.0, zz);     // +1.0 lifts the cloud upward
      const s = p.scale * (0.85 + Math.sin(t * p.speed + i) * 0.15);
      dummy.scale.set(s, s, s);
      dummy.rotation.y = t * 0.1 + p.rot;
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[null, null, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        transparent
        opacity={0.28}
        roughness={0.8}
        metalness={0.0}
        color={"#ef4444"}
      />
    </instancedMesh>
  );
}
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.3} />
      {/* <SubtleParticles count={30} spread={10}/> */}
      <SubtleFloatingField count={90} spread={12} />
      <PerspectiveCamera makeDefault position={[2, 0, 8]} fov={50} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50"></div>
      
      {/* Minimal Three.js Background - Very subtle */}
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          
          
          {/* Minimal Logo */}
          {/* <div className="mb-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 mb-8 shadow-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div> */}

          {/* Hero Title - Apple Style */}
          <h1 className="text-5xl md:text-7xl font-semibold text-gray-900 mb-6 tracking-tight leading-[1.1] animate-fade-in">
            Advanced cardiac risk
            <br />
            <span className="text-red-600">
              assessment
            </span>
          </h1>
          <div className="absolute inset-0 z-0 opacity-[0.09]">
        <Canvas>
          <Scene />
        </Canvas>
      </div>

          
          {/* Subtitle - Clean and professional */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4 font-normal leading-relaxed animate-fade-in-delay max-w-3xl mx-auto">
          AI analysis for coronary heart disease risk prediction for upcoming 10 years.
          </p>
          
          <p className="text-base md:text-lg text-gray-500 mb-12 animate-fade-in-delay max-w-2xl mx-auto">
            Precision medicine • Evidence-based • Confidential
          </p>
          
          {/* Trust Badges - Minimal */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-16 animate-fade-in-delay">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">Clinically Validated</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full border border-gray-200">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-700 font-medium">HIPAA Compliant</span>
            </div>
          </div>

          {/* Feature Cards - Apple Minimalist */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14 animate-fade-in-delay-2 max-w-5xl mx-auto">
            <div className="group bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Guided Assessment</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Intuitive step-by-step process with intelligent validation</p>
            </div>
            
            <div className="group bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Advanced machine learning with 94% prediction accuracy</p>
            </div>
            
            <div className="group bg-white rounded-3xl p-10 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-50 transition-colors duration-300">
                <svg className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Privacy First</h3>
              <p className="text-sm text-gray-600 leading-relaxed">End-to-end encryption with zero data retention policy</p>
            </div>
          </div>

          {/* CTA Button - Apple Style */}
          <button
            onClick={onGetStarted}
            className="group relative px-10 py-4 bg-red-600 text-white text-base font-medium rounded-full
                     transform transition-all duration-200 hover:bg-red-700
                     animate-fade-in-delay-3 shadow-sm hover:shadow-md"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Begin Assessment
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>

          {/* Stats Section - Minimal */}
          <div className="mt-20 grid grid-cols-2 gap-12 max-w-2xl mx-auto animate-fade-in-delay-4 pt-12 border-t border-gray-200">
            <div className="text-center">
              <div className="text-4xl font-semibold text-gray-900 mb-2">93%</div>
              <div className="text-sm text-gray-500">Prediction Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-semibold text-gray-900 mb-2">2-3 min</div>
              <div className="text-sm text-gray-500">Assessment Duration</div>
            </div>
          </div>

          {/* Disclaimer - Clean */}
          <div className="mt-16 max-w-3xl mx-auto animate-fade-in-delay-5">
            <div className="bg-gray-50 rounded-2xl px-8 py-6 border border-gray-200">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-700 font-medium">Medical Disclaimer:</strong> This assessment provides an informational risk estimate based on clinical data and does not replace professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical decisions and personalized care.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }

        .animate-fade-in-delay {
          animation: fade-in 0.6s ease-out 0.15s both;
        }

        .animate-fade-in-delay-2 {
          animation: fade-in 0.6s ease-out 0.3s both;
        }

        .animate-fade-in-delay-3 {
          animation: fade-in 0.6s ease-out 0.45s both;
        }

        .animate-fade-in-delay-4 {
          animation: fade-in 0.6s ease-out 0.6s both;
        }

        .animate-fade-in-delay-5 {
          animation: fade-in 0.6s ease-out 0.75s both;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;