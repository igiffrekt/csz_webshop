import {defineType, defineField} from 'sanity'

export const orderAddress = defineType({
  name: 'orderAddress',
  title: 'Cim',
  type: 'object',
  fields: [
    defineField({
      name: 'recipientName',
      title: 'Cimzett neve',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'street',
      title: 'Utca, hazszam',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'city',
      title: 'Varos',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'postalCode',
      title: 'Iranyitoszam',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'country',
      title: 'Orszag',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'phone',
      title: 'Telefon',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'companyName',
      title: 'Cegnev',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'vatNumber',
      title: 'Adoszam',
      type: 'string',
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      recipientName: 'recipientName',
      city: 'city',
    },
    prepare({recipientName, city}) {
      return {
        title: recipientName || 'Cim',
        subtitle: city || '',
      }
    },
  },
})
