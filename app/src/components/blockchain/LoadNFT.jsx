import React, { useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { Buffer } from 'buffer'
import { useReadContract } from 'wagmi'
import { cryptoIdolABI, cryptoIdolAddresses, useTransactionsStyles } from './TransactionPanel'
import { useGlobalStyles } from '../../styles'

export const NFTLoader = ({ tokenId, onLoadedNFT, onError }) => {

  const globalStyles = useGlobalStyles()
  const styles = useTransactionsStyles(globalStyles)


  const tokenMetadata = useReadContract({
    address: cryptoIdolAddresses.sepolia,
    abi: cryptoIdolABI,
    functionName: 'tokenURI',
    args: [tokenId],
  })

  useEffect(() => {
    const saveImageToFileSystem = async (base64Data) => {
      try {
        // Define file path and name
        const fileUri = `${FileSystem.cacheDirectory}nft_image_${tokenId}.svg`

        // Save the image to the file system
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        })

        // Notify the parent component
        console.debug('NFT image saved to file system:', fileUri)
        onLoadedNFT(fileUri, tokenId)
      } catch (err) {
        onError('Failed to save NFT image to file system.\n' + err.toString())
      }
    }

    if (tokenMetadata.data) {
      try {
        const data = tokenMetadata.data
        const jsonData = data.split(',')[1] // Assuming data URL format: data:application/json;base64,...
        const decodedJson = Buffer.from(jsonData, 'base64').toString('utf8')
        const jsonObject = JSON.parse(decodedJson)

        if (jsonObject.image && jsonObject.image.startsWith('data:image')) {
          // Extract base64 image data
          const base64Image = jsonObject.image.split(',')[1]
          saveImageToFileSystem(base64Image)
        } else {
          console.debug('Invalid NFT image data.')
          onError('Invalid NFT image data.')
        }
      } catch (err) {
        console.debug(err)
        onError('Failed to decode NFT metadata.')
      }
    } else if (tokenMetadata.isError) {
      console.debug(tokenMetadata.error)
      onError('Failed to load NFT metadata.')
    }
  }, [tokenMetadata.data, tokenMetadata.isError])

  return (
    <View style={[globalStyles.container, styles.outerContainer]}>
      {/* Title */}
      <Text style={globalStyles.titleText}>Fetching NFT Details</Text>

      {/* Description */}
      <Text style={[globalStyles.userText, { marginTop: 10 }]}>
        Retrieving NFT information from the blockchain. This may take a few moments.
      </Text>

      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={globalStyles.colors.primary} />
        <Text style={[styles.loadingText, { color: globalStyles.colors.primary }]}>Loading NFT...</Text>
      </View>
    </View>
  )
}
