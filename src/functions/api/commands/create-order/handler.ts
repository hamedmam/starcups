import { nextRevision } from '@clients/db/event-store'
import { eventStore } from '@clients/db/event-store/client'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'
import { OrderEventEnum } from 'src/types/events'

import schema from './schema'

const createOrder: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event,
) => {
  const { items } = event.body

  const storeId = `store_${event.body.storeId}`
  const orderId = `order_${event.body.orderId}`

  const events = await eventStore.getEvents(storeId)

  if (events.find((event) => event.idempotencyKey === orderId)) {
    return formatJSONResponse({
      message: 'Order already exists',
    })
  }

  await eventStore.dispatch({
    aggregateId: storeId,
    idempotencyKey: orderId,
    type: OrderEventEnum.Created,
    revision: nextRevision(events),
    data: {
      storeId,
      orderId,
      items,
    },
  })
  return formatJSONResponse({
    storeId,
    orderId,
  })
}

export const main = middyfy(createOrder)
