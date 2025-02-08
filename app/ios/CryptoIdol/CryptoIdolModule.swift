import React
import EzklPackage // Replace with the actual name of your SPM library

@objc(NativeModelProver)
class NativeModelProver: NSObject {

  @objc
  func setupKeys(_ param: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // Parse JSON parameter to get paths
        guard let paths = try JSONSerialization.jsonObject(with: param.data(using: .utf8)!, options: []) as? [String: String],
              var compiledCircuitPath = paths["compiledCircuit"],
              var srsPath = paths["srs"] else {
          throw NSError(domain: "InvalidParameterError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid paths in input parameter."])
        }

        // Remove "file://" prefix if present
        if compiledCircuitPath.hasPrefix("file://") {
          compiledCircuitPath = String(compiledCircuitPath.dropFirst(7))
        }
        if srsPath.hasPrefix("file://") {
          srsPath = String(srsPath.dropFirst(7))
        }

        // Read compiledCircuit and srs files as binary data
        let compiledCircuitData = try Data(contentsOf: URL(fileURLWithPath: compiledCircuitPath))
        let srsData = try Data(contentsOf: URL(fileURLWithPath: srsPath))

        // Generate vk and pk using the functions in EzklPackage
        let vk = try EzklPackage.genVk(compiledCircuit: compiledCircuitData, srs: srsData, compressSelectors: true)
        let pk = try EzklPackage.genPk(vk: vk, compiledCircuit: compiledCircuitData, srs: srsData)

        // Save vk and pk to local files
        let vkPath = FileManager.default.temporaryDirectory.appendingPathComponent("vk.key")
        let pkPath = FileManager.default.temporaryDirectory.appendingPathComponent("pk.key")

        try vk.write(to: vkPath)
        try pk.write(to: pkPath)

        // Prepare result dictionary to send back file paths to JavaScript
        let result: [String: String] = [
          "vkPath": vkPath.path,
          "pkPath": pkPath.path
        ]

        // Return to the main thread and resolve with file paths
        DispatchQueue.main.async {
          resolver(result)
        }
      } catch {
        // Handle any errors and reject promise with full error description
        DispatchQueue.main.async {
          let errorMessage = "Error during `setupKeys` computation: \(error.localizedDescription)"
          rejecter("E_COMPUTATION_ERROR", errorMessage, error)
        }
      }
    }
  }


  @objc
  func generateProof(_ param: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        // Parse JSON parameter to get paths for pk, compiledCircuit, and srs
        guard let paths = try JSONSerialization.jsonObject(with: param.data(using: .utf8)!, options: []) as? [String: String],
              var pkPath = paths["pk"],
              var compiledCircuitPath = paths["compiledCircuit"],
              var srsPath = paths["srs"],
              let inputDataString = paths["inputData"] else {
          throw NSError(domain: "InvalidParameterError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Invalid paths in input parameter."])
        }

        // Strip "file://" prefix if present
        if pkPath.hasPrefix("file://") {
          pkPath = String(pkPath.dropFirst(7))
        }
        if compiledCircuitPath.hasPrefix("file://") {
          compiledCircuitPath = String(compiledCircuitPath.dropFirst(7))
        }
        if srsPath.hasPrefix("file://") {
          srsPath = String(srsPath.dropFirst(7))
        }

        // Read pk, compiledCircuit, and srs files as binary data
        let pkData = try Data(contentsOf: URL(fileURLWithPath: pkPath))
        let compiledCircuitData = try Data(contentsOf: URL(fileURLWithPath: compiledCircuitPath))
        let srsData = try Data(contentsOf: URL(fileURLWithPath: srsPath))

        // Convert inputData (passed as JSON string) into Data
        guard let inputData = inputDataString.data(using: .utf8) else {
          throw NSError(domain: "DataConversionError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert inputData to Data."])
        }

        // Generate witness using genWitness
        let witness = try EzklPackage.genWitness(compiledCircuit: compiledCircuitData, input: inputData)

        // Generate proof using prove
        let proofData = try EzklPackage.prove(witness: witness, pk: pkData, compiledCircuit: compiledCircuitData, srs: srsData)

        // Convert proof Data to JSON string
        guard let proofJSON = try JSONSerialization.jsonObject(with: proofData, options: []) as? [String: Any],
              let proofString = String(data: try JSONSerialization.data(withJSONObject: proofJSON, options: []), encoding: .utf8) else {
          throw NSError(domain: "JSONConversionError", code: 1, userInfo: [NSLocalizedDescriptionKey: "Failed to convert proof data to JSON string."])
        }

        // Prepare result dictionary with proof JSON string as output
        let result: [String: String] = [
          "proof": proofString
        ]

        // Return to the main thread and resolve with the proof
        DispatchQueue.main.async {
          resolver(result)
        }
      } catch {
        // Handle any errors and reject promise with full error description
        DispatchQueue.main.async {
          let errorMessage = "Error during `generateProof` computation: \(error.localizedDescription)"
          rejecter("E_COMPUTATION_ERROR", errorMessage, error)
        }
      }
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
