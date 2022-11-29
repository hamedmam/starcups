export default {
  type: 'object',
  properties: {
    idempotencyKey: { type: 'string' },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'string' },
        },
      },
    },
  },
  required: ['idempotencyKey', 'items'],
} as const
