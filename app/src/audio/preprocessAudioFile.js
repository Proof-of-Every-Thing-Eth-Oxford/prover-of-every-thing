import * as FileSystem from 'expo-file-system'
import { Buffer } from 'buffer'
import calculateMelSpectrogram from './melSpectogram'

// Function to preprocess audio data
async function preprocessAudioFile(audioFilePath) {
  // Step 1: Load audio file (this will likely require a backend or a specific library)
  const [audioData, sampleRate] = await loadAndTrimWavFile(audioFilePath)

  if (!audioData) {
    console.error('Failed to load audio data')
    throw new Error('Failed to load audio data')
  }

  // Step 2: Trim silent segments from the audio
  const trimmedAudioData = await trimSilence(audioData)

  if (!trimmedAudioData.length) {
    console.warn('The audio file is silent or too short')
    throw new Error('The audio file is silent or too short')
  }

  // Step 3: Convert audio data to a mel spectrogram
  const melSpectrogram = calculateMelSpectrogram(trimmedAudioData, sampleRate)


  // TODO - adjust the mel spectrogram to match the data format of the small model - currently implemented for large model
  // Step 4: Reshape the mel spectrogram
  return reshapeMelSpectrogram(melSpectrogram)
}

// Function to load, trim, and convert WAV audio file to Meyda Signal format
async function loadAndTrimWavFile(audioFilePath) {
  // Step 1: Read the WAV file as binary data
  const fileData = await FileSystem.readAsStringAsync(audioFilePath, {
    encoding: FileSystem.EncodingType.Base64,
  })

  // Decode base64 and convert to an ArrayBuffer
  const audioBuffer = Buffer.from(fileData, 'base64')
  const dataView = new DataView(audioBuffer.buffer)

  // Step 2: Validate RIFF and WAVE headers
  const riff = String.fromCharCode(dataView.getUint8(0), dataView.getUint8(1), dataView.getUint8(2), dataView.getUint8(3))
  const wave = String.fromCharCode(dataView.getUint8(8), dataView.getUint8(9), dataView.getUint8(10), dataView.getUint8(11))

  if (riff !== 'RIFF' || wave !== 'WAVE') {
    throw new Error('Invalid WAV file format')
  }

  // Step 3: Find the `fmt ` chunk
  let offset = 12
  let sampleRate = 0

  while (offset < audioBuffer.length) {
    const chunkId = String.fromCharCode(
      dataView.getUint8(offset),
      dataView.getUint8(offset + 1),
      dataView.getUint8(offset + 2),
      dataView.getUint8(offset + 3),
    )
    const chunkSize = dataView.getUint32(offset + 4, true)

    if (chunkId === 'fmt ') {
      sampleRate = dataView.getUint32(offset + 12, true)
      offset += chunkSize + 8
      break
    } else {
      // Move to the next chunk
      offset += chunkSize + 8
    }
  }

  if (sampleRate === 0) {
    throw new Error('Sample rate not found in WAV file')
  }
  console.debug('Sample Rate:', sampleRate)

  // Step 4: Find all `data` chunks and accumulate audio data
  const audioDataChunks = []
  while (offset < audioBuffer.length) {
    const chunkId = String.fromCharCode(
      dataView.getUint8(offset),
      dataView.getUint8(offset + 1),
      dataView.getUint8(offset + 2),
      dataView.getUint8(offset + 3),
    )
    const chunkSize = dataView.getUint32(offset + 4, true)

    if (chunkId === 'data') {
      // Extract audio data from the current `data` chunk and store as a sub-array
      const dataOffset = offset + 8
      const rawData = audioBuffer.slice(dataOffset, dataOffset + chunkSize)
      audioDataChunks.push(new Int16Array(rawData.buffer))
      offset += chunkSize + 8
    } else {
      // Skip non-audio data chunks
      offset += chunkSize + 8
    }
  }

  // Flatten all `Int16Array` chunks into a single array without recursive push
  const audioData = new Int16Array(audioDataChunks.reduce((acc, chunk) => acc + chunk.length, 0))
  let offsetIndex = 0
  for (const chunk of audioDataChunks) {
    audioData.set(chunk, offsetIndex)
    offsetIndex += chunk.length
  }

  // Step 5: Convert accumulated audio data to Float32 and normalize
  const float32Array = new Float32Array(audioData.length)
  for (let i = 0; i < audioData.length; i++) {
    float32Array[i] = audioData[i] / 32768 // Normalize to range -1.0 to 1.0
  }

  // Step 6: Trim audio to start at 0.5 seconds and last for 3 seconds
  const startSample = Math.round(0.5 * sampleRate)
  const endSample = Math.min(float32Array.length, Math.floor(3.5 * sampleRate))

  // Return trimmed audio data and sample rate
  return [float32Array.slice(startSample, endSample), sampleRate]

}

// Helper function to calculate RMS energy of a frame
function calculateRMS(frame) {
  const sumOfSquares = frame.reduce((sum, sample) => sum + sample * sample, 0)
  return Math.sqrt(sumOfSquares / frame.length)
}

// Function to trim silent segments based on top_db threshold
async function trimSilence(audioData, top_db = 60, frame_length = 1024, hop_length = 128) {
  const thresholdAmplitude = Math.pow(10, -top_db / 20) // Convert dB threshold to amplitude
  let startFrame = null
  let endFrame = null

  // Find the first non-silent frame from the start
  for (let i = 0; i <= audioData.length - frame_length; i += hop_length) {
    const frame = audioData.slice(i, i + frame_length)
    const rms = calculateRMS(frame)

    if (rms >= thresholdAmplitude) {
      startFrame = i
      break
    }
  }

  // Find the first non-silent frame from the end
  for (let i = audioData.length - frame_length; i >= 0; i -= hop_length) {
    const frame = audioData.slice(i, i + frame_length)
    const rms = calculateRMS(frame)

    if (rms >= thresholdAmplitude) {
      endFrame = i + frame_length // Include the end of this frame
      break
    }
  }

  // If startFrame or endFrame is null, the entire audio is silent
  if (startFrame === null || endFrame === null || startFrame >= endFrame) {
    return [] // Return an empty array if there's no audible segment
  }

  // Trim and return the audio data from startFrame to endFrame
  return audioData.slice(startFrame, endFrame)
}

// Function to process mel spectrogram: reshape, pad, or truncate
function reshapeMelSpectrogram(melSpectrogram) {
  const numberOfFrames = 130

  // Reshape: In JavaScript, we can treat the array as a 2D array directly
  let processedSpectrogram = melSpectrogram

  // Pad or truncate to ensure the second dimension has a fixed length of 130
  if (processedSpectrogram[0].length < numberOfFrames) {
    // Pad with zeros if the spectrogram length is less than 130
    processedSpectrogram = processedSpectrogram.map(band => {
      const paddedBand = new Float32Array(numberOfFrames)
      paddedBand.set(band) // Copy original data into the start of the new array
      return paddedBand
    })
  } else if (processedSpectrogram[0].length > numberOfFrames) {
    // Truncate if the spectrogram length is greater than 130
    processedSpectrogram = processedSpectrogram.map(band => band.slice(0, numberOfFrames))
  }

  return processedSpectrogram // 2D array [128, 130]
}

export default preprocessAudioFile
