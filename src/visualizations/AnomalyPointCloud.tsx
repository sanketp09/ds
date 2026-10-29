import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MatchedEnvironmentalRecord } from '../data/types';
import { Crosshair } from 'lucide-react';

interface AnomalyPointCloudProps {
  data: MatchedEnvironmentalRecord[];
  selectedObservation: MatchedEnvironmentalRecord | null;
  onSelectObservation: (obs: MatchedEnvironmentalRecord) => void;
  className?: string;
}

export const AnomalyPointCloud: React.FC<AnomalyPointCloudProps> = ({
  data,
  selectedObservation,
  onSelectObservation,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDimensions, setActiveDimensions] = useState<'PM' | 'GAS' | 'WEATHER'>('PM');
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14213D); // Deep Oxford Navy #14213D

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(10, 8, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create 3D Bounding Box Guide
    const boxGeo = new THREE.BoxGeometry(8, 6, 8);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({ color: 0xE5E5E5, transparent: true, opacity: 0.2 });
    const boxLine = new THREE.LineSegments(boxEdges, boxMat);
    scene.add(boxLine);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(8, 8, 0xFCA311, 0x1E3A5F);
    gridHelper.position.y = -3;
    scene.add(gridHelper);

    const count = data.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const maxAqi = 430;
    const maxPm25 = 300;
    const maxPm10 = 420;
    const maxNo2 = 130;
    const maxCo = 3200;
    const maxTemp = 36;
    const maxHum = 100;

    data.forEach((r, i) => {
      const nx = ((r.aqi / maxAqi) - 0.5) * 8;
      
      let ny = 0;
      let nz = 0;

      if (activeDimensions === 'PM') {
        ny = ((r.pm25 / maxPm25) - 0.5) * 6;
        nz = ((r.pm10 / maxPm10) - 0.5) * 8;
      } else if (activeDimensions === 'GAS') {
        ny = ((r.no2 / maxNo2) - 0.5) * 6;
        nz = ((r.co / maxCo) - 0.5) * 8;
      } else {
        const t = r.weather?.tempMean || 27;
        const h = r.weather?.humidity || 65;
        ny = ((t / maxTemp) - 0.5) * 6;
        nz = ((h / maxHum) - 0.5) * 8;
      }

      positions[i * 3] = nx;
      positions[i * 3 + 1] = ny;
      positions[i * 3 + 2] = nz;

      if (r.isAnomaly) {
        // Electric Amber #FCA311
        colors[i * 3] = 0.988;
        colors[i * 3 + 1] = 0.639;
        colors[i * 3 + 2] = 0.067;
      } else {
        // Light Gray / White #E5E5E5
        colors[i * 3] = 0.898;
        colors[i * 3 + 1] = 0.898;
        colors[i * 3 + 2] = 0.898;
      }
    });

    const pointsGeo = new THREE.BufferGeometry();
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointsMat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.9
    });

    const pointCloud = new THREE.Points(pointsGeo, pointsMat);
    scene.add(pointCloud);

    // Selected Observation Target Indicator
    const targetGeo = new THREE.RingGeometry(0.2, 0.32, 16);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0xFCA311, side: THREE.DoubleSide });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.visible = false;
    scene.add(targetMesh);

    // Raycasting for interactive selection
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.3 };
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = new THREE.Spherical(16, Math.PI / 3, Math.PI / 4);

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        spherical.theta -= dx * 0.008;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi - dy * 0.008));
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      } else {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(pointCloud);
        if (intersects.length > 0 && intersects[0].index !== undefined) {
          const idx = intersects[0].index;
          setHoveredDate(data[idx].date);
        } else {
          setHoveredDate(null);
        }
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      isDragging = false;
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      
      raycaster.setFromCamera(new THREE.Vector2(clickX, clickY), camera);
      const intersects = raycaster.intersectObject(pointCloud);
      if (intersects.length > 0 && intersects[0].index !== undefined) {
        const idx = intersects[0].index;
        onSelectObservation(data[idx]);
      }
    };

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (selectedObservation) {
        const idx = data.findIndex(d => d.date === selectedObservation.date);
        if (idx !== -1) {
          targetMesh.visible = true;
          targetMesh.position.set(positions[idx * 3], positions[idx * 3 + 1], positions[idx * 3 + 2]);
          targetMesh.lookAt(camera.position);
          targetMesh.scale.setScalar(1 + Math.sin(Date.now() * 0.006) * 0.2);
        }
      } else {
        targetMesh.visible = false;
      }

      if (!isDragging) {
        spherical.theta += 0.001;
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 400;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      container.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      pointsGeo.dispose();
      pointsMat.dispose();
      boxGeo.dispose();
      boxEdges.dispose();
      boxMat.dispose();
      targetGeo.dispose();
      targetMat.dispose();
    };
  }, [data, activeDimensions, selectedObservation, onSelectObservation]);

  return (
    <div className={`relative bg-[#14213D] rounded-xl overflow-hidden border border-[#14213D] shadow-lg ${className}`}>
      <div ref={containerRef} className="w-full h-[400px] cursor-grab active:cursor-grabbing" />

      {/* Dimension Switcher Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#000000]/80 backdrop-blur-md px-3.5 py-1.5 rounded-md border border-[#E5E5E5]/20 pointer-events-auto shadow-md">
          <Crosshair size={13} className="text-[#FCA311]" />
          <span className="font-mono text-[10px] text-[#FFFFFF] font-bold tracking-wider">
            3D ANOMALY LATENT SPACE
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#000000]/90 backdrop-blur-md p-1 rounded-md border border-[#E5E5E5]/20 pointer-events-auto shadow-md">
          <button
            onClick={() => setActiveDimensions('PM')}
            className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded transition-all font-bold ${
              activeDimensions === 'PM' ? 'bg-[#FCA311] text-[#14213D]' : 'text-[#E5E5E5] hover:text-[#FFFFFF]'
            }`}
          >
            AQI / PM2.5 / PM10
          </button>
          <button
            onClick={() => setActiveDimensions('GAS')}
            className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded transition-all font-bold ${
              activeDimensions === 'GAS' ? 'bg-[#FCA311] text-[#14213D]' : 'text-[#E5E5E5] hover:text-[#FFFFFF]'
            }`}
          >
            AQI / NO2 / CO
          </button>
          <button
            onClick={() => setActiveDimensions('WEATHER')}
            className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded transition-all font-bold ${
              activeDimensions === 'WEATHER' ? 'bg-[#FCA311] text-[#14213D]' : 'text-[#E5E5E5] hover:text-[#FFFFFF]'
            }`}
          >
            AQI / TEMP / HUMIDITY
          </button>
        </div>
      </div>

      {/* Bottom Legend and Info */}
      <div className="absolute bottom-3 left-4 right-4 flex flex-col md:flex-row items-start md:items-end justify-between gap-2 pointer-events-none">
        <div className="bg-[#000000]/85 backdrop-blur-md px-3.5 py-2 rounded-md border border-[#E5E5E5]/20 pointer-events-auto flex items-center gap-4 text-[10px] font-mono shadow-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311]" />
            <span className="text-[#FFFFFF] font-bold">FLAGGED OUTLIERS (47 OBS)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
            <span className="text-[#E5E5E5]/90">NOMINAL OBSERVATIONS</span>
          </div>
          {hoveredDate && (
            <span className="text-[#FCA311] pl-2 border-l border-[#E5E5E5]/20 font-bold">
              HOVER: {hoveredDate}
            </span>
          )}
        </div>

        <div className="bg-[#000000]/85 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#E5E5E5]/20 text-[9px] font-mono text-[#E5E5E5]/90 pointer-events-auto shadow-md">
          DRAG TO ORBIT · CLICK ANY POINT TO INSPECT
        </div>
      </div>
    </div>
  );
};
