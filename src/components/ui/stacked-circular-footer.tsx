import Button from "./Button"
import Input from "./Input"
import { Label } from "./label"
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react"
import { LogoIcon } from "../icons/LogoIcon"
import { Link } from "react-router-dom"

function StackedCircularFooter() {
  return (
    <footer className="bg-background py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          <div className="mb-8 rounded-full">
            <LogoIcon className="h-8 w-8" />
          </div>
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <Link to="/" className="text-text-secondary hover:text-accent-blue">Home</Link>
            <Link to="/properties" className="text-text-secondary hover:text-accent-blue">Properties</Link>
            <Link to="/roommate-matching" className="text-text-secondary hover:text-accent-blue">Roommates</Link>
            <Link to="/legal-assistant" className="text-text-secondary hover:text-accent-blue">Legal Assistant</Link>
            <Link to="/subscription" className="text-text-secondary hover:text-accent-blue">Pricing</Link>
          </nav>
          <div className="mb-8 flex space-x-4">
            <Button variant="outline" size="icon" className="rounded-full">
              <Facebook className="h-4 w-4" />
              <span className="sr-only">Facebook</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Twitter className="h-4 w-4" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Instagram className="h-4 w-4" />
              <span className="sr-only">Instagram</span>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Linkedin className="h-4 w-4" />
              <span className="sr-only">LinkedIn</span>
            </Button>
          </div>
          <div className="mb-8 w-full max-w-md">
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Email</Label>
                <Input id="email" placeholder="Enter your email" type="email" className="rounded-full" />
              </div>
              <Button type="submit" className="rounded-full">Subscribe</Button>
            </form>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} BAABA.ng. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }