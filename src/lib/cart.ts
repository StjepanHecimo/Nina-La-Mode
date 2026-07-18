export type CartItem = {
  productId: string;
  name: string;
  image: string;
  size: string;
  colour: string;
  quantity: number;
  priceCents: number;
};

export const cartItemKey = (item: Pick<CartItem, "productId" | "size" | "colour">) =>
  `${item.productId}:${item.size}:${item.colour}`;

