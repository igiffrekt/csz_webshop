import {defineType, defineField} from 'sanity'
import {ComponentIcon} from '@sanity/icons'
import {hunSlugify} from '../utils'

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
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 200,
        slugify: hunSlugify,
      },
      validation: (rule) => rule.required().error('Az URL slug kötelező.'),
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
      name: 'attributes',
      title: 'Tulajdonságok',
      type: 'array',
      description: 'Többdimenziós variáns tulajdonságok (pl. Méret + Szín)',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Tulajdonság neve',
              type: 'string',
              description: 'Pl.: Méret, Szín, Kiszerelés',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'value',
              title: 'Tulajdonság értéke',
              type: 'string',
              description: 'Pl.: 6 kg, Piros, 12 db',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              label: 'label',
              value: 'value',
            },
            prepare({label, value}) {
              return {
                title: `${label}: ${value}`,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'attributeLabel',
      title: 'Tulajdonság neve (régi)',
      type: 'string',
      hidden: true,
    }),
    defineField({
      name: 'attributeValue',
      title: 'Tulajdonság értéke (régi)',
      type: 'string',
      hidden: true,
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
      attributes: 'attributes',
    },
    prepare({title, sku, media, attributes}) {
      const attrText = attributes?.length
        ? attributes.map((a: {label: string; value: string}) => `${a.label}: ${a.value}`).join(', ')
        : ''
      const subtitle = [attrText, sku ? `SKU: ${sku}` : ''].filter(Boolean).join(' | ')
      return {
        title,
        subtitle,
        media,
      }
    },
  },
})
