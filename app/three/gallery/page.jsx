"use client";

import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";

function MiniCard({ position }) {
  return (
    <Float speed={2} floatIntensity={2} rotationIntensity={1}>
      <mesh position={position}>
        <boxGeometry args={[1.8, 2.6, 0.1]} />
        <meshStandardMaterial color="#fafafa" />
      </mesh>
    </Float>
  );
}

export default function Gallery3D() {
  return (
    <div className="w-full h-[90vh] bg-gray-50">
      <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight intensity={1} position={[4, 5, 5]} />

        <MiniCard position={[-3, 0, 0]} />
        <MiniCard position={[0, 0, 0]} />
        <MiniCard position={[3, 0, 0]} />

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
