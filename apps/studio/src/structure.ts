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
  ComposeIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S, context) => {
  const client = context.getClient({apiVersion: '2025-01-01'})

  return S.list()
    .title('Dunamenti CSZ')
    .items([
      // ── Products by Category ──────────────────────────────────────
      S.listItem()
        .title('Termékek')
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
                      .title(`Összes termék (${catName})`)
                      .icon(PackageIcon)
                      .id(`${catId}-all`)
                      .child(
                        S.documentList()
                          .title(`Összes ${catName} termék`)
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
                .title('Termékek')
                .items([
                  S.listItem()
                    .title('Minden termék')
                    .icon(SearchIcon)
                    .id('all-products')
                    .child(
                      S.documentList()
                        .title('Minden termék')
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
                    .title('Kategória nélkül')
                    .icon(PackageIcon)
                    .id('uncategorized')
                    .child(
                      S.documentList()
                        .title('Kategória nélkül')
                        .filter('_type == "product" && (!defined(categories) || length(categories) == 0)')
                        .defaultOrdering([{field: 'name', direction: 'asc'}]),
                    ),
                ]),
            )
        }),

      // ── Categories (hierarchical) ─────────────────────────────────
      S.listItem()
        .title('Kategóriák')
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
                          .title(`${catName} szerkesztése`)
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
                .title('Kategóriák')
                .items([
                  S.listItem()
                    .title('Minden kategória')
                    .icon(SearchIcon)
                    .id('all-categories')
                    .child(
                      S.documentList()
                        .title('Minden kategória')
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
        .title('Termékváriánsok')
        .icon(ComponentIcon)
        .schemaType('productVariant')
        .child(S.documentTypeList('productVariant').title('Termékváriánsok')),

      S.divider(),

      // ── Orders ──────────────────────────────────────────────────
      S.listItem()
        .title('Rendelések')
        .icon(BasketIcon)
        .child(
          S.list()
            .title('Rendelések')
            .items([
              S.listItem()
                .title('Minden rendelés')
                .icon(BasketIcon)
                .id('all-orders')
                .child(
                  S.documentList()
                    .title('Minden rendelés')
                    .filter('_type == "order"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),

              S.divider(),

              S.listItem()
                .title('Fizetésre vár')
                .id('orders-pending')
                .child(
                  S.documentList()
                    .title('Fizetésre vár')
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
                .title('Feldolgozás alatt')
                .id('orders-processing')
                .child(
                  S.documentList()
                    .title('Feldolgozás alatt')
                    .filter('_type == "order" && status == "processing"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Kiszállítva')
                .id('orders-shipped')
                .child(
                  S.documentList()
                    .title('Kiszállítva')
                    .filter('_type == "order" && status == "shipped"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),
              S.listItem()
                .title('Kézbesítve')
                .id('orders-delivered')
                .child(
                  S.documentList()
                    .title('Kézbesítve')
                    .filter('_type == "order" && status == "delivered"')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}]),
                ),

              S.divider(),

              S.listItem()
                .title('Törölve / Visszatérített')
                .id('orders-cancelled-refunded')
                .child(
                  S.documentList()
                    .title('Törölve / Visszatérített')
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
        .title('Blog')
        .icon(ComposeIcon)
        .schemaType('blogPost')
        .child(
          S.documentTypeList('blogPost')
            .title('Blog bejegyzések')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
        ),

      S.listItem()
        .title('Menu')
        .icon(MenuIcon)
        .schemaType('menuItem')
        .child(S.documentTypeList('menuItem').title('Menüpontok')),

      S.divider(),

      S.listItem()
        .title('Kezdőlap')
        .icon(HomeIcon)
        .child(
          S.document()
            .schemaType('homepage')
            .documentId('homepage')
            .title('Kezdőlap'),
        ),
    ])
}
