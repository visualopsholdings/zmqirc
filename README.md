# ZMQIRC

A frontend for IRC that uses ZMQ to send/receive messages.

## Visual Ops

This is a companion project to:

https://github.com/visualopsholdings/zmqchat

Visual Ops is a proprietary (closed source) system that runs on very low end hardware
like T4G's in AWS, or on a Raspberry Pi 4/5.

This "plugin" can run on a Visual Ops server and provide simple IRC access to the server.

An Open Source version of Visual Ops called "ZMQChat" is being developed, but for now at least
this small part of the server, the IRC protocol is available to build and use.

If you would like access to the Visual Ops software it is available as an image download 
after we get to know you.

Visit https://info.visualops.com/ for more info.

All the places that mention "Visual Ops", could be interchanged with "ZMQChat".

## Protocol

The protocol used to talk to ZMQChat is sending stringified JSON over 2 ZMQ message queues.

### Supported IRC commands

#### PASS [password]

Sends the "login" command below, you can pass your VID here which is all that is needed by 
Visual Ops to return your nickname and your real name.

#### LIST

List all channels (streams in Visual Ops)

#### JOIN

Join a particular channel.

#### QUIT

Log off the server.

#### PRIVMSG

Send a message to the server.

### ZMQ messages

A SUB socket on port tcp://127.0.0.1:3012 which is used to receive new messages from other nodes
and users locally connected to this node.

A REQ socket on port tcp://127.0.0.1:3013 which is used to send messages to other nodes and
users connected locally to this node. This port is also used to "ask" for things of the Visual Ops
system such as login etc.

### JSON formats

#### Certs

```
{ 
  "type": "certs"
}
```

This will be processed by the Visual Ops system and it will return:

```
{ 
  "type": "certs", 
  "ssl": true,
  "cettFile": "xxxx",
  "chainFile": "yyy"
}
```

The session id, is just turned around for convenience. It isn't used by Visual Ops.

#### Login

```
{ 
  "type": "login", 
  "session": "internal session id",
  "password": "password" 
}
```

This will be processed by the Visual Ops system and it will return:

```
{ 
  "type": "user", 
  "name": "tracy",
  "fullname": "Tracy",
  "id": "user guid",
  "session": "internal session id"
}
```

The session id, is just turned around for convenience. It isn't used by Visual Ops.

#### Streams

```
{ 
  "type": "streams", 
  "user": "user guid",
}
```

This will be processed by the Visual Ops system and it will return:

```
{ 
  "type": "streams", 
  "user": "user guid",
  "streams": [
    {
      "name": "Conversation 1",
      "stream": "stream guid",
      "policy": "stream policy guid"
    }
  ]
}
```

#### Policy users

Since the Visual Ops (and the ZMQChat system) is persistent, when you join a stream, you can query the 
users in that stream by the stream policy and join those users too.

```
{ 
  "type": "policyusers", 
  "policy": "stream policy guid" 
}
```

This will be processed by the Visual Ops system and it will return:

```
{ 
  "type": "user", 
  "name": "policyusers",
  "id": "stream policy guid",
  "users": [
    {
      "name": "tracy",
      "fullname": "Tracy",
      "id": "user guid"
    },
    {
      "name": "leanne",
      "fullname": "Leanne",
      "id": "user guid"
    }
  ]
}
```

#### Message

This is sent to the REQ socket when a message happens on IRC, and will be received on the 
SUB socket when a new message is received.

```
{ 
  "type": "message", 
  "text": "Message text",
  "stream": "stream guid",
  "policy": "stream policy guid",
  "user": "user guid"
}
```

#### Acknowlege

This is received on the REQ socket when a Message is sent.

```
{ 
  "type": "ack"
}
```

#### Error

This is received on the REQ socket when a a bad request has happened

```
{ 
  "type": "err",
  "msg": "LOL what are you doing!"
}
```

## Building

The development process for all of this code used a normal Linux environment with the BOOST
libraries and a C++ compiler.

So on your Linux (or mac using Homebrew etc), get all you need:

```
sudo apt-get update
sudo apt-get -y install g++ gcc make cmake
```

