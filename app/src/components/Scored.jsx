import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useGlobalStyles } from '../styles'

export const Scored = ({ score, onRetryRecording, onShare }) => {
  const globalStyles = useGlobalStyles()

  // Convert score from [0, 1] to [0, 10] for display
  // const displayScore = s

  // Determine score color based on the range
  const getScoreColor = (score) => {
    if (score <= 1) {
      return '#ff4d4d' // Red for 0-1
    } else if (score <= 3) {
      return '#ffad33' // Orange for 1-3
    } else if (score <= 7) {
      return '#f7e600' // Yellow for 4-7
    } else {
      return '#38a169' // Green for 8-10
    }
  }

  return (
    <View style={[globalStyles.container, styles.container]}>
      <Text style={globalStyles.titleText}>Are you alive?</Text>
      {score >= 5 ? (
        <Text style={[styles.scoreText, { color: '#38a169' }]}>Yes</Text>
      ) : (
        <Text style={[styles.scoreText, { color: '#ff4d4d' }]}>No</Text>
      )}
      <Text style={globalStyles.sectionHeader}>Verify on Mina Protocol</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={globalStyles.secondaryButton} onPress={onRetryRecording}>
          <Text style={globalStyles.buttonText}>Record Again</Text>
        </TouchableOpacity>
        {score >= 5 ? (
          <TouchableOpacity style={globalStyles.primaryButton} onPress={onShare}>
            <Text style={globalStyles.buttonText}>Prove</Text>
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
})
