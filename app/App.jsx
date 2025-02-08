import React from 'react'
import MainFlow from './src/components/MainFlow'

import { TextDecoder, TextEncoder } from 'text-encoding'

// Needed to load the VRM model file
global.TextDecoder = TextDecoder
global.TextEncoder = TextEncoder

const App = () => {
  return <MainFlow />
}

export default App
