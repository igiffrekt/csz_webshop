import {defineType, defineField} from 'sanity'

export const orderLineItem = defineType({
  name: 'orderLineItem',
  title: 'Rendeles tetel',
  type: 'object',
  fields: [
    defineField({
      name: 'productId',
      title: 'Termek ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'variantId',
      title: 'Arians ID',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'name',
      title: 'Termek nev',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'variantName',
      title: 'Arians nev',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'sku',
      title: 'Cikkszam',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'price',
      title: 'Egysegar (Ft)',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'quantity',
      title: 'Mennyiseg',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'total',
      title: 'Osszesen (Ft)',
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
        title: name || 'Tetel',
        subtitle: `${quantity || 0} x ${price || 0} Ft`,
      }
    },
  },
})
