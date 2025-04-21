import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "./lib/store";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CarDetails from "@/pages/CarDetails";
import BookingPage from "@/pages/BookingPage";
import MyBookings from "@/pages/MyBookings";
import { Suspense, lazy } from "react";
import { AuthProvider, ProtectedRoute } from "@/hooks/use-auth";

// Lazy load admin pages for better performance
const AdminLogin = lazy(() => import("@/pages/admin/Login"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCars = lazy(() => import("@/pages/admin/Cars"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));
const AdminAvailability = lazy(() => import("@/pages/admin/Availability"));
const AdminBookings = lazy(() => import("@/pages/admin/Bookings"));
const AdminCustomers = lazy(() => import("@/pages/admin/Customers"));

// Minimal loading placeholder - just shows content as it loads
// No spinning animation that could block interaction
const MinimalLoading = () => null;

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cars/:id" component={CarDetails} />
      <Route path="/booking/:carId" component={BookingPage} />
      <Route path="/my-bookings" component={MyBookings} />
      
      {/* Admin login route */}
      <Route path="/admin/login">
        <Suspense fallback={<MinimalLoading />}>
          <AdminLogin />
        </Suspense>
      </Route>
      
      {/* Protected admin routes with lazy loading */}
      <Route path="/admin">
        <Suspense fallback={<MinimalLoading />}>
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path="/admin/cars">
        <Suspense fallback={<MinimalLoading />}>
          <ProtectedRoute>
            <AdminCars />
          </ProtectedRoute>
        </Suspense>
      </Route>
      <Route path="/admin/settings">
        <Suspense fallback={<MinimalLoading />}>
          <ProtectedRoute>
            <AdminSettings />
          </ProtectedRoute>
        </Suspense>
      </Route>
      
      <Route path="/admin/availability">
        <Suspense fallback={<MinimalLoading />}>
          <ProtectedRoute>
            <AdminAvailability />
          </ProtectedRoute>
        </Suspense>
      </Route>
      
      <Route path="/admin/bookings">
        <Suspense fallback={<MinimalLoading />}>
          <ProtectedRoute>
            <AdminBookings />
          </ProtectedRoute>
        </Suspense>
      </Route>
      
      <Route path="/admin/customers">
        <Suspense fallback={<MinimalLoading />}>
          <ProtectedRoute>
            <AdminCustomers />
          </ProtectedRoute>
        </Suspense>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

export default App;
