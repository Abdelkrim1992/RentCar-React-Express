import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import CarDetails from "@/pages/CarDetails";
import { Suspense, lazy } from "react";

// Lazy load admin pages for better performance
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCars = lazy(() => import("@/pages/admin/Cars"));
const AdminSettings = lazy(() => import("@/pages/admin/Settings"));

// Loading placeholder
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-16 h-16 border-4 border-t-[#6843EC] border-b-[#D2FF3A] border-l-[#6843EC] border-r-[#D2FF3A] rounded-full animate-spin"></div>
  </div>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/cars/:id" component={CarDetails} />
      
      {/* Admin routes with lazy loading */}
      <Route path="/admin">
        <Suspense fallback={<Loading />}>
          <AdminDashboard />
        </Suspense>
      </Route>
      <Route path="/admin/cars">
        <Suspense fallback={<Loading />}>
          <AdminCars />
        </Suspense>
      </Route>
      <Route path="/admin/settings">
        <Suspense fallback={<Loading />}>
          <AdminSettings />
        </Suspense>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
