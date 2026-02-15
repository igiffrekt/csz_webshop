import {defineType, defineField, defineArrayMember} from 'sanity'
import {PackageIcon} from '@sanity/icons'
import {hunSlugify} from '../utils'

export const product = defineType({
  name: 'product',
  title: 'Termék',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Név',
      type: 'string',
      validation: (rule) => rule.required().error('A termék neve kötelező.'),
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
      name: 'description',
      title: 'Leírás',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'shortDescription',
      title: 'Rövid leírás',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(300).warning('A rövid leírás ideális esetben 300 karakter alatt legyen.'),
    }),
    defineField({
      name: 'basePrice',
      title: 'Ár (Ft)',
      type: 'number',
      validation: (rule) =>
        rule.required().min(0).error('Az ár kötelező és nem lehet negatív.'),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Összehasonlító ár (Ft)',
      type: 'number',
      description: 'Az eredeti ár, ha a termék akciós',
    }),
    defineField({
      name: 'stock',
      title: 'Készlet',
      type: 'number',
      initialValue: 0,
      validation: (rule) =>
        rule.required().min(0).error('A készlet kötelező és nem lehet negatív.'),
    }),
    defineField({
      name: 'weight',
      title: 'Súly (kg)',
      type: 'number',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Kiemelt termék',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isOnSale',
      title: 'Akciós',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Képek',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'documents',
      title: 'Dokumentumok',
      type: 'array',
      description: 'PDF adatlapok, használati utasítások',
      of: [
        defineArrayMember({
          type: 'file',
        }),
      ],
    }),
    defineField({
      name: 'specifications',
      title: 'Műszaki adatok',
      type: 'array',
      of: [defineArrayMember({type: 'specification'})],
    }),
    defineField({
      name: 'certifications',
      title: 'Tanúsítványok',
      type: 'array',
      of: [defineArrayMember({type: 'certification'})],
    }),
    defineField({
      name: 'categories',
      title: 'Kategóriák',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}],
        }),
      ],
    }),
    defineField({
      name: 'variants',
      title: 'Variánsok',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'productVariant'}],
        }),
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'images.0',
      sku: 'sku',
    },
    prepare({title, media, sku}) {
      return {
        title,
        subtitle: sku ? `SKU: ${sku}` : '',
        media,
      }
    },
  },
})
