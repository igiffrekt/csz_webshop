import {defineType, defineField} from 'sanity'

export const certification = defineType({
  name: 'certification',
  title: 'Tanusitvany',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Nev',
      type: 'string',
      validation: (rule) => rule.required().error('A tanusitvany neve kotelezo.'),
    }),
    defineField({
      name: 'standard',
      title: 'Szabvany',
      type: 'string',
      description: 'Pl.: MSZ EN 3, OTSZ 54/2014',
    }),
    defineField({
      name: 'issuedDate',
      title: 'Kiadas datuma',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'expiryDate',
      title: 'Lejarat datuma',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'certificate',
      title: 'Tanusitvany fajl',
      type: 'file',
      description: 'PDF vagy kep fajl',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      standard: 'standard',
    },
    prepare({name, standard}) {
      return {
        title: name,
        subtitle: standard || '',
      }
    },
  },
})
