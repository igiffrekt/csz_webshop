import type { Core } from '@strapi/strapi';

interface OrderData {
  id: number;
  documentId: string;
  orderNumber: string;
  status: string;
  shippingAddress?: {
    recipientName?: string;
    street?: string;
    postalCode?: string;
    city?: string;
  };
  user?: {
    id: number;
    email: string;
    firstName?: string;
  };
}

export default {
  async afterUpdate(event: { params: { data: Partial<OrderData>; where: { id: number } }; result: OrderData }) {
    const { result } = event;

    // Check if status changed to shipped
    if (result.status === 'shipped') {
      try {
        // Get the order with user relation populated
        const order = await strapi.db.query('api::order.order').findOne({
          where: { id: result.id },
          populate: ['user'],
        }) as OrderData | null;

        if (!order?.user?.email) {
          strapi.log.warn(`Order ${order?.orderNumber}: No user email for shipping notification`);
          return;
        }

        // Send shipping notification email
        await strapi.plugins['email'].services.email.send({
          to: order.user.email,
          subject: `Rendelése úton van! - ${order.orderNumber}`,
          html: `
            <h1>Kedves ${order.user.firstName || 'Vásárló'}!</h1>
            <p>Örömmel értesítjük, hogy a <strong>${order.orderNumber}</strong> számú rendelése feladásra került.</p>
            <p>A csomag hamarosan megérkezik a megadott szállítási címre.</p>
            <h2>Szállítási cím:</h2>
            <p>
              ${order.shippingAddress?.recipientName || ''}<br>
              ${order.shippingAddress?.street || ''}<br>
              ${order.shippingAddress?.postalCode || ''} ${order.shippingAddress?.city || ''}
            </p>
            <p>Köszönjük, hogy nálunk vásárolt!</p>
            <p>Üdvözlettel,<br>CSZ Tűzvédelmi Webshop</p>
          `,
        });

        strapi.log.info(`Shipping notification sent for order ${order.orderNumber} to ${order.user.email}`);
      } catch (error) {
        strapi.log.error(`Failed to send shipping notification: ${error}`);
      }
    }

    // Log all status changes for audit
    if (result.status && result.orderNumber) {
      strapi.log.info(`Order ${result.orderNumber} status changed to: ${result.status}`);
    }
  },
};
