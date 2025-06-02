import { Building, Search, Users, Scale, Shield } from "lucide-react";
import { BentoCard, BentoGrid } from "./bento-grid";

const features = [
  {
    name: "Find Properties",
    description: "Browse through our curated list of student-friendly properties near Nigerian universities.",
    href: "/properties",
    cta: "Browse Properties",
    background: <img src="https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Property Search" className="h-full w-full object-cover" />,
    className: "lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-3",
  },
  {
    name: "Match with Roommates",
    description: "Find compatible roommates using our AI-powered matching system with Spotify integration.",
    href: "/roommate-matching",
    cta: "Find Roommates",
    background: <img src="https://images.pexels.com/photos/7015034/pexels-photo-7015034.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\" alt="Roommate Matching\" className="h-full w-full object-cover" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-2",
  },
  {
    name: "Legal Protection",
    description: "Get instant legal advice and document reviews from our AI trained in Nigerian tenancy law.",
    href: "/legal-assistant",
    cta: "Get Legal Help",
    background: <img src="https://images.pexels.com/photos/5668473/pexels-photo-5668473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\" alt="Legal Protection\" className="h-full w-full object-cover" />,
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-2 lg:row-end-3",
  },
  {
    name: "List Properties",
    description: "Are you a landlord? List your properties and reach thousands of potential student tenants.",
    href: "/register",
    cta: "Start Listing",
    background: <img src="https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\" alt="Property Listing\" className="h-full w-full object-cover" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2",
  },
  {
    name: "Verified Properties",
    description: "All properties are verified to ensure safety and security for Nigerian students.",
    href: "/properties",
    cta: "Learn More",
    background: <img src="https://images.pexels.com/photos/7641839/pexels-photo-7641839.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2\" alt="Property Verification\" className="h-full w-full object-cover" />,
    className: "lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-3",
  },
];

function HowToUse() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-text-primary md:text-4xl mb-4">How BAABA.COM Works</h2>
        <p className="text-text-secondary max-w-2xl mx-auto">
          Our AI-powered platform makes it easy to find safe and affordable student housing in Nigeria.
          Here's how you can get started:
        </p>
      </div>
      <BentoGrid className="lg:grid-rows-2">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </section>
  );
}

export { HowToUse };