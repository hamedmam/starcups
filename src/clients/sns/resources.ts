import { INTERNAL_STAGE } from '@utils/index'

const eventStoreTopic = {
  Type: 'AWS::SNS::Topic',
  Properties: {
    DisplayName: 'Orders Events',
    TopicName: `orders-event-topic-${INTERNAL_STAGE}`,
  },
}

export default eventStoreTopic
