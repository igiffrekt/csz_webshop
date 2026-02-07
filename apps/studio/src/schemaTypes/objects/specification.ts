import {defineType, defineField} from 'sanity'

export const specification = defineType({
  name: 'specification',
  title: 'Muszaki adat',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Nev',
      type: 'string',
      validation: (rule) => rule.required().error('A nev megadasa kotelezo.'),
    }),
    defineField({
      name: 'value',
      title: 'Ertek',
      type: 'string',
      validation: (rule) => rule.required().error('Az ertek megadasa kotelezo.'),
    }),
    defineField({
      name: 'unit',
      title: 'Mertekegyseg',
      type: 'string',
      description: 'Pl.: kg, mm, db, W',
    }),
  ],
  preview: {
    select: {
      name: 'name',
      value: 'value',
      unit: 'unit',
    },
    prepare({name, value, unit}) {
      return {
        title: name,
        subtitle: unit ? `${value} ${unit}` : value,
      }
    },
  },
})
