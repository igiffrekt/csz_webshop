import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Category {
  documentId: string;
  name: string;
  productCount: number;
}

const CategoryFilterDropdown = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Only show on product list view
  const isProductListView = location.pathname.includes('api::product.product') &&
    !location.pathname.includes('/create') &&
    location.pathname.split('/').length <= 5;

  useEffect(() => {
    if (!isProductListView) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories?pagination[pageSize]=200&sort=name:asc');
        const json = await response.json();
        setCategories(json?.data || []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [isProductListView]);

  useEffect(() => {
    // Parse current filter from URL
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filters[$and][0][categories][documentId][$eq]');
    if (filterParam) {
      setSelectedCategory(filterParam);
    } else {
      setSelectedCategory('');
    }
  }, [location.search]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);

    const params = new URLSearchParams(location.search);

    // Remove existing category filter
    const keysToDelete: string[] = [];
    params.forEach((_, key) => {
      if (key.includes('[categories]')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => params.delete(key));

    // Reset to page 1 when filtering
    params.set('page', '1');

    if (value) {
      // Add new category filter
      params.set('filters[$and][0][categories][documentId][$eq]', value);
    }

    navigate(`${location.pathname}?${params.toString()}`);
  };

  if (!isProductListView) {
    return null;
  }

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginRight: '16px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: '#32324d',
      whiteSpace: 'nowrap' as const,
    },
    select: {
      padding: '8px 32px 8px 12px',
      fontSize: '14px',
      border: '1px solid #dcdce4',
      borderRadius: '4px',
      backgroundColor: 'white',
      cursor: 'pointer',
      minWidth: '200px',
      appearance: 'none' as const,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666687' d='M6 8.825c-.2 0-.4-.1-.5-.2l-3.3-3.3c-.3-.3-.3-.8 0-1.1.3-.3.8-.3 1.1 0l2.7 2.7 2.7-2.7c.3-.3.8-.3 1.1 0 .3.3.3.8 0 1.1l-3.3 3.3c-.1.1-.3.2-.5.2z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
    },
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>Kategória:</label>
      <select
        style={styles.select}
        value={selectedCategory}
        onChange={handleCategoryChange}
        disabled={loading}
      >
        <option value="">Összes kategória</option>
        {categories.map((category) => (
          <option key={category.documentId} value={category.documentId}>
            {category.name} ({category.productCount || 0})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryFilterDropdown;
