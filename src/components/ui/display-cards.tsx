import { cn } from "../../lib/utils";
import { HomeIcon } from "../icons/HomeIcon";
import { BuildingIcon } from "../icons/BuildingIcon";
import { RoommateIcon } from "../icons/RoommateIcon";
import { LegalIcon } from "../icons/LegalIcon";

interface DisplayCardProps {
  className?: string;
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  date?: string;
  iconClassName?: string;
  titleClassName?: string;
}

function DisplayCard({
  className,
  icon,
  title = "Featured",
  description = "Discover amazing content",
  date = "Just now",
  iconClassName = "text-accent-blue",
  titleClassName = "text-text-primary",
}: DisplayCardProps) {
  return (
    <div
      className={cn(
        "relative flex h-36 w-full select-none flex-col justify-between rounded-xl border-2 bg-card/70 backdrop-blur-sm px-4 py-3 transition-all duration-500 hover:border-nav/20 hover:bg-card [&>*]:flex [&>*]:items-center [&>*]:gap-2",
        className
      )}
    >
      <div>
        <span className="relative inline-block rounded-full bg-accent-blue/20 p-1">
          {icon}
        </span>
        <p className={cn("text-lg font-medium", titleClassName)}>{title}</p>
      </div>
      <p className="whitespace-normal text-lg text-text-secondary">{description}</p>
      <p className="text-text-muted">{date}</p>
    </div>
  );
}

interface DisplayCardsProps {
  cards?: DisplayCardProps[];
}

export default function DisplayCards({ cards }: DisplayCardsProps) {
  const defaultCards = [
    {
      icon: <BuildingIcon className="h-4 w-4 text-accent-blue" />,
      title: "Find Properties",
      description: "Browse through our curated list of student-friendly properties"
    },
    {
      icon: <RoommateIcon className="h-4 w-4 text-accent-blue" />,
      title: "Match with Roommates",
      description: "Find compatible roommates using our AI-powered matching system"
    },
    {
      icon: <LegalIcon className="h-4 w-4 text-accent-blue" />,
      title: "Legal Protection",
      description: "Get instant legal advice and document reviews"
    },
    {
      icon: <BuildingIcon className="h-4 w-4 text-accent-blue" />,
      title: "List Properties",
      description: "List your properties and reach thousands of students"
    },
    {
      icon: <BuildingIcon className="h-4 w-4 text-accent-blue" />,
      title: "Verified Properties",
      description: "All properties are verified for student safety"
    }
  ];

  const displayCards = cards || defaultCards;

  return (
    <div className="grid gap-6 opacity-100 animate-in fade-in-0 duration-700">
      {displayCards.map((cardProps, index) => (
        <DisplayCard key={index} {...cardProps} />
      ))}
    </div>
  );
}