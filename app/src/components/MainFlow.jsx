import React, { useEffect, useState } from 'react'
import { SafeAreaView, View } from 'react-native'
import Avatar from './canvas/Avatar'
import ConfettiComponent from './elements/ConfettiComponent'
import Scoring from './Scoring'
import { Recording } from './Recording'

import { Scored } from './Scored'
import { Proving } from './Proving'
import { preloadModel } from '../audio/audioClassifier'
import { setupModelProver } from '../prover/setupModelProver'
import DebugControls from './elements/DebugButton'
import { Minting } from './Minting'
import DeviceInfo from 'react-native-device-info'
import { Minted } from './Minted'

const MainFlow = () => {
  const [debug, setDebug] = useState(false)

  const [state, setState] = useState('start')
  const [renderAvatar, setRenderAvatar] = useState(false)
  const [recordingPath, setRecordingPath] = useState(null)
  const [recordingScore, setRecordingScore] = useState(null)
  const [preprocessedRecordingData, setPreprocessedRecordingData] = useState(null)
  const [nftData, setNftData] = useState(null)
  const [proof, setProof] = useState(null)

  const onRecorded = (restingRecordingPath) => {
    console.log(restingRecordingPath)
    setRecordingPath(restingRecordingPath)
    setState('scoring')
    console.debug('Recording Submitted for Scoring')
  }

  const onScoringFinished = (processedData, score) => {
    setPreprocessedRecordingData(processedData)
    setRecordingScore(score)
    setState('scored')
    console.debug('Audio Scoring Result:', score)
  }

  const onProofGenerated = (proof) => {
    setProof(proof)
    setState('minting')
    console.debug('Proof generated successfully')
  }

  const onMinted = (nftId, uri) => {
    setNftData({ id: nftId, uri })
    setState('minted')
    console.debug('NFT minted successfully with ID:', nftId + ' and Image URI:', uri)
  }

  const onRestartFlow = () => {
    setState('start')
    setProof(null)
    setRecordingPath(null)
    setRecordingScore(null)
    setPreprocessedRecordingData(null)
    setNftData(null)
    console.debug('Restarting the flow again')
  }

  // Only render the avatar on real devices
  useEffect(() => {
    DeviceInfo.isEmulator().then((emulator) => {
      setRenderAvatar(!emulator)
      setDebug(emulator)
    })
  }, [])

  useEffect(() => {
    preloadModel().catch((error) => console.error('Error preloading model:', error))
    setupModelProver().catch((error) => console.error('Error preparing model prover:', error))
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, marginBottom: 70 }}>
      {/* {debug && (
        <DebugControls
          state={state}
          renderAvatar={renderAvatar}
          onRenderSelected={(selection) => setRenderAvatar(selection)}
        />
      )} */}

      {state !== 'minted' && renderAvatar && <Avatar state={state} />}
      {
        state === 'minted' && (
          <>
            <ConfettiComponent />
          </>
        )

        // TODO - also show the NFT image as in the web version
      }

      {(state === 'start' || state === 'recording' || state === 'listening' || state === 'recorded') && (
        <Recording onSubmit={onRecorded} state={state} setState={setState} />
      )}
      {state === 'scoring' && (
        <Scoring onCancel={() => setState('start')} recording={recordingPath} onFinished={onScoringFinished} />
      )}
      {state === 'scored' && (
        <Scored score={recordingScore} onRetryRecording={() => setState('start')} onShare={() => setState('proving')} />
      )}
      {state === 'proving' && (
        <Proving
          score={recordingScore}
          onProofGenerated={onProofGenerated}
          preprocessedRecordingData={preprocessedRecordingData}
          onCancelled={() => setState('scored')}
        />
      )}
      {state === 'minting' && <Minting onMinted={onMinted} onCancelled={() => setState('scored')} proof={proof} />}
      {state === 'minted' && <Minted nft={nftData} onRestartFlow={onRestartFlow} />}
    </SafeAreaView>
  )
}

export default MainFlow
