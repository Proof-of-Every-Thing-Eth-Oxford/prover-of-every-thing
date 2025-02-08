import * as FileSystem from 'expo-file-system'
import { Asset } from 'expo-asset'
import preprocessAudioFile from '../audio/preprocessAudioFile'
import { runAudioClassifier } from '../audio/audioClassifier'
import { generateProverInputJSON, runModelProver } from '../prover/runModelProver'

export const testWorkflow = async () => {
  const localPath = `${FileSystem.cacheDirectory}angry.wav`
  const testAudioFile = await FileSystem.downloadAsync(Asset.fromModule(require('../../assets/model/sample_audio.wav')).uri, localPath)
  const blockchainAddress = 0.08811962604522705

  console.log('Testing Audio Processing')


  // Load the audio file
  try {
    let preprocessedData = await preprocessAudioFile(testAudioFile.uri)

    console.log('Preprocessing complete')

    let score = await runAudioClassifier(preprocessedData, blockchainAddress)

    console.log('Scoring complete. Score:', Math.round(score * 100) / 100, '/ 1')

    let proverInput = generateProverInputJSON(preprocessedData, score, blockchainAddress)

    console.log('Prover Input generated')

    let proof = await runModelProver(proverInput)

    console.log('Proof generated')
    return proof
  } catch (error) {
    console.error('Error processing audio:', error)
  }

}
