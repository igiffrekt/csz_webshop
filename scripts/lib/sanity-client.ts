import { createClient } from '@sanity/client'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load env from apps/web/.env.local
config({ path: resolve(__dirname, '../../apps/web/.env.local') })

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN!,
})
