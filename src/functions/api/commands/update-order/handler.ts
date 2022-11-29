import { nextRevision } from '@clients/db/event-store'
import { eventStore } from '@clients/db/event-store/client'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'
import { OrderEventEnum } from 'src/types/events'

import schema from './schema'

const updateOrder: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event,
) => {
  const { storeId, orderId } = event.pathParameters

  const events = await eventStore.getEvents(storeId)

  await eventStore.dispatch({
    aggregateId: storeId,
    type: OrderEventEnum.Updated,
    revision: nextRevision(events),
    data: {
      storeId,
      orderId,
      status: event.body.status,
    },
  })
  return formatJSONResponse({
    storeId,
    orderId,
  })
}

export const main = middyfy(updateOrder)
