#include "util.h"

using v8::FunctionTemplate;

// NativeExtension.cc represents the top level of the module.
// C++ constructs that are exposed to javascript are exported here

NAN_MODULE_INIT(InitAll) {
  Nan::Set(target, Nan::New("bytesIn").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(bytesIn)).ToLocalChecked());
  Nan::Set(target, Nan::New("bytesOut").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(bytesOut)).ToLocalChecked());
}

NODE_MODULE(xrateplus, InitAll)
