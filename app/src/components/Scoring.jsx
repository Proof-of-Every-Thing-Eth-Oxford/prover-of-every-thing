import { Alert, StyleSheet, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import preprocessAudioFile from '../audio/preprocessInputs'
import { runAudioClassifier } from '../audio/audioClassifier'
import { LinksSection } from './elements/LinkSection'
import CancelButton from './elements/CancelButton'
import RotatingSentences from './elements/RotatingSentences'
import { useGlobalStyles } from '../styles'

const sentences = [
  'Analyzing audio! 🕒',
  'Please give us a minute! ⏳',
  'Almost there! ⚙️',
]


export const Scoring = ({ onCancel, recording, onFinished }) => {

  const preprocessedRecording = useRef(null)
  const modelResults = useRef(null)
  const [processingState, setProcessingState] = useState('processing') // ['processing', 'finished'

  const globalStyles = useGlobalStyles()

  const handleCancel = () => {
    setProcessingState('cancelled')
    onCancel()
    // TODO - figure out a way to handle cancel to run the processing while not blocking UI
    // Currently we have a workaround by splitting the processing into multiple tasks
    // And then checking if the task was cancelled before running the next step
    // This is not ideal and should be fixed
  }

  useEffect(() => {
    preprocessAudioFile(recording).then(
      (result) => {
        preprocessedRecording.current = result
        setProcessingState('classification')
      },
      (error) => {
        console.error('Error preprocessing audio', error)
        Alert.alert('Error preprocessing your audio', 'Please try again.\n\n' + error.toString(), [{ text: 'OK' }])
        handleCancel()
      },
    )

  }, [recording])

  useEffect(() => {
    // TODO - we currently have a timeout to allow all the blocked UI Cancel calls to run before we continue processing
    setTimeout(() => {
      if (processingState === 'classification') {
        runAudioClassifier(preprocessedRecording.current).then(
          (result) => {
            modelResults.current = result
            setProcessingState('finished')
          },
          (error) => {
            console.error('Error scoring audio', error)
            Alert.alert('Error scoring your audio', 'Please try again.\n\n' + error.toString(), [{ text: 'OK' }])
            handleCancel()
          },
        )
      } else if (processingState === 'finished') {
        onFinished(preprocessedRecording.current, modelResults.current)
      }
    }, 50)
  }, [processingState, onFinished])


  return (
    <View style={[globalStyles.container, styles.container]}>
      <RotatingSentences sentences={sentences} />
      <CancelButton onCancel={handleCancel} />
      <LinksSection />
    </View>
  )
}


export default Scoring

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
})
