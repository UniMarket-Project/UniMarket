export const CATEGORIES = [
  'electronics',
  'books',
  'dorm',
  'clothing',
  'services',
  'food',
  'transport',
  'stationery',
  'sports',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  electronics: 'Electronics & Gadgets',
  books: 'Books & Course Materials',
  dorm: 'Dorm & Room Essentials',
  clothing: 'Clothing & Accessories',
  services: 'Tutoring & Services',
  food: 'Food & Meals',
  transport: 'Transport & Rides',
  stationery: 'Stationery & Supplies',
  sports: 'Sports & Fitness',
  other: 'Other Items',
};
