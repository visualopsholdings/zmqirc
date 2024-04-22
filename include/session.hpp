/*
  session.hpp
  
  Author: Paul Hamilton (paul@visualops.com)
  Date: 16-Apr-2024
    
  A session for ZMQ to IRC integration.
  
  Licensed under [version 3 of the GNU General Public License] contained in LICENSE.
 
  https://github.com/visualopsholdings/zmqirc
*/

#ifndef H_session
#define H_session

#include "request.hpp"

#include <boost/enable_shared_from_this.hpp>
#include <boost/asio.hpp>
#include <list>

class Session : public boost::enable_shared_from_this<Session> {

public:
  
  static boost::shared_ptr<Session> create(
      boost::asio::io_service& io_service);

  boost::asio::ip::tcp::socket& socket();

  void start();
  boost::asio::streambuf& buffer();
  
  void nick(const std::list<std::string> &args);
  void user(const std::list<std::string> &args);
  
private:

  boost::asio::ip::tcp::socket _socket;
  boost::asio::streambuf _buffer;
  Request _request;
  std::string _nick;
  
  explicit Session(boost::asio::io_service& io_service);
  
  void handle_read(const boost::system::error_code& error,
      const std::size_t bytes_transferred);


};

#endif // H_session
