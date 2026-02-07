import {defineType, defineField, defineArrayMember} from 'sanity'
import {HelpCircleIcon} from '@sanity/icons'

export const faq = defineType({
  name: 'faq',
  title: 'GYIK',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Kerdes',
      type: 'string',
      validation: (rule) => rule.required().error('A kerdes megadasa kotelezo.'),
    }),
    defineField({
      name: 'answer',
      title: 'Valasz',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (rule) => rule.required().error('A valasz megadasa kotelezo.'),
    }),
    defineField({
      name: 'order',
      title: 'Sorrend',
      type: 'number',
      initialValue: 0,
      description: 'Kisebb szam = elobb jelenik meg',
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      type: 'string',
      description: 'GYIK kategoria (pl.: Szallitas, Fizetes, Garancia)',
    }),
  ],
  orderings: [
    {
      title: 'Sorrend szerint',
      name: 'orderAsc',
      by: [{field: 'order', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'question',
      order: 'order',
    },
    prepare({title, order}) {
      return {
        title,
        subtitle: `Sorrend: ${order ?? 0}`,
      }
    },
  },
})
