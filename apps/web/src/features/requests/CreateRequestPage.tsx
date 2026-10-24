import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../shared/api/api-client';
import { useAuthStore } from '../auth/auth.store';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { ArrowLeft, ShieldAlert, AlertTriangle, ArrowLeftRight } from 'lucide-react';
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

export function CreateRequestPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Academic Books');
  const [type, setType] = useState<'product' | 'service' | 'exchange'>('product');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [exchangeHave, setExchangeHave] = useState('');
  const [exchangeWant, setExchangeWant] = useState('');
  const [address, setAddress] = useState('AAU Main Campus');
  const [errorMsg, setErrorMsg] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        budgetMin: budgetMin ? parseFloat(budgetMin) : undefined,
        budgetMax: budgetMax ? parseFloat(budgetMax) : undefined,
        location: address ? { address } : undefined,
      };

      if (type === 'exchange') {
        payload.exchangeHave = exchangeHave.trim();
        payload.exchangeWant = exchangeWant.trim();
      }

      const res = await api.post('/requests', payload);
      return res.data.data.request;
    },
    onSuccess: () => {
      navigate('/requests');
    },
    onError: (err: any) => {
      setErrorMsg(
        getErrorMessage(
          err,
          'Failed to post demand. Please verify your title (min 5 chars) and description (min 20 chars).'
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
            ? 'Your campus ID submission is currently being reviewed by university administration. You will be able to post demands once your ID is approved.'
            : 'To protect student transactions and maintain campus trust, only verified students and staff can post campus demands.'}
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
      setErrorMsg('Demand title must be at least 5 characters long.');
      return;
    }

    if (description.trim().length < 20) {
      setErrorMsg(
        `Description must be at least 20 characters long (currently ${description.trim().length}). Please provide more details on what you need.`
      );
      return;
    }

    if (budgetMin && budgetMax && parseFloat(budgetMin) > parseFloat(budgetMax)) {
      setErrorMsg('Minimum budget cannot be greater than maximum budget.');
      return;
    }

    if (type === 'exchange') {
      if (!exchangeHave.trim() || !exchangeWant.trim()) {
        setErrorMsg('Both "What You Have" and "What You Want In Return" are required for exchange requests.');
        return;
      }
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
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">Post a Student Demand</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Let the campus know what you are looking to buy, rent, exchange, or find.
          </p>
        </div>

        {errorMsg && (
          <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-4 text-xs text-red-800 dark:text-red-200 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Cannot Post Demand</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Input
              label="What are you looking for?"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="e.g. Needed: Discrete Mathematics 7th Edition / Looking for Roommate"
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
                Demand Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="product">Item / Product</option>
                <option value="service">Service / Tutoring</option>
                <option value="exchange">Exchange / Trade</option>
              </select>
            </div>
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Budget (ETB)"
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              placeholder="e.g. 500"
            />
            <Input
              label="Maximum Budget (ETB)"
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              placeholder="e.g. 1000"
            />
          </div>

          {/* Exchange Have / Want when Demand Type is Exchange */}
          {type === 'exchange' && (
            <div className="rounded-2xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-800 dark:text-purple-300">
                <ArrowLeftRight className="h-4 w-4" />
                <span>Exchange & Trade Details</span>
              </div>

              <div>
                <Input
                  label="What do you have to offer? (Exchange Have)"
                  required
                  value={exchangeHave}
                  onChange={(e) => {
                    setExchangeHave(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. TI-84 Plus Graphic Calculator in mint condition"
                />
              </div>

              <div>
                <Input
                  label="What do you want in return? (Exchange Want)"
                  required
                  value={exchangeWant}
                  onChange={(e) => {
                    setExchangeWant(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="e.g. Arduino Starter Kit or Organic Chemistry Textbook"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Details & Urgency
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Describe your requirement, course code, how quickly you need it, and preferred meet-up spot..."
              className="w-full rounded-xl border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-muted-foreground text-right mt-1">
              {description.trim().length}/20 characters minimum
            </p>
          </div>

          <Input
            label="Preferred Campus Location"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. AAU 6-Kilo Library or Sidist Kilo"
          />

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
              Post Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateRequestPage;
