import { publishEventToSNS } from '@clients/sns'
import { DynamoDBStreamHandler } from 'aws-lambda'
import { DomainEvent } from 'src/types/events'

const handleDomainEventStreams: DynamoDBStreamHandler = async (event) => {
  console.log('event', event)
  const record = event.Records[0]
  if (record.eventName !== 'INSERT') {
    return
  }

  if (!record.dynamodb?.NewImage) return

  try {
    const event = record.dynamodb.NewImage as DomainEvent

    console.log(event)

    await publishEventToSNS(event)
  } catch (error) {
    throw error
  }
}

export const main = handleDomainEventStreams
