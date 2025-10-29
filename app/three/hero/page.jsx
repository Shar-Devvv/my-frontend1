"use client";

import { Canvas, useFrame, useLoader, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { TextureLoader, FontLoader } from "three";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import fontJson from "three/examples/fonts/helvetiker_regular.typeface.json";
import { useRef } from "react";

// ✅ Register TextGeometry so R3F accepts <textGeometry />
extend({ TextGeometry });

function FlipResumeCard() {
  const cardRef = useRef();

  // Load resume image
  const texture = useLoader(TextureLoader, "/resume-card.png");

  // Load font
  const font = new FontLoader().parse(fontJson);

  // Slow rotation
  useFrame(() => {
    cardRef.current.rotation.y += 0.01;
  });

  return (
    <group ref={cardRef}>
      {/* ✅ FRONT SIDE (Image) */}
      <mesh position={[0, 0, 0.075]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial map={texture} />
      </mesh>

      {/* ✅ BACK SIDE */}
      <mesh position={[0, 0, -0.075]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial color="#1a1a1a" />

        {/* ✅ Back Text */}
        <mesh position={[0, 0, 0.02]}>
          <textGeometry
            args={[
              "Resume Builder",
              {
                font,
                size: 0.35,
                height: 0.05,
                curveSegments: 12,
              },
            ]}
          />
          <meshStandardMaterial color="white" />
        </mesh>
      </mesh>

      {/* ✅ Card Thickness */}
      <mesh>
        <boxGeometry args={[3, 4, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="w-full h-[90vh] bg-gray-100 flex items-center justify-center">
      <Canvas camera={{ position: [5, 3, 7], fov: 45 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />

        <FlipResumeCard />

        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
