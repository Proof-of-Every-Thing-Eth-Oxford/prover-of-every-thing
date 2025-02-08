// Function to wait until the asset is no longer null
export function sleepUntilPreloaded(toCheckFunction, maxTimeout = 10000) {
  return new Promise((resolve, reject) => {
    let waited = 0
    const waitTime = 100

    const interval = setInterval(() => {
      // Dynamically check the value of the asset
      if (toCheckFunction()) {
        clearInterval(interval)
        resolve()
      } else {
        waited += waitTime
        if (waited >= maxTimeout) {
          clearInterval(interval)
          reject('Timeout waiting for asset to preload')
        }
      }
    }, waitTime)
  })
}
