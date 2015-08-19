// test.cc

#include <dirent.h>
#include <stdio.h>
#include <time.h>


int compare_string(char*, char*);
char* get_device_list(char*);
void get_bytes(FILE*, char*, char*);

int main(void)
{
  FILE *sent, *rcvd;
  char *device;
  char *mode = "r";
  char *syspath = "/sys/class/net/";
  char *sentpath = "/statistics/tx_bytes";
  char *rcvdpath = "/statistics/rx_bytes";

  device = get_device_list(syspath);

  if(device[0] == '\0')
  {
    printf("oh no! couldnt find it..\n");
  }

  char buf[48];
  snprintf(buf, sizeof buf, "%s%s%s", syspath, device, sentpath);
  char buff[20];

  get_bytes(sent, buf, buff);
  printf("Read Buffer: %s\n", buff);
}

void get_bytes(FILE *fp, char *fullpath, char *buff)
{
  fp = fopen(fullpath, "r");
  if(fp == NULL) {
    printf(".shoooot\n");
  }

  fscanf(fp, "%s", buff);
}


char * get_device_list(char *syspath) {
  DIR *d;
  struct dirent *dir;
  char *eth;
  d = opendir(syspath);
  if (d)
  {
    while ((dir = readdir(d)) != NULL)
    {
      // printf("%s is in the dir\n", dir->d_name);
      int result = compare_string(dir->d_name, "eth0");
      if (result == 0)
      {
        eth = dir->d_name;
      }
    }
    closedir(d);
    return eth;
  }
  return "";
}

int compare_string(char *first, char *second) {
   while (*first == *second) {
      if (*first == '\0' || *second == '\0')
         break;

      first++;
      second++;
   }

   if (*first == '\0' && *second == '\0')
      return 0;
   else
      return -1;
}