### Prerequisites

For convenience, do all these inside a folder you can remove, they take a lot of disk space
but aren't used once instsalled.

```
mkdir working
cd working
```

Boost 1.85.0 if you can get this or later with a simple tool then do that, otherwise you will
need to build it from source:

```
wget https://github.com/boostorg/boost/releases/download/boost-1.85.0/boost-1.85.0-b2-nodocs.tar.gz
tar xzf boost-1.85.0-b2-nodocs.tar.gz 
cd boost-1.85.0
./bootstrap.sh --prefix=/usr --with-python=python3
./b2 stage threading=multi link=shared boost.stacktrace.from_exception=off

as root user:
./b2 install threading=multi link=shared
```

ZMQ and JSON Stuff.

```
wget https://download.libsodium.org/libsodium/releases/libsodium-1.0.19-stable.tar.gz  
tar xzf libsodium-1.0.19-stable.tar.gz
cd libsodium-stable
./configure
make 
sudo make install
sudo ldconfig
cd ..

wget https://github.com/zeromq/libzmq/releases/download/v4.3.5/zeromq-4.3.5.tar.gz
tar xzf zeromq-4.3.5.tar.gz
cd zeromq-4.3.5
./configure
make
sudo make install
sudo ldconfig
cd ..
cd ..

git clone https://github.com/zeromq/cppzmq
cd cppzmq
mkdir build
cd build
cmake ..
make
sudo make install
cd ../..
```

Now this project:

```
git clone https://github.com/visualopsholdings/zmqirc.git
cd zmqirc
mkdir build
cd build
cmake ..
make
make test
```

To run all the unit tests. And show failures.

```
make && make test || cat Testing/Temporary/LastTest.log 
```

## Testing

The end to end tests use cucumber (Ruby), to get that going:

```
$ bundle install
$ bundle exec cucumber
```

This will run up a dummy "ZMQChat" with some dummy data and run end to end tests
against the IRC client.

You can find the actual tests in "features".

To run a single test:

```
bundle exec cucumber -n "More than one user can connect and login"
```

## Installation in Visual Ops

You use the same SSL certs that visualops has, which are in /etc/letsencrypt/live/mydomain, so 
edit zmqirc/scripts/start.sh and set it to that folder.

Once built, to start it on a Visual Ops server:

```
$ zmqirc/scripts/start.sh
```

To stop it:

```
$ zmqirc/scripts/stop.sh
```

On reboot, Visual ops will look for the start script file and run it up.

Make sure that port 6667 is punched through your firewall and you can connect to the Visual Ops
server and chat that way.

## Current development focus

### Remove need to embed SSL cert path in start script.

## License

ZMQIRC is licensed under [version 3 of the GNU General Public License] contained in LICENSE.

## Acknowlegements

### C++ and Boost inspiration

- https://github.com/skywodd/Boost_IRC_server

### NodeJS IRC inspiration

- https://github.com/song940/node-irc

### ZeroMQ messaging

- https://zeromq.org/

### Boost C++ library

- https://www.boost.org/

### End to end testing

- https://cucumber.io/

## Change Log

### 10 Apr 2024
- Initial project creation.

### 15 Apr 2024
- Cucumber tests, slight rename to include the ZMQChat project (new) which is an open source
implementation of the proprietary "Visual Ops" server.

### 18 Apr 2024
- Implement server and session.

### 22 Apr 2024
- Simple parser, handle NICK

### 24 Apr 2024
- command list, handle USER and send ZMQ login to record user.

### 26 Apr 2024
- start to implement channels mapped from streams.

### 29 Apr 2024
- start to implemement users.

### 30 Apr 2024
- finish off other users in the stream.
- finish off PRIVMSG

### 1 May 2024
- Get ZMQ working in background thread to handle messages correctly.

### 8 May 2024
- FInish initial C++ implementation running in Visual Ops

### 10 May 2024
- Rewrite zmqchat test program in C++. Get rid of nodejs.

### 12 May
- SSL support

### 16 May
- Solve "LIST" deadlock problem in SSL.
