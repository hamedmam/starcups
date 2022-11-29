import type { AWS } from '@serverless/typescript'
import { getArn, iamAllow, INTERNAL_STAGE, join } from '@utils/index'
import { EVENT_STORE_TOPIC } from '@utils/cf-utils'

// dbs
import ordersTable from '@clients/db/projection/resources'
import eventStoreTable from '@clients/db/event-store/resources'

// mutations
import createOrder from '@functions/api/commands/create-order'
import updateOrder from '@functions/api/commands/update-order'
import deleteOrder from '@functions/api/commands/delete-order'

// queries
import getOrders from '@functions/api/queries/get-orders'
import getOrderById from '@functions/api/queries/get-order-by-id'
import getOrdersInProgress from '@functions/api/queries/get-orders-in-progress'

// sns topics
import eventStoreTopic from '@clients/sns/resources'

// event handlers with sqs queues
import {
  orderCreatedEventHandler,
  orderCreatedEventHandlerConfig,
} from '@functions/events/order-created'
import {
  orderUpdatedEventHandler,
  orderUpdatedEventHandlerConfig,
} from '@functions/events/order-updated'
import {
  orderDeletedEventHandler,
  orderDeletedEventHandlerConfig,
} from '@functions/events/order-deleted'

// domain event dispatcher
import eventDispatcher from '@functions/events/event-dispatcher'

const serverlessConfiguration: AWS = {
  service: 'starcups',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs16.x',
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      EVENT_STORE_TABLE: `orders-event-store-${INTERNAL_STAGE}`,
      PROJECTION_TABLE_NAME: `orders-projection-${INTERNAL_STAGE}`,
      DOMAIN_EVENT_TOPIC: { Ref: EVENT_STORE_TOPIC },
    },
    iamRoleStatements: [
      iamAllow(
        [
          'dynamodb:Query',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:BatchWriteItem',
          'dynamodb:DeleteItem',
        ],
        [getArn('OrdersTable'), join('/', getArn('OrdersTable'), 'index/*')],
      ),
      iamAllow(
        [
          'dynamodb:PutItem',
          'dynamodb:GetItem',
          'dynamodb:Query',
          'dynamodb:DescribeStream',
        ],
        [getArn('EventStore')],
      ),
      {
        Effect: 'Allow',
        Action: ['sns:Publish'],
        Resource: { Ref: 'EventStoreTopic' },
      },
    ],
  },
  // import the function via paths
  functions: {
    eventDispatcher,
    createOrder,
    updateOrder,
    deleteOrder,
    getOrders,
    getOrderById,
    getOrdersInProgress,
    orderCreatedEventHandler,
    orderUpdatedEventHandler,
    orderDeletedEventHandler,
  },
  resources: {
    Resources: {
      ...orderCreatedEventHandlerConfig.resources,
      ...orderUpdatedEventHandlerConfig.resources,
      ...orderDeletedEventHandlerConfig.resources,
      OrdersTable: ordersTable,
      EventStore: eventStoreTable,
      EventStoreTopic: eventStoreTopic,
    },
  },

  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
    stageConfig: {
      // only for demonstration purposes
      // this is how we set environment variables for different stages
      dev: {
        someExternalArn: 'arn:aws',
      },
      prod: {
        someExternalArn: 'arn:aws',
      },
    },
  },
}

module.exports = serverlessConfiguration
