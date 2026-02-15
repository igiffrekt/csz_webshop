import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'
import {hunSlugify} from '../utils'

export const category = defineType({
  name: 'category',
  title: 'Kategória',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Név',
      type: 'string',
      validation: (rule) => rule.required().error('A kategória neve kötelező.'),
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
      name: 'description',
      title: 'Leírás',
      type: 'text',
      rows: 4,
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
      name: 'parent',
      title: 'Szülő kategória',
      type: 'reference',
      to: [{type: 'category'}],
      description: 'Válasszon szülő kategóriát a hierarchia kiépítéséhez',
    }),
    defineField({
      name: 'productCount',
      title: 'Termékek száma',
      type: 'number',
      readOnly: true,
      description: 'Automatikusan számolt mező',
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
        subtitle: parentName ? `Szülő: ${parentName}` : 'Fő kategória',
        media,
      }
    },
  },
})
