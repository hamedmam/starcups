import { OrderEventEnum } from 'src/types/events'
import { domainEventSubscription } from 'src/utils/cf-utils'

export const orderCreatedEventHandlerConfig = domainEventSubscription(
  'order-created-event-handler',
  {
    type: [OrderEventEnum.Created],
  },
)

export const orderCreatedEventHandler = {
  handler: 'src/functions/events/order-created/handler.main',
  events: [orderCreatedEventHandlerConfig.lambdaEvent],
}
