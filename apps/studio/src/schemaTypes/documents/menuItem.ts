import {defineType, defineField} from 'sanity'
import {MenuIcon} from '@sanity/icons'

export const menuItem = defineType({
  name: 'menuItem',
  title: 'Menüpont',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'cim',
      title: 'Cím',
      type: 'string',
      validation: (rule) => rule.required().error('A menüpont címe kötelező.'),
    }),
    defineField({
      name: 'tipus',
      title: 'Típus',
      type: 'string',
      options: {
        list: [
          {title: 'URL', value: 'url'},
          {title: 'Kategória', value: 'kategoria'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required().error('A típus választása kötelező.'),
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
            return 'Az URL megadása kötelező URL típus esetén.'
          }
          return true
        }),
    }),
    defineField({
      name: 'kategoria',
      title: 'Kategória',
      type: 'reference',
      to: [{type: 'category'}],
      hidden: ({document}) => document?.tipus !== 'kategoria',
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document as {tipus?: string} | undefined
          if (doc?.tipus === 'kategoria' && !value) {
            return 'A kategória választása kötelező kategória típus esetén.'
          }
          return true
        }),
    }),
    defineField({
      name: 'parent',
      title: 'Szülő menüpont',
      type: 'reference',
      to: [{type: 'menuItem'}],
      description: 'Válasszon szülő menüpontot al-menü létrehozásához',
    }),
    defineField({
      name: 'sorrend',
      title: 'Sorrend',
      type: 'number',
      initialValue: 0,
      description: 'Kisebb szám = előbb jelenik meg',
    }),
    defineField({
      name: 'nyitasUjTabon',
      title: 'Megnyitás új lapon',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ikon',
      title: 'Ikon',
      type: 'string',
      description: 'Ikon azonosító (opcionális)',
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
        subtitle: `Sorrend: ${sorrend ?? 0} | Típus: ${tipus ?? ''}`,
      }
    },
  },
})
