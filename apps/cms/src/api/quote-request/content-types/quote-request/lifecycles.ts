interface QuoteItem {
  productName: string;
  quantity: number;
  variantName?: string;
}

export default {
  /**
   * Send confirmation email after quote request created
   */
  async afterCreate(event) {
    const { result } = event;

    try {
      // Get quote request with user info for email
      const quoteRequest = await strapi.db.query('api::quote-request.quote-request').findOne({
        where: { id: result.id },
        populate: ['user'],
      });

      const contactEmail = quoteRequest.contactEmail;
      const requestNumber = quoteRequest.requestNumber;
      const items = quoteRequest.items || [];

      // Build items list for email
      const itemsList = items
        .map((item: QuoteItem) => {
          const variant = item.variantName ? ` (${item.variantName})` : '';
          return `- ${item.productName}${variant}: ${item.quantity} db`;
        })
        .join('\n');

      // Send confirmation email to customer
      await strapi.plugins['email'].services.email.send({
        to: contactEmail,
        subject: `Árajánlat kérés beérkezett - ${requestNumber}`,
        html: `
          <h2>Köszönjük árajánlat kérését!</h2>
          <p>Árajánlat kérésének azonosítója: <strong>${requestNumber}</strong></p>

          <h3>Kért termékek:</h3>
          <pre>${itemsList}</pre>

          ${quoteRequest.deliveryNotes ? `<h3>Szállítási megjegyzések:</h3><p>${quoteRequest.deliveryNotes}</p>` : ''}

          <p>Munkatársaink hamarosan felveszik Önnel a kapcsolatot az árajánlattal.</p>

          <p>Várható válaszidő: 1-2 munkanap</p>

          <hr>
          <p>
            Üdvözlettel,<br>
            CSZ Tűzvédelmi Kft.
          </p>
        `,
        text: `
Köszönjük árajánlat kérését!

Árajánlat kérésének azonosítója: ${requestNumber}

Kért termékek:
${itemsList}

${quoteRequest.deliveryNotes ? `Szállítási megjegyzések:\n${quoteRequest.deliveryNotes}\n` : ''}

Munkatársaink hamarosan felveszik Önnel a kapcsolatot az árajánlattal.

Várható válaszidő: 1-2 munkanap

Üdvözlettel,
CSZ Tűzvédelmi Kft.
        `,
      });

      strapi.log.info(`Quote request confirmation sent to ${contactEmail} for ${requestNumber}`);

      // Notify admin about new quote request (optional - can be enabled in production)
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await strapi.plugins['email'].services.email.send({
          to: adminEmail,
          subject: `Új árajánlat kérés - ${requestNumber}`,
          html: `
            <h2>Új árajánlat kérés érkezett</h2>
            <p>Azonosító: <strong>${requestNumber}</strong></p>
            <p>Email: ${contactEmail}</p>
            ${quoteRequest.companyName ? `<p>Cég: ${quoteRequest.companyName}</p>` : ''}
            ${quoteRequest.contactPhone ? `<p>Telefon: ${quoteRequest.contactPhone}</p>` : ''}

            <h3>Kért termékek (${items.length} tétel):</h3>
            <pre>${itemsList}</pre>

            <p><a href="${process.env.STRAPI_URL || 'http://localhost:1337'}/admin/content-manager/collection-types/api::quote-request.quote-request/${result.documentId}">Megtekintés a Strapi adminban</a></p>
          `,
        });
        strapi.log.info(`Admin notification sent for quote request ${requestNumber}`);
      }
    } catch (error) {
      strapi.log.error(`Failed to send quote request confirmation email: ${error.message}`);
    }
  },

  /**
   * Log status changes and send notification when quoted
   */
  async afterUpdate(event) {
    const { result } = event;

    // Log status change
    strapi.log.info(`Quote request ${result.requestNumber} status: ${result.status}`);

    // Check if status changed to 'quoted' and send notification
    if (result.status === 'quoted') {
      try {
        const quoteRequest = await strapi.db.query('api::quote-request.quote-request').findOne({
          where: { id: result.id },
          populate: ['user'],
        });

        const contactEmail = quoteRequest.contactEmail;
        const requestNumber = quoteRequest.requestNumber;
        const quotedAmount = quoteRequest.quotedAmount;
        const validUntil = quoteRequest.validUntil
          ? new Date(quoteRequest.validUntil).toLocaleDateString('hu-HU')
          : null;

        await strapi.plugins['email'].services.email.send({
          to: contactEmail,
          subject: `Árajánlata elkészült - ${requestNumber}`,
          html: `
            <h2>Árajánlata elkészült!</h2>
            <p>Árajánlat kérésének azonosítója: <strong>${requestNumber}</strong></p>

            ${quotedAmount ? `<p>Ajánlott ár: <strong>${quotedAmount.toLocaleString('hu-HU')} Ft</strong></p>` : ''}
            ${validUntil ? `<p>Az ajánlat érvényes: ${validUntil}-ig</p>` : ''}

            ${quoteRequest.adminResponse ? `<h3>Üzenet:</h3><p>${quoteRequest.adminResponse}</p>` : ''}

            <p>Kérjük, vegye fel velünk a kapcsolatot a rendelés véglegesítéséhez.</p>

            <hr>
            <p>
              Üdvözlettel,<br>
              CSZ Tűzvédelmi Kft.
            </p>
          `,
        });

        strapi.log.info(`Quote ready notification sent to ${contactEmail} for ${requestNumber}`);
      } catch (error) {
        strapi.log.error(`Failed to send quote ready notification: ${error.message}`);
      }
    }
  },
};
