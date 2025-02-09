import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { isReady, shutdown, Mina, PrivateKey, PublicKey, Field, SmartContract, method } from 'o1js'

export const Minting = ({ onMinted, onCancelled, proof }) => {
  //   useEffect(() => {
  //   (async () => {
  //     // Wait until SnarkyJS is ready
  //     await isReady;

  //     // Set up a local blockchain for testing (you can replace this with the testnet or mainnet setup)
  //     const Local = Mina.Network('https://api.minascan.io/node/devnet/v1/graphql');
  //     Mina.setActiveInstance(Local);

  //     // Generate keys
  //     const deployerKey = "EKDtY9uiAxyGMUD3iu8vaGLcDktToZ74TRRcdA7Dm4wjk4W5bWrD";
  //     const deployerAccount = "B62qns8CuBBBDcGLyR5XghdxFbPmquYXfPkDEW8xERyd3tnuTUTA4be";
  //     console.log('Deployer Account:', deployerAccount.toBase58());

  //     // Define a simple smart contract
  //     export class MusicArchiveApp extends SmartContract {
  //       // Store a single Field which is the "aggregated" hash of everything so far
  //       @state(Field) storedHash = State<Field>();

  //       // The init() method is called when the contract is first deployed.
  //       init() {
  //         super.init();
  //         // Set initial storedHash to Field(0) or any sentinel value
  //         this.storedHash.set(Field(0));
  //       }

  //       /**
  //        * Adds a new hash to the on-chain digest by combining (old storedHash) with (newHash)
  //        * using Poseidon hashing, which is typically the cheapest / fastest built-in hash in o1js.
  //        *
  //        * This also timestamps the transaction at the block level, so that we know
  //        * that 'newHash' was posted at or before the final block that includes this transaction.
  //        */
  //       @method async addLivenessHash(newHash: Field) {
  //         // Get the current state from the blockchain
  //         const currentHash = this.storedHash.get();
  //         // Link circuit value to on-chain value
  //         this.storedHash.requireEquals(currentHash);

  //         // Combine them with Poseidon
  //         const nextHash = Poseidon.hash([currentHash, newHash]);

  //         // Update on-chain state
  //         this.storedHash.set(nextHash);
  //       }
  //     }

  //     // You would normally deploy and interact with your contract here.
  //     // For example, creating an instance of the contract, deploying it,
  //     // and then calling methods on it.

  //     // Always shutdown SnarkyJS when you're done to clean up WASM instances.
  //     shutdown();
  //   })();
  // }, []);

  useEffect(() => {
    setTimeout(() => {
      onCancelled()
    }, 10000)
  }, [])
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Submitting to blockchain...</Text>
    </View>
  )
}
