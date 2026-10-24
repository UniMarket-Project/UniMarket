import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowDownUp,
  AlertCircle,
  BookOpen,
  Laptop,
  Home,
  PenTool,
  Wrench,
  Bus,
} from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const CATEGORIES = [
  { id: 'all', label: 'All Items', icon: null },
  { id: 'Academic Books', label: 'Academic Books', icon: BookOpen },
  { id: 'Electronics', label: 'Electronics', icon: Laptop },
  { id: 'Dorm Essentials', label: 'Dorm Essentials', icon: Home },
  { id: 'Stationery', label: 'Stationery', icon: PenTool },
  { id: 'Services', label: 'Services', icon: Wrench },
  { id: 'Transport', label: 'Transport', icon: Bus },
];

export const TRANSACTION_TYPES = [
  { id: 'all', label: 'All Deals' },
  { id: 'sell', label: 'To Buy' },
  { id: 'rent', label: 'To Rent' },
  { id: 'lend', label: 'Borrow / Lend' },
  { id: 'service', label: 'Services' },
];

export const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price_asc', label: 'Price: Low to High' },
  { id: 'price_desc', label: 'Price: High to Low' },
];

interface ListingFiltersProps {
  onFiltersChange?: (filters: FilterValues) => void;
  isProvider?: boolean;
}

export interface FilterValues {
  q: string;
  category: string;
  transactionType: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  priceError: string | null;
}

