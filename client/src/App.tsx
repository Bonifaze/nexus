import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import CreatePost from "@/pages/create-post";
import Schedule from "@/pages/schedule";
import ContentLibrary from "@/pages/content-library";
import Analytics from "@/pages/analytics";
import SocialAccounts from "@/pages/social-accounts";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-post" component={CreatePost} />
      <Route path="/schedule" component={Schedule} />
      <Route path="/content-library" component={ContentLibrary} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/social-accounts" component={SocialAccounts} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
