export const fetchLatestBlockStateHash = async () => {
  try {
    const response = await fetch('https://api.minaexplorer.com/blocks?limit=1')
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }
    const data = await response.json()
    // console.log(data.length > 0)
    // if (data.length > 0 && data['blocks'][0].stateHash) {
    return data['blocks'][0].stateHash // Return the stateHash as a string
    // } else {
    //   throw new Error('No state hash found in the response.')
    // }
  } catch (error) {
    console.error('Error fetching latest block state hash:', error)
    return null // Return null or handle errors appropriately
  }
}

// Generate a WAV header for PCM audio data
export const generateWavHeader = (numSamples, sampleRate = 44100, numChannels = 1, bitsPerSample = 16) => {
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8
  const blockAlign = (numChannels * bitsPerSample) / 8
  const dataSize = (numSamples * numChannels * bitsPerSample) / 8

  const buffer = new ArrayBuffer(44)
  const view = new DataView(buffer)

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + dataSize, true)
  writeString(view, 8, 'WAVE')

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size for PCM
  view.setUint16(20, 1, true) // AudioFormat 1 for PCM
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)

  // "data" sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, dataSize, true)

  return new Uint8Array(buffer)
}

// Helper to write an ASCII string into the DataView
const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

// Generate PCM data for a series of sine wave tones.
// For each frequency (each representing a character), a tone lasting `durationPerTone` seconds is generated.
export const generatePCMData = (frequencies, durationPerTone = 0.1, sampleRate = 44100) => {
  const totalSamples = Math.floor(sampleRate * durationPerTone * frequencies.length)
  const samples = new Int16Array(totalSamples)
  let sampleIndex = 0

  frequencies.forEach((freq) => {
    const toneSamples = Math.floor(sampleRate * durationPerTone)
    for (let i = 0; i < toneSamples; i++) {
      // Generate a sine wave sample
      const sampleValue = Math.sin(2 * Math.PI * freq * (i / sampleRate))
      // Scale the sample to 16-bit signed integer range
      samples[sampleIndex++] = sampleValue * 32767
    }
  })

  return new Uint8Array(samples.buffer)
}

export const getFrequencies = (str) => {
  const baseFrequency = 200
  const frequencyRange = 800
  return Array.from(str).map((char) => baseFrequency + (char.charCodeAt(0) % frequencyRange))
}
