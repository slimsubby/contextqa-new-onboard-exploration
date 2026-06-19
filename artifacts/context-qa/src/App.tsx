import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoginPage from "@/pages/login";
import SignUpPage from "@/pages/signup";
import DashboardPage from "@/pages/dashboard";
import TestsPage from "@/pages/tests";
import ExecutionPage from "@/pages/execution";
import SettingsPage from "@/pages/settings";
import ContextPage from "@/pages/context";
import DataProfileEditor from "@/pages/DataProfileEditor";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/tests" component={TestsPage} />
      <Route path="/execution/:id" component={ExecutionPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/context" component={ContextPage} />
      <Route path="/tests/data-profile/:id" component={DataProfileEditor} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
