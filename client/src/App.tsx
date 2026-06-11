import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/authContext";
import { PortalSettingsProvider, usePortalSettings } from "@/lib/portalSettingsContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Induction from "@/pages/Induction";
import Training from "@/pages/Training";
import CareerMap from "@/pages/CareerMap";
import RolePlaybook from "@/pages/RolePlaybook";
import Resources from "@/pages/Resources";
import Milestones from "@/pages/Milestones";
import Team from "@/pages/Team";
import AdminUsers from "@/pages/admin/Users";
import AdminTemplates from "@/pages/admin/Templates";
import AdminRoles from "@/pages/admin/Roles";
import AdminResources from "@/pages/admin/Resources";
import AdminCertificates from "@/pages/admin/Certificates";
import Organisation from "@/pages/admin/Organisation";
import SharedTrainingMatrix from "@/pages/SharedTrainingMatrix";
import SharedInduction from "@/pages/SharedInduction";
import ArchitectStudio from "@/pages/ArchitectStudio";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAuthLoading } = useAuth();
  const [location] = useLocation();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    sessionStorage.setItem("postLoginRedirect", location);
    return <Redirect to="/" />;
  }

  return <Component />;
}

function PrimaryColorApplier() {
  const { getSetting } = usePortalSettings();
  const primaryColor = getSetting('branding.primaryColor');

  useEffect(() => {
    if (primaryColor && primaryColor !== '222 47% 20%') {
      document.documentElement.style.setProperty('--primary', primaryColor);
      document.documentElement.style.setProperty('--sidebar-primary', primaryColor);
    } else {
      document.documentElement.style.removeProperty('--primary');
      document.documentElement.style.removeProperty('--sidebar-primary');
    }
  }, [primaryColor]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/training-matrix/shared/:token" component={SharedTrainingMatrix} />
      <Route path="/induction/shared/:token" component={SharedInduction} />
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
      <Route path="/career-map">
        {() => <ProtectedRoute component={CareerMap} />}
      </Route>
      <Route path="/role-playbook">
        {() => <ProtectedRoute component={RolePlaybook} />}
      </Route>
      <Route path="/resources">
        {() => <ProtectedRoute component={Resources} />}
      </Route>
      <Route path="/milestones">
        {() => <ProtectedRoute component={Milestones} />}
      </Route>
      <Route path="/team/member/:encodedId">
        {() => <ProtectedRoute component={Team} />}
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
      <Route path="/admin/resources">
        {() => <ProtectedRoute component={AdminResources} />}
      </Route>
      <Route path="/admin/certificates">
        {() => <ProtectedRoute component={AdminCertificates} />}
      </Route>
      <Route path="/organisation">
        {() => <ProtectedRoute component={Organisation} />}
      </Route>
      <Route path="/architect-studio">
        {() => <ProtectedRoute component={ArchitectStudio} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PortalSettingsProvider>
        <AuthProvider>
          <TooltipProvider>
            <PrimaryColorApplier />
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </PortalSettingsProvider>
    </QueryClientProvider>
  );
}

export default App;
