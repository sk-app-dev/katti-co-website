/**
 * V2 Studio Route - Separate testing environment
 * Use this for testing new features on a v2 dataset
 */

import { NextStudio } from 'next-sanity/studio'
import config from '../../../../sanity.config.v2'

export const dynamic = 'force-static'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioV2Page() {
  return <NextStudio config={config} />
}
