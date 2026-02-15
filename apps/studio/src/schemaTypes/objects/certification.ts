import {defineType, defineField} from 'sanity'

export const certification = defineType({
  name: 'certification',
  title: 'Tanúsítvány',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Név',
      type: 'string',
      validation: (rule) => rule.required().error('A tanúsítvány neve kötelező.'),
    }),
    defineField({
      name: 'standard',
      title: 'Szabvány',
      type: 'string',
      description: 'Pl.: MSZ EN 3, OTSZ 54/2014',
    }),
    defineField({
      name: 'issuedDate',
      title: 'Kiadás dátuma',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'expiryDate',
      title: 'Lejárat dátuma',
      type: 'date',
      options: {
        dateFormat: 'YYYY-MM-DD',
      },
    }),
    defineField({
      name: 'certificate',
      title: 'Tanúsítvány fájl',
      type: 'file',
      description: 'PDF vagy kép fájl',
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
