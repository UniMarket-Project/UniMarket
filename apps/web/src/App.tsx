import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './features/auth/auth.store';
import { AppLayout } from './shared/components/layout/AppLayout';
import { PublicLayout } from './shared/components/layout/PublicLayout';
import { LandingPage } from './features/landing/pages/LandingPage';

import { ListingsFeedPage } from './features/listings/ListingsFeedPage';
import { ListingDetailPage } from './features/listings/ListingDetailPage';
import { CreateListingPage } from './features/listings/CreateListingPage';
import { MyListingsPage } from './features/listings/MyListingsPage';
import { RequestsFeedPage } from './features/requests/RequestsFeedPage';
import { CreateRequestPage } from './features/requests/CreateRequestPage';
import { DealsPage } from './features/deals/DealsPage';
import { MessagesPage } from './features/chat/MessagesPage';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { VerificationPage } from './features/verification/VerificationPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { AdminDashboardPage } from './features/admin/AdminDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
    },
  },
});

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function RootRoute() {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <AppLayout>
        <ListingsFeedPage />
      </AppLayout>
    );
  }

  return (
    <PublicLayout>
      <LandingPage />
    </PublicLayout>
  );
}

export function App() {
  const { fetchMe } = useAuthStore();

  useEffect(() => {
    // Attempt silent session restore on initial app mount
    fetchMe();
  }, [fetchMe]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Dynamic Root Route: Landing for guest visitors, Feed for authenticated members */}
          <Route path="/" element={<RootRoute />} />

          {/* Dedicated public landing page route */}
          <Route
            path="/landing"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />

          {/* Public / Standard App Shell */}
          <Route element={<AppLayout />}>
            <Route path="/browse" element={<ListingsFeedPage />} />
            <Route path="/listings/:id" element={<ListingDetailPage />} />
            <Route path="/requests" element={<RequestsFeedPage />} />
            <Route path="/users/:id" element={<ProfilePage />} />

            {/* Authenticated Routes */}
            <Route
              path="/create-listing"
              element={
                <ProtectedRoute>
                  <CreateListingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <MyListingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-request"
              element={
                <ProtectedRoute>
                  <CreateRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deals"
              element={
                <ProtectedRoute>
                  <DealsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/verify"
              element={
                <ProtectedRoute>
                  <VerificationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Dedicated Shells */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
