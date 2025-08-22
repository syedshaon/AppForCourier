// src/components/pages/Pricing.tsx
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const plans = [
    {
      name: "Basic",
      description: "Perfect for occasional senders",
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      features: ["Up to 5 shipments per month", "Basic tracking", "Email support", "3-5 business day delivery", "Cash on Delivery available"],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Professional",
      description: "Ideal for small businesses",
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      features: ["Up to 20 shipments per month", "Advanced real-time tracking", "Priority support", "2-3 business day delivery", "Cash on Delivery included", "Scheduled pickups", "Delivery notifications"],
      buttonText: "Get Started",
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For high-volume shipping needs",
      monthlyPrice: 99.99,
      annualPrice: 999.99,
      features: ["Unlimited shipments", "Premium real-time tracking", "24/7 dedicated support", "Next-day delivery", "All features included", "Custom reporting", "API access", "Account manager"],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  const additionalServices = [
    {
      name: "Express Delivery",
      price: "+$15.00",
      description: "Next business day delivery",
    },
    {
      name: "Saturday Delivery",
      price: "+$12.50",
      description: "Weekend delivery service",
    },
    {
      name: "Insurance Coverage",
      price: "+2% of value",
      description: "Additional package insurance",
    },
    {
      name: "Special Handling",
      price: "+$8.00",
      description: "Fragile or special items",
    },
  ];

  usePageTitle("Pricing Plans");

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Pricing Plans</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Choose the plan that works best for your shipping needs. All plans include our premium delivery services.</p>

        <div className="flex justify-center mt-6">
          <div className="inline-flex rounded-md bg-muted p-1">
            <button type="button" className={`px-4 py-2 text-sm font-medium rounded-md ${billingCycle === "monthly" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`} onClick={() => setBillingCycle("monthly")}>
              Monthly
            </button>
            <button type="button" className={`px-4 py-2 text-sm font-medium rounded-md ${billingCycle === "annual" ? "bg-background text-foreground shadow" : "text-muted-foreground"}`} onClick={() => setBillingCycle("annual")}>
              Annual (Save 16%)
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => (
          <Card key={index} className={`flex flex-col ${plan.popular ? "border-2 border-primary shadow-lg" : ""}`}>
            {plan.popular && <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-semibold">Most Popular</div>}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">${billingCycle === "monthly" ? plan.monthlyPrice : plan.annualPrice}</span>
                <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-primary mr-2" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Additional Services</h2>
        <p className="text-muted-foreground">Enhance your shipping experience with our premium add-on services</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {additionalServices.map((service, index) => (
          <Card key={index} className="text-center">
            <CardHeader>
              <CardTitle className="text-lg">{service.name}</CardTitle>
              <CardDescription className="text-primary font-semibold text-xl">{service.price}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{service.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted border-none">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Need a custom solution?</h3>
            <p className="text-muted-foreground mb-4">Contact our sales team to discuss enterprise-level pricing and custom features</p>
            <Button variant="outline">Contact Sales</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pricing;
