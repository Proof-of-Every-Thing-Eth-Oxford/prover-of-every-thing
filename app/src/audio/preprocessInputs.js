import * as FileSystem from 'expo-file-system';
import {Asset} from "expo-asset";

// Helper: Pads an ArrayBuffer to the desired length if needed.
function padArrayBuffer(buffer, desiredLength) {
  if (buffer.byteLength >= desiredLength) return buffer;
  console.debug(
    `Warning: Buffer is too short (length ${buffer.byteLength}), padding with zeros to reach ${desiredLength} bytes.`
  );
  const padded = new Uint8Array(desiredLength);
  padded.set(new Uint8Array(buffer));
  return padded.buffer;
}

// Helper: Convert Base64 string to ArrayBuffer.
function base64ToArrayBuffer(base64) {
  // Use atob (or a polyfill if needed)
  const binaryString = global.atob ? global.atob(base64) : atobPolyfill(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Minimal atob polyfill if needed.
function atobPolyfill(input) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let str = input.replace(/=+$/, '');
  let output = '';

  for (
    let bc = 0, bs = 0, buffer, idx = 0;
    (buffer = str.charAt(idx++));
    ~buffer &&
    (bs = bc % 4 ? bs * 64 + buffer : buffer,
      bc++ % 4)
      ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
      : 0
  ) {
    buffer = chars.indexOf(buffer);
  }
  return output;
}

// Helper: Convert a slice of 16-bit PCM data to Float32 in [-1, 1].
function int16SliceToFloat32(arrayBuffer, sampleCount) {
  const bytes = new Uint8Array(arrayBuffer);
  const dataView = new DataView(bytes.buffer);
  const floatArray = new Float32Array(sampleCount);

  for (let i = 0; i < sampleCount; i++) {
    // Each sample is 2 bytes, little-endian.
    const sampleInt16 = dataView.getInt16(i * 2, true);
    floatArray[i] = sampleInt16 / 32768.0;
  }
  return floatArray;
}

async function preprocessFiles(recordingFilePath, challengeFilePath, photoFilePath) {
  // ---------------------------
  // Step 1: Read the WAV files as Base64 strings.
  // ---------------------------
  const recordingBase64 = await FileSystem.readAsStringAsync(recordingFilePath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const challengeBase64 = await FileSystem.readAsStringAsync(challengeFilePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // ---------------------------
  // Step 2: Read the photo as a Base64 string.
  // ---------------------------
  const photoBase64 = await FileSystem.readAsStringAsync(photoFilePath, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // ---------------------------
  // Step 3: Convert Base64 to ArrayBuffer and pad if necessary.
  // For audio, we expect a 44-byte header plus 2000 bytes of sample data.
  // ---------------------------
  let recordingBinary = base64ToArrayBuffer(recordingBase64);
  recordingBinary = padArrayBuffer(recordingBinary, 44 + 2000);
  const recordingDataSlice = recordingBinary.slice(44, 44 + 2000);
  const recordingFloat32Array = int16SliceToFloat32(recordingDataSlice, 1000);

  let challengeBinary = base64ToArrayBuffer(challengeBase64);
  challengeBinary = padArrayBuffer(challengeBinary, 44 + 2000);
  const challengeDataSlice = challengeBinary.slice(44, 44 + 2000);
  const challengeFloat32Array = int16SliceToFloat32(challengeDataSlice, 1000);

  // ---------------------------
  // Step 4: Process the photo.
  // We expect at least 256 bytes; if not, we pad with zeros.
  // ---------------------------
  let photoBinary = base64ToArrayBuffer(photoBase64);
  photoBinary = padArrayBuffer(photoBinary, 256);
  const photoSlice = photoBinary.slice(0, 256);
  const imageFloat32Array = new Float32Array(256);
  const photoU8 = new Uint8Array(photoSlice);
  for (let i = 0; i < 256; i++) {
    // Normalize pixel value from [0, 255] to [0, 1].
    imageFloat32Array[i] = photoU8[i] / 255.0;
  }

  // ---------------------------
  // Return the preprocessed data for ONNX inference.
  // ---------------------------
  return {
    imageData: imageFloat32Array,         // Expected shape: [1, 256]
    challengeData: challengeFloat32Array,   // Expected shape: [1, 1000]
    recordingData: recordingFloat32Array,   // Expected shape: [1, 1000]
  };
}

// Example usage:
async function exampleUsage() {
  const sampleRecordingPath = `${FileSystem.cacheDirectory}sample_recording.wav`
  const sampleChallengePath = `${FileSystem.cacheDirectory}sample_challenge.wav`
  const samplePhotoPath = `${FileSystem.cacheDirectory}sample_photo.wav`

  const recordingFilePath =  await FileSystem.downloadAsync(Asset.fromModule(require('../../assets/model/sample_recording.wav')).uri, sampleRecordingPath)
  const challengeFilePath =  await FileSystem.downloadAsync(Asset.fromModule(require('../../assets/model/sample_challenge.wav')).uri, sampleChallengePath)
  const photoFilePath =  await FileSystem.downloadAsync(Asset.fromModule(require('../../assets/model/sample_photo.png')).uri, samplePhotoPath)

  const { imageData, challengeData, recordingData } = await preprocessFiles(
    recordingFilePath.uri,
    challengeFilePath.uri,
    photoFilePath.uri
  );

  console.log('Image Data (256 floats):', imageData.length);
  console.log('Challenge Audio Data (1000 floats):', challengeData.length);
  console.log('Recording Audio Data (1000 floats):', recordingData.length);

  // These arrays can now be used to create ONNX tensors:
  // Example:
  // const feeds = {
  //   image_flat: new ort.Tensor('float32', imageData, [1, 256]),
  //   challenge_audio_flat: new ort.Tensor('float32', challengeData, [1, 1000]),
  //   recorded_audio_flat: new ort.Tensor('float32', recordingData, [1, 1000])
  // }
  // const output = await session.run(feeds);
}

export { preprocessFiles, exampleUsage };
