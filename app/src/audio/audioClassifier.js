import * as ort from 'onnxruntime-react-native'
import { sleepUntilPreloaded } from '../util/sleepUntilPreloaded'
import * as RNFS from 'react-native-fs'

export let preloadedModelSession = null

// Preload model
export async function preloadModel() {
  const start = new Date()

  const result = await RNFS.readDir(RNFS.MainBundlePath)
  const modelFile = result.find((file) => file.name === 'network.onnx')

  if (!modelFile) {
    throw new Error('Model file not found in iOS main bundle')
  }

  console.log('Model file path:', modelFile.path)
  console.log('Model file:', modelFile)

  preloadedModelSession = await ort.InferenceSession.create(modelFile.path)

  console.debug('Model preloaded successfully')
  console.debug('Preloading time:', (new Date().getTime() - start.getTime()) / 1000, 'seconds')
}

// Function to prepare the model and run inference
export async function runAudioClassifier(processedMelSpectrogram, blockchainAddress = 0.08811962604522705) {
  await sleepUntilPreloaded(() => preloadedModelSession, 3000)

  // Run inference and get results
  return await runInference(preloadedModelSession, processedMelSpectrogram, blockchainAddress)
}

// Function to run inference
async function runInference(session, inputData, blockchainAddress) {
  const start = new Date()

  // Flatten the 2D array and convert it to Float32Array
  const flattenedData = inputData.map(row => Array.from(row)).reduce((acc, row) => acc.concat(row), [])

  // Check if the flattened data has the correct length
  if (flattenedData.length !== 128 * 130) {
    throw new Error(`Flattened data length (${flattenedData.length}) does not match expected length (16,640).`)
  }

  inputData = new Float32Array(flattenedData)

  // Convert blockchainAddress to an input tensor
  const blockchainAddressTensor = new ort.Tensor('float32', new Float32Array([blockchainAddress]), [1, 1])

  // Set up the model inputs
  const feeds = {
    'input': blockchainAddressTensor,                       // blockchainAddress input
    'input.1': new ort.Tensor('float32', inputData, [1, 1, 128, 130]), // audio data input
  }

  try {
    const outputData = await session.run(feeds)
    const end = new Date()
    const inferenceTime = (end.getTime() - start.getTime()) / 1000

    console.debug('Inference time:', inferenceTime, 'seconds')

    // Consistency check for blockchainAddress
    const outputBlockchainAddress = outputData['output'].data[0]
    if (outputBlockchainAddress !== blockchainAddress) {
      throw new Error(`Blockchain address mismatch: expected ${blockchainAddress}, but got ${outputBlockchainAddress}`)
    }

    // Extract the prediction output
    const prediction = outputData['10'].data[0]

    // Only leave 7 decimal places after the decimal point
    return Number(prediction.toFixed(7))

  } catch (error) {
    console.error('Error during inference:', error)
    return null
  }
}
