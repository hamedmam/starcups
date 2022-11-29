import { projectionDb } from '@clients/db/projection'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

const getOrderById: ValidatedEventAPIGatewayProxyEvent<any> = async (event) => {
  const order = await projectionDb.getOrderById({
    orderId: event.pathParameters.orderId,
    storeId: event.pathParameters.storeId,
  })

  return {
    statusCode: 200,
    body: JSON.stringify(order),
  }
}

export const main = middyfy(getOrderById)
