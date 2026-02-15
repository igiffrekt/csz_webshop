import {defineType, defineField, defineArrayMember} from 'sanity'
import {ComposeIcon} from '@sanity/icons'
import {hunSlugify} from '../utils'

export const blogPost = defineType({
  name: 'blogPost',
  title: 'Blog bejegyzés',
  type: 'document',
  icon: ComposeIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Cím',
      type: 'string',
      validation: (rule) => rule.required().error('A cím megadása kötelező.'),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200,
        slugify: hunSlugify,
      },
      validation: (rule) => rule.required().error('Az URL slug kötelező.'),
    }),
    defineField({
      name: 'excerpt',
      title: 'Rövid leírás',
      type: 'text',
      rows: 3,
      description: 'Rövid összefoglaló a blog kártyákhoz',
      validation: (rule) => rule.max(300).warning('Az összefoglaló ideális esetben 300 karakter alatt legyen.'),
    }),
    defineField({
      name: 'coverImage',
      title: 'Borítókép',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'body',
      title: 'Tartalom',
      type: 'array',
      of: [defineArrayMember({type: 'block'}), defineArrayMember({type: 'image', options: {hotspot: true}})],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Megjelenés dátuma',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'author',
      title: 'Szerző',
      type: 'string',
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
  ],
  orderings: [
    {
      title: 'Megjelenés szerint (újabb elől)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author',
      media: 'coverImage',
    },
    prepare({title, author, media}) {
      return {
        title,
        subtitle: author ? `Szerző: ${author}` : '',
        media,
      }
    },
  },
})
