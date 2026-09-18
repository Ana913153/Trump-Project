import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "@/pages/Admin";
import Donation from "@/pages/Donation";
import Home from "@/pages/Home";
import ResetPassword from "./pages/ResetPassword";
import InfoPage from "./pages/InfoPage";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/donate" component={Donation} /><Route path="/admin" component={Admin} /><Route path="/reset-password" component={ResetPassword} /><Route path="/about" component={InfoPage} /><Route path="/contact" component={InfoPage} /><Route path="/tax-policy" component={InfoPage} /><Route path="/privacy" component={InfoPage} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="top-right" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
