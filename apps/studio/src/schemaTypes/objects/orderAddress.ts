import {defineType, defineField} from 'sanity'

export const orderAddress = defineType({
  name: 'orderAddress',
  title: 'Cím',
  type: 'object',
  fields: [
    defineField({
      name: 'recipientName',
      title: 'Címzett neve',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'street',
      title: 'Utca, házszám',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'city',
      title: 'Város',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'postalCode',
      title: 'Irányítószám',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'country',
      title: 'Ország',
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
      title: 'Cégnév',
      type: 'string',
      readOnly: true,
    }),
    defineField({
      name: 'vatNumber',
      title: 'Adószám',
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
        title: recipientName || 'Cím',
        subtitle: city || '',
      }
    },
  },
})
