"use client"
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';


export default function Hero3D() {
return (
<div className="w-full h-screen bg-black">
<Canvas>
<ambientLight intensity={0.7} />
<directionalLight position={[5, 5, 5]} intensity={1} />
<Float>
<mesh>
<icosahedronGeometry args={[2, 1]} />
<meshStandardMaterial wireframe />
</mesh>
</Float>
<OrbitControls enableZoom={false} />
</Canvas>
</div>
);
}