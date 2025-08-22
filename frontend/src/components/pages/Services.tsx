// src/components/pages/Services.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Truck, Clock, Shield, MapPin, Package, Headphones } from "lucide-react";
import { usePageTitle } from "../../hooks/usePageTitle";

const Services = () => {
  const services = [
    {
      icon: <Truck className="h-12 w-12 text-primary" />,
      title: "Express Delivery",
      description: "Fast and reliable delivery services for time-sensitive packages with guaranteed delivery times.",
    },
    {
      icon: <Package className="h-12 w-12 text-primary" />,
      title: "Parcel Services",
      description: "Comprehensive parcel delivery solutions for businesses and individuals of all sizes.",
    },
    {
      icon: <Shield className="h-12 w-12 text-primary" />,
      title: "Secure Handling",
      description: "Your packages are handled with the utmost care and security throughout the delivery process.",
    },
    {
      icon: <MapPin className="h-12 w-12 text-primary" />,
      title: "Real-time Tracking",
      description: "Track your parcels in real-time with our advanced GPS tracking system and receive status updates.",
    },
    {
      icon: <Clock className="h-12 w-12 text-primary" />,
      title: "Scheduled Pickups",
      description: "Convenient scheduled pickup services that work around your busy schedule.",
    },
    {
      icon: <Headphones className="h-12 w-12 text-primary" />,
      title: "Customer Support",
      description: "24/7 customer support to assist you with any questions or concerns about your deliveries.",
    },
  ];

  usePageTitle("Our Services");

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Our Services</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">Discover the comprehensive range of delivery solutions designed to meet all your shipping needs</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {services.map((service, index) => (
          <Card key={index} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-center mb-4">{service.icon}</div>
              <CardTitle className="text-center">{service.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-center">{service.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-muted p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">1</div>
            <h3 className="font-semibold mb-2">Book a Pickup</h3>
            <p className="text-muted-foreground">Schedule a pickup through our website or mobile app at your convenience</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">2</div>
            <h3 className="font-semibold mb-2">We Collect</h3>
            <p className="text-muted-foreground">Our delivery agent will collect your package at the scheduled time</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">3</div>
            <h3 className="font-semibold mb-2">Fast Delivery</h3>
            <p className="text-muted-foreground">Your package is delivered quickly and safely to its destination</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
