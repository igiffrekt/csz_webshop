import {defineType, defineField} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'SEO cím',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Az SEO cím ideális esetben 70 karakter alatt legyen.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO leírás',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Az SEO leírás ideális esetben 160 karakter alatt legyen.'),
    }),
    defineField({
      name: 'metaImage',
      title: 'OG kép',
      type: 'image',
      description: 'Közösségi média megosztás kép (ajánlott: 1200x630px)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'keywords',
      title: 'Kulcsszavak',
      type: 'string',
      description: 'Vesszővel elválasztott kulcsszavak',
    }),
  ],
})
