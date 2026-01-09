import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/authContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Induction from "@/pages/Induction";
import Training from "@/pages/Training";
import Resources from "@/pages/Resources";
import Milestones from "@/pages/Milestones";
import Team from "@/pages/Team";
import AdminUsers from "@/pages/admin/Users";
import AdminTemplates from "@/pages/admin/Templates";
import AdminRoles from "@/pages/admin/Roles";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/induction">
        {() => <ProtectedRoute component={Induction} />}
      </Route>
      <Route path="/training">
        {() => <ProtectedRoute component={Training} />}
      </Route>
      <Route path="/resources">
        {() => <ProtectedRoute component={Resources} />}
      </Route>
      <Route path="/milestones">
        {() => <ProtectedRoute component={Milestones} />}
      </Route>
      <Route path="/team/:id?">
        {() => <ProtectedRoute component={Team} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} />}
      </Route>
      <Route path="/admin/templates">
        {() => <ProtectedRoute component={AdminTemplates} />}
      </Route>
      <Route path="/admin/roles">
        {() => <ProtectedRoute component={AdminRoles} />}
      </Route>
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
