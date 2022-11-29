export default {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['IN_PROGRESS', 'CANCELLED', 'COMPLETED'] },
  },
  required: ['status'],
} as const
