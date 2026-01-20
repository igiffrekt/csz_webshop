import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import healthcheck from 'fastify-healthcheck';
import { couponRoutes } from './routes/cart/coupon.js';

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

// Cart routes
await fastify.register(couponRoutes);

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
