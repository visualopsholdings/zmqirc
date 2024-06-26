#!/bin/bash
# 
# Start ZMQIRC

if [ ! -f "zmqirc/build/ZMQIRC" ];
then
  echo "Need to build project first"
  exit 1
fi

if [ -d zmqirc/lib ];
then
  # for those machines that have local libs on them
  sudo LD_LIBRARY_PATH=/home/visualops/zmqirc/lib ./zmqirc/build/ZMQIRC \
    --logLevel=trace \
    > zmqirc.log 2>&1 &
    
# when running without sudo
#   LD_LIBRARY_PATH=/home/visualops/zmqirc/lib
#   export LD_LIBRARY_PATH
else
  sudo ./zmqirc/build/ZMQIRC \
    --logLevel=trace \
    > zmqirc.log 2>&1 &
fi

# to run without SSL, comment out the above and just used this.
# BUT DONT!!!!
#
#./zmqirc/build/ZMQIRC \
#  > zmqirc.log 2>&1 &

