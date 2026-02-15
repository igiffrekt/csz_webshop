import {defineType, defineField, defineArrayMember} from 'sanity'

export const footer = defineType({
  name: 'footer',
  title: 'Lábléc',
  type: 'document',
  fields: [
    defineField({
      name: 'companyDescription',
      title: 'Cégbemutató szöveg',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'socialLinks',
      title: 'Közösségi linkek',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  {title: 'Facebook', value: 'facebook'},
                  {title: 'YouTube', value: 'youtube'},
                  {title: 'TikTok', value: 'tiktok'},
                  {title: 'LinkedIn', value: 'linkedin'},
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'url',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'linkColumns',
      title: 'Link oszlopok',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Oszlop cím',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Linkek',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Megjelenő szöveg',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'Hivatkozás',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      title: 'label',
                      subtitle: 'href',
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              title: 'title',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'bottomBarLinks',
      title: 'Alsó sáv linkek',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Megjelenő szöveg',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Hivatkozás',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              subtitle: 'href',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'copyrightText',
      title: 'Szerzői jogi szöveg',
      type: 'string',
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Lábléc',
      }
    },
  },
})
