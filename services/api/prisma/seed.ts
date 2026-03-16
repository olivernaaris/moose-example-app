/**
 * API database seed script
 *
 * Run with: pnpm db:seed
 *
 * Seeds the database with sample products, a test user, and orders.
 * Idempotent — safe to run multiple times (uses upsert).
 */

import { config } from "../src/config.js";
import { getChildLogger } from "../src/lib/logger.js";
import { getPrisma } from "../src/lib/prisma.js";

// ── Deterministic IDs (hardcoded so seed is idempotent) ─────────────

const PRODUCT_IDS = {
  keyboard: "01961a00-0000-7000-8000-000000000001",
  mouse: "01961a00-0000-7000-8000-000000000002",
  hub: "01961a00-0000-7000-8000-000000000003",
  stand: "01961a00-0000-7000-8000-000000000004",
  lamp: "01961a00-0000-7000-8000-000000000005",
} as const;

const USER_ID = "01961a00-0000-7000-8000-000000000010";

const ORDER_IDS = {
  order1: "01961a00-0000-7000-8000-000000000020",
  order2: "01961a00-0000-7000-8000-000000000021",
} as const;

const ORDER_ITEM_IDS = {
  item1: "01961a00-0000-7000-8000-000000000030",
  item2: "01961a00-0000-7000-8000-000000000031",
  item3: "01961a00-0000-7000-8000-000000000032",
} as const;

// ── Seed data ───────────────────────────────────────────────────────

const products = [
  {
    id: PRODUCT_IDS.keyboard,
    name: "Mechanical Keyboard",
    description: "Cherry MX Brown switches, full-size layout with RGB backlighting",
    price: "129.99",
    sku: "KB-001",
    stock: 50,
  },
  {
    id: PRODUCT_IDS.mouse,
    name: "Wireless Mouse",
    description: "Ergonomic design, 16000 DPI sensor, USB-C charging",
    price: "49.99",
    sku: "MS-001",
    stock: 120,
  },
  {
    id: PRODUCT_IDS.hub,
    name: "USB-C Hub",
    description: "7-in-1 hub with HDMI, USB-A, SD card reader, and 100W passthrough",
    price: "79.99",
    sku: "HB-001",
    stock: 75,
  },
  {
    id: PRODUCT_IDS.stand,
    name: "Monitor Stand",
    description: "Adjustable aluminum stand with cable management",
    price: "59.99",
    sku: "ST-001",
    stock: 30,
  },
  {
    id: PRODUCT_IDS.lamp,
    name: "Desk Lamp",
    description: "LED desk lamp with 5 brightness levels and wireless charging base",
    price: "39.99",
    sku: "LP-001",
    stock: 90,
  },
];

async function main() {
  const log = getChildLogger({ script: "db:seed" });
  log.info("Starting database seed");

  const prisma = getPrisma(config.DATABASE_URL);

  // ── Products ────────────────────────────────────────────────────
  log.info({ count: products.length }, "Seeding products");
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: { name: product.name, description: product.description, price: product.price, sku: product.sku, stock: product.stock },
      create: product,
    });
  }

  // ── Test user ───────────────────────────────────────────────────
  log.info("Seeding test user");
  await prisma.user.upsert({
    where: { id: USER_ID },
    update: { name: "Test User", email: "test@example.com" },
    create: {
      id: USER_ID,
      name: "Test User",
      email: "test@example.com",
      emailVerified: true,
    },
  });

  // ── Orders ──────────────────────────────────────────────────────
  log.info("Seeding orders");

  // Order 1: Keyboard + Mouse = $179.98
  await prisma.order.upsert({
    where: { id: ORDER_IDS.order1 },
    update: { status: "PROCESSING", total: "179.98" },
    create: {
      id: ORDER_IDS.order1,
      userId: USER_ID,
      status: "PROCESSING",
      total: "179.98",
    },
  });

  await prisma.orderItem.upsert({
    where: { id: ORDER_ITEM_IDS.item1 },
    update: { quantity: 1, price: "129.99" },
    create: {
      id: ORDER_ITEM_IDS.item1,
      orderId: ORDER_IDS.order1,
      productId: PRODUCT_IDS.keyboard,
      quantity: 1,
      price: "129.99",
    },
  });

  await prisma.orderItem.upsert({
    where: { id: ORDER_ITEM_IDS.item2 },
    update: { quantity: 1, price: "49.99" },
    create: {
      id: ORDER_ITEM_IDS.item2,
      orderId: ORDER_IDS.order1,
      productId: PRODUCT_IDS.mouse,
      quantity: 1,
      price: "49.99",
    },
  });

  // Order 2: Desk Lamp x2 = $79.98
  await prisma.order.upsert({
    where: { id: ORDER_IDS.order2 },
    update: { status: "PENDING", total: "79.98" },
    create: {
      id: ORDER_IDS.order2,
      userId: USER_ID,
      status: "PENDING",
      total: "79.98",
    },
  });

  await prisma.orderItem.upsert({
    where: { id: ORDER_ITEM_IDS.item3 },
    update: { quantity: 2, price: "39.99" },
    create: {
      id: ORDER_ITEM_IDS.item3,
      orderId: ORDER_IDS.order2,
      productId: PRODUCT_IDS.lamp,
      quantity: 2,
      price: "39.99",
    },
  });

  log.info("Database seed completed");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed script failed:", e);
  process.exit(1);
});
