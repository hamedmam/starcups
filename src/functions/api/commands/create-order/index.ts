import schema from './schema'
import { handlerPath } from '@libs/handler-resolver'
import { AWS } from '@serverless/typescript'

const iac: AWS['functions'][string] = {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'post',
        path: 'orders',
        request: {
          schemas: {
            'application/json': schema,
          },
        },
      },
    },
  ],
}

export default iac
