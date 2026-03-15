import { PipelineFunction } from "@514labs/moose-lib";

interface ProductView {
  viewId: string;
  productId: string;
  userId: string;
  timestamp: Date;
}

const pipeline: PipelineFunction<ProductView, ProductView> = (event) => {
  return event;
};

export default pipeline;
