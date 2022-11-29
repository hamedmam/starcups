import { config } from '@utils/environments'
import { SNS } from 'aws-sdk'
import { DomainEvent } from 'src/types/events'

const sns = new SNS()

export const publishEventToSNS = async (event: DomainEvent): Promise<void> => {
  await sns
    .publish({
      TopicArn: config.eventStore.topic,
      MessageAttributes: {
        type: {
          DataType: 'String',
          StringValue: event.type['S'],
        },
        revision: {
          DataType: 'Number',
          StringValue: event.revision['N'].toString(),
        },
      },
      Message: JSON.stringify(event),
    })
    .promise()
}
