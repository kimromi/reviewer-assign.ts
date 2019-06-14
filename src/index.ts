import { Application } from 'probot' // eslint-disable-line no-unused-vars
import _ from 'underscore'

interface AppConfig {
  reviewers: string[]
  reviewersNumber?: number
}

export = (app: Application) => {
  app.on('pull_request.opened', async (context) => {
    const config: AppConfig = await context.config<AppConfig>('reviewers_assign.yml', { reviewers: [] })

    const owner = context.payload.pull_request.user.login
    let filteredReviewers = config.reviewers.filter((reviewer: string): boolean => {
        return reviewer !== owner
      }
    )
    if (config.reviewersNumber) {
      filteredReviewers = _.sample(filteredReviewers, config.reviewersNumber)
    }

    const reviewers = context.issue({ reviewers: filteredReviewers })
    await context.github.pullRequests.createReviewRequest(reviewers)
  })
}
