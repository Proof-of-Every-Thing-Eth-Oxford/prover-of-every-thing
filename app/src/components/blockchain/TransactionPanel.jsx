import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useAccount } from 'wagmi'
import { encodeAbiParameters, keccak256 } from 'viem'

import CommittingTransaction from './CommittingTransaction'
import { bigEndianToLittleEndian } from '../../util/bigEndianToLittleEndian'
import MintingTransaction from './MintingTransaction'
import { AppKit, AppKitButton } from '@reown/appkit-wagmi-react-native'
import CancelButton from '../elements/CancelButton'
import { NFTLoader } from './LoadNFT'
import { useGlobalStyles } from '../../styles'

export const cryptoIdolAddresses = require('../../../assets/blockchain/addresses.json')
export const cryptoIdolABI = require('../../../assets/blockchain/abi.json')

export default function TransactionPanel({ onNftLoaded, onCancelled, proof }) {
  const [stage, setStage] = useState('connecting')
  const [error, setError] = useState(null)
  const [proofData, setProofData] = useState(null)
  const [nftId, setNftId] = useState(null)
  const { isConnected } = useAccount()

  const globalStyles = useGlobalStyles()
  const styles = useStyles(globalStyles)

  // Preprocess the proof before starting transactions
  const preprocessProof = async () => {
    try {
      const json_proof = JSON.parse(proof)

      const hexProof = json_proof.hex_proof
      const instances = json_proof.instances.map((pair) =>
        pair.map((value) => `0x${bigEndianToLittleEndian(value)}`),
      )

      const dataHash = keccak256(
        encodeAbiParameters([{ type: 'bytes' }, { type: 'uint256[]' }], [hexProof, instances.flat()]),
      )

      setProofData({ hexProof, instances, dataHash })
    } catch (err) {
      setError('Error preprocessing proof.\n ' + err.toString())
    }
  }

  const handleStartProcess = async () => {
    if (isConnected && stage === 'connecting') {
      setStage('preprocessing')
      console.debug('Finished preprocessing proof')
      await preprocessProof()
      setStage('committing')
    } else if (!isConnected) {
      setStage('connecting')
    }
  }

  useEffect(() => {
    handleStartProcess()
  }, [isConnected])

  const handleCommitSuccess = () => {
    console.debug('Committed proof hash!')
    setStage('minting')
  }

  const handleMintSuccess = (nftId) => {
    console.debug('Minted NFT completed successfully with ID:', nftId)
    setNftId(nftId)
    setStage('loadingnft')
  }

  const handleNFTLoaded = (fileUri) => {
    console.debug('NFT loaded:', fileUri)
    onNftLoaded(nftId, fileUri)
  }

  const handleError = (err) => {
    setError(err)
  }

  useEffect(() => {
    if (error) {
      console.debug('Error occurred:', error)
      setStage('error')
    }
  }, [error])

  const handleRetry = () => {
    setError(null) // Clear the error
    setStage('connecting') // Reset the stage
    handleStartProcess() // Retry the process
  }

  return (
    <View style={[globalStyles.container, styles.outerContainer]}>
      <AppKitButton balance="show" />
      <AppKit />

      {/* Show connection message when waiting for user to connect wallet */}
      {stage === 'connecting' && (
        <View style={styles.infoContainer}>
          <Text style={globalStyles.userText}>Please connect your wallet to mint NFT.</Text>
        </View>
      )}

      {/* Display error message if there's an error */}
      {stage === 'error' && (
        <View style={styles.errorContainer}>
          <Text style={globalStyles.subtitleText}>An error occurred:</Text>
          <Text style={styles.errorMessage}>{error.substring(0, 100)}{error.length > 100 ? '...' : ''}</Text>

          <View style={styles.errorButtonContainer}>
            <TouchableOpacity style={globalStyles.primaryButton} onPress={handleRetry}>
              <Text style={globalStyles.buttonText}>TRY AGAIN</Text>
            </TouchableOpacity>
            <CancelButton onCancel={onCancelled} />
          </View>
        </View>
      )}


      {/* Show committing stage UI if no error */}
      {stage === 'committing' && (
        <CommittingTransaction
          proofData={proofData}
          onSuccess={handleCommitSuccess}
          onError={handleError}
        />
      )}

      {/* Show minting stage UI if no error */}
      {stage === 'minting' && (
        <MintingTransaction proofData={proofData} onSuccess={handleMintSuccess} onError={handleError} />
      )}

      {
        stage === 'loadingnft' && (
          <NFTLoader tokenId={1} onLoadedNFT={handleNFTLoaded} onError={handleError} />

        )
      }

      {/* Bottom Cancel Button */}
      {
        stage !== 'error' &&
        <CancelButton onCancel={onCancelled} styleOverwrite={styles.bottomCancelButton} />
      }

    </View>
  )
}


const useStyles = (globalStyles) => StyleSheet.create({
  outerContainer: {
    justifyContent: 'space-between',
  },
  infoContainer: {
    alignItems: 'center',
    // backgroundColor: '#e3f2fd',
    backgroundColor: globalStyles.isDarkMode ? '#496068' : '#E3F2FD', // Dark navy for dark mode, light blue for light mode
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 20,
  },
  errorContainer: {
    backgroundColor: globalStyles.isDarkMode ? '#954d4d' : '#fdecea', // Dark muted red for dark mode, light red for light mode
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
    shadowColor: globalStyles.isDarkMode ? '#000' : '#333', // Softer shadow in dark mode
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  errorMessage: {
    marginTop: 10,
    color: globalStyles.isDarkMode ? '#FF6B6B' : '#d32f2f', // Light red for dark mode, dark red for light mode
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  bottomCancelButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
})

export const useTransactionsStyles = (globalStyles) => StyleSheet.create({
  outerContainer: {
    padding: globalStyles.isDarkMode ? 10 : 20,
    backgroundColor: globalStyles.isDarkMode ? globalStyles.colors.darkBackground : globalStyles.colors.lightBackground,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: globalStyles.isDarkMode ? 10 : 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
    marginTop: 25,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
  },
})

