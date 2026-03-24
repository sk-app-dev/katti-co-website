import { type SchemaTypeDefinition } from 'sanity'
import blog from './blog'
import founder from './founder'
import gallery from './gallery'
import formSubmission from './formSubmission'
import team from './team'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blog, founder, gallery, formSubmission, team],
}
