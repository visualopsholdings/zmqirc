const {
  RPL_TOPIC,
  RPL_NOTOPIC,
  ERR_NEEDMOREPARAMS,
  ERR_NOSUCHCHANNEL
} = require('../replies')

const names = require('./names')

function join (opts) {
  const { user, server, parameters: [ channelNames ] } = opts

  if (!channelNames) {
    return user.send(server, ERR_NEEDMOREPARAMS, [ 'JOIN', ':Not enough parameters' ])
  }

  for (const channelName of channelNames.split(',')) {
    const channel = server.findChannel(channelName)
    if (!channel) {
      return user.send(server, ERR_NOSUCHCHANNEL, [ channelName, ':No such channel.' ])
    }
    
    channel.join(user)

    channel.send(user, 'JOIN', [ channel.name, user.username, `:${user.realname}` ])

    names(Object.assign(
      {},
      opts,
      { parameters: [ channelName ] }
    ))

    // Topic
    if (channel.topic) {
      user.send(server, RPL_TOPIC, [ user.nickname, channel.name, `:${channel.topic}` ])
    } else {
      user.send(server, RPL_NOTOPIC, [ user.nickname, channel.name, ':No topic is set.' ])
    }
    
    // other users
    server.policyUsers(channel.policy);
  }
}

module.exports = join;