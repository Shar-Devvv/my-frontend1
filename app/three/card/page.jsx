"use client";
import { Canvas } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';


export default function Resume3D() {
return (
<div className="w-full h-screen bg-gray-950">
<Canvas>
<ambientLight />
<Text fontSize={0.7} color="white" position={[0, 1, 0]}>
Sneha's Resume
</Text>
<mesh position={[0, -1, 0]}>
<planeGeometry args={[4, 2]} />
<meshStandardMaterial color={"#222"} />
</mesh>
<OrbitControls />
</Canvas>
</div>
);
}