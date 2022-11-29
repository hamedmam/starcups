import { v4 as uuid } from 'uuid'
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
  // temporary use of idempotency key to prevent duplicate orders
  // ideally this would be handled from the request context
  const { items, idempotencyKey } = event.body
  const { storeId } = event.pathParameters
  const orderId = `order_${uuid()}`

  const events = await eventStore.getEvents(storeId)

  if (events.find((event) => event.idempotencyKey === idempotencyKey)) {
    return formatJSONResponse({
      message: 'Order already exists',
    })
  }

  await eventStore.dispatch({
    aggregateId: storeId,
    idempotencyKey,
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
