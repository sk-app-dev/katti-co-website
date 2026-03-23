import { type SchemaTypeDefinition } from 'sanity'
import blog from './blog'
import founder from './founder'
import gallery from './gallery'
import formSubmission from './formSubmission'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blog, founder, gallery, formSubmission],
}
