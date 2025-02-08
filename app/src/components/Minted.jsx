import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SvgUri } from 'react-native-svg'
import { useGlobalStyles } from '../styles'

export const Minted = ({ nft, onRestartFlow }) => {

  const globalStyles = useGlobalStyles()
  const styles = useStyles(globalStyles)

  return (
    <View contentContainerStyle={[globalStyles.container]}>
      {/* Success message */}
      <View style={styles.container}>
        <Text style={globalStyles.titleText}>NFT #{BigInt(nft.id).toString()}</Text>
        {nft.uri ? (
          <SvgUri width="100%" height="400" uri={nft.uri} />
        ) : (
          <Text style={globalStyles.errorText}>Image data not available.</Text>
        )}
      </View>

      <View style={styles.finishedContainer}>
        <Text style={styles.finishedText}>NFT successfully minted! 🎉</Text>

        {/* Record Again button */}
        <TouchableOpacity style={globalStyles.primaryButton} onPress={onRestartFlow}>
          <Text style={globalStyles.buttonText}>Record Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const useStyles = (globalStyles) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 70,
  },
  finishedContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  finishedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: globalStyles.isDarkMode ? '#a3e7b1' : '#38a169', // Success color with dark mode support
    marginBottom: 25,
  },
})
