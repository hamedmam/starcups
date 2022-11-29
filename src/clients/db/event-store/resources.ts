import { env } from '@utils/index'

const eventStoreTable = {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    TableName: env('EVENT_STORE_TABLE'),
    AttributeDefinitions: [
      {
        AttributeName: 'aggregateId',
        AttributeType: 'S',
      },
      {
        AttributeName: 'revision',
        AttributeType: 'N',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'aggregateId',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'revision',
        KeyType: 'RANGE',
      },
    ],
    StreamSpecification: {
      StreamViewType: 'NEW_IMAGE',
    },
    BillingMode: 'PAY_PER_REQUEST',
  },
}

export default eventStoreTable
