import React, { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import { useGlobalStyles } from '../../styles'

const RotatingSentences = ({ sentences }) => {
  const [currentSentence, setCurrentSentence] = useState(0)
  const fadeAnim = useRef(new Animated.Value(1)).current
  const scaleAnim = useRef(new Animated.Value(0.95)).current

  const globalStyles = useGlobalStyles()

  useEffect(() => {
    // Cycle through sentences every 4 seconds
    const timer = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentSentence((prev) => (prev + 1) % sentences.length)
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start()
      })
    }, 4000)

    return () => clearInterval(timer)
  }, [fadeAnim, scaleAnim, sentences.length])

  return (
    <View style={[styles.textContainer]}>
      <Animated.Text
        style={[
          globalStyles.titleText,
          styles.sentenceText,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {sentences[currentSentence]}
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  textContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  sentenceText: {
    lineHeight: 28,
    fontWeight: 600,
    textAlign: 'center',
    paddingHorizontal: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
})

export default RotatingSentences
