import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  documentId: string;
  name: string;
  productCount: number;
}

interface Product {
  id: number;
  documentId: string;
  name: string;
  sku: string;
  basePrice: number;
  stock: number;
  publishedAt: string | null;
}

const CategoryFilterPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?pagination[pageSize]=200&sort=name:asc');
        const json = await response.json();
        const data = json?.data || [];
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await fetch(
          `/api/products?filters[categories][documentId][$eq]=${selectedCategory}&pagination[pageSize]=100&sort=name:asc`
        );
        const json = await response.json();
        const data = json?.data || [];
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    const cat = categories.find((c) => c.documentId === value);
    setSelectedCategoryName(cat?.name || '');
  };

  const handleProductClick = (documentId: string) => {
    navigate(`/admin/content-manager/collection-types/api::product.product/${documentId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('hu-HU', {
      style: 'currency',
      currency: 'HUF',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const styles = {
    container: {
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      marginBottom: '24px',
    },
    title: {
      fontSize: '32px',
      fontWeight: 600,
      margin: 0,
      color: '#32324d',
    },
    subtitle: {
      fontSize: '14px',
      color: '#666687',
      marginTop: '8px',
    },
    selectContainer: {
      marginBottom: '24px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: 500,
      color: '#32324d',
    },
    select: {
      width: '300px',
      padding: '10px 12px',
      fontSize: '14px',
      border: '1px solid #dcdce4',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      backgroundColor: 'white',
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(33, 33, 52, 0.1)',
    },
    th: {
      padding: '16px',
      textAlign: 'left' as const,
      backgroundColor: '#f6f6f9',
      fontWeight: 600,
      color: '#32324d',
      fontSize: '12px',
      textTransform: 'uppercase' as const,
    },
    td: {
      padding: '16px',
      borderTop: '1px solid #eaeaef',
      color: '#32324d',
    },
    row: {
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    productName: {
      color: '#4945ff',
      fontWeight: 500,
    },
    badge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 500,
    },
    badgePublished: {
      backgroundColor: '#c6f0c2',
      color: '#2f6846',
    },
    badgeDraft: {
      backgroundColor: '#eaeaef',
      color: '#666687',
    },
    emptyState: {
      textAlign: 'center' as const,
      padding: '48px',
      color: '#666687',
    },
    loader: {
      textAlign: 'center' as const,
      padding: '48px',
      color: '#666687',
    },
    count: {
      marginBottom: '16px',
      fontWeight: 500,
      color: '#32324d',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Kategória szűrő</h1>
        <p style={styles.subtitle}>Válassz kategóriát a termékek megtekintéséhez</p>
      </div>

      <div style={styles.selectContainer}>
        <label style={styles.label}>Kategória</label>
        <select
          style={styles.select}
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={loadingCategories}
        >
          <option value="">Válassz kategóriát...</option>
          {categories.map((category) => (
            <option key={category.documentId} value={category.documentId}>
              {category.name} ({category.productCount || 0} termék)
            </option>
          ))}
        </select>
      </div>

      {loadingProducts && (
        <div style={styles.loader}>Termékek betöltése...</div>
      )}

      {!loadingProducts && !selectedCategory && (
        <div style={styles.emptyState}>
          Válassz egy kategóriát a termékek megtekintéséhez
        </div>
      )}

      {!loadingProducts && selectedCategory && products.length === 0 && (
        <div style={styles.emptyState}>
          Nincs termék ebben a kategóriában.
        </div>
      )}

      {!loadingProducts && products.length > 0 && (
        <>
          <div style={styles.count}>
            {selectedCategoryName}: {products.length} termék
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Név</th>
                <th style={styles.th}>Cikkszám</th>
                <th style={styles.th}>Ár</th>
                <th style={styles.th}>Készlet</th>
                <th style={styles.th}>Státusz</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.documentId}
                  style={styles.row}
                  onClick={() => handleProductClick(product.documentId)}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f6f6f9')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <td style={{ ...styles.td, ...styles.productName }}>
                    {product.name}
                  </td>
                  <td style={styles.td}>{product.sku}</td>
                  <td style={styles.td}>{formatPrice(product.basePrice)}</td>
                  <td style={styles.td}>{product.stock} db</td>
                  <td style={styles.td}>
                    {product.publishedAt ? (
                      <span style={{ ...styles.badge, ...styles.badgePublished }}>
                        Közzétéve
                      </span>
                    ) : (
                      <span style={{ ...styles.badge, ...styles.badgeDraft }}>
                        Piszkozat
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default CategoryFilterPage;
