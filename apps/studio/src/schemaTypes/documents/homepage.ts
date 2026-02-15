import {defineType, defineField, defineArrayMember} from 'sanity'
import {HomeIcon} from '@sanity/icons'

export const homepage = defineType({
  name: 'homepage',
  title: 'Kezdőlap',
  type: 'document',
  icon: HomeIcon,
  fields: [
    defineField({
      name: 'heroSection',
      title: 'Hero szekció',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cím',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcím',
          type: 'string',
        }),
        defineField({
          name: 'ctaText',
          title: 'CTA gomb szöveg',
          type: 'string',
        }),
        defineField({
          name: 'ctaLink',
          title: 'CTA gomb link',
          type: 'string',
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Háttérkép',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'categoriesSection',
      title: 'Kategóriák szekció',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cím',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcím',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Kiemelt termékek',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'product'}],
        }),
      ],
    }),
    defineField({
      name: 'dealsSection',
      title: 'Akciók szekció',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cím',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcím',
          type: 'string',
        }),
        defineField({
          name: 'products',
          title: 'Akciós termékek',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'reference',
              to: [{type: 'product'}],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'promoBanners',
      title: 'Promo bannerek',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Cím',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Leírás',
              type: 'text',
              rows: 2,
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
              name: 'link',
              title: 'Link',
              type: 'url',
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Háttérszín',
              type: 'string',
              description: 'CSS szín érték, pl.: #FF6600',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              media: 'image',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'faqSection',
      title: 'GYIK szekció',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cím',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcím',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'trustBadges',
      title: 'Bizalmi jelvények',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Cím',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Leírás',
              type: 'string',
            }),
            defineField({
              name: 'icon',
              title: 'Ikon',
              type: 'string',
              description: 'Ikon azonosító (pl.: shield, truck, headphones)',
            }),
          ],
          preview: {
            select: {
              title: 'title',
              subtitle: 'description',
            },
          },
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
    prepare() {
      return {
        title: 'Kezdőlap',
      }
    },
  },
})
