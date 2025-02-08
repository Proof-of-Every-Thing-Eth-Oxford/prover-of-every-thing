import React, { useEffect, useState } from 'react'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { testWorkflow } from '../../util/TestSystem' // Assuming this is the correct import for testAudioProcessing

const DebugControls = ({ state, onFinished, renderAvatar, onRenderSelected }) => {
  const [isProcessing, setIsProcessing] = useState(false) // State for button processing
  const [isSimulator, setIsSimulator] = useState(false) // State to check if running in a simulator

  // Detect if running on a simulator
  useEffect(() => {
    DeviceInfo.isEmulator().then((emulator) => setIsSimulator(emulator))
  }, [])

  // Handles processing dummy recording
  const handleProcess = () => {
    setIsProcessing(true)
    testWorkflow().then(
      () => {
        console.log('Processing complete')
        setIsProcessing(false)
        if (onFinished) {
          onFinished()
        }
      },
      (error) => {
        console.error('Error processing audio:', error)
        setIsProcessing(false)
      },
    )
  }

  // Handles toggle switch for avatar rendering
  const handleToggleAvatar = (value) => {
    if (!isSimulator) {
      onRenderSelected(value)
    }
  }

  return (
    <View style={styles.debugContainer}>
      {/* Displaying the debug state */}
      <Text style={styles.debugText}> {'Debug State: ' + state} </Text>

      {/* Button for processing */}
      <TouchableOpacity
        onPress={handleProcess}
        style={[styles.button, isProcessing && styles.buttonDisabled]}
        disabled={isProcessing}
      >
        <Text style={styles.buttonText}>{isProcessing ? 'Processing...' : 'Process Dummy Recording'}</Text>
      </TouchableOpacity>

      {/* Toggle switch for avatar rendering */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>
          {isSimulator ? 'Render Avatar (Unavailable in Simulator)' : 'Render Avatar (Only Real iPhone)'}
        </Text>
        <Switch
          value={renderAvatar}
          onValueChange={handleToggleAvatar}
          trackColor={{ false: '#767577', true: '#007bff' }}
          thumbColor={renderAvatar ? '#f4f3f4' : '#f4f3f4'}
          disabled={isSimulator} // Disable the switch if in a simulator
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  debugContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0', // Light background color to separate the section
    borderRadius: 10,
    marginVertical: 10,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007bff', // Button background color
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0', // Gray out the button when disabled
  },
  buttonText: {
    fontSize: 14, // Small button text
    color: '#fff', // White text color
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
})

export default DebugControls
