import { projectionDb } from '@clients/db/projection'
import { SQSHandler } from 'aws-lambda'

export const handleOrderDeleted: SQSHandler = async (event) => {
  const body = JSON.parse(event.Records[0].body)
  const orderId = body.data.M.orderId.S
  const storeId = body.data.M.storeId.S
  await projectionDb.deleteOrder({
    orderId,
    storeId,
  })
}

export const main = handleOrderDeleted
