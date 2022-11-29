import { OrderEvent } from 'src/types/events'
import { getArn } from '.'

// TODO handle internal stage
const INTERNAL_STAGE = 'dev'

export const EVENT_STORE_TOPIC = 'EventStoreTopic'

export const domainEventSubscription = (
  queueName: string,
  filter: { type: Array<OrderEvent['type']> },
  options?: { visibilityTimeout?: number; delay?: number; batchSize?: number },
): {
  resources
  lambdaEvent
} => {
  const titleCase = queueName
    .split(/[ -_]/g)
    .reduce(
      (result, word) => `${result}${word[0].toUpperCase() + word.substr(1)}`,
      '',
    )

  const resourceName = `${titleCase}Queue`
  return {
    lambdaEvent: {
      sqs: {
        arn: getArn(resourceName),
        ...(options?.batchSize && { batchSize: options.batchSize }),
      },
    },
    resources: {
      [resourceName]: {
        Type: 'AWS::SQS::Queue',
        Properties: {
          QueueName: `${queueName}-${INTERNAL_STAGE}`,
          ...(options?.visibilityTimeout && {
            VisibilityTimeout: options.visibilityTimeout,
          }),
          ...(options?.delay && { DelaySeconds: options.delay }),
        },
      },

      [`${resourceName}Subscription`]: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          TopicArn: { Ref: EVENT_STORE_TOPIC },
          Endpoint: getArn(resourceName),
          Protocol: 'sqs',
          // Required to send to SQS
          RawMessageDelivery: 'true',
          FilterPolicy: filter,
        },
      },
      [`${resourceName}Policy`]: {
        Type: 'AWS::SQS::QueuePolicy',
        Properties: {
          PolicyDocument: {
            Version: '2012-10-17',
            Statement: [
              {
                Sid: `${queueName}-allow-sns-messages`,
                Effect: 'Allow',
                Principal: '*',
                Resource: getArn(resourceName),
                Action: 'SQS:SendMessage',
                Condition: {
                  ArnEquals: {
                    'aws:SourceArn': { Ref: EVENT_STORE_TOPIC },
                  },
                },
              },
            ],
          },
          Queues: [{ Ref: resourceName }],
        },
      },
    },
  }
}
