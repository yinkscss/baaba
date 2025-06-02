import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { DivideIcon as LucideIcon, LogIn } from "lucide-react"
import { cn } from "../../lib/utils"
import Button from "../ui/Button"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(items.find(item => item.url === location.pathname)?.name || items[0].name);
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50 top-4 sm:top-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-nav backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        <div className="flex items-center gap-3">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name

            return (
              <Link
                key={item.name}
                to={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                  "text-text-secondary hover:text-text-primary",
                  isActive && "bg-nav text-text-primary",
                )}
              >
                <span className="hidden md:inline">{item.name}</span>
                <span className="md:hidden">
                  <Icon className={item.name === "Home" ? "h-6" : item.name === "Properties" ? "h-7" : item.name === "Legal" ? "h-7" : "h-8"} strokeWidth={2.5} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="lamp"
                    className="absolute inset-0 w-full bg-accent-blue/5 rounded-full -z-10"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent-blue rounded-t-full">
                      <div className="absolute w-12 h-6 bg-accent-blue/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-accent-blue/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-accent-blue/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </Link>
            )
          })}
        </div>

        {/* Sign In Icon */}
        <Button
          variant="primary"
          size="icon"
          className="hidden md:flex items-center justify-center ml-2 h-9 w-9"
          onClick={() => navigate('/login')}
          title="Sign In"
        >
          <LogIn size={16} />
        </Button>
      </div>
    </div>
  )
}