import React, { useEffect } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { useSendTransaction, useWaitForTransactionReceipt } from 'wagmi'
import { cryptoIdolABI, cryptoIdolAddresses, useTransactionsStyles } from './TransactionPanel'
import { useGlobalStyles } from '../../styles'
import { encodeFunctionData, parseEther } from 'viem'

export default function MintingTransaction({ proofData, onSuccess, onError }) {
  const { hexProof, instances } = proofData
  const contractAddress = cryptoIdolAddresses.sepolia // Use appropriate address based on chain

  const { data: hash, isSuccess, error, sendTransaction } = useSendTransaction()
  const { isLoading: isTxLoading, isSuccess: isTxSuccess, error: txError, data } = useWaitForTransactionReceipt({
    hash,
  })

  const globalStyles = useGlobalStyles()
  const styles = useTransactionsStyles(globalStyles)

  useEffect(() => {
    if (error) {
      onError('Mint transaction failed.\n' + error.message)
    }
  }, [error, onError])

  useEffect(() => {
    if (txError) {
      onError('Mint transaction failed or was rejected.\n' + txError.message)
    }
  }, [onError, txError])

  useEffect(() => {
    if (isSuccess) {
      // Transaction sent, wait for confirmation
      console.debug('Mint transaction sent:', hash)
    }
  }, [hash, isSuccess])

  useEffect(() => {
    if (isTxSuccess) {
      console.debug('Mint transaction confirmed:', hash)
      const tokenId = data?.logs[0].topics[3]
      console.debug('Minted NFT with ID:', tokenId)
      onSuccess(tokenId)
    }
  }, [hash, isTxSuccess, onSuccess])

  useEffect(() => {
    sendTransaction({
      to: contractAddress,
      value: parseEther('0'),
      data: encodeFunctionData({
        abi: cryptoIdolABI,
        functionName: 'mint',
        args: [hexProof, instances.flat()],
      }),
    })
  }, [hexProof, instances, contractAddress, sendTransaction])

  return (
    <View style={[styles.outerContainer]}>
      {/* Title */}
      <Text style={globalStyles.titleText}>Issuing "Mint" Transaction</Text>

      {/* Description */}
      <Text style={[globalStyles.userText, { marginTop: 10 }]}>
        You’re about to mint your unique NFT, marking your achievement permanently on the blockchain. Please confirm the
        transaction in your wallet.
      </Text>

      {/* Loading Indicators */}
      {!isSuccess && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={globalStyles.colors.primary} />
          <Text style={[styles.loadingText, { color: globalStyles.colors.primary }]}>Waiting for user approval...</Text>
        </View>
      )}

      {isTxLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={globalStyles.colors.success} />
          <Text style={[styles.loadingText, { color: globalStyles.colors.success }]}>Transaction is being
            confirmed...</Text>
        </View>
      )}
    </View>
  )
}

