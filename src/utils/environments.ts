import * as env from 'env-var'

export const config = {
  name: env.get('SERVER_NAME').asString(),
  stage: env.get('ENVIRONMENT').default('dev').required().asString(),
  region: env.get('REGION').default('us-east-1').required().asString(),
  projectionTable: env.get('PROJECTION_TABLE_NAME').required().asString(),
  eventStore: {
    table: env.get('EVENT_STORE_TABLE').required().asString(),
    topic: env.get('DOMAIN_EVENT_TOPIC').required().asString(),
  },
}
