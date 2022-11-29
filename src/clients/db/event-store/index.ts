import * as AWS from 'aws-sdk'
import { ulid } from 'ulid'

import {
  DispatchInputEvent,
  DispatchOutput,
  DomainEvent,
  EventStoreClient,
  EventStoreClientParams,
} from './types'

/**
 * Finds the last revision number in a given list of domain events
 *  returns 0 if no events exist
 *
 * @param history List of domain events to iterate through
 */
export const nextRevision = <T extends DomainEvent>(history: T[]): number => {
  const revisions = history.map((e) => e.revision)
  if (!revisions.length) {
    return 0
  }
  return Math.max(...revisions) + 1
}

export const makeEventId = (): string => 'event_' + ulid()

const ensureArray = <TOutput, TInput extends unknown = unknown>(
  input: TInput | TInput[],
) => (Array.isArray(input) ? input : [input]) as unknown as TOutput[]

export const eventstore = <T extends DomainEvent>(
  params: EventStoreClientParams,
): EventStoreClient<T> => {
  const { tableName: TableName, tracing = true } = params

  const dynamo = new AWS.DynamoDB.DocumentClient()

  const dispatch: EventStoreClient<T>['dispatch'] = async (input) => {
    const events = ensureArray<DispatchInputEvent<T>>(input).map((event) => {
      const eventId = event.eventId || makeEventId()
      const timestamp = event.timestamp || new Date().toISOString()
      const schemaVersion = event.schemaVersion ?? 1

      return {
        ...event,
        schemaVersion,
        eventId,
        timestamp,
      } as unknown as T
    })

    try {
      await dynamo
        .transactWrite({
          TransactItems: events.map((event) => ({
            Put: {
              TableName,
              ConditionExpression:
                'attribute_not_exists(#aggregateId) AND attribute_not_exists(#revision)',
              ExpressionAttributeNames: {
                '#aggregateId': 'aggregateId',
                '#revision': 'revision',
              },
              Item: event,
            },
          })),
        })
        .promise()
    } catch (error) {
      if (error.message && typeof error.message === 'string') {
        // Catch possible DynamoDB conflict errors
        // see: https://docs.aws.amazon.com/AWSJavaSDK/latest/javadoc/com/amazonaws/services/dynamodbv2/model/TransactionCanceledException.html
        if (
          error.message.includes('ConditionalCheckFailed') ||
          error.message.includes('TransactionConflict')
        ) {
          throw new Error(
            'Event already exists for given aggregate ID and revision number',
          )
        }
      }

      throw error
    }

    const result = Array.isArray(input) ? events : events[0]
    return result as DispatchOutput<T, typeof input>
  }

  const getEvents: EventStoreClient<T>['getEvents'] = async (aggregateId) => {
    let lastKey: AWS.DynamoDB.DocumentClient.Key | undefined
    const events = []

    do {
      const { Items = [], LastEvaluatedKey } = await dynamo
        .query({
          TableName,
          KeyConditionExpression: 'aggregateId = :aggregateId',
          ExpressionAttributeValues: { ':aggregateId': aggregateId },
          ConsistentRead: true,
          ExclusiveStartKey: lastKey,
        })
        .promise()

      lastKey = LastEvaluatedKey
      events.push(...Items)
    } while (lastKey)

    return events as T[]
  }

  return {
    dispatch,
    getEvents,
  }
}
