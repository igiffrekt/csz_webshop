import type {StructureResolver} from 'sanity/structure'
import {
  PackageIcon,
  ComponentIcon,
  TagIcon,
  DocumentTextIcon,
  HelpCircleIcon,
  HomeIcon,
  MenuIcon,
  FolderIcon,
  SearchIcon,
  AddIcon,
  BasketIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S, context) => {
  const client = context.getClient({apiVersion: '2025-01-01'})

  return S.list()
    .title('CSZ Tuzvedelem')
    .items([
      // ── Products by Category ──────────────────────────────────────
      S.listItem()
        .title('Termekek')
        .icon(PackageIcon)
        .child(() =>
          client
            .fetch<{_id: string; name: string; childIds: string[]}[]>(
              `*[_type == "category" && !defined(parent)] | order(name asc) {
                _id,
                name,
                "childIds": *[_type == "category" && parent._ref == ^._id]._id
              }`,
            )
            .then((parentCategories) =>
              S.list()
                .title('Termekek')
                .items([
                  S.listItem()
                    .title('Minden termek')
                    .icon(SearchIcon)
                    .id('all-products')
                    .child(
                      S.documentList()
                        .title('Minden termek')
                        .filter('_type == "product"')
                        .defaultOrdering([{field: 'name', direction: 'asc'}]),
                    ),

                  S.divider(),

                  ...parentCategories.map((cat) => {
                    // All IDs: parent + its children
                    const allCatIds = [cat._id, ...cat.childIds]

                    return S.listItem()
                      .title(cat.name)
                      .icon(cat.childIds.length > 0 ? FolderIcon : TagIcon)
                      .id(cat._id)
                      .child(() =>
                        cat.childIds.length === 0
                          ? // No children → products directly
                            S.documentList()
                              .title(cat.name)
                              .filter('_type == "product" && count((categories[]._ref)[@ in $catIds]) > 0')
                              .params({catIds: allCatIds})
                              .defaultOrdering([{field: 'name', direction: 'asc'}])
                          : // Has children → fetch child names, show sub-cats + products
                            client
                              .fetch<{_id: string; name: string}[]>(
                                `*[_type == "category" && parent._ref == $catId] | order(name asc) {_id, name}`,
                                {catId: cat._id},
                              )
                              .then((subCategories) =>
                                S.list()
                                  .title(cat.name)
                                  .items([
                                    // Sub-categories first
                                    ...subCategories.map((sub) =>
                                      S.listItem()
                                        .title(sub.name)
                                        .icon(TagIcon)
                                        .id(sub._id)
                                        .child(
                                          S.documentList()
                                            .title(sub.name)
                                            .filter('_type == "product" && $catId in categories[]._ref')
                                            .params({catId: sub._id})
                                            .defaultOrdering([{field: 'name', direction: 'asc'}]),
                                        ),
                                    ),

                                    S.divider(),

                                    // All products in parent + children combined
                                    S.listItem()
                                      .title(`Osszes termek (${cat.name})`)
                                      .icon(PackageIcon)
                                      .id(`${cat._id}-all`)
                                      .child(
                                        S.documentList()
                                          .title(`Osszes ${cat.name} termek`)
                                          .filter('_type == "product" && count((categories[]._ref)[@ in $catIds]) > 0')
                                          .params({catIds: allCatIds})
                                          .defaultOrdering([{field: 'name', direction: 'asc'}]),
                                      ),
                                  ]),
                              ),
                      )
                  }),

                  S.divider(),

                  S.listItem()
                    .title('Kategoria nelkul')
                    .icon(PackageIcon)
                    .id('uncategorized')
                    .child(
                      S.documentList()
                        .title('Kategoria nelkul')
                        .filter('_type == "product" && (!defined(categories) || length(categories) == 0)')
                        .defaultOrdering([{field: 'name', direction: 'asc'}]),
                    ),
                ]),
            ),
        ),

      // ── Categories (hierarchical) ─────────────────────────────────
      S.listItem()
        .title('Kategoriak')
        .icon(TagIcon)
        .child(() =>
          client
            .fetch<{_id: string; name: string; childCount: number}[]>(
              `*[_type == "category" && !defined(parent)] | order(name asc) {
                _id,
                name,
                "childCount": count(*[_type == "category" && parent._ref == ^._id])
              }`,
            )
            .then((parentCategories) =>
              S.list()
                .title('Kategoriak')
                .items([
                  S.listItem()
                    .title('Minden kategoria')
                    .icon(SearchIcon)
                    .id('all-categories')
                    .child(
                      S.documentList()
                        .title('Minden kategoria')
                        .filter('_type == "category"')
                        .defaultOrdering([{field: 'name', direction: 'asc'}]),
                    ),

                  S.listItem()
                    .title('Uj kategoria')
                    .icon(AddIcon)
                    .id('new-category')
                    .child(
                      S.document()
                        .schemaType('category')
                        .documentId('drafts.')
                        .title('Uj kategoria'),
                    ),

                  S.divider(),

                  ...parentCategories.map((cat) =>
                    S.listItem()
                      .title(cat.name)
                      .icon(cat.childCount > 0 ? FolderIcon : TagIcon)
                      .id(`cat-nav-${cat._id}`)
                      .child(() =>
                        cat.childCount === 0
                          ? // No children → open document editor directly
                            S.document()
                              .schemaType('category')
                              .documentId(cat._id)
                              .title(cat.name)
                          : // Has children → show parent + child categories
                            client
                              .fetch<{_id: string; name: string}[]>(
                                `*[_type == "category" && parent._ref == $catId] | order(name asc) {_id, name}`,
                                {catId: cat._id},
                              )
                              .then((subCategories) =>
                                S.list()
                                  .title(cat.name)
                                  .items([
                                    // Parent category document at top
                                    S.listItem()
                                      .title(`${cat.name} szerkesztese`)
                                      .icon(TagIcon)
                                      .id(`cat-edit-${cat._id}`)
                                      .child(
                                        S.document()
                                          .schemaType('category')
                                          .documentId(cat._id)
                                          .title(cat.name),
                                      ),

                                    S.divider(),

                                    // Child categories
                                    ...subCategories.map((sub) =>
                                      S.listItem()
                                        .title(sub.name)
                                        .icon(TagIcon)
                                        .id(`cat-nav-${sub._id}`)
                                        .child(
                                          S.document()
                                            .schemaType('category')
                                            .documentId(sub._id)
                                            .title(sub.name),
                                        ),
                                    ),
                                  ]),
                              ),
                      ),
                  ),
                ]),
            ),
        ),

      // ── Product Variants ──────────────────────────────────────────
      S.listItem()
        .title('Termekvariansok')
        .icon(ComponentIcon)
        .schemaType('productVariant')
        .child(S.documentTypeList('productVariant').title('Termekvariansok')),

      S.divider(),

      // ── Orders ──────────────────────────────────────────────────
      S.listItem()
        .title('Rendelesek')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Rendelesek')
            .items([
              S.listItem()
                .title('Minden rendeles')
                .icon(BasketIcon)
                .id('all-orders')
                .child(
                  S.documentList()
                    .title('Minden rendeles')
                    .filter('_type == "order"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),

              S.divider(),

              S.listItem()
                .title('Fizetesre var')
                .id('orders-pending')
                .child(
                  S.documentList()
                    .title('Fizetesre var')
                    .filter('_type == "order" && status == "pending"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Fizetve')
                .id('orders-paid')
                .child(
                  S.documentList()
                    .title('Fizetve')
                    .filter('_type == "order" && status == "paid"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Feldolgozas alatt')
                .id('orders-processing')
                .child(
                  S.documentList()
                    .title('Feldolgozas alatt')
                    .filter('_type == "order" && status == "processing"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Kiszallitva')
                .id('orders-shipped')
                .child(
                  S.documentList()
                    .title('Kiszallitva')
                    .filter('_type == "order" && status == "shipped"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Kezbesitve')
                .id('orders-delivered')
                .child(
                  S.documentList()
                    .title('Kezbesitve')
                    .filter('_type == "order" && status == "delivered"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),

              S.divider(),

              S.listItem()
                .title('Torolve / Visszateritett')
                .id('orders-cancelled-refunded')
                .child(
                  S.documentList()
                    .title('Torolve / Visszateritett')
                    .filter('_type == "order" && status in ["cancelled", "refunded"]')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
            ]),
        ),

      S.divider(),

      // ── Content ───────────────────────────────────────────────────
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
    ])
}
