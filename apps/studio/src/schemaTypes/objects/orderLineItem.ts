import {defineType, defineField} from 'sanity'

export const orderLineItem = defineType({
  name: 'orderLineItem',
  title: 'Rendelés tétel',
  type: 'object',
  fields: [
    defineField({
      name: 'productId',
      title: 'Termék ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'variantId',
      title: 'Variáns ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Termék név',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'variantName',
      title: 'Variáns név',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'sku',
      title: 'Cikkszám',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'price',
      title: 'Egységár (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'quantity',
      title: 'Mennyiség',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'total',
      title: 'Összesen (Ft)',
      type: 'number',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      name: 'name',
      quantity: 'quantity',
      price: 'price',
    },
    prepare({name, quantity, price}) {
      return {
        title: name || 'Tétel',
        subtitle: `${quantity || 0} x ${price || 0} Ft`,
      }
    },
  },
})
