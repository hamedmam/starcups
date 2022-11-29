export type DomainEvent<
  T extends string = string,
  D = unknown,
  S extends number = 1,
> = {
  /**
   * Unique identifier for event, defaults to a unique prefixed ID
   * @example event_01EQRN6YZRXZGSBKM3XH1WRMGZ
   */
  eventId: string
  /**
   * ISO 8601 timestamp for when the event is published, defaults to now
   * @example 2020-12-19T07:15:24.950Z
   */
  timestamp: string
  /**
   * Schema version of the domain event, increment on changes
   *  Defaults to 1
   */
  schemaVersion: S
  /**
   * ID for the aggregate root of the event
   */
  aggregateId: string
  /**
   * The type of event being published
   * @example application.approved
   */
  type: T
  /**
   * Revision number for given aggregate
   */
  revision: number
  /**
   * Data object with detail fields
   */
  data: D
  /**
   * Optional idempotency key
   */
  idempotencyKey?: string
}

export interface CallContext {
  client?: string
  clientVersion?: string
}

export type DomainEventWithContext<
  Type extends string = string,
  Data = unknown,
  Version extends number = 1,
> = DomainEvent<Type, Data, Version> & {
  context?: CallContext
}

type OrderCreatedEventData = {
  orderId: string
}

type OrderUpdatedEventData = {
  orderId: string
}

type OrderDeletedEventData = {
  orderId: string
}

export type OrderCreatedEvent = DomainEventWithContext<
  OrderEventEnum.Created,
  OrderCreatedEventData
>
export type OrderUpdatedEvent = DomainEventWithContext<
  OrderEventEnum.Updated,
  OrderUpdatedEventData
>
export type OrderDeletedEvent = DomainEventWithContext<
  OrderEventEnum.Deleted,
  OrderDeletedEventData
>

export enum OrderEventEnum {
  Created = 'order.created',
  Updated = 'order.updated',
  Deleted = 'order.deleted',
}

export type OrderEvent =
  | OrderCreatedEvent
  | OrderUpdatedEvent
  | OrderDeletedEvent