export function ListingFilters({ onFiltersChange, isProvider }: ListingFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial filter values from URL query string
  const initialQ = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const initialType = searchParams.get('type') || searchParams.get('transactionType') || 'all';
  const initialMinPrice = searchParams.get('minPrice') || '';
  const initialMaxPrice = searchParams.get('maxPrice') || '';
  const initialSortBy = searchParams.get('sortBy') || 'newest';

  // Internal local states
  const [keyword, setKeyword] = useState<string>(initialQ);
  const [category, setCategory] = useState<string>(initialCategory);
  const [transactionType, setTransactionType] = useState<string>(initialType);
  const [minPrice, setMinPrice] = useState<string>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<string>(initialMaxPrice);
  const [sortBy, setSortBy] = useState<string>(initialSortBy);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(Boolean(initialMinPrice || initialMaxPrice || initialSortBy !== 'newest'));

  // Debounced keyword (350ms)
  const [debouncedKeyword, setDebouncedKeyword] = useState<string>(initialQ);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 350);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Sync internal state if URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    const urlQ = searchParams.get('q') || '';
    const urlCat = searchParams.get('category') || 'all';
    const urlType = searchParams.get('type') || searchParams.get('transactionType') || 'all';
    const urlMin = searchParams.get('minPrice') || '';
    const urlMax = searchParams.get('maxPrice') || '';
    const urlSort = searchParams.get('sortBy') || 'newest';

    if (urlQ !== keyword) setKeyword(urlQ);
    if (urlCat !== category) setCategory(urlCat);
    if (urlType !== transactionType) setTransactionType(urlType);
    if (urlMin !== minPrice) setMinPrice(urlMin);
    if (urlMax !== maxPrice) setMaxPrice(urlMax);
    if (urlSort !== sortBy) setSortBy(urlSort);
  }, [searchParams]);

  // Price validation: min > max inline validation
  const priceError = useMemo(() => {
    if (!minPrice || !maxPrice) return null;
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (isNaN(min) || isNaN(max)) return null;
    if (min > max) {
      return 'Min price cannot be greater than max price';
    }
    return null;
  }, [minPrice, maxPrice]);

  // Mirror filter state to URL query string whenever debounced values change
  useEffect(() => {
    // Only update URL if there is no price error
    const nextParams = new URLSearchParams(searchParams);

    if (debouncedKeyword.trim()) {
      nextParams.set('q', debouncedKeyword.trim());
    } else {
      nextParams.delete('q');
    }

    if (category && category !== 'all') {
      nextParams.set('category', category);
    } else {
      nextParams.delete('category');
    }

    if (transactionType && transactionType !== 'all') {
      nextParams.set('type', transactionType);
      nextParams.delete('transactionType');
    } else {
      nextParams.delete('type');
      nextParams.delete('transactionType');
    }

    if (minPrice && !priceError) {
      nextParams.set('minPrice', minPrice);
    } else {
      nextParams.delete('minPrice');
    }

    if (maxPrice && !priceError) {
      nextParams.set('maxPrice', maxPrice);
    } else {
      nextParams.delete('maxPrice');
    }

    if (sortBy && sortBy !== 'newest') {
      nextParams.set('sortBy', sortBy);
    } else {
      nextParams.delete('sortBy');
    }

    // Reset pagination to page 1 on filter update
    nextParams.delete('page');

    setSearchParams(nextParams, { replace: true });

    if (onFiltersChange) {
      onFiltersChange({
        q: debouncedKeyword.trim(),
        category,
        transactionType,
        minPrice,
        maxPrice,
        sortBy,
        priceError,
      });
    }
  }, [debouncedKeyword, category, transactionType, minPrice, maxPrice, sortBy, priceError]);

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('all');
    setTransactionType('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');

    const nextParams = new URLSearchParams();
    const uni = searchParams.get('universityCode');
    if (uni) nextParams.set('universityCode', uni);
    setSearchParams(nextParams, { replace: true });
  };

  const hasActiveFilters = Boolean(
    keyword ||
      category !== 'all' ||
      transactionType !== 'all' ||
      minPrice ||
      maxPrice ||
      sortBy !== 'newest'
  );

  return (
    <div className="space-y-4">
      {/* Search Input Bar (Debounced) */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={
              isProvider
                ? 'Search repair equipment, spare parts, campus services...'
                : 'Search textbooks, calculators, dorm items...'
            }
            className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-xs"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Toggle Price / Sort Controls Button */}
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className={`h-11 px-3.5 gap-1.5 transition-colors ${
            showAdvanced || minPrice || maxPrice || sortBy !== 'newest'
              ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20'
              : ''
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {(minPrice || maxPrice || sortBy !== 'newest') && (
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
          )}
        </Button>
      </div>

      {/* Category Chips Scroller */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.icon && <cat.icon className="h-3.5 w-3.5" />}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Transaction Type Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-1 bg-muted/60 p-1 rounded-xl overflow-x-auto">
          {TRANSACTION_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTransactionType(t.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                transactionType === t.id
                  ? 'bg-card text-foreground font-bold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-muted-foreground hover:text-emerald-600 font-medium underline-offset-4 hover:underline"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Price Range & Sort Bar (Filter drawer / subpanel) */}
      {showAdvanced && (
        <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs animate-in fade-in-50 duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Min Price */}
            <div>
              <label htmlFor="minPriceInput" className="block text-xs font-semibold text-muted-foreground mb-1">
                Min Price (ETB)
              </label>
              <div className="relative">
                <input
                  id="minPriceInput"
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className={`h-9 w-full rounded-lg border bg-background px-3 text-xs focus:outline-none focus:ring-2 ${
                    priceError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-input focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Max Price */}
            <div>
              <label htmlFor="maxPriceInput" className="block text-xs font-semibold text-muted-foreground mb-1">
                Max Price (ETB)
              </label>
              <div className="relative">
                <input
                  id="maxPriceInput"
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Any"
                  className={`h-9 w-full rounded-lg border bg-background px-3 text-xs focus:outline-none focus:ring-2 ${
                    priceError
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-input focus:ring-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div>
              <label htmlFor="sortBySelect" className="block text-xs font-semibold text-muted-foreground mb-1">
                Sort By
              </label>
              <div className="relative">
                <select
                  id="sortBySelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowDownUp className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Inline Error for Min > Max price */}
          {priceError && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium pt-1">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{priceError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
