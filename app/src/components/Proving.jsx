import React, { useEffect, useRef } from 'react'
import { Alert, StyleSheet, View } from 'react-native'
import { generateProverInputJSON, runModelProver } from '../prover/runModelProver'
import { LinksSection } from './elements/LinkSection'
import CancelButton from './elements/CancelButton'
import RotatingSentences from './elements/RotatingSentences'
import { useGlobalStyles } from '../styles'

const sentences = [
  'Generating ZK proof! 🔐',
  'Please give us a minute! ⏳',
  'Almost there! ⚙️',
]

export const Proving = ({ score, preprocessedRecordingData, onProofGenerated, onCancelled }) => {
  const canceled = useRef(false)

  const globalStyles = useGlobalStyles()

  useEffect(() => {
    const proverInput = generateProverInputJSON(preprocessedRecordingData, score)
    runModelProver(proverInput).then((proof) => {
        if (canceled.current) {
          console.debug('Proof generated, but canceled')
        } else {
          console.debug('Proof generated successfully')
          onProofGenerated(proof)
        }
      }, (error) => {
        console.error('Proof generation error:', error)
        Alert.alert('Error generating proof', 'Please try again', [{ text: 'OK' }])
      },
    )
  }, [onProofGenerated, preprocessedRecordingData, score])


  return (
    <View style={[styles.container, globalStyles.container]}>
      <RotatingSentences sentences={sentences} />

      <CancelButton onCancel={() => {
        canceled.current = true
        onCancelled()
      }} />
      <LinksSection />

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
})
