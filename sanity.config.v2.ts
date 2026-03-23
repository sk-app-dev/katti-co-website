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

// Hardcoded V2 configuration (for deployed studio)
const projectId = '9epvqzza'
const dataset = 'v2'

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
