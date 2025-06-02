import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "../../lib/utils";
import Button from "./Button";

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BentoCard = ({
  name,
  className,
  background,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 flex min-h-[22rem] flex-col justify-between overflow-hidden rounded-xl",
      "bg-card border border-nav transition-all duration-300",
      "hover:scale-[1.02] hover:shadow-lg hover:shadow-accent-blue/5",
      className,
    )}
  >
    {/* Background Image Container */}
    <div className="absolute inset-0 z-0">
      {background}
      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-transparent" />
    </div>

    {/* Content */}
    <div className="relative z-10 flex transform-gpu flex-col gap-1 p-6 transition-all duration-300 group-hover:-translate-y-10">
      <h3 className="text-xl font-semibold text-text-primary">
        {name}
      </h3>
      <p className="max-w-lg text-text-secondary">{description}</p>
    </div>

    {/* CTA Button */}
    <div
      className={cn(
        "absolute bottom-0 flex w-full translate-y-10 transform-gpu flex-row items-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button variant="secondary" className="hover:bg-accent-blue hover:text-background" asChild>
        <a href={href} className="flex items-center">
          {cta}
          <ArrowRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>

    {/* Hover Overlay */}
    <div className="absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-nav/10" />
  </div>
);

export { BentoCard, BentoGrid };