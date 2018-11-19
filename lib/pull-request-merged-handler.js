const checkForDuplicateIssue = require('./utils/check-for-duplicate-issue')
const reopenClosed = require('./utils/reopen-closed')
const { assignFlow, lineBreak, truncate } = require('./utils/helpers')
const { issueFromMerge } = require('./templates')
const theLoop = require('./utils/the-loop')

module.exports = async context => {
  return theLoop(context, async ({
    title,
    config,
    filename,
    range,
    assignedToString,
    keyword,
    number,
    bodyComment,
    sha,
    labels,
    username
  }) => {
    // Prevent duplicates
    const existingIssue = await checkForDuplicateIssue(context, title)
    if (existingIssue) {
      context.log(`Duplicate issue found with title [${title}]`)
      return reopenClosed({ context, config, issue: existingIssue }, {
        keyword,
        title,
        sha,
        filename
      })
    }

    let body = issueFromMerge(context.repo({
      sha,
      assignedToString,
      range,
      filename,
      keyword,
      number,
      body: bodyComment
    }))

    body = lineBreak(body)
    context.log(`Creating issue [${title}] in [${context.repo().owner}/${context.repo().repo}]`)
    return context.github.issues.create(context.repo({
      title: truncate(title),
      body,
      labels,
      ...assignFlow(config, username)
    }))
  })
}