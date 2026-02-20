import {defineType, defineField} from 'sanity'
import {ComponentIcon} from '@sanity/icons'

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Termékváriáns',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Név',
      type: 'string',
      validation: (rule) => rule.required().error('A variáns neve kötelező.'),
    }),
    defineField({
      name: 'sku',
      title: 'Cikkszám',
      type: 'string',
      validation: (rule) => rule.required().error('A cikkszám kötelező.'),
    }),
    defineField({
      name: 'price',
      title: 'Ár (Ft)',
      type: 'number',
      validation: (rule) =>
        rule.required().min(0).error('Az ár kötelező és nem lehet negatív.'),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Összehasonlító ár (Ft)',
      type: 'number',
      description: 'Az eredeti ár, ha a variáns akciós',
    }),
    defineField({
      name: 'stock',
      title: 'Készlet',
      type: 'number',
      initialValue: 99,
      validation: (rule) =>
        rule.required().min(0).error('A készlet kötelező és nem lehet negatív.'),
    }),
    defineField({
      name: 'weight',
      title: 'Súly (kg)',
      type: 'number',
    }),
    defineField({
      name: 'attributeLabel',
      title: 'Tulajdonság neve',
      type: 'string',
      description: 'Pl.: Méret, Szín, Kiszerelés',
    }),
    defineField({
      name: 'attributeValue',
      title: 'Tulajdonság értéke',
      type: 'string',
      description: 'Pl.: 6 kg, Piros, 12 db',
    }),
    defineField({
      name: 'image',
      title: 'Kép',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'product',
      title: 'Termék',
      type: 'reference',
      to: [{type: 'product'}],
      description: 'A szülő termék, amelyhez ez a variáns tartozik',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      sku: 'sku',
      media: 'image',
    },
    prepare({title, sku, media}) {
      return {
        title,
        subtitle: sku ? `SKU: ${sku}` : '',
        media,
      }
    },
  },
})
