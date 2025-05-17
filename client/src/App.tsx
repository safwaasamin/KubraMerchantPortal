import { Switch, Route, useLocation } from "wouter";
import LoginPage from "./pages/LoginPage";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import ShopPage from "./pages/ShopPage";
import RentalPage from "./pages/RentalPage";
import SalesPage from "./pages/SalesPage";
import NotificationsPage from "./pages/NotificationsPage";
import NotFound from "./pages/not-found";
import { useMerchant } from "./hooks/use-merchant";

function App() {
  const [location] = useLocation();
  const { merchant, loading } = useMerchant();

  // If loading, show a simple loading screen
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated and not on login page, redirect to login
  if (!merchant && location !== "/login") {
    window.location.href = "/login";
    return null;
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      {/* Protected routes wrapped in Layout */}
      <Route path="/">
        <Layout>
          <DashboardPage />
        </Layout>
      </Route>
      <Route path="/products">
        <Layout>
          <ProductsPage />
        </Layout>
      </Route>
      <Route path="/orders">
        <Layout>
          <OrdersPage />
        </Layout>
      </Route>
      <Route path="/shop">
        <Layout>
          <ShopPage />
        </Layout>
      </Route>
      <Route path="/rental">
        <Layout>
          <RentalPage />
        </Layout>
      </Route>
      <Route path="/sales">
        <Layout>
          <SalesPage />
        </Layout>
      </Route>
      <Route path="/notifications">
        <Layout>
          <NotificationsPage />
        </Layout>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

export default App;
