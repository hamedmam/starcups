import { env } from '@utils/index'
const ordersTable = {
  Type: 'AWS::DynamoDB::Table',
  Properties: {
    TableName: env('PROJECTION_TABLE_NAME'),
    AttributeDefinitions: [
      {
        AttributeName: 'pk',
        AttributeType: 'S',
      },
      {
        AttributeName: 'sk',
        AttributeType: 'S',
      },
      {
        AttributeName: 'orderStatus',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'pk',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'sk',
        KeyType: 'RANGE',
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'statusPkIndex',
        KeySchema: [
          {
            AttributeName: 'orderStatus',
            KeyType: 'HASH',
          },
          {
            AttributeName: 'pk',
            KeyType: 'RANGE',
          },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
  },
}

export default ordersTable
