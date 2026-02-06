'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Minus, X } from 'lucide-react';
import type { QuoteItem } from '@csz/types';

interface Product {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
}

interface ProductSelectorProps {
  items: QuoteItem[];
  onItemsChange: (items: QuoteItem[]) => void;
}

export function ProductSelector({ items, onItemsChange }: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const json = await response.json();
        setSearchResults((json.data || []).map((p: any) => ({
          _id: p._id,
          name: p.name,
          sku: p.sku,
          basePrice: p.basePrice,
        })));
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addProduct = (product: Product) => {
    const productId = product._id;
    const existingIndex = items.findIndex(item => item.productId === productId);

    if (existingIndex >= 0) {
      // Increase quantity if already in list
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      onItemsChange(newItems);
    } else {
      // Add new item
      const newItem: QuoteItem = {
        productId,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
      };
      onItemsChange([...items, newItem]);
    }

    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, newItems[index].quantity + delta);
    onItemsChange(newItems);
  };

  const setQuantity = (index: number, quantity: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, quantity);
    onItemsChange(newItems);
  };

  const removeItem = (index: number) => {
    onItemsChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Termék keresése..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} disabled={isSearching}>
          Keresés
        </Button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="border rounded-lg divide-y">
          {searchResults.map((product) => (
            <div
              key={product._id}
              className="p-3 flex justify-between items-center hover:bg-muted/50"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
              </div>
              <Button size="sm" onClick={() => addProduct(product)}>
                <Plus className="h-4 w-4 mr-1" />
                Hozzáadás
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Selected Items */}
      {items.length > 0 && (
        <div className="border rounded-lg divide-y">
          <div className="p-3 bg-muted/50 font-medium">
            Kiválasztott termékek ({items.length})
          </div>
          {items.map((item, index) => (
            <div key={index} className="p-3 flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(index, -1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => setQuantity(index, parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => updateQuantity(index, 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => removeItem(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && searchResults.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
          Keressen termékeket a fenti mezőben
        </div>
      )}
    </div>
  );
}
