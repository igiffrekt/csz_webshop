import {defineType, defineField} from 'sanity'
import {ComponentIcon} from '@sanity/icons'

export const productVariant = defineType({
  name: 'productVariant',
  title: 'Termekvarians',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nev',
      type: 'string',
      validation: (rule) => rule.required().error('A varians neve kotelezo.'),
    }),
    defineField({
      name: 'sku',
      title: 'Cikkszam',
      type: 'string',
      validation: (rule) => rule.required().error('A cikkszam kotelezo.'),
    }),
    defineField({
      name: 'price',
      title: 'Ar (Ft)',
      type: 'number',
      validation: (rule) =>
        rule.required().min(0).error('Az ar kotelezo es nem lehet negativ.'),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Osszehasonlito ar (Ft)',
      type: 'number',
      description: 'Az eredeti ar, ha a varians akcios',
    }),
    defineField({
      name: 'stock',
      title: 'Keszlet',
      type: 'number',
      initialValue: 0,
      validation: (rule) =>
        rule.required().min(0).error('A keszlet kotelezo es nem lehet negativ.'),
    }),
    defineField({
      name: 'weight',
      title: 'Suly (kg)',
      type: 'number',
    }),
    defineField({
      name: 'attributeLabel',
      title: 'Tulajdonsag neve',
      type: 'string',
      description: 'Pl.: Meret, Szin, Kiszereles',
    }),
    defineField({
      name: 'attributeValue',
      title: 'Tulajdonsag erteke',
      type: 'string',
      description: 'Pl.: 6 kg, Piros, 12 db',
    }),
    defineField({
      name: 'image',
      title: 'Kep',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'product',
      title: 'Termek',
      type: 'reference',
      to: [{type: 'product'}],
      description: 'A szulo termek, amelyhez ez a varians tartozik',
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
