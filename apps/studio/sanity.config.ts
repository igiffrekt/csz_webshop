import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {structure} from './src/structure'
import {duplicateAction} from './src/actions/duplicateAction'

export default defineConfig({
  name: 'csz-webshop',
  title: 'Dunamenti CSZ',
  projectId: '7xz4a7fm',
  dataset: 'production',
  plugins: [
    structureTool({structure}),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      if (['product', 'productVariant'].includes(context.schemaType)) {
        return [...prev, duplicateAction]
      }
      return prev
    },
  },
})
