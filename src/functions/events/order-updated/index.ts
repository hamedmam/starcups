import { OrderEventEnum } from 'src/types/events'
import { domainEventSubscription } from 'src/utils/cf-utils'

export const orderUpdatedEventHandlerConfig = domainEventSubscription(
  'order-updated-event-handler',
  {
    type: [OrderEventEnum.Updated],
  },
)

export const orderUpdatedEventHandler = {
  handler: 'src/functions/events/order-updated/handler.main',
  events: [orderUpdatedEventHandlerConfig.lambdaEvent],
}
