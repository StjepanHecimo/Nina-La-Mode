export {};

declare global {
  interface Window {
    paypal?: {
      Buttons(options: {
        style?: Record<string, string>;
        createOrder: () => Promise<string>;
        onApprove: (data: { orderID: string }) => Promise<void>;
        onCancel?: () => void;
        onError?: (error: unknown) => void;
      }): { render(selector: string): Promise<void> };
    };
  }
}
