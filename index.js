require('dotenv').config()
require('heapdump')

const { findPrivateKey } = require('probot/lib/private-key')
const { createProbot } = require('probot')

const probot = createProbot({
  id: process.env.APP_ID,
  secret: process.env.WEBHOOK_SECRET,
  cert: findPrivateKey(),
  port: process.env.PORT || 3000,
  webhookProxy: process.env.WEBHOOK_PROXY_URL
})

const appFn = require('./lib')

probot.setup([appFn])
probot.start()
