import { NativeModules } from 'react-native'
import * as RNFS from 'react-native-fs'

const { NativeModelProver } = NativeModules

export let proverAssets = null

export const setupModelProver = async () => {
  const start = new Date()


  const result = await RNFS.readDir(RNFS.MainBundlePath)
  const modelFile = result.find((file) => file.name === 'model.compiled')
  const srsFile = result.find((file) => file.name === 'kzg16.srs')

  if (!modelFile || !srsFile) {
    throw new Error('Prover files not found in iOS main bundle')
  }

  // Prepare input parameter as JSON string with paths
  const inputParam = JSON.stringify({
    compiledCircuit: modelFile.path,
    srs: srsFile.path,
  })

  // Call setupCircuitForTheModel and handle the promise
  NativeModelProver.setupKeys(inputParam)
    .then(result => {
      proverAssets = {
        pkPath: result.pkPath,
        vkPath: result.vkPath,
        srsPath: srsFile.path,
        compiledCircuitPath: modelFile.path,
      }
      console.debug('Model Prover setup successful')
      console.debug('Prover Setup time:', (new Date().getTime() - start.getTime()) / 1000, 'seconds')
    })
    .catch(error => {
      console.error('Error in `setupCircuitForTheModel`:', error)
    })
}
