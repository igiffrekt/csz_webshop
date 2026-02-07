import {defineType, defineField, defineArrayMember} from 'sanity'
import {PackageIcon} from '@sanity/icons'

export const product = defineType({
  name: 'product',
  title: 'Termek',
  type: 'document',
  icon: PackageIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nev',
      type: 'string',
      validation: (rule) => rule.required().error('A termek neve kotelezo.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 200,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .slice(0, 200),
      },
      validation: (rule) => rule.required().error('Az URL slug kotelezo.'),
    }),
    defineField({
      name: 'sku',
      title: 'Cikkszam',
      type: 'string',
      validation: (rule) => rule.required().error('A cikkszam kotelezo.'),
    }),
    defineField({
      name: 'description',
      title: 'Leiras',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
    }),
    defineField({
      name: 'shortDescription',
      title: 'Rovid leiras',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(300).warning('A rovid leiras idealis esetben 300 karakter alatt legyen.'),
    }),
    defineField({
      name: 'basePrice',
      title: 'Ar (Ft)',
      type: 'number',
      validation: (rule) =>
        rule.required().min(0).error('Az ar kotelezo es nem lehet negativ.'),
    }),
    defineField({
      name: 'compareAtPrice',
      title: 'Osszehasonlito ar (Ft)',
      type: 'number',
      description: 'Az eredeti ar, ha a termek akcios',
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
      name: 'isFeatured',
      title: 'Kiemelt termek',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'isOnSale',
      title: 'Akcios',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'images',
      title: 'Kepek',
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
      description: 'PDF adatlapok, hasznalati utasitasok',
      of: [
        defineArrayMember({
          type: 'file',
        }),
      ],
    }),
    defineField({
      name: 'cloudinaryImageUrl',
      title: 'Cloudinary kep URL',
      type: 'url',
      description: 'Kulso kep URL Cloudinary CDN-rol',
    }),
    defineField({
      name: 'specifications',
      title: 'Muszaki adatok',
      type: 'array',
      of: [defineArrayMember({type: 'specification'})],
    }),
    defineField({
      name: 'certifications',
      title: 'Tanusitvanyok',
      type: 'array',
      of: [defineArrayMember({type: 'certification'})],
    }),
    defineField({
      name: 'categories',
      title: 'Kategoriak',
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
      title: 'Variansok',
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
