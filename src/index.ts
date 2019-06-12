import { Application } from 'probot' // eslint-disable-line no-unused-vars

interface AppConfig {
  reviewers: string[]
}

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    const config: AppConfig = await context.config<AppConfig>('reviewers_assign.yml', { reviewers: [] })

    const reviewers = context.issue({ reviewers: config.reviewers })
    await context.github.pullRequests.createReviewRequest(reviewers)
  })
}
