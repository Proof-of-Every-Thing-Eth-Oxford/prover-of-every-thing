// Generates the JSON files identical to `input.json` used by the python server model
import { proverAssets } from './setupModelProver'
import { NativeModules } from 'react-native'
import { sleepUntilPreloaded } from '../util/sleepUntilPreloaded'

const { NativeModelProver } = NativeModules


export function generateProverInputJSON(processedMelSpectrogram, modelScore, blockchainAddress) {
  // Step 1: Flatten the 2D array [128, 130] to a 1D array
  const flattenedData = processedMelSpectrogram.reduce((acc, row) => acc.concat(Array.from(row)), [])

  // Step 2: Format as JSON with the flattened array
  const inputJSON = {
    output_data: [[blockchainAddress], [modelScore]],
    input_data: [[blockchainAddress], flattenedData],
  }

  return JSON.stringify(inputJSON)
}


export const runModelProver = async (inputData) => {
  await sleepUntilPreloaded(() => proverAssets, 15000)

  // Prepare input parameter as JSON string with paths
  const inputParam = JSON.stringify({
    pk: proverAssets.pkPath,
    srs: proverAssets.srsPath,
    compiledCircuit: proverAssets.compiledCircuitPath,
    inputData: inputData,
  })

  const start = new Date()

  // Call proveModel and handle the promise
  return NativeModelProver.generateProof(inputParam)
    .then(result => {
      console.debug('Model Proved successfully')
      console.debug('Proving time:', (new Date().getTime() - start.getTime()) / 1000, 'seconds')
      return result.proof
    })
    .catch(error => {
      console.error('Error in `proveModel`:', error)
    })
}
