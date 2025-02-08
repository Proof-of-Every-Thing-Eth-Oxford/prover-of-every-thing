export function bigEndianToLittleEndian(hexStr) {
  // Ensure the hex string length is even for proper byte representation
  if (hexStr.length % 2 !== 0) {
    throw new Error('Hex string length must be even')
  }

  // Split the hex string into 2-character chunks (bytes), reverse them, and join
  return hexStr.match(/.{2}/g).reverse().join('')
}
