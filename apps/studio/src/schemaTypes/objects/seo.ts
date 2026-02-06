import {defineType, defineField} from 'sanity'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'SEO cim',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Az SEO cim idealis esetben 70 karakter alatt legyen.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'SEO leiras',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Az SEO leiras idealis esetben 160 karakter alatt legyen.'),
    }),
    defineField({
      name: 'metaImage',
      title: 'OG kep',
      type: 'image',
      description: 'Kozossegi media megosztas kep (ajanlott: 1200x630px)',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'keywords',
      title: 'Kulcsszavak',
      type: 'string',
      description: 'Vesszoval elvalasztott kulcsszavak',
    }),
  ],
})
