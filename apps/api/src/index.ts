import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import healthcheck from 'fastify-healthcheck';
import rawBody from 'fastify-raw-body';
import { couponRoutes } from './routes/cart/coupon.js';
import { webhookRoutes } from './routes/checkout/webhook.js';
import { calculateRoutes } from './routes/checkout/calculate.js';
import { createSessionRoutes } from './routes/checkout/create-session.js';
import { bankTransferRoutes } from './routes/checkout/bank-transfer.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
  },
});

// Register plugins
await fastify.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false, // Disable CSP for development
});

await fastify.register(healthcheck, {
  healthcheckUrl: '/health',
});

// Raw body plugin for webhook signature verification
await fastify.register(rawBody, {
  field: 'rawBody',
  global: false, // Only enable where needed
  encoding: 'utf8',
  runFirst: true,
});

// Cart routes
await fastify.register(couponRoutes);

// Webhook routes
await fastify.register(webhookRoutes, { prefix: '/webhook' });

// Checkout routes
await fastify.register(calculateRoutes, { prefix: '/checkout' });
await fastify.register(createSessionRoutes, { prefix: '/checkout' });
await fastify.register(bankTransferRoutes, { prefix: '/checkout' });

// Root route for basic info
fastify.get('/', async () => {
  return {
    name: 'CSZ Webshop API',
    version: '0.0.1',
    status: 'running',
  };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '4000', 10);
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
    console.log(`API running at http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
