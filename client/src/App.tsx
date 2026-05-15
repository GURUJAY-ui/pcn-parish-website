import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Donations from "./pages/Donations";
import staff from "./pages/Staff";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import About from "./pages/About";
import Sermons from "./pages/Sermons";
import Ministries from "./pages/Ministries";
import Testimonies from "./pages/Testimonies";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import { JSX, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { api } from "./lib/api";


function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      if (api.isLoggedIn()) {
        setIsLoggedIn(true);
      } else {
        // Try to restore session via refresh token (httpOnly cookie)
        const restored = await api.tryRestoreSession();
        if (!restored) {
          navigate("/admin/login");
        }
        setIsLoggedIn(restored);
      }
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  if (isLoading) return null;
  if (!isLoggedIn) return null;
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/donations"} component={Donations} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin"} component={() => <ProtectedRoute component={Admin} />} />
      <Route path={"/about"} component={About} />
      <Route path={"/sermons"} component={Sermons} />
      <Route path={"/ministries"} component={Ministries} />
      <Route path={"/testimonies"} component={Testimonies} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/gallery"} component={Gallery} />
      <Route path={"/events"} component={Events} />
      <Route path={"/staff"} component={staff} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <TooltipProvider>
          <Toaster />
          <ThemeToggle />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
