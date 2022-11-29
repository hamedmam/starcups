import { v4 as uuid } from 'uuid'
import { config } from '@utils/environments'
import * as AWS from 'aws-sdk'
const client = new AWS.DynamoDB.DocumentClient()

const TableName = config.projectionTable

type OrderStatus = 'IN_PROGRESS' | 'CANCELLED' | 'COMPLETED'

type OrderItem = {
  id: string
  name: string
  description: string
  price: string
}

type Order = {
  id: string
  orderStatus: OrderStatus
  items: OrderItem[]
}

export type Item = {
  pk: string
  sk: 'STATUS' | string // itemId or 'STATUS'
  orderStatus: OrderStatus
} & OrderItem

type GetOrderByIdInput = {
  storeId: string
  orderId: string
}

type GetOrderByIdResponse =
  | {
      storeId: string
      orderId: string
      orderStatus: OrderStatus
      items: OrderItem[]
    }
  | { message: string }

type GetOrdersInProgressInput = {
  storeId: string
}

type CreateOrderInput = {
  storeId: string
  orderId: string
  items: OrderItem[]
}

type GetOrdersInProgressResponse = {
  storeId: string
  orders: Order[]
}

type ProjectionClient = {
  getOrderById({
    storeId,
    orderId,
  }: GetOrderByIdInput): Promise<GetOrderByIdResponse>
  getOrdersInProgress({
    storeId,
  }: GetOrdersInProgressInput): Promise<GetOrdersInProgressResponse>
  createOrder({ storeId, orderId, items }: CreateOrderInput): Promise<void>
  updateOrderStatus({
    storeId,
    orderId,
    orderStatus,
  }: {
    storeId: string
    orderId: string
    orderStatus: OrderStatus
  }): Promise<void>
  deleteOrder({
    storeId,
    orderId,
  }: {
    storeId: string
    orderId: string
  }): Promise<void>
}

export const projectionDb: ProjectionClient = {
  getOrderById: async ({ storeId, orderId }) => {
    const params = {
      TableName,
      KeyConditionExpression: 'pk = :pk',
      ExpressionAttributeValues: {
        ':pk': `${storeId}#${orderId}`,
      },
    }
    const result = await client.query(params).promise()
    if (!result.Items) {
      return {
        message: 'Order not found',
      }
    }
    const item = result.Items.find((item) => item.sk === 'STATUS')
    if (!item) {
      return {
        message: 'Order not found',
      }
    }
    return {
      orderId,
      storeId,
      orderStatus: result.Items.find((item) => item.sk === 'STATUS')
        .orderStatus,
      items: result.Items.filter((item) => item.name).map((item) => ({
        id: item.itemId,
        name: item.name,
        description: item.description,
        price: item.price,
      })),
    }
  },
  getOrdersInProgress: async ({ storeId }) => {
    const params = {
      TableName,
      IndexName: 'statusPkIndex',
      KeyConditionExpression: 'orderStatus = :stat AND begins_with(pk, :pk)',
      ExpressionAttributeValues: {
        ':stat': 'IN_PROGRESS',
        ':pk': storeId,
      },
    }
    const result = await client.query(params).promise()

    if (!result.Items) {
      return {
        storeId,
        orders: [],
      }
    }

    const itemsWithoutStatus = result.Items.filter((item) => item.name)

    const orders: (Order & { sk: string })[] = []

    itemsWithoutStatus.map((item) => {
      if (!orders.find((order) => order.id === item.pk.split('#')[1])) {
        orders.push({
          id: item.pk.split('#')[1],
          sk: item.sk,
          orderStatus: item.orderStatus,
          items: [],
        })
      }
    })

    const remainingOrders = orders.filter((order) => order.sk === 'STATUS')

    remainingOrders.map((order) => {
      const items = itemsWithoutStatus.filter(
        (item) => item.pk.split('#')[1] === order.id,
      )
      order.items = items.map((item) => ({
        id: item.sk,
        name: item.name,
        description: item.description,
        price: item.price,
      }))
    })

    return {
      storeId: result.Items[0].pk.split('#')[0],
      orders,
    }
  },
  createOrder: async ({ storeId, orderId, items }) => {
    const RequestItems = {
      [TableName]: [
        ...items.map((item) => {
          const id = uuid()

          return {
            PutRequest: {
              Item: {
                pk: `${storeId}#${orderId}`,
                sk: `item_${id}`,
                name: item.name,
                description: item.description,
                price: item.price,
                orderStatus: 'IN_PROGRESS',
              },
            },
          }
        }),
        {
          PutRequest: {
            Item: {
              pk: `${storeId}#${orderId}`,
              sk: 'STATUS',
              orderStatus: 'IN_PROGRESS',
            },
          },
        },
      ],
    }
    await client
      .batchWrite({
        RequestItems,
      })
      .promise()
  },
  updateOrderStatus: async ({ storeId, orderId, orderStatus }) => {
    const params = {
      TableName,
      Key: {
        pk: `${storeId}#${orderId}`,
        sk: 'STATUS',
      },
      UpdateExpression: 'SET orderStatus = :stat',
      ExpressionAttributeValues: {
        ':stat': orderStatus,
      },
    }
    await client.update(params).promise()
  },
  deleteOrder: async ({ storeId, orderId }) => {
    const params = {
      TableName,
      Key: {
        pk: `${storeId}#${orderId}`,
        sk: 'STATUS',
      },
    }
    await client.delete(params).promise()
  },
}
