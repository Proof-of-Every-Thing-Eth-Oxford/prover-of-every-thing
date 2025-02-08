import React, { useState } from 'react'
import { Dimensions, StyleSheet, View } from 'react-native'
import ConfettiCannon from 'react-native-confetti-cannon'

const ConfettiComponent = () => {
  const { width } = Dimensions.get('window')
  const [zIndex, setZIndex] = useState(null)

  return (
    <View style={[styles.confettiContainer, zIndex && { zIndex: zIndex }]}>
      <ConfettiCannon
        count={200}
        origin={{ x: width / 2, y: 0 }}
        fadeOut={true}
        onAnimationStart={() => setZIndex(1)}
        onAnimationEnd={() => setZIndex(null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  confettiContainer: {
    ...StyleSheet.absoluteFillObject, // Makes the confetti cover the entire area
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ConfettiComponent
