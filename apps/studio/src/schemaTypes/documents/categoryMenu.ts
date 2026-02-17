import {defineType, defineField} from 'sanity'
import {MenuIcon} from '@sanity/icons'

export const categoryMenu = defineType({
  name: 'categoryMenu',
  title: 'Kategória menü',
  type: 'document',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'categories',
      title: 'Kategóriák sorrendje',
      description: 'Húzza a kategóriákat a kívánt sorrendbe. Ez a sorrend jelenik meg a bal oldali menüben.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'category'}],
        },
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: 'Kategória menü',
        subtitle: 'Bal oldali kategória menü sorrendje',
      }
    },
  },
})
