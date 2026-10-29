import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CloudSun } from 'lucide-react';

interface AtmosphericFieldProps {
  activeVariable: 'tempMean' | 'humidity' | 'windSpeed' | 'precipitation';
  className?: string;
}

export const AtmosphericField: React.FC<AtmosphericFieldProps> = ({
  activeVariable,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const variableRef = useRef(activeVariable);
  variableRef.current = activeVariable;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14213D); // Deep Oxford Navy #14213D

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const GRID_SIZE = 40;
    const planeGeo = new THREE.PlaneGeometry(14, 10, GRID_SIZE - 1, GRID_SIZE - 1);
    planeGeo.rotateX(-Math.PI / 2);

    const count = planeGeo.attributes.position.count;
    const basePos = planeGeo.attributes.position.array.slice();

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xFCA311, // Electric Amber #FCA311
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const mesh = new THREE.Mesh(planeGeo, wireMat);
    scene.add(mesh);

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(basePos), 3));
    const pointsMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xFFFFFF, // Pure White #FFFFFF
      transparent: true,
      opacity: 0.85
    });
    const points = new THREE.Points(pointsGeo, pointsMat);
    scene.add(points);

    let animId: number;
    let clock = new THREE.Clock();

    const posAttr = planeGeo.attributes.position as THREE.BufferAttribute;
    const ptAttr = pointsGeo.attributes.position as THREE.BufferAttribute;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const currentVar = variableRef.current;

      let freq = 1.0;
      let amp = 0.5;
      let targetColor = 0xFCA311; // Amber

      if (currentVar === 'tempMean') {
        freq = 0.8;
        amp = 0.7;
        targetColor = 0xFCA311; // Electric Amber
      } else if (currentVar === 'humidity') {
        freq = 1.4;
        amp = 1.0;
        targetColor = 0xE5E5E5; // Clean Silver
      } else if (currentVar === 'windSpeed') {
        freq = 2.4;
        amp = 0.4;
        targetColor = 0xFFFFFF; // Pure White
      } else if (currentVar === 'precipitation') {
        freq = 1.8;
        amp = 1.3;
        targetColor = 0xFCA311; // Rain wave amber
      }

      wireMat.color.setHex(targetColor);

      for (let i = 0; i < count; i++) {
        const x = basePos[i * 3];
        const z = basePos[i * 3 + 2];
        const y = Math.sin(x * freq + elapsed * 1.5) * Math.cos(z * freq + elapsed) * amp;
        posAttr.setY(i, y);
        ptAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;
      ptAttr.needsUpdate = true;

      mesh.rotation.y = Math.sin(elapsed * 0.1) * 0.08;
      points.rotation.y = mesh.rotation.y;

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 340;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      planeGeo.dispose();
      pointsGeo.dispose();
      wireMat.dispose();
      pointsMat.dispose();
    };
  }, []);

  const varLabels = {
    tempMean: 'Mean Temperature Surface (°C)',
    humidity: 'Relative Humidity Saturation (%)',
    windSpeed: 'Wind Velocity Field (km/h)',
    precipitation: 'Monsoon Scavenging Precipitation (mm)'
  };

  return (
    <div className={`relative bg-[#14213D] rounded-xl overflow-hidden border border-[#14213D] shadow-lg ${className}`}>
      <div ref={containerRef} className="w-full h-[320px]" />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-[#000000]/80 backdrop-blur-md px-3.5 py-1.5 rounded-md border border-[#E5E5E5]/20 pointer-events-auto shadow-md">
          <CloudSun size={13} className="text-[#FCA311]" />
          <span className="font-mono text-[10px] text-[#FFFFFF] font-bold tracking-wider">
            3D ATMOSPHERIC FIELD / {activeVariable.toUpperCase()}
          </span>
        </div>

        <div className="bg-[#000000]/85 backdrop-blur-md px-3 py-1 rounded-md border border-[#E5E5E5]/20 text-[10px] font-mono text-[#FCA311] pointer-events-auto shadow-md font-bold">
          {varLabels[activeVariable]}
        </div>
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#000000]/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#E5E5E5]/20 text-[9px] font-mono text-[#E5E5E5]/80 pointer-events-auto shadow-md">
          * NORMALIZED FLUID SURFACE SIMULATION — REFLECTS METEOROLOGICAL FORCE DYNAMICS
        </div>
      </div>
    </div>
  );
};
