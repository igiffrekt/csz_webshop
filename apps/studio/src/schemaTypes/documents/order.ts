import {defineType, defineField, defineArrayMember} from 'sanity'
import {BasketIcon} from '@sanity/icons'

export const order = defineType({
  name: 'order',
  title: 'Rendeles',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Rendelesi szam',
      type: 'string',
      readOnly: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Statusz',
      type: 'string',
      options: {
        list: [
          {title: 'Fizetesre var', value: 'pending'},
          {title: 'Fizetve', value: 'paid'},
          {title: 'Feldolgozas alatt', value: 'processing'},
          {title: 'Kiszallitva', value: 'shipped'},
          {title: 'Kezbesitve', value: 'delivered'},
          {title: 'Torolve', value: 'cancelled'},
          {title: 'Visszateritett', value: 'refunded'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'customerEmail',
      title: 'Vasarlo email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customerName',
      title: 'Vasarlo neve',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'subtotal',
      title: 'Reszosszeg (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'discount',
      title: 'Kedvezmeny (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'shipping',
      title: 'Szallitasi dij (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'vatAmount',
      title: 'AFA (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'total',
      title: 'Vegosszeg (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'lineItems',
      title: 'Tetelek',
      type: 'array',
      readOnly: true,
      of: [defineArrayMember({type: 'orderLineItem'})],
    }),
    defineField({
      name: 'shippingAddress',
      title: 'Szallitasi cim',
      type: 'orderAddress',
      readOnly: true,
    }),
    defineField({
      name: 'billingAddress',
      title: 'Szamlazasi cim',
      type: 'orderAddress',
      readOnly: true,
    }),
    defineField({
      name: 'couponCode',
      title: 'Kupon kod',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Fizetesi mod',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'paymentId',
      title: 'Fizetesi azonosito',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'stripeSessionId',
      title: 'Stripe session ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'paidAt',
      title: 'Fizetes datuma',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'poReference',
      title: 'PO hivatkozas',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'notes',
      title: 'Admin megjegyzes',
      type: 'text',
    }),
  ],
  preview: {
    select: {
      orderNumber: 'orderNumber',
      status: 'status',
      total: 'total',
      customerName: 'customerName',
    },
    prepare({orderNumber, status, total, customerName}) {
      const statusLabels: Record<string, string> = {
        pending: 'Fizetesre var',
        paid: 'Fizetve',
        processing: 'Feldolgozas alatt',
        shipped: 'Kiszallitva',
        delivered: 'Kezbesitve',
        cancelled: 'Torolve',
        refunded: 'Visszateritett',
      }
      const parts = [statusLabels[status] || status]
      if (total != null) parts.push(`${total} Ft`)
      if (customerName) parts.push(customerName)
      return {
        title: orderNumber || 'Rendeles',
        subtitle: parts.join(' · '),
      }
    },
  },
  orderings: [
    {
      title: 'Letrehozas (ujabb elol)',
      name: 'createdDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
