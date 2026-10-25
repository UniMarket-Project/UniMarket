import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../shared/api/api-client';
import { useAuthStore } from '../auth/auth.store';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { ImageUpload } from '../../shared/components/ui/ImageUpload';
import { ShieldAlert, ArrowLeft, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../shared/utils/errors';

const CATEGORIES = [
  'Academic Books',
  'Electronics',
  'Dorm Essentials',
  'Stationery',
  'Services',
  'Transport',
  'Other',
];

const SAMPLE_PHOTOS = [
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
  'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600',
  'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600',
  'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',
];

export function CreateListingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic Books');
  const [transactionType, setTransactionType] = useState<'sell' | 'rent' | 'lend' | 'service'>('sell');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('AAU 4-Kilo Campus');
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTOS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        transactionType,
        price: price ? parseFloat(price) : null,
        quantityAvailable: quantity,
        images: [customPhotoUrl.trim() || selectedPhoto],
        location: address ? { address } : undefined,
      };
      const res = await api.post('/listings', payload);
      return res.data.data.listing;
    },
    onSuccess: (data) => {
      navigate(`/listings/${data.listingId}`);
    },
    onError: (err: any) => {
      setErrorMsg(
        getErrorMessage(
          err,
          'Failed to create listing. Please check your title (min 5 chars) and description (min 20 chars).'
        )
      );
    },
  });

  // Guard: if not verified, prompt user to verify first
  if (user?.verificationStatus !== 'verified') {
    const isPending = user?.verificationStatus === 'pending';
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold">
          {isPending ? 'Verification Under Review' : 'Campus Verification Required'}
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {isPending
            ? 'Your campus ID submission is currently being reviewed by university administration. You will be able to post listings once your ID is approved.'
            : 'To maintain campus safety and prevent scams, only students and providers with a verified university ID can list items for sale, rent, or service.'}
        </p>
        {!isPending && (
          <Link to="/verify" className="inline-block pt-2">
            <Button>Submit Student ID for Verification &rarr;</Button>
          </Link>
        )}
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (title.trim().length < 5) {
      setErrorMsg('Listing title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 20) {
      setErrorMsg(`Description must be at least 20 characters long (currently ${description.trim().length}). Please provide more detail about the item.`);
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back</span>
      </button>

      <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Post a New Listing</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Share what you have with the university community.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-800 dark:text-red-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Cannot Create Listing</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="Listing Title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Casio fx-991EX Calculator / Organic Chemistry Textbook"
            />
            <p className="text-[11px] text-muted-foreground text-right mt-1">
              {title.trim().length}/5 characters minimum
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Listing Type
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value as any)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sell">Sell (Outright Purchase)</option>
                <option value="rent">Rent (Semester / Weekly)</option>
                <option value="lend">Lend (Free Peer Borrowing)</option>
                <option value="service">Service (Tutoring / Repair)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={transactionType === 'lend' ? 'Price (Free / Deposit)' : 'Price (ETB)'}
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={transactionType === 'lend' ? '0' : 'e.g. 850'}
            />

            <Input
              label="Available Quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Describe condition, edition, accessories included, and safe campus pickup notes..."
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-muted-foreground text-right mt-1">
              {description.trim().length}/20 characters minimum
            </p>
          </div>

          <Input
            label="Campus Meeting / Pickup Location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. AAU 4-Kilo Science Library entrance or Dorm Block 12"
          />

          {/* Photo Picker */}
          <div className="space-y-4">
            <ImageUpload
              label="Listing Photo"
              value={customPhotoUrl}
              onChange={(url) => {
                setCustomPhotoUrl(url);
                if (url) setSelectedPhoto(url);
              }}
              purpose="listing_image"
              accept="image/jpeg,image/png,image/webp"
              helperText="Upload a photo from your storage/gallery or paste an image URL. Stored on cloud storage."
              placeholder="https://example.com/item.jpg"
            />

            <div className="space-y-1.5 pt-1">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                Or select from campus sample photos:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {SAMPLE_PHOTOS.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => { setSelectedPhoto(url); setCustomPhotoUrl(url); }}
                    className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                      selectedPhoto === url ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="sample" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              className="px-8 font-bold"
              isLoading={createMutation.isPending}
            >
              Publish Listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
