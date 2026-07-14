export const PAYMENT_METHODS = ["CASH", "TRANSFER", "APP"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  APP: "Pago por app",
};
