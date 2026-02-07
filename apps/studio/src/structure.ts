import type {StructureResolver} from 'sanity/structure'
import {
  PackageIcon,
  ComponentIcon,
  TagIcon,
  DocumentTextIcon,
  HelpCircleIcon,
  HomeIcon,
  MenuIcon,
  CreditCardIcon,
  DocumentsIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('CSZ Tuzvedelem')
    .items([
      S.listItem()
        .title('Termekek')
        .icon(PackageIcon)
        .schemaType('product')
        .child(S.documentTypeList('product').title('Termekek')),

      S.listItem()
        .title('Termekvariansok')
        .icon(ComponentIcon)
        .schemaType('productVariant')
        .child(S.documentTypeList('productVariant').title('Termekvariansok')),

      S.listItem()
        .title('Kategoriak')
        .icon(TagIcon)
        .schemaType('category')
        .child(S.documentTypeList('category').title('Kategoriak')),

      S.divider(),

      S.listItem()
        .title('Oldalak')
        .icon(DocumentTextIcon)
        .schemaType('page')
        .child(S.documentTypeList('page').title('Oldalak')),

      S.listItem()
        .title('GYIK')
        .icon(HelpCircleIcon)
        .schemaType('faq')
        .child(S.documentTypeList('faq').title('GYIK')),

      S.listItem()
        .title('Menu')
        .icon(MenuIcon)
        .schemaType('menuItem')
        .child(S.documentTypeList('menuItem').title('Menupontok')),

      S.divider(),

      S.listItem()
        .title('Kezdolap')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
            .title('Kezdolap'),
        ),

      S.listItem()
        .title('Kuponok')
        .icon(CreditCardIcon)
        .child(
          S.component()
            .title('Kuponok')
            .component(() => {
              // Note: Coupons are managed in the e-commerce backend (Vendure),
              // not in Sanity. This is a placeholder to inform editors.
              return null
            }),
        ),

      S.divider(),

      S.listItem()
        .title('Minden dokumentum')
        .icon(DocumentsIcon)
        .child(S.documentTypeList('')),
    ])
