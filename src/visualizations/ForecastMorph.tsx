import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ForecastPoint } from '../data/types';
import { TrendingUp, GitCommit } from 'lucide-react';

interface ForecastMorphProps {
  series: ForecastPoint[];
  selectedModel: 'Holt-Winters' | 'Naive';
  className?: string;
}

export const ForecastMorph: React.FC<ForecastMorphProps> = ({
  series,
  selectedModel,
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x14213D); // Deep Oxford Navy #14213D

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 6, 16);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(16, 16, 0xFCA311, 0x1E3A5F);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    const count = series.length;
    const historicalPoints: THREE.Vector3[] = [];
    const forecastPoints: THREE.Vector3[] = [];

    let splitIndex = series.findIndex(s => s.isTestPeriod);
    if (splitIndex === -1) splitIndex = Math.floor(count * 0.8);

    series.forEach((pt, i) => {
      const x = ((i / (count - 1)) - 0.5) * 14;
      const y = (pt.actual / 320) * 3.5;
      const z = Math.sin(i * 0.2) * 0.8;
      const v = new THREE.Vector3(x, y, z);

      if (i <= splitIndex) {
        historicalPoints.push(v);
      }
      if (i >= splitIndex) {
        const projVal = (selectedModel === 'Holt-Winters' ? (pt.holtWinters ?? pt.actual) : (pt.naive ?? pt.actual));
        const fy = (projVal / 320) * 3.5;
        forecastPoints.push(new THREE.Vector3(x, fy, z));
      }
    });

    // Historical Line: Crisp White #FFFFFF
    const histCurve = new THREE.CatmullRomCurve3(historicalPoints);
    const histGeo = new THREE.TubeGeometry(histCurve, 64, 0.07, 8, false);
    const histMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const histMesh = new THREE.Mesh(histGeo, histMat);
    scene.add(histMesh);

    // Forecast Projection Line: Electric Amber #FCA311
    const fcastCurve = new THREE.CatmullRomCurve3(forecastPoints);
    const fcastGeo = new THREE.TubeGeometry(fcastCurve, 32, 0.09, 8, false);
    const fcastMat = new THREE.MeshBasicMaterial({ color: 0xFCA311 });
    const fcastMesh = new THREE.Mesh(fcastGeo, fcastMat);
    scene.add(fcastMesh);

    // Split Boundary Marker Vertical Plane
    const splitX = ((splitIndex / (count - 1)) - 0.5) * 14;
    const splitPlaneGeo = new THREE.PlaneGeometry(0.04, 5);
    const splitPlaneMat = new THREE.MeshBasicMaterial({
      color: 0xFCA311,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const splitPlane = new THREE.Mesh(splitPlaneGeo, splitPlaneMat);
    splitPlane.position.set(splitX, 1.5, 0);
    scene.add(splitPlane);

    // Instanced Nodes for Data Points
    const nodeGeo = new THREE.SphereGeometry(0.13, 12, 12);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFCA311 });
    const nodes = new THREE.InstancedMesh(nodeGeo, nodeMat, count);
    const dummy = new THREE.Object3D();

    series.forEach((pt, i) => {
      const x = ((i / (count - 1)) - 0.5) * 14;
      const val = pt.isTestPeriod 
        ? (selectedModel === 'Holt-Winters' ? (pt.holtWinters ?? pt.actual) : (pt.naive ?? pt.actual))
        : pt.actual;
      const y = (val / 320) * 3.5;
      const z = Math.sin(i * 0.2) * 0.8;
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      nodes.setMatrixAt(i, dummy.matrix);
    });
    nodes.instanceMatrix.needsUpdate = true;
    scene.add(nodes);

    let animId: number;
    let angle = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      angle += 0.002;
      camera.position.x = Math.sin(angle) * 3;
      camera.lookAt(0, 1.2, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight || 360;
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
      histGeo.dispose();
      histMat.dispose();
      fcastGeo.dispose();
      fcastMat.dispose();
      splitPlaneGeo.dispose();
      splitPlaneMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
    };
  }, [series, selectedModel]);

  return (
    <div className={`relative bg-[#14213D] rounded-xl overflow-hidden border border-[#14213D] shadow-lg ${className}`}>
      <div ref={containerRef} className="w-full h-[360px]" />

      <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-[#000000]/80 backdrop-blur-md px-3.5 py-1.5 rounded-md border border-[#E5E5E5]/20 pointer-events-auto shadow-md">
          <TrendingUp size={13} className="text-[#FCA311]" />
          <span className="font-mono text-[10px] text-[#FFFFFF] font-bold tracking-wider">
            3D TEMPORAL MORPH / {selectedModel.toUpperCase()}
          </span>
        </div>

        <div className="bg-[#000000]/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#E5E5E5]/20 text-[10px] font-mono text-[#FCA311] pointer-events-auto flex items-center gap-2 shadow-md font-bold">
          <GitCommit size={12} />
          <span>TRAIN / TEST HOLDOUT SPLIT (80% / 20%)</span>
        </div>
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-[#000000]/85 backdrop-blur-md px-3.5 py-2 rounded-md border border-[#E5E5E5]/20 pointer-events-auto flex items-center gap-4 text-[10px] font-mono shadow-md">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFFFFF]" />
            <span className="text-[#FFFFFF] font-bold">TRAINING HISTORY (AUG 2022 — JAN 2026)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FCA311]" />
            <span className="text-[#FCA311] font-bold">MODEL PROJECTION ({selectedModel})</span>
          </div>
        </div>

        <div className="bg-[#000000]/85 backdrop-blur-md px-3 py-1.5 rounded-md border border-[#E5E5E5]/20 text-[9px] font-mono text-[#E5E5E5]/80 pointer-events-auto shadow-md">
          ORTHOGRAPHIC TIME-ELEVATION CURVATURE
        </div>
      </div>
    </div>
  );
};
