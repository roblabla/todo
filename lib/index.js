const pullRequestHandler = require('./pull-request-handler')
const pullRequestMergedHandler = require('./pull-request-merged-handler')
const pushHandler = require('./push-handler')
const issueRenameHandler = require('./issue-rename-handler')

const fs = require('fs')
const heapdump = require('heapdump')
const { promisify } = require('util')

const writeSnapshot = promisify(heapdump.writeSnapshot)
const readFile = promisify(fs.readFile)

module.exports = app => {
  // PR handler (comments on pull requests)
  app.on(['pull_request.opened', 'pull_request.synchronize'], pullRequestHandler)

  // Merge handler (opens new issues)
  app.on('pull_request.closed', pullRequestMergedHandler)

  // Push handler (opens new issues)
  app.on('push', pushHandler)

  // Prevent tampering with the issue title
  app.on('issues.edited', issueRenameHandler)

  app.route('/snapshot').get('/', async (req, res) => {
    const file = await writeSnapshot()
    const snapshot = await readFile(file)
    res.sendFile(snapshot)
  })
}
