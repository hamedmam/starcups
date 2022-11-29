export default {
  type: 'object',
  properties: {
    orderId: { type: 'string' },
    storeId: { type: 'string' },
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
} as const
