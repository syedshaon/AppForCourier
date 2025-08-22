// src/components/pages/NotFound.tsx
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Home, ArrowLeft, Search, Mail } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";

const NotFound = () => {
  usePageTitle("Page Not Found");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-9xl font-bold text-orange-500  ">404</h1>
          <h2 className="text-3xl font-bold  mb-4 text-orange-900">Page Not Found</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Oops! It seems like the page you're looking for has been moved, deleted, or never existed.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="mr-2 h-6 w-6" />
                What could have happened?
              </CardTitle>
              <CardDescription>Common reasons you might see this page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>The page may have been moved to a new location</li>
                <li>The URL might have a typo or incorrect address</li>
                <li>The content may have been temporarily removed</li>
                <li>You might not have permission to access this page</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-6 w-6" />
                Need help?
              </CardTitle>
              <CardDescription>We're here to assist you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">If you believe this is an error or need assistance finding what you're looking for, our support team is ready to help.</p>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/contact">Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>

          <Button variant="default" className="border border-b-primary gap-2" asChild>
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
        </div>

        {/* Quick links section */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-secondary text-center mb-6">Popular Pages</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4  ">
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/services">Services</Link>
            </Button>
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/contact">Contact</Link>
            </Button>

            <Button variant="default" className="border border-b-primary" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
