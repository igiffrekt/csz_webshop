import {defineType, defineField, defineArrayMember} from 'sanity'
import {BasketIcon} from '@sanity/icons'

export const order = defineType({
  name: 'order',
  title: 'Rendelés',
  type: 'document',
  icon: BasketIcon,
  fields: [
    defineField({
      name: 'orderNumber',
      title: 'Rendelési szám',
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
          {title: 'Fizetésre vár', value: 'pending'},
          {title: 'Fizetve', value: 'paid'},
          {title: 'Feldolgozás alatt', value: 'processing'},
          {title: 'Kiszállítva', value: 'shipped'},
          {title: 'Kézbesítve', value: 'delivered'},
          {title: 'Törölve', value: 'cancelled'},
          {title: 'Visszatérített', value: 'refunded'},
        ],
        layout: 'dropdown',
      },
      initialValue: 'pending',
    }),
    defineField({
      name: 'customerEmail',
      title: 'Vásárló email',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'customerName',
      title: 'Vásárló neve',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'subtotal',
      title: 'Részösszeg (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'discount',
      title: 'Kedvezmény (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'shipping',
      title: 'Szállítási díj (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'vatAmount',
      title: 'ÁFA (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'total',
      title: 'Végösszeg (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'lineItems',
      title: 'Tételek',
      type: 'array',
      readOnly: true,
      of: [defineArrayMember({type: 'orderLineItem'})],
    }),
    defineField({
      name: 'shippingAddress',
      title: 'Szállítási cím',
      type: 'orderAddress',
      readOnly: true,
    }),
    defineField({
      name: 'billingAddress',
      title: 'Számlázási cím',
      type: 'orderAddress',
      readOnly: true,
    }),
    defineField({
      name: 'couponCode',
      title: 'Kupon kód',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Fizetési mód',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'paymentId',
      title: 'Fizetési azonosító',
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
      title: 'Fizetés dátuma',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'poReference',
      title: 'PO hivatkozás',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'notes',
      title: 'Admin megjegyzés',
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
        pending: 'Fizetésre vár',
        paid: 'Fizetve',
        processing: 'Feldolgozás alatt',
        shipped: 'Kiszállítva',
        delivered: 'Kézbesítve',
        cancelled: 'Törölve',
        refunded: 'Visszatérített',
      }
      const parts = [statusLabels[status] || status]
      if (total != null) parts.push(`${total} Ft`)
      if (customerName) parts.push(customerName)
      return {
        title: orderNumber || 'Rendelés',
        subtitle: parts.join(' · '),
      }
    },
  },
  orderings: [
    {
      title: 'Létrehozás (újabb elől)',
      name: 'createdDesc',
      by: [{field: '_createdAt', direction: 'desc'}],
    },
  ],
})
