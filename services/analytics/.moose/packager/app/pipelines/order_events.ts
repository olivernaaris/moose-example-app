import { PipelineFunction } from "@514labs/moose-lib";

interface OrderEvent {
  eventId: string;
  orderId: string;
  userId: string;
  action: string;
  totalAmount: number;
  itemCount: number;
  timestamp: Date;
}

const pipeline: PipelineFunction<OrderEvent, OrderEvent> = (event) => {
  return event;
};

export default pipeline;
