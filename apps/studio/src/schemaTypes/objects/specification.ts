import {defineType, defineField} from 'sanity'

export const specification = defineType({
  name: 'specification',
  title: 'Műszaki adat',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Név',
      type: 'string',
      validation: (rule) => rule.required().error('A név megadása kötelező.'),
    }),
    defineField({
      name: 'value',
      title: 'Érték',
      type: 'string',
      validation: (rule) => rule.required().error('Az érték megadása kötelező.'),
    }),
    defineField({
      name: 'unit',
      title: 'Mértékegység',
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
