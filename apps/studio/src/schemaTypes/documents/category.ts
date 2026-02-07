import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'

export const category = defineType({
  name: 'category',
  title: 'Kategoria',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Nev',
      type: 'string',
      validation: (rule) => rule.required().error('A kategoria neve kotelezo.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 200,
      },
      validation: (rule) => rule.required().error('Az URL slug kotelezo.'),
    }),
    defineField({
      name: 'description',
      title: 'Leiras',
      type: 'text',
      rows: 4,
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
      name: 'parent',
      title: 'Szulo kategoria',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Valasszon szulo kategoriat a hierarchia kiepitesehez',
    }),
    defineField({
      name: 'productCount',
      title: 'Termekek szama',
      type: 'number',
      readOnly: true,
      description: 'Automatikusan szamolt mezo',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      media: 'image',
      parentName: 'parent.name',
    },
    prepare({title, media, parentName}) {
      return {
        title,
        subtitle: parentName ? `Szulo: ${parentName}` : 'Fo kategoria',
        media,
      }
    },
  },
})
