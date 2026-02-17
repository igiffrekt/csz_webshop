// Object types
import {seo} from './objects/seo'
import {specification} from './objects/specification'
import {certification} from './objects/certification'
import {orderLineItem} from './objects/orderLineItem'
import {orderAddress} from './objects/orderAddress'

// Document types
import {product} from './documents/product'
import {productVariant} from './documents/productVariant'
import {category} from './documents/category'
import {page} from './documents/page'
import {faq} from './documents/faq'
import {homepage} from './documents/homepage'
import {menuItem} from './documents/menuItem'
import {order} from './documents/order'
import {blogPost} from './documents/blogPost'
import {footer} from './documents/footer'
import {categoryMenu} from './documents/categoryMenu'

export const schemaTypes = [
  // Objects
  seo,
  specification,
  certification,
  orderLineItem,
  orderAddress,
  // Documents
  product,
  productVariant,
  category,
  categoryMenu,
  page,
  faq,
  blogPost,
  homepage,
  menuItem,
  order,
  footer,
]
