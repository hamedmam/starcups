import { projectionDb } from '@clients/db/projection'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

const getOrdersInProgress: ValidatedEventAPIGatewayProxyEvent<any> = async (
  event,
) => {
  const orders = await projectionDb.getOrdersInProgress({
    storeId: event.pathParameters.storeId,
  })

  return {
    statusCode: 200,
    body: JSON.stringify(orders),
  }
}

export const main = middyfy(getOrdersInProgress)
