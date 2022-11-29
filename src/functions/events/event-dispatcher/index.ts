import { handlerPath } from '@libs/handler-resolver'
import { getAtt } from '@utils/index'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      stream: {
        type: 'dynamodb',
        arn: getAtt('EventStore', 'StreamArn'),
      },
    },
  ],
}
