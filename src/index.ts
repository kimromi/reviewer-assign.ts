import { Application, Context } from 'probot' // eslint-disable-line no-unused-vars
import _ from 'underscore'

interface ReviewersConfig {
  reviewers: string[]
  reviewersNumber?: number
}

interface LabelConfig extends ReviewersConfig {
  label: string
}

interface AppConfig {
  open?: ReviewersConfig
  labels?: LabelConfig[]
}

export = (app: Application) => {
  app.on('pull_request.opened', async (context: Context) => {
    const config: AppConfig = await context.config<AppConfig>('reviewers_assign.yml',)
    if (!config.open) {
      return
    }

    await createReviewRequest(context, config.open)
  })

  app.on('pull_request.labeled', async (context) => {
    const config: AppConfig = await context.config<AppConfig>('reviewers_assign.yml')
    if (!config.labels) {
      return
    }

    const addedLabel = context.payload.label.name

    config.labels.forEach(async (labelConfig) => {
      if (labelConfig.label === addedLabel) {
        await createReviewRequest(context, labelConfig)
      }
    })
  })
}

async function createReviewRequest(context: Context, config: ReviewersConfig) {
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
}
