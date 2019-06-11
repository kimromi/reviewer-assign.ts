import { Application } from 'probot' // eslint-disable-line no-unused-vars

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    const prComment = context.issue({ body: 'Thanks for opening this pull request!' })
    await context.github.issues.createComment(prComment)
  })
}
