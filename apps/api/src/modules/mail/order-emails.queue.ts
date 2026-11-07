export const ORDER_EMAILS_QUEUE = "order-emails";
export type OrderEmailType = "customer-slip" | "admin-notification";
export type OrderEmailJob = { orderId: string };
