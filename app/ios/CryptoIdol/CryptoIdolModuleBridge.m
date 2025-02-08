#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(NativeModelProver, NSObject)

RCT_EXTERN_METHOD(setupKeys:(NSString *)param resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(generateProof:(NSString *)param resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)

@end
