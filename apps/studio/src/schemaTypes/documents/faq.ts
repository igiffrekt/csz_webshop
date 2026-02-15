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
      title: 'Kérdés',
      type: 'string',
      validation: (rule) => rule.required().error('A kérdés megadása kötelező.'),
    }),
    defineField({
      name: 'answer',
      title: 'Válasz',
      type: 'array',
      of: [defineArrayMember({type: 'block'})],
      validation: (rule) => rule.required().error('A válasz megadása kötelező.'),
    }),
    defineField({
      name: 'order',
      title: 'Sorrend',
      type: 'number',
      initialValue: 0,
      description: 'Kisebb szám = előbb jelenik meg',
    }),
    defineField({
      name: 'category',
      title: 'Kategória',
      type: 'string',
      description: 'GYIK kategória (pl.: Szállítás, Fizetés, Garancia)',
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
