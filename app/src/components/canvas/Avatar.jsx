import React, { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import CryptoIdol from './CryptoIdol'
import { CryptoIdolPlaceholder } from './CryptoIdolPlaceholder'

const Avatar = ({ state }) => {
  // State to manage whether the avatar has finished loading
  const [isAvatarLoaded, setIsAvatarLoaded] = useState(false)

  // This function will be called once the avatar has finished setting up
  const onLoadedAvatar = () => {
    setIsAvatarLoaded(true) // Hide loading and show the avatar
  }

  return (
    <Canvas
      onCreated={(state) => {
        const renderer = state.gl

        renderer.extensions.get('EXT_color_buffer_float')

        // Fix related to https://github.com/expo/expo-three/issues/196#issuecomment-1334807693
        const _gl = state.gl.getContext()
        const pixelStorei = _gl.pixelStorei.bind(_gl)
        _gl.pixelStorei = function(...args) {
          const [parameter] = args
          switch (parameter) {
            case _gl.UNPACK_FLIP_Y_WEBGL:
              return pixelStorei(...args)
          }
        }
      }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} />
      <pointLight position={[0, 5, 5]} intensity={1.2} />

      <PerspectiveCamera makeDefault fov={80} position={[0, -0.5, 5.2]} />

      {/* Show loading if the avatar hasn't loaded yet */}
      {!isAvatarLoaded && <CryptoIdolPlaceholder />}

      <Suspense fallback={CryptoIdolPlaceholder}>
        {/* Render the Avatar but keep it hidden until fully loaded */}
        <CryptoIdol
          position={[0, -1, 3.7]}
          rotation={[0, -Math.PI, 0]}
          avatarState={state}
          onLoadedAvatar={onLoadedAvatar} // Call this once avatar setup is complete
          visible={isAvatarLoaded} // Control avatar visibility
        />
      </Suspense>

    </Canvas>
  )
}

export default Avatar
