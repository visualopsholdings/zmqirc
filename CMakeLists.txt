#   CMakeLists.txt
#
#   Author: Paul Hamilton (paul@visualops.com)
#   Date: 16-Apr-2024
#
#   Input file for ZMQIRC driver for Visual Ops
#
#   Licensed under [version 3 of the GNU General Public License] contained in LICENSE.
#   
#   https://github.com/visualopsholdings/zmqirc

cmake_minimum_required(VERSION 3.5)

project (zmqirc)
  find_package(Boost 1.85.0 COMPONENTS program_options filesystem unit_test_framework chrono thread log_setup log json REQUIRED)
  find_package(cppzmq REQUIRED)
  find_package(OpenSSL REQUIRED)
  add_definitions(-DBOOST_ALL_DYN_LINK) 
  enable_testing()

set(CMAKE_BUILD_TYPE Debug)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_EXTENSIONS OFF)

set(LIBS zmq ${OPENSSL_LIBRARIES})

if (UNIX AND NOT APPLE)
  add_definitions(-funwind-tables) 
endif ()
if (APPLE)
  include_directories(/usr/local/include)
  LINK_DIRECTORIES(/opt/homebrew/Cellar/zeromq/4.3.5_1/lib)
endif ()
set(BOOSTLIBS ${Boost_CHRONO_LIBRARY} ${Boost_THREAD_LIBRARY} ${Boost_PROGRAM_OPTIONS_LIBRARY} 
      ${Boost_FILESYSTEM_LIBRARY} ${Boost_LOG_SETUP_LIBRARY} ${Boost_LOG_LIBRARY} ${Boost_JSON_LIBRARY})

include_directories(include)
include_directories(${OPENSSL_INCLUDE_DIR})

add_executable(ZMQIRC src/zmqirc.cpp src/server.cpp src/zmqclient.cpp src/session.cpp 
                      src/commands.cpp src/parser.cpp src/channel.cpp src/user.cpp 
                      src/tcpsession.cpp src/sslsession.cpp)
  target_link_libraries(ZMQIRC ${LIBS} ${BOOSTLIBS})

add_executable(ZMQCHAT test/zmqchat.cpp)
  target_link_libraries(ZMQCHAT ${LIBS} ${BOOSTLIBS})

add_executable(TestParser test/testparser.cpp src/parser.cpp)
  target_link_libraries(TestParser ${Boost_UNIT_TEST_FRAMEWORK_LIBRARY})

add_executable(TestChannel test/testchannel.cpp src/parser.cpp)
  target_link_libraries(TestChannel ${Boost_UNIT_TEST_FRAMEWORK_LIBRARY})

add_test(TestParser TestParser)
add_test(TestChannel TestChannel)
