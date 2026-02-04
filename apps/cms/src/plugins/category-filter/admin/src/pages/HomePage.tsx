import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Main,
  Box,
  Typography,
  SingleSelect,
  SingleSelectOption,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Badge,
  Loader,
  EmptyStateLayout,
} from '@strapi/design-system';
import { Layouts, useFetchClient } from '@strapi/admin/strapi-admin';
import { PLUGIN_ID } from '../pluginId';

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

const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryName, setSelectedCategoryName] = useState<string>('');
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const navigate = useNavigate();
  const { get } = useFetchClient();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await get('/api/categories?pagination[pageSize]=200&sort=name:asc');
        const data = response?.data?.data || [];
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [get]);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const response = await get(
          `/api/products?filters[categories][documentId][$eq]=${selectedCategory}&pagination[pageSize]=100&sort=name:asc`
        );
        const data = response?.data?.data || [];
        setProducts(data);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, get]);

  const handleCategoryChange = (value: string) => {
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

  return (
    <Main>
      <Layouts.Header
        title="Kategória szűrő"
        subtitle="Válassz kategóriát a termékek megtekintéséhez"
      />
      <Layouts.Content>
        <Box paddingBottom={4}>
          <SingleSelect
            label="Kategória"
            placeholder="Válassz kategóriát..."
            value={selectedCategory}
            onChange={handleCategoryChange}
            onClear={() => handleCategoryChange('')}
            disabled={loadingCategories}
          >
            {categories.map((category) => (
              <SingleSelectOption key={category.documentId} value={category.documentId}>
                {category.name} ({category.productCount || 0} termék)
              </SingleSelectOption>
            ))}
          </SingleSelect>
        </Box>

        {loadingProducts && (
          <Flex justifyContent="center" paddingTop={6}>
            <Loader>Termékek betöltése...</Loader>
          </Flex>
        )}

        {!loadingProducts && !selectedCategory && (
          <EmptyStateLayout
            content="Válassz egy kategóriát a termékek megtekintéséhez"
          />
        )}

        {!loadingProducts && selectedCategory && products.length === 0 && (
          <EmptyStateLayout content="Nincs termék ebben a kategóriában." />
        )}

        {!loadingProducts && products.length > 0 && (
          <Box paddingTop={2}>
            <Typography variant="epsilon" fontWeight="bold">
              {selectedCategoryName}: {products.length} termék
            </Typography>
            <Box paddingTop={4}>
              <Table colCount={5} rowCount={products.length}>
                <Thead>
                  <Tr>
                    <Th>
                      <Typography variant="sigma">Név</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Cikkszám</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Ár</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Készlet</Typography>
                    </Th>
                    <Th>
                      <Typography variant="sigma">Státusz</Typography>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product) => (
                    <Tr
                      key={product.documentId}
                      onClick={() => handleProductClick(product.documentId)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Td>
                        <Typography textColor="primary600" fontWeight="bold">
                          {product.name}
                        </Typography>
                      </Td>
                      <Td>
                        <Typography>{product.sku}</Typography>
                      </Td>
                      <Td>
                        <Typography>{formatPrice(product.basePrice)}</Typography>
                      </Td>
                      <Td>
                        <Typography>{product.stock} db</Typography>
                      </Td>
                      <Td>
                        {product.publishedAt ? (
                          <Badge active>Közzétéve</Badge>
                        ) : (
                          <Badge>Piszkozat</Badge>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </Layouts.Content>
    </Main>
  );
};

export { HomePage };
