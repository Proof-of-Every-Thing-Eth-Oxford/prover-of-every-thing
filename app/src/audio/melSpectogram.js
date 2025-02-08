// Calculate Mel Spectrogram
// TODO - make the output consistent with the Python version
import FFT from 'fft.js'

function calculateMelSpectrogram(audioData, sampleRate) {
  const n_fft = 2048              // FFT window size
  const hop_length = 512          // Hop length
  const n_mels = 128              // Number of mel bands
  const fmin = 0                  // Minimum frequency
  const fmax = sampleRate / 2     // Maximum frequency

  // Create Hann window
  const windowFunction = hannWindow(n_fft)

  // Pad the signal
  const padAmount = Math.floor(n_fft / 2)
  const paddedAudioData = padSignal(audioData, padAmount)

  // Initialize FFT and mel filter banks
  const fft = new FFT(n_fft)
  const melFilterbanks = createMelFilterbank(n_fft, n_mels, fmin, fmax, sampleRate)

  // Initialize 2D array for the mel spectrogram
  const melSpectrogram = Array.from({ length: n_mels }, () => [])

  let currentOffset = 0
  while (currentOffset + n_fft <= paddedAudioData.length) {
    const segment = paddedAudioData.slice(currentOffset, currentOffset + n_fft)

    // Apply window function
    for (let i = 0; i < n_fft; i++) {
      segment[i] *= windowFunction[i]
    }

    // Perform FFT
    const spectrum = fft.createComplexArray()
    fft.realTransform(spectrum, segment)
    fft.completeSpectrum(spectrum)

    // Compute power spectrum
    const powerSpectrum = new Float32Array(n_fft / 2 + 1)
    for (let i = 0; i < powerSpectrum.length; i++) {
      const real = spectrum[i * 2]
      const imag = spectrum[i * 2 + 1]
      powerSpectrum[i] = real * real + imag * imag // Power spectrum
    }

    // Apply mel filter bank
    const melspec = applyFilterbank(powerSpectrum, melFilterbanks)

    // Convert to dB scale
    const melArray = powerToDb(melspec)

    // Store the result
    for (let i = 0; i < n_mels; i++) {
      melSpectrogram[i].push(melArray[i])
    }

    currentOffset += hop_length
  }

  return melSpectrogram
}

// Hann window function
function hannWindow(length) {
  return Array.from({ length }, (_, n) => 0.5 * (1 - Math.cos((2 * Math.PI * n) / (length - 1))))
}

// Padding function
function padSignal(signal, padAmount) {
  const paddedSignal = new Float32Array(signal.length + 2 * padAmount)

  // Reflect padding
  for (let i = 0; i < padAmount; i++) {
    paddedSignal[padAmount - i - 1] = signal[i]
    paddedSignal[paddedSignal.length - padAmount + i] = signal[signal.length - i - 1]
  }

  // Copy original data
  paddedSignal.set(signal, padAmount)

  return paddedSignal
}

// Adjusted powerToDb function
function powerToDb(S, ref = null, amin = 1e-10, top_db = 80.0) {
  const refValue = ref || Math.max(...S, amin)

  const dBArray = new Float32Array(S.length)
  for (let i = 0; i < S.length; i++) {
    const magnitude = Math.max(S[i], amin)
    dBArray[i] = 10 * Math.log10(magnitude / refValue)
  }

  // Apply top_db threshold
  const maxDb = Math.max(...dBArray)
  const minDb = maxDb - top_db
  for (let i = 0; i < dBArray.length; i++) {
    dBArray[i] = Math.max(dBArray[i], minDb)
  }

  return dBArray
}

// Adjusted createMelFilterbank function with normalization
function createMelFilterbank(n_fft, n_mels, fmin, fmax, sampleRate) {
  // Number of FFT bins
  const n_fft_bins = Math.floor(n_fft / 2) + 1

  // Compute the mel frequencies
  const mel_frequencies = linearSpace(hzToMel(fmin), hzToMel(fmax), n_mels + 2)
  const mel_frequencies_hz = mel_frequencies.map(mel => melToHz(mel))

  // Compute the FFT bin frequencies
  const fft_frequencies = Array.from({ length: n_fft_bins }, (_, i) => (i * sampleRate) / n_fft)

  // Initialize the filter bank matrix
  const filterBank = Array.from({ length: n_mels }, () => new Float32Array(n_fft_bins))

  // Calculate the filters
  for (let i = 0; i < n_mels; i++) {
    const lower = mel_frequencies_hz[i]
    const center = mel_frequencies_hz[i + 1]
    const upper = mel_frequencies_hz[i + 2]

    for (let j = 0; j < n_fft_bins; j++) {
      const freq = fft_frequencies[j]

      if (freq >= lower && freq <= center) {
        filterBank[i][j] = (freq - lower) / (center - lower)
      } else if (freq >= center && freq <= upper) {
        filterBank[i][j] = (upper - freq) / (upper - center)
      } else {
        filterBank[i][j] = 0
      }
    }

    // Normalize the filter to have unity area (slaney normalization)
    const enorm = 2.0 / (upper - lower)
    for (let j = 0; j < n_fft_bins; j++) {
      filterBank[i][j] *= enorm
    }
  }

  return filterBank
}

// Rest of the utility functions

function applyFilterbank(powerSpectrum, filterBank) {
  const n_mels = filterBank.length
  const melEnergies = new Float32Array(n_mels)

  for (let i = 0; i < n_mels; i++) {
    let energy = 0
    for (let j = 0; j < powerSpectrum.length; j++) {
      energy += filterBank[i][j] * powerSpectrum[j]
    }
    melEnergies[i] = energy
  }

  return melEnergies
}

function hzToMel(hz) {
  // Slaney's formula (default in librosa)
  return 2595 * Math.log10(1 + hz / 700)
}

function melToHz(mel) {
  return 700 * (Math.pow(10, mel / 2595) - 1)
}

function linearSpace(start, end, count) {
  const delta = (end - start) / (count - 1)
  return Array.from({ length: count }, (_, i) => start + i * delta)
}

export default calculateMelSpectrogram
