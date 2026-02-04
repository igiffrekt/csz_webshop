import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * This component enhances the productCount column in the Category list view
 * to make the numbers clickable and navigate to filtered product list.
 */
const ProductCountEnhancer = () => {
  const location = useLocation();
  const observerRef = useRef<MutationObserver | null>(null);
  const processedRows = useRef<Set<string>>(new Set());

  // Only enhance on category list view
  const isCategoryListView = location.pathname.includes('api::category.category') &&
    !location.pathname.includes('/create') &&
    !location.pathname.match(/\/[a-z0-9]+$/i); // Not on edit view

  useEffect(() => {
    if (!isCategoryListView) {
      return;
    }

    console.log('[ProductCountEnhancer] Active on category list view');

    const enhanceTable = () => {
      // Find all table rows in tbody
      const rows = document.querySelectorAll('tbody tr');
      console.log('[ProductCountEnhancer] Found rows:', rows.length);
      if (!rows.length) return;

      rows.forEach((row, rowIndex) => {
        // Get document ID from the row link
        const link = row.querySelector('a[href*="api::category.category"]') as HTMLAnchorElement;
        if (!link) {
          console.log(`[ProductCountEnhancer] Row ${rowIndex}: No category link found`);
          return;
        }

        const href = link.getAttribute('href') || '';
        const match = href.match(/api::category\.category\/([^?/]+)/);
        if (!match) {
          console.log(`[ProductCountEnhancer] Row ${rowIndex}: Could not extract documentId from href:`, href);
          return;
        }

        const documentId = match[1];

        // Skip if already processed
        if (processedRows.current.has(documentId)) return;

        // Find all cells
        const cells = row.querySelectorAll('td');
        console.log(`[ProductCountEnhancer] Row ${rowIndex} (${documentId}): ${cells.length} cells`);

        // Look for a cell with just a number (productCount)
        // More flexible detection: look at innerText and allow wrapped content
        cells.forEach((cell, cellIndex) => {
          const text = cell.innerText?.trim() || '';

          // Debug: log each cell's content
          if (rowIndex === 0) {
            console.log(`[ProductCountEnhancer] Cell ${cellIndex}: text="${text}", children=${cell.children.length}`);
          }

          // Check if this is a numeric cell (only digits)
          // Be more flexible: allow wrapped content, just check the text
          if (/^\d+$/.test(text) &&
              !cell.querySelector('input[type="checkbox"]') &&
              !cell.querySelector('a') &&
              !cell.querySelector('button')) {

            const count = parseInt(text, 10);
            console.log(`[ProductCountEnhancer] Found numeric cell: ${count} for category ${documentId}`);

            // Mark as processed
            processedRows.current.add(documentId);

            // Create a wrapper with the link
            const wrapper = document.createElement('a');
            wrapper.href = `/admin/content-manager/collection-types/api::product.product?page=1&pageSize=10&sort=name:ASC&filters[$and][0][categories][documentId][$eq]=${documentId}`;
            wrapper.className = 'product-count-link';
            wrapper.style.cssText = `
              display: inline-flex;
              align-items: center;
              gap: 6px;
              padding: 4px 12px;
              border-radius: 4px;
              text-decoration: none;
              color: ${count > 0 ? '#4945ff' : '#666687'};
              font-weight: ${count > 0 ? '600' : '400'};
              cursor: ${count > 0 ? 'pointer' : 'default'};
              transition: all 0.15s ease;
              background-color: ${count > 0 ? '#f0f0ff' : 'transparent'};
            `;

            if (count > 0) {
              wrapper.title = `${count} termék megtekintése`;
              wrapper.onmouseenter = () => {
                wrapper.style.textDecoration = 'underline';
                wrapper.style.backgroundColor = '#e0e0ff';
              };
              wrapper.onmouseleave = () => {
                wrapper.style.textDecoration = 'none';
                wrapper.style.backgroundColor = '#f0f0ff';
              };
              wrapper.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('[ProductCountEnhancer] Navigating to:', wrapper.href);
                window.location.href = wrapper.href;
              };
            } else {
              wrapper.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
              };
            }

            // Add the count text
            wrapper.textContent = String(count);

            // Add arrow icon for clickable items
            if (count > 0) {
              const arrow = document.createElement('span');
              arrow.innerHTML = ' →';
              arrow.style.cssText = 'font-size: 12px; opacity: 0.7;';
              wrapper.appendChild(arrow);
            }

            // Clear cell and add wrapper
            cell.innerHTML = '';
            cell.appendChild(wrapper);
          }
        });
      });
    };

    // Run after a delay to let the table render
    const timeoutId = setTimeout(enhanceTable, 1500);

    // Also observe for changes
    observerRef.current = new MutationObserver(() => {
      setTimeout(enhanceTable, 500);
    });

    const main = document.querySelector('main');
    if (main) {
      observerRef.current.observe(main, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timeoutId);
      observerRef.current?.disconnect();
    };
  }, [isCategoryListView, location.pathname, location.search]);

  // Clear processed rows on navigation
  useEffect(() => {
    processedRows.current.clear();
  }, [location.pathname, location.search]);

  return null;
};

export default ProductCountEnhancer;
