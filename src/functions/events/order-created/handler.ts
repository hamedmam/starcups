import { projectionDb } from '@clients/db/projection'
import { SQSHandler } from 'aws-lambda'

const handleOrderCreated: SQSHandler = async (event) => {
  const body = JSON.parse(event.Records[0].body)
  const orderId = body.data.M.orderId.S
  const storeId = body.data.M.storeId.S

  const items = body.data.M.items.L.map((item) => ({
    name: item.M.name.S,
    description: item.M.description.S,
    price: item.M.price.S,
  }))

  await projectionDb.createOrder({
    orderId,
    storeId,
    items,
  })
}

export const main = handleOrderCreated
