import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export const CryptoIdolPlaceholder = () => {
  const microphoneRef = useRef()
  const wave1Ref = useRef()
  const wave2Ref = useRef()

  // Animation loop for the pulsing waves
  useFrame((state, delta) => {
    // Rotate the microphone slightly for a dynamic effect
    microphoneRef.current.rotation.y += delta * 0.5

    // Make the waves pulsate
    wave1Ref.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime()) * 0.1
    wave1Ref.current.scale.y = 1 + Math.sin(state.clock.getElapsedTime()) * 0.1
    wave1Ref.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime()) * 0.1

    wave2Ref.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime() + 1) * 0.15
    wave2Ref.current.scale.y = 1 + Math.sin(state.clock.getElapsedTime() + 1) * 0.15
    wave2Ref.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime() + 1) * 0.15
  })

  return (
    <group position={[0, 1, 0]}>
      {/* Microphone Icon */}
      <mesh ref={microphoneRef} position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 32]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* First Pulsing Wave */}
      <mesh ref={wave1Ref} position={[0, 0, 0]}>
        <ringGeometry args={[1.2, 1.3, 64]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.5} />
      </mesh>

      {/* Second Pulsing Wave */}
      <mesh ref={wave2Ref} position={[0, 0, 0]}>
        <ringGeometry args={[1.5, 1.6, 64]} />
        <meshStandardMaterial color="#3b82f6" transparent opacity={0.3} />
      </mesh>
    </group>
  )
}
