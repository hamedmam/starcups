export interface EventStoreClientParams {
  tableName: string
  tracing?: boolean
}

type OptionalFields = 'eventId' | 'timestamp' | 'schemaVersion'

type DistributiveOmit<T, K extends keyof T> = T extends infer O
  ? Omit<O, K>
  : never

export type DispatchInputEvent<T extends DomainEvent> = DistributiveOmit<
  T,
  OptionalFields
> &
  Partial<Pick<T, OptionalFields>>

export type DispatchInput<T extends DomainEvent> =
  | DispatchInputEvent<T>
  | DispatchInputEvent<T>[]

export type DispatchOutput<
  T extends DomainEvent,
  U extends DispatchInput<T>,
> = U extends DispatchInputEvent<T>[] ? T[] : T

export interface EventStoreClient<T extends DomainEvent> {
  /**
   * Writes event(s) to the event store.
   * Accepts either a single or array of events to dispatch
   *
   * Enforces concurrency with optimistic locking using revision number.
   *
   * If you do not require concurrency protection then you can use
   * `dispatchNext` to write the event with next revision
   *
   * @param input The event(s) to dispatch to the event store
   */
  dispatch<U extends DispatchInput<T>>(input: U): Promise<DispatchOutput<T, U>>
  /**
   * Returns all of the events in the event stream for a given aggregate
   * @param aggregateId The id of the aggregate to get events for
   */
  getEvents(aggregateId: string): Promise<T[]>
}

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
