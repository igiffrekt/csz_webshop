import {defineType, defineField} from 'sanity'
import {MenuIcon} from '@sanity/icons'

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menupont',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'cim',
      title: 'Cim',
      type: 'string',
      validation: (rule) => rule.required().error('A menupont cime kotelezo.'),
    }),
    defineField({
      name: 'tipus',
      title: 'Tipus',
      type: 'string',
      options: {
        list: [
          {title: 'URL', value: 'url'},
          {title: 'Kategoria', value: 'kategoria'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('A tipus valasztasa kotelezo.'),
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      hidden: ({document}) => document?.tipus !== 'url',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {tipus?: string} | undefined
          if (doc?.tipus === 'url' && !value) {
            return 'Az URL megadasa kotelezo URL tipus eseten.'
          }
          return true
        }),
    }),
    defineField({
      name: 'kategoria',
      title: 'Kategoria',
      type: 'reference',
      to: [{type: 'category'}],
      hidden: ({document}) => document?.tipus !== 'kategoria',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {tipus?: string} | undefined
          if (doc?.tipus === 'kategoria' && !value) {
            return 'A kategoria valasztasa kotelezo kategoria tipus eseten.'
          }
          return true
        }),
    }),
    defineField({
      name: 'parent',
      title: 'Szulo menupont',
      type: 'reference',
      to: [{type: 'menuItem'}],
      description: 'Valasszon szulo menupontot al-menu letrehozasahoz',
    }),
    defineField({
      name: 'sorrend',
      title: 'Sorrend',
      type: 'number',
      initialValue: 0,
      description: 'Kisebb szam = elobb jelenik meg',
    }),
    defineField({
      name: 'nyitasUjTabon',
      title: 'Megnyitas uj lapon',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ikon',
      title: 'Ikon',
      type: 'string',
      description: 'Ikon azonosito (opcionalis)',
    }),
  ],
  orderings: [
    {
      title: 'Sorrend szerint',
      name: 'orderAsc',
      by: [{field: 'sorrend', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'cim',
      sorrend: 'sorrend',
      tipus: 'tipus',
    },
    prepare({title, sorrend, tipus}) {
      return {
        title,
        subtitle: `Sorrend: ${sorrend ?? 0} | Tipus: ${tipus ?? ''}`,
      }
    },
  },
})
