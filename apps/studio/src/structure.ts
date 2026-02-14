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
  BasketIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S, context) => {
  const client = context.getClient({apiVersion: '2025-01-01'})

  return S.list()
    .title('Dunamenti CSZ')
    .items([
      // ── Products by Category ──────────────────────────────────────
      S.listItem()
        .title('Termekek')
        .icon(PackageIcon)
        .child(() => {
          // Collect all descendant IDs for a category (recursive)
          const getAllDescendantIds = async (catId: string): Promise<string[]> => {
            const children = await client.fetch<{_id: string}[]>(
              `*[_type == "category" && parent._ref == $catId]{_id}`,
              {catId},
            )
            const childIds = children.map((c) => c._id)
            const grandchildIds = await Promise.all(childIds.map(getAllDescendantIds))
            return [...childIds, ...grandchildIds.flat()]
          }

          // Recursive helper to build product category tree at any depth
          const buildProductCategoryChild = (catId: string, catName: string): Promise<any> =>
            client
              .fetch<{_id: string; name: string; childCount: number}[]>(
                `*[_type == "category" && parent._ref == $catId] | order(name asc) {
                  _id,
                  name,
                  "childCount": count(*[_type == "category" && parent._ref == ^._id])
                }`,
                {catId},
              )
              .then(async (children) => {
                if (children.length === 0) {
                  // Leaf category → show products directly
                  return S.documentList()
                    .title(catName)
                    .filter('_type == "product" && $catId in categories[]._ref')
                    .params({catId})
                    .defaultOrdering([{field: 'name', direction: 'asc'}])
                }

                // Has children → collect all descendant IDs for "all products" view
                const descendantIds = await getAllDescendantIds(catId)
                const allCatIds = [catId, ...descendantIds]

                return S.list()
                  .title(catName)
                  .items([
                    ...children.map((child) =>
                      S.listItem()
                        .title(child.name)
                        .icon(child.childCount > 0 ? FolderIcon : TagIcon)
                        .id(`prod-${child._id}`)
                        .child(() => buildProductCategoryChild(child._id, child.name)),
                    ),

                    S.divider(),

                    S.listItem()
                      .title(`Osszes termek (${catName})`)
                      .icon(PackageIcon)
                      .id(`${catId}-all`)
                      .child(
                        S.documentList()
                          .title(`Osszes ${catName} termek`)
                          .filter('_type == "product" && count((categories[]._ref)[@ in $catIds]) > 0')
                          .params({catIds: allCatIds})
                          .defaultOrdering([{field: 'name', direction: 'asc'}]),
                      ),
                  ])
              })

          return client
            .fetch<{_id: string; name: string; childCount: number}[]>(
              `*[_type == "category" && !defined(parent)] | order(name asc) {
                _id,
                name,
                "childCount": count(*[_type == "category" && parent._ref == ^._id])
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

                  ...parentCategories.map((cat) =>
                    S.listItem()
                      .title(cat.name)
                      .icon(cat.childCount > 0 ? FolderIcon : TagIcon)
                      .id(cat._id)
                      .child(() => buildProductCategoryChild(cat._id, cat.name)),
                  ),

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
            )
        }),

      // ── Categories (hierarchical) ─────────────────────────────────
      S.listItem()
        .title('Kategoriak')
        .icon(TagIcon)
        .child(() => {
          // Recursive helper to build category tree at any depth
          const buildCategoryChild = (catId: string, catName: string): Promise<any> =>
            client
              .fetch<{_id: string; name: string; childCount: number}[]>(
                `*[_type == "category" && parent._ref == $catId] | order(name asc) {
                  _id,
                  name,
                  "childCount": count(*[_type == "category" && parent._ref == ^._id])
                }`,
                {catId},
              )
              .then((children) =>
                children.length === 0
                  ? S.document()
                      .schemaType('category')
                      .documentId(catId)
                      .title(catName)
                  : S.list()
                      .title(catName)
                      .items([
                        S.listItem()
                          .title(`${catName} szerkesztese`)
                          .icon(TagIcon)
                          .id(`cat-edit-${catId}`)
                          .child(
                            S.document()
                              .schemaType('category')
                              .documentId(catId)
                              .title(catName),
                          ),

                        S.divider(),

                        ...children.map((child) =>
                          S.listItem()
                            .title(child.name)
                            .icon(child.childCount > 0 ? FolderIcon : TagIcon)
                            .id(`cat-nav-${child._id}`)
                            .child(() => buildCategoryChild(child._id, child.name)),
                        ),
                      ]),
              )

          return client
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

                  S.divider(),

                  ...parentCategories.map((cat) =>
                    S.listItem()
                      .title(cat.name)
                      .icon(cat.childCount > 0 ? FolderIcon : TagIcon)
                      .id(`cat-nav-${cat._id}`)
                      .child(() => buildCategoryChild(cat._id, cat.name)),
                  ),
                ]),
            )
        }),

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
