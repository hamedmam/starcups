import { projectionDb } from '@clients/db/projection'
import { SQSHandler } from 'aws-lambda'

export const handleOrderUpdated: SQSHandler = async (event) => {
  const body = JSON.parse(event.Records[0].body)
  const orderId = body.data.M.orderId.S
  const storeId = body.data.M.storeId.S
  const orderStatus = body.data.M.status.S

  await projectionDb.updateOrderStatus({
    orderId,
    storeId,
    orderStatus,
  })
}

export const main = handleOrderUpdated
