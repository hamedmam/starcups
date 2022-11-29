import { nextRevision } from '@clients/db/event-store'
import { eventStore } from '@clients/db/event-store/client'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'
import { OrderEventEnum } from 'src/types/events'

const deleteOrder: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  const { storeId, orderId } = event.pathParameters

  const events = await eventStore.getEvents(storeId)

  if (
    events.find(
      (event) =>
        event.type === OrderEventEnum.Deleted && event.data.orderId === orderId,
    )
  ) {
    return formatJSONResponse({
      message: 'Order is already deleted',
    })
  }

  await eventStore.dispatch({
    aggregateId: storeId,
    type: OrderEventEnum.Deleted,
    revision: nextRevision(events),
    data: {
      storeId,
      orderId,
    },
  })
  return formatJSONResponse({
    storeId,
    orderId,
  })
}

export const main = middyfy(deleteOrder)
