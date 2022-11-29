import { OrderEventEnum } from 'src/types/events'
import { domainEventSubscription } from 'src/utils/cf-utils'

export const orderDeletedEventHandlerConfig = domainEventSubscription(
  'order-deleted-event-handler',
  {
    type: [OrderEventEnum.Deleted],
  },
)

export const orderDeletedEventHandler = {
  handler: 'src/functions/events/order-deleted/handler.main',
  events: [orderDeletedEventHandlerConfig.lambdaEvent],
}
