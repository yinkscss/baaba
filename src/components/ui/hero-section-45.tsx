import React from "react";
import { HelpingHand, Users, Scale } from "lucide-react";
import { Badge } from "./badge";
import { Separator } from "./separator";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface HeroSection45Props {
  badge?: string;
  heading: string;
  imageSrc?: string;
  imageAlt?: string;
  features?: Feature[];
}

export function HeroSection45({
  badge = "BAABA.COM",
  heading = "AI-Powered Solutions for Your Housing Journey",
  imageSrc = "https://images.pexels.com/photos/7245333/pexels-photo-7245333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  imageAlt = "Student housing platform",
  features = [
    {
      icon: <Scale className="h-auto w-5" />,
      title: "AI Legal Assistant",
      description:
        "Get instant legal advice and document reviews powered by AI trained in Nigerian tenancy law.",
    },
    {
      icon: <Users className="h-auto w-5" />,
      title: "Smart Roommate Matching",
      description:
        "Find your perfect roommate match using our AI-powered compatibility system with Spotify integration.",
    },
    {
      icon: <HelpingHand className="h-auto w-5" />,
      title: "Student Support",
      description:
        "24/7 assistance with housing-related queries, from property search to lease signing.",
    },
  ],
}: HeroSection45Props) {
  return (
    <section className="py-32">
      <div className="container mx-auto overflow-hidden">
        <div className="mb-20 flex flex-col items-center gap-6 text-center">
          <Badge variant="outline\" className="border-accent-blue text-accent-blue">{badge}</Badge>
          <h2 className="text-4xl font-semibold text-text-primary lg:text-5xl">{heading}</h2>
        </div>
        <div className="relative mx-auto max-w-screen-lg">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="aspect-video max-h-[500px] w-full rounded-xl object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute -right-28 -top-28 -z-10 aspect-video h-72 w-96 opacity-40 [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] sm:bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)]"></div>
          <div className="absolute -left-28 -top-28 -z-10 aspect-video h-72 w-96 opacity-40 [background-size:12px_12px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_20%,transparent_100%)] sm:bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)]"></div>
        </div>
        <div className="mx-auto mt-10 flex max-w-screen-lg flex-col md:flex-row">
          {features.map((feature, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <Separator
                  orientation="vertical"
                  className="mx-6 hidden h-auto w-[2px] bg-gradient-to-b from-nav via-transparent to-nav md:block"
                />
              )}
              <div className="flex grow basis-0 flex-col rounded-md bg-card p-4">
                <div className="mb-6 flex size-10 items-center justify-center rounded-full bg-accent-blue/10">
                  {feature.icon}
                </div>
                <h3 className="mb-2 font-semibold text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-secondary">
                  {feature.description}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}