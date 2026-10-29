import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export type TerrainMode = 'SURFACE' | 'POLLUTION' | 'TIME' | 'OBSERVATIONS';

interface AtmosphericTerrainProps {
  initialMode?: TerrainMode;
  className?: string;
}

export const AtmosphericTerrain: React.FC<AtmosphericTerrainProps> = ({
  initialMode = 'SURFACE',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<TerrainMode>(initialMode);
  const [reducedMotion, setReducedMotion] = useState(false);

  // References for animation loop
  const modeRef = useRef<TerrainMode>(initialMode);
  modeRef.current = mode;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up Three.js Scene, Camera, Renderer
    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14213D); // Deep Oxford Navy #14213D
    scene.fog = new THREE.FogExp2(0x14213D, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 10, 16);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // Grid Dimensions
    const GRID_X = 54;
    const GRID_Z = 36;
    const planeGeo = new THREE.PlaneGeometry(18, 12, GRID_X - 1, GRID_Z - 1);
    planeGeo.rotateX(-Math.PI / 2);

    const vertexCount = planeGeo.attributes.position.count;
    const basePositions = planeGeo.attributes.position.array.slice();
    const currentPositions = new Float32Array(basePositions);

    // Create 4 Target Height Buffers for Smooth Morphing
    const heightSurface = new Float32Array(vertexCount);
    const heightPollution = new Float32Array(vertexCount);
    const heightTime = new Float32Array(vertexCount);
    const heightObs = new Float32Array(vertexCount);

    for (let i = 0; i < vertexCount; i++) {
      const x = basePositions[i * 3];
      const z = basePositions[i * 3 + 2];

      const coastalMask = Math.exp(-Math.pow(x * 0.45, 2)) * Math.exp(-Math.pow(z * 0.25, 2));
      
      // State A: Quiet Topographic Surface
      heightSurface[i] = coastalMask * (Math.sin(x * 0.8) * Math.cos(z * 0.7) * 0.8 + 0.3);

      // State B: Localized Pollution Dome
      const plumeA = Math.exp(-Math.pow((x - 1.5) * 1.2, 2) - Math.pow((z + 1.0) * 1.2, 2)) * 2.8;
      const plumeB = Math.exp(-Math.pow((x + 2.0) * 1.5, 2) - Math.pow((z - 1.5) * 1.5, 2)) * 2.1;
      heightPollution[i] = coastalMask * 0.6 + plumeA + plumeB;

      // State C: Temporal Wave
      heightTime[i] = coastalMask * 0.4 + Math.sin(x * 1.2 + z * 0.6) * 1.2;

      // State D: Dispersed Point Cloud
      heightObs[i] = (i % 5 === 0) ? coastalMask * 1.8 : 0.05;
    }

    // Material 1: Wireframe Mesh with fine silver contour lines #E5E5E5
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xE5E5E5,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    const terrainMesh = new THREE.Mesh(planeGeo, wireframeMat);
    scene.add(terrainMesh);

    // Material 2: Points (Electric Amber #FCA311 and Pure White #FFFFFF)
    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    
    const pointColors = new Float32Array(vertexCount * 3);
    for (let i = 0; i < vertexCount; i++) {
      pointColors[i * 3] = 0.988;     // r (FCA311)
      pointColors[i * 3 + 1] = 0.639; // g
      pointColors[i * 3 + 2] = 0.067; // b
    }
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(pointColors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.13,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const pointsMesh = new THREE.Points(pointsGeo, pointsMat);
    scene.add(pointsMesh);

    // Floating Atmospheric Dust Particles #FCA311 and #FFFFFF (Instanced Mesh)
    const PARTICLE_COUNT = 240;
    const particleGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const particleMat = new THREE.MeshBasicMaterial({
      color: 0xFCA311, // Electric Amber
      transparent: true,
      opacity: 0.75
    });
    const particles = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_COUNT);
    const dummy = new THREE.Object3D();
    const particlePositions: { x: number; y: number; z: number; speed: number; phase: number }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const px = (Math.random() - 0.5) * 16;
      const py = 0.5 + Math.random() * 3.5;
      const pz = (Math.random() - 0.5) * 10;
      particlePositions.push({
        x: px,
        y: py,
        z: pz,
        speed: 0.005 + Math.random() * 0.008,
        phase: Math.random() * Math.PI * 2
      });
      dummy.position.set(px, py, pz);
      dummy.updateMatrix();
      particles.setMatrixAt(i, dummy.matrix);
    }
    scene.add(particles);

    // Pointer Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetCameraX = 0;
    let targetCameraY = 10;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = nx * 3.5;
      mouseY = ny * 1.5;
    };
    container.addEventListener('mousemove', handlePointerMove);

    // Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const posAttr = planeGeo.attributes.position as THREE.BufferAttribute;
    const ptPosAttr = pointsGeo.attributes.position as THREE.BufferAttribute;
    const ptColAttr = pointsGeo.attributes.color as THREE.BufferAttribute;

    const render = () => {
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();
      const currentMode = modeRef.current;

      // Parallax camera lerp
      targetCameraX = mouseX;
      targetCameraY = 10 + mouseY;
      camera.position.x += (targetCameraX - camera.position.x) * 0.05;
      camera.position.y += (targetCameraY - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);

      // Morph Heights based on currentMode
      let targetHeights = heightSurface;
      let targetPointOpacity = 0.7;
      let targetWireOpacity = 0.25;

      if (currentMode === 'POLLUTION') {
        targetHeights = heightPollution;
        targetPointOpacity = 0.95;
        targetWireOpacity = 0.35;
      } else if (currentMode === 'TIME') {
        targetHeights = heightTime;
        targetPointOpacity = 0.8;
        targetWireOpacity = 0.3;
      } else if (currentMode === 'OBSERVATIONS') {
        targetHeights = heightObs;
        targetPointOpacity = 1.0;
        targetWireOpacity = 0.15;
      }

      // Smooth geometry interpolation
      const lerpSpeed = 0.06;
      for (let i = 0; i < vertexCount; i++) {
        let th = targetHeights[i];
        
        if (!reducedMotion) {
          if (currentMode === 'TIME') {
            th += Math.sin(elapsed * 2.0 + basePositions[i * 3] * 0.8) * 0.35;
          } else {
            th += Math.sin(elapsed * 0.8 + basePositions[i * 3] * 0.5) * 0.04;
          }
        }

        const currentH = posAttr.getY(i);
        const newH = currentH + (th - currentH) * lerpSpeed;
        posAttr.setY(i, newH);
        ptPosAttr.setY(i, newH);

        // Color modulation: High elevation = Pure White #FFFFFF, baseline = Amber #FCA311
        if (newH > 1.2) {
          ptColAttr.setXYZ(i, 1.0, 1.0, 1.0); // Pure White peak
        } else {
          ptColAttr.setXYZ(i, 0.988, 0.639, 0.067); // Electric Amber #FCA311
        }
      }

      posAttr.needsUpdate = true;
      ptPosAttr.needsUpdate = true;
      ptColAttr.needsUpdate = true;

      pointsMat.opacity += (targetPointOpacity - pointsMat.opacity) * 0.08;
      wireframeMat.opacity += (targetWireOpacity - wireframeMat.opacity) * 0.08;

      if (!reducedMotion) {
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const p = particlePositions[i];
          p.x += p.speed;
          p.y += Math.sin(elapsed * 1.5 + p.phase) * 0.003;
          if (p.x > 9) p.x = -9;

          dummy.position.set(p.x, p.y, p.z);
          dummy.updateMatrix();
          particles.setMatrixAt(i, dummy.matrix);
        }
        particles.instanceMatrix.needsUpdate = true;
      }

      terrainMesh.rotation.y = Math.sin(elapsed * 0.12) * 0.06;
      pointsMesh.rotation.y = terrainMesh.rotation.y;

      renderer.render(scene, camera);
    };

    render();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 420;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      pointsGeo.dispose();
      particleGeo.dispose();
      wireframeMat.dispose();
      pointsMat.dispose();
      particleMat.dispose();
    };
  }, [reducedMotion]);

  const modeDescriptions: Record<TerrainMode, { title: string; desc: string; metric: string }> = {
    SURFACE: {
      title: 'Topographic Baseline',
      desc: 'Topographic contour mesh showing base coastal boundary layer elevation.',
      metric: 'MEAN BASELINE: 183.65 AQI'
    },
    POLLUTION: {
      title: 'Pollutant Field Deformation',
      desc: 'Synthetic spatial elevation expressing PM2.5/PM10 concentration gradients.',
      metric: 'PEAK INTENSITY: 423 (13 MAR 2023)'
    },
    TIME: {
      title: 'Seasonal Temporal Wave',
      desc: 'Harmonic surface wave representing cyclical monsoon drawdown & winter stagnation.',
      metric: 'AMPLITUDE: 63.63 (JUL) → 294.51 (NOV)'
    },
    OBSERVATIONS: {
      title: 'Data Point Cloud',
      desc: 'Discrete coordinate vertices reflecting 1,545 daily observational records.',
      metric: 'FLAGGED OUTLIERS: 47 OBSERVATIONS'
    }
  };

  return (
    <div className={`relative bg-[#14213D] rounded-xl overflow-hidden border border-[#14213D] shadow-lg ${className}`}>
      {/* 3D Canvas Mount */}
      <div 
        ref={containerRef} 
        className="w-full h-[360px] md:h-[430px] cursor-grab active:cursor-grabbing"
      />

      {/* Top Bar: Mode Selector */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#000000]/80 backdrop-blur-md px-3.5 py-1.5 rounded-md border border-[#E5E5E5]/20 pointer-events-auto shadow-md">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311] animate-pulse" />
          <span className="font-mono text-[10px] tracking-wider text-[#FFFFFF] font-bold">
            TERRAIN / {mode}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1 bg-[#000000]/90 backdrop-blur-md p-1 rounded-md border border-[#E5E5E5]/20 pointer-events-auto shadow-md">
          {(['SURFACE', 'POLLUTION', 'TIME', 'OBSERVATIONS'] as TerrainMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-[10px] font-mono tracking-wider transition-all rounded ${
                mode === m
                  ? 'bg-[#FCA311] text-[#14213D] font-bold shadow-sm'
                  : 'text-[#E5E5E5] hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar: Context Caption & Scientific Disclaimer */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-col md:flex-row md:items-end justify-between gap-2 pointer-events-none">
        <div className="bg-[#000000]/85 backdrop-blur-md p-3.5 rounded-md border border-[#E5E5E5]/20 max-w-md pointer-events-auto shadow-md">
          <div className="text-xs font-bold text-[#FFFFFF]">
            {modeDescriptions[mode].title}
          </div>
          <p className="text-[11px] text-[#E5E5E5] mt-0.5 leading-relaxed">
            {modeDescriptions[mode].desc}
          </p>
          <div className="mt-1.5 font-mono text-[10px] text-[#FCA311] tracking-wider font-bold">
            {modeDescriptions[mode].metric}
          </div>
        </div>

        <div className="bg-[#000000]/85 backdrop-blur-md px-3 py-2 rounded-md border border-[#E5E5E5]/20 text-[9px] font-mono text-[#E5E5E5]/80 pointer-events-auto flex items-center gap-3 shadow-md">
          <span>* CONCEPTUAL VISUALIZATION — NOT VERIFIED GEOGRAPHIC COORDINATES</span>
          <button 
            onClick={() => setReducedMotion(!reducedMotion)} 
            className="text-[9px] underline text-[#FCA311] hover:text-[#FFFFFF] font-semibold"
          >
            {reducedMotion ? 'Resume Motion' : 'Reduce Motion'}
          </button>
        </div>
      </div>
    </div>
  );
};
