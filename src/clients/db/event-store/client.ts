import { config } from '@utils/environments'
import { OrderEvent } from 'src/types/events'
import { eventstore as EventStore } from './'

export const eventStore = EventStore<OrderEvent>({
  tableName: config.eventStore.table,
})
