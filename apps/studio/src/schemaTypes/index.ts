// Object types
import {seo} from './objects/seo'
import {specification} from './objects/specification'
import {certification} from './objects/certification'

// Document types
import {product} from './documents/product'
import {productVariant} from './documents/productVariant'
import {category} from './documents/category'
import {page} from './documents/page'
import {faq} from './documents/faq'
import {homepage} from './documents/homepage'
import {menuItem} from './documents/menuItem'

export const schemaTypes = [
  // Objects
  seo,
  specification,
  certification,
  // Documents
  product,
  productVariant,
  category,
  page,
  faq,
  homepage,
  menuItem,
]
