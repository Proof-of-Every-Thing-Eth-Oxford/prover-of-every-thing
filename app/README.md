# Proof of Everything App


## Setup Instructions

1. **Install dependencies**:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```
2. **Install iOS dependencies**:
   ```
   cd ios && pod install
   ```
3. **Start Development Server**:
   ```
   npx react-native start --reset-cache
   ```

  And press **i** for iPhone mode when prompted.


4. **Run the app**:

- **Simulator**: To run the app in the simulator on your Mac, execute:

  ```
  npx react-native run-ios --simulator="iPhone 15 Pro"
  ```

- **Real Device**: To run it on a real iPhone, make sure you have connected your device to your Mac via USB and execute:

  ```
  npx react-native run-ios
  ```
  
Optionally, you can add `mode="Release"` to build a release version of the app, that does not require the development server running in order to use.

**Note:** this has been forked from [CryptoIdol](https://github.com/zkonduit/cryptoidol-react-native/tree/main)


