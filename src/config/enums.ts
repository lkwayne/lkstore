/**
 * Enums métier BENDO — source unique de vérité côté application.
 * Doivent rester synchronisés avec les types PostgreSQL définis dans
 * supabase/migrations/0001_init.sql.
 */

export const USER_ROLES = [
  "CUSTOMER",
  "ADMIN",
  "MANAGER",
  "LOGISTICS",
  "CUSTOMER_SUPPORT",
  "MARKETING",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const STAFF_ROLES = USER_ROLES.filter((r) => r !== "CUSTOMER");

export const FULFILLMENT_TYPES = ["BENDO_STOCK", "DROPSHIPPING", "MIXED"] as const;
export type FulfillmentType = (typeof FULFILLMENT_TYPES)[number];

export const SUPPLIER_STATUSES = ["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "READY_FOR_PICKUP",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "RETURNED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_METHODS = ["CASH_ON_DELIVERY", "PAY_IN_STORE"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "CANCELLED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const RECEPTION_METHODS = ["DELIVERY", "STORE_PICKUP"] as const;
export type ReceptionMethod = (typeof RECEPTION_METHODS)[number];

export const PRODUCT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const FULFILLMENT_ORDER_STATUSES = [
  "PENDING_SUPPLIER",
  "SENT_TO_SUPPLIER",
  "CONFIRMED_BY_SUPPLIER",
  "SHIPPED",
  "TRACKING_RECEIVED",
  "DELIVERED",
  "FAILED",
] as const;
export type FulfillmentOrderStatus = (typeof FULFILLMENT_ORDER_STATUSES)[number];
