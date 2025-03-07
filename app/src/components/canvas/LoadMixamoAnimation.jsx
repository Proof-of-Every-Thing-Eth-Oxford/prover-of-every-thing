import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { mixamoVRMRigMap } from './MixamoVRRigMap'
import * as RNFS from 'react-native-fs'

/**
 * Load Mixamo animation, convert for three-vrm use, and return it.
 *
 * @param {string} url A url of mixamo animation data
 * @param {VRM} vrm A target VRM
 * @returns {Promise<THREE.AnimationClip>} The converted AnimationClip
 */
export async function loadMixamoAnimation(url, vrm) {
  const loader = new FBXLoader() // A loader which loads FBX

  const result = await RNFS.readDir(RNFS.MainBundlePath)

  let animation = null
  if (url === 'Button Pushing.fbx') {
    animation = result.find((file) => file.name === 'ButtonPushing.fbx')
  } else if (url === 'Chicken Dance.fbx') {
    animation = result.find((file) => file.name === 'ChickenDance.fbx')
  } else if (url === 'Thinking.fbx') {
    animation = result.find((file) => file.name === 'Thinking.fbx')
  } else if (url === 'Gangnam Style.fbx') {
    animation = result.find((file) => file.name === 'GangnamStyle.fbx')
  } else if (url === 'Thankful.fbx') {
    animation = result.find((file) => file.name === 'Thankful.fbx')
  } else {
    throw new Error('Unknown animation URL: ' + url)
  }

  return loader.loadAsync('file://' + animation.path).then((asset) => {
    const clip = THREE.AnimationClip.findByName(asset.animations, 'mixamo.com') // extract the AnimationClip

    const tracks = [] // KeyframeTracks compatible with VRM will be added here

    const restRotationInverse = new THREE.Quaternion()
    const parentRestWorldRotation = new THREE.Quaternion()
    const _quatA = new THREE.Quaternion()
    const _vec3 = new THREE.Vector3()

    // Adjust with reference to hips height.
    const motionHipsHeight = asset.getObjectByName('mixamorigHips').position.y
    const vrmHipsY = vrm.humanoid?.getNormalizedBoneNode('hips').getWorldPosition(_vec3).y
    const vrmRootY = vrm.scene.getWorldPosition(_vec3).y
    const vrmHipsHeight = Math.abs(vrmHipsY - vrmRootY)
    const hipsPositionScale = vrmHipsHeight / motionHipsHeight

    clip.tracks.forEach((track) => {
      // Convert each tracks for VRM use, and push to `tracks`
      const trackSplitted = track.name.split('.')
      const mixamoRigName = trackSplitted[0]
      const vrmBoneName = mixamoVRMRigMap[mixamoRigName]
      const vrmNodeName = vrm.humanoid?.getNormalizedBoneNode(vrmBoneName)?.name
      const mixamoRigNode = asset.getObjectByName(mixamoRigName)

      if (vrmNodeName != null) {
        const propertyName = trackSplitted[1]

        // Store rotations of rest-pose.
        mixamoRigNode.getWorldQuaternion(restRotationInverse).invert()
        mixamoRigNode.parent.getWorldQuaternion(parentRestWorldRotation)

        if (track instanceof THREE.QuaternionKeyframeTrack) {
          // Retarget rotation of mixamoRig to NormalizedBone.
          for (let i = 0; i < track.values.length; i += 4) {
            const flatQuaternion = track.values.slice(i, i + 4)

            _quatA.fromArray(flatQuaternion)

            // 親のレスト時ワールド回転 * トラックの回転 * レスト時ワールド回転の逆
            _quatA.premultiply(parentRestWorldRotation).multiply(restRotationInverse)

            _quatA.toArray(flatQuaternion)

            flatQuaternion.forEach((v, index) => {
              track.values[index + i] = v
            })
          }

          tracks.push(
            new THREE.QuaternionKeyframeTrack(
              `${vrmNodeName}.${propertyName}`,
              track.times,
              track.values.map((v, i) => (vrm.meta?.metaVersion === '0' && i % 2 === 0 ? -v : v)),
            ),
          )
        } else if (track instanceof THREE.VectorKeyframeTrack) {
          const value = track.values.map(
            (v, i) => (vrm.meta?.metaVersion === '0' && i % 3 !== 1 ? -v : v) * hipsPositionScale,
          )
          tracks.push(new THREE.VectorKeyframeTrack(`${vrmNodeName}.${propertyName}`, track.times, value))
        }
      }
    })

    return new THREE.AnimationClip('vrmAnimation', clip.duration, tracks)
  })
}
