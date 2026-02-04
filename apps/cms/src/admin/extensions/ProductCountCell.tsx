import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ProductCountCellProps {
  content: number;
  rowId: string;
}

const ProductCountCell = ({ content, rowId }: ProductCountCellProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Navigate to products filtered by this category
    const productListUrl = `/admin/content-manager/collection-types/api::product.product?page=1&pageSize=10&sort=name:ASC&filters[$and][0][categories][documentId][$eq]=${rowId}`;
    navigate(productListUrl);
  };

  const count = content ?? 0;

  const styles = {
    container: {
      display: 'inline-block',
      cursor: count > 0 ? 'pointer' : 'default',
      textDecoration: isHovered && count > 0 ? 'underline' : 'none',
      color: count > 0 ? '#4945ff' : '#666687',
      fontWeight: count > 0 ? 500 : 400,
      padding: '4px 8px',
      borderRadius: '4px',
      transition: 'all 0.15s ease',
      backgroundColor: isHovered && count > 0 ? '#f0f0ff' : 'transparent',
    },
  };

  if (count === 0) {
    return <span style={styles.container}>0</span>;
  }

  return (
    <span
      style={styles.container}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={`${count} termék megtekintése`}
    >
      {count}
    </span>
  );
};

export default ProductCountCell;
