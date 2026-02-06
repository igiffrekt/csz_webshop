import {defineType, defineField, defineArrayMember} from 'sanity'
import {HomeIcon} from '@sanity/icons'

export const homepage = defineType({
  name: 'homepage',
  title: 'Kezdolap',
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
          title: 'Cim',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcim',
          type: 'string',
        }),
        defineField({
          name: 'ctaText',
          title: 'CTA gomb szoveg',
          type: 'string',
        }),
        defineField({
          name: 'ctaLink',
          title: 'CTA gomb link',
          type: 'string',
        }),
        defineField({
          name: 'backgroundImage',
          title: 'Hatterkep',
          type: 'image',
          options: {
            hotspot: true,
          },
        }),
      ],
    }),
    defineField({
      name: 'categoriesSection',
      title: 'Kategoriak szekcio',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cim',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcim',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'featuredProducts',
      title: 'Kiemelt termekek',
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
      title: 'Akciok szekcio',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cim',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcim',
          type: 'string',
        }),
        defineField({
          name: 'products',
          title: 'Akcios termekek',
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
              title: 'Cim',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Leiras',
              type: 'text',
              rows: 2,
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
              name: 'link',
              title: 'Link',
              type: 'url',
            }),
            defineField({
              name: 'backgroundColor',
              title: 'Hatterszin',
              type: 'string',
              description: 'CSS szin ertek, pl.: #FF6600',
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
      title: 'GYIK szekcio',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Cim',
          type: 'string',
        }),
        defineField({
          name: 'subtitle',
          title: 'Alcim',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'trustBadges',
      title: 'Bizalmi jelvenyek',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Cim',
              type: 'string',
            }),
            defineField({
              name: 'description',
              title: 'Leiras',
              type: 'string',
            }),
            defineField({
              name: 'icon',
              title: 'Ikon',
              type: 'string',
              description: 'Ikon azonosito (pl.: shield, truck, headphones)',
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
        title: 'Kezdolap',
      }
    },
  },
})
