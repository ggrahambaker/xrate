// util.cc
#include "util.h"
#include <dirent.h>
#include <unistd.h>
#include <stdio.h>

int sendFD, rcvdFD;
const char *device = "eth0";
const char *syspath = "/sys/class/net/";
const char *sentpath = "/statistics/tx_bytes";
const char *rcvdpath = "/statistics/rx_bytes";
int sendOpened = 0;
int rcvdOpened = 0;


NAN_METHOD(bytesIn)
{
  char sendbuf[48];
  snprintf(sendbuf, sizeof sendbuf, "%s%s%s", syspath, device, sentpath);
  char buff[400];

  sendFD = open(sendbuf, O_RDONLY);

  if(sendFD < 0) {
    printf(".shoooot\n");
  }

  ssize_t bytesRead = read(sendFD, buff, sizeof buff);

  if (bytesRead == (ssize_t)-1) {
    printf(".read returned -1\n");
  }
  else {
    buff[bytesRead] = '\0';
  }

  // printf("%s\n", buff);

//   fseek(sent, SEEK_SET, 0);
  // fread(buff, sizeof buff, 1, sent);
  // fscanf(sent, "%s", buff);
  int a=0;
  while(buff[a] != '\0'){
    if(buff[a] == '\n')
      buff[a] = '\0';
    a++;
  }

  std::string inString(buff);

  info.GetReturnValue().Set(Nan::New(inString).ToLocalChecked());
}


NAN_METHOD(bytesOut)
{
  char rcvdbuf[48];
  snprintf(rcvdbuf, sizeof rcvdbuf, "%s%s%s", syspath, device, rcvdpath);
  char buff[20];

  rcvdFD = open(rcvdbuf, O_RDONLY);


  if(rcvdFD < 0) {
    printf(".shoooot\n");
  }

  read(rcvdFD, buff, sizeof buff);

  int a=0;

  while(buff[a] != '\0'){
    if(buff[a] == '\n')
      buff[a] = '\0';
    a++;
  }

  std::string inString(buff);

  info.GetReturnValue().Set(Nan::New(inString).ToLocalChecked());
}
