// src/components/pages/TermsAndConditions.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { usePageTitle } from "../../hooks/usePageTitle";

const TermsAndConditions = () => {
  usePageTitle("Terms and Conditions");
  return (
    <div className="container mx-auto py-10">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Terms and Conditions</CardTitle>
            <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">By accessing or using Rui Courier services, you agree to be bound by these Terms and Conditions. If you do not agree to all the terms and conditions, you may not access our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Services Provided</h2>
              <p className="text-muted-foreground">Rui Courier provides parcel delivery and logistics services including but not limited to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Parcel pickup and delivery</li>
                <li>Real-time tracking services</li>
                <li>Cash on Delivery (COD) services</li>
                <li>Delivery status updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
              <p className="text-muted-foreground">As a user of our services, you agree to:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Provide accurate and complete information</li>
                <li>Ensure parcels are properly packaged</li>
                <li>Not ship prohibited or illegal items</li>
                <li>Pay all applicable fees and charges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Prohibited Items</h2>
              <p className="text-muted-foreground">The following items are strictly prohibited:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Illegal substances and drugs</li>
                <li>Weapons and firearms</li>
                <li>Perishable goods without proper packaging</li>
                <li>Hazardous materials</li>
                <li>Live animals</li>
                <li>Currency and valuable documents</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Liability Limitations</h2>
              <p className="text-muted-foreground">Rui Courier's liability for loss or damage to parcels is limited to the actual value of the contents or the maximum declared value, whichever is lower. We are not liable for:</p>
              <ul className="list-disc pl-6 text-muted-foreground mt-2 space-y-1">
                <li>Consequential or indirect damages</li>
                <li>Delays caused by circumstances beyond our control</li>
                <li>Incorrect addressing provided by the sender</li>
                <li>Items improperly packaged</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Payment Terms</h2>
              <p className="text-muted-foreground">All payments must be made in accordance with our pricing structure. For COD shipments, the delivery agent will collect payment upon delivery. Late payments may result in service suspension.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy Policy</h2>
              <p className="text-muted-foreground">Your privacy is important to us. Please refer to our separate Privacy Policy for information on how we collect, use, and protect your personal data.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
              <p className="text-muted-foreground">We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Governing Law</h2>
              <p className="text-muted-foreground">These terms are governed by the laws of the jurisdiction where Rui Courier is based. Any disputes shall be resolved in the courts of that jurisdiction.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms and Conditions, please contact us at:
                <br />
                Email: legal@ruicourier.com
                <br />
                Phone: (123) 456-7890
                <br />
                Address: 123 Courier Street, Delivery City, DC 12345
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
