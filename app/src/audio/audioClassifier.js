import * as ort from 'onnxruntime-react-native'
import { sleepUntilPreloaded } from '../util/sleepUntilPreloaded'
import * as RNFS from 'react-native-fs'
import {preprocessFiles} from "./preprocessInputs";

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
export async function runAudioClassifier(flattenedImage, flattenedChallengeAudio, flattenedRecordedAudio) {
  await sleepUntilPreloaded(() => preloadedModelSession, 3000)

  // Run inference and get results
  return await runInference(preloadedModelSession, flattenedImage, flattenedChallengeAudio, flattenedRecordedAudio)
}

// Function to run inference
async function runInference(session, recordingFilePath, challengeFilePath, photoFilePath) {
  const start = new Date()

  const { imageData, challengeData, recordingData } = await preprocessFiles(
    recordingFilePath,
    challengeFilePath,
    photoFilePath
  )

  const flattenedImage = imageData
  const flattenedChallengeAudio = challengeData
  const flattenedRecordedAudio = recordingData

  try {

    // Convert input data to Float32Array
    const imageTensorData = new Float32Array(flattenedImage) // Shape: [1, 256]
    const challengeAudioTensorData = new Float32Array(flattenedChallengeAudio) // Shape: [1, 1000]
    const recordedAudioTensorData = new Float32Array(flattenedRecordedAudio) // Shape: [1, 1000]

    // Create ONNX tensors with the correct shape
    const feeds = {
      'image_flat': new ort.Tensor('float32', imageTensorData, [1, 256]),
      'challenge_audio_flat': new ort.Tensor('float32', challengeAudioTensorData, [1, 1000]),
      'recorded_audio_flat': new ort.Tensor('float32', recordedAudioTensorData, [1, 1000])
    }

    // // Flatten the 2D array and convert it to Float32Array
    // const flattenedData = inputData.map(row => Array.from(row)).reduce((acc, row) => acc.concat(row), [])

    const outputData = await session.run(feeds)
    const end = new Date()
    const inferenceTime = (end.getTime() - start.getTime()) / 1000

    console.debug('Inference time:', inferenceTime, 'seconds')

    // Extract the prediction output
    const prediction = outputData.output.data[0]

    // Only leave 7 decimal places after the decimal point
    return Number(prediction.toFixed(7))

  } catch (error) {
    console.error('Error during inference:', error)
    return null
  }
}
