'use client'

/**
 * V2 Studio Configuration - Separate from production
 * This allows testing new features without affecting the live site
 */

import {visionTool} from '@sanity/vision'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'

// V2 configuration uses separate project/dataset
import {apiVersion} from './sanity/env'
import {schema} from './sanity/schemaTypes'
import {structure} from './sanity/structure'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID_V2 || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET_V2 || 'v2'

export default defineConfig({
  basePath: '/studio-v2',
  projectId,
  dataset,
  title: 'Katti & Co. - V2 (Testing)',
  schema,
  plugins: [
    structureTool({structure}),
    visionTool({defaultApiVersion: apiVersion}),
  ],
})
