# BAABA.ng Frontend

BAABA.ng is an AI-powered student housing platform designed specifically for Nigerian students. The platform connects students with safe, affordable housing while providing legal protection, roommate matching, and comprehensive property management tools.

## 🎨 Design Approach

### Layout Philosophy
- **Mobile-first responsive design** with breakpoints optimized for Nigerian mobile usage patterns
- **Progressive disclosure** to manage complexity and reveal features contextually
- **Single Responsibility Principle** applied to all views (browse, manage, dashboard)
- **Consistent 8px spacing system** throughout the interface
- **Apple-level design aesthetics** with meticulous attention to detail

### Responsiveness Strategy
- Fluid grid systems using CSS Grid and Flexbox
- Adaptive navigation (desktop header, mobile bottom nav)
- Responsive typography with proper line spacing (150% for body, 120% for headings)
- Optimized touch targets for mobile interactions
- Contextual UI patterns (modals on desktop, full-screen on mobile)

### Theme & Visual Identity
- **Dark-first design** with sophisticated color palette
- **Comprehensive color system** with 6+ color ramps (primary, secondary, accent, success, warning, error)
- **Brand colors**: Accent Blue (#7B3F00) and Accent Green (#A05000)
- **Typography**: Plus Jakarta Sans font family with 3 weight variations maximum
- **Micro-interactions** and hover states for enhanced user engagement

## 📚 Libraries & Technologies

### Core Framework
- **React 18.2.0** - Modern React with hooks and concurrent features
- **TypeScript 5.3.3** - Type safety and developer experience
- **Vite 5.0.7** - Fast build tool and development server
- **React Router DOM 6.20.1** - Client-side routing

### UI & Styling
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **Tailwind Animate 1.0.7** - Animation utilities
- **Class Variance Authority 0.7.0** - Component variant management
- **Clsx 2.0.0** & **Tailwind Merge 2.1.0** - Conditional class handling

### Animation & Interaction
- **Framer Motion 10.16.16** - Advanced animations and gestures
- **@splinetool/react-spline 2.2.6** - 3D graphics and interactions

### Form Management
- **React Hook Form 7.49.0** - Performant form handling
- **@hookform/resolvers 3.3.2** - Form validation resolvers
- **Zod 3.22.4** - Schema validation

### Data Management
- **@tanstack/react-query 5.13.4** - Server state management
- **@supabase/supabase-js 2.39.0** - Backend integration
- **UUID 9.0.1** - Unique identifier generation

### UI Components
- **@radix-ui/react-avatar 1.0.4** - Accessible avatar component
- **@radix-ui/react-label 2.0.2** - Form label primitives
- **@radix-ui/react-separator 1.0.3** - Visual separators
- **Lucide React 0.294.0** - Icon library

### Utilities
- **Date-fns 2.30.0** - Date manipulation
- **usehooks-ts 2.9.1** - Custom React hooks

## 📁 Folder Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, inputs, cards)
│   ├── forms/           # Form-specific components
│   ├── dashboard/       # Dashboard-specific components
│   └── icons/           # Custom icon components
├── pages/               # Page components organized by feature
│   ├── auth/            # Authentication pages (login, register)
│   ├── dashboard/       # Dashboard pages by user role
│   │   ├── tenant/      # Tenant-specific dashboard pages
│   │   ├── landlord/    # Landlord-specific dashboard pages
│   │   └── agent/       # Agent-specific dashboard pages
│   ├── properties/      # Property listing and detail pages
│   ├── roommates/       # Roommate matching pages
│   ├── legal/           # Legal assistant pages
│   └── subscription/    # Subscription and pricing pages
├── layouts/             # Layout components
│   ├── MainLayout.tsx   # Public pages layout
│   ├── AuthLayout.tsx   # Authentication pages layout
│   └── DashboardLayout.tsx # Dashboard layout with navigation
├── context/             # React context providers
│   └── AuthContext.tsx  # Authentication state management
├── hooks/               # Custom React hooks
│   └── useDashboard.ts  # Dashboard-related data fetching
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   └── utils.ts         # Common utility functions
├── types/               # TypeScript type definitions
│   ├── index.ts         # Main type definitions
│   └── supabase.ts      # Generated Supabase types
└── main.tsx             # Application entry point
```

## 🎯 Component Styling & Reuse Strategy

### Design System Components
- **Atomic Design Principles**: Base components (Button, Input) → Composed components (PropertyCard) → Page layouts
- **Variant-based styling** using `class-variance-authority` for consistent component APIs
- **Compound components** for complex UI patterns (Card with Header, Content, Footer)
- **Polymorphic components** supporting `as` prop for flexible element rendering

### Styling Patterns
- **CSS-in-JS avoided** in favor of Tailwind utility classes
- **Component-specific styles** using Tailwind's `@layer components` directive
- **Consistent spacing** using Tailwind's spacing scale (4, 6, 8, 12, 16, 24)
- **Color system** leveraging CSS custom properties for theme consistency

### Reusability Features
- **Flexible prop interfaces** with sensible defaults
- **Composition over inheritance** for component extension
- **Consistent naming conventions** (PascalCase for components, camelCase for props)
- **TypeScript interfaces** for prop validation and IntelliSense

## ✨ Animations & Transitions

### Animation Libraries
- **Framer Motion** for complex animations and page transitions
- **Tailwind Animate** for simple CSS animations
- **Custom keyframes** defined in `tailwind.config.js`

### Animation Patterns
- **Page transitions** with fade and slide effects
- **Micro-interactions** on buttons, cards, and form elements
- **Loading states** with skeleton screens and spinners
- **Stagger animations** for list items and grid layouts
- **Gesture-based interactions** for mobile touch interfaces

### Performance Considerations
- **AnimatePresence** for mount/unmount animations
- **Layout animations** using Framer Motion's layout prop
- **Reduced motion** support for accessibility
- **GPU-accelerated transforms** for smooth performance

## ⚙️ Key Configurations

### Tailwind Configuration (`tailwind.config.js`)
- **Custom color palette** with CSS custom properties
- **Extended spacing scale** and border radius values
- **Custom animations** and keyframes
- **Typography scale** with consistent line heights
- **Container configuration** for responsive layouts

### Theme Setup (`src/index.css`)
- **CSS custom properties** for color system
- **Dark theme variables** as default
- **Component-specific styles** in `@layer components`
- **Global styles** for consistent typography

### TypeScript Configuration
- **Strict mode enabled** for type safety
- **Path mapping** for clean imports
- **Component prop types** for better DX
- **Supabase type generation** for database schema

### Vite Configuration (`vite.config.ts`)
- **React plugin** for JSX support
- **Optimized dependencies** for better performance
- **Development server** configuration
- **Build optimizations** for production

## 🚀 Running the Frontend Locally

### Prerequisites
- **Node.js 18+** (recommended: use nvm for version management)
- **npm** or **yarn** package manager
- **Git** for version control

### Environment Setup
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd baaba-frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment variables**:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open in browser**:
   Navigate to `http://localhost:5173`

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

### Development Workflow
1. **Component development** in isolation using the existing component library
2. **Type-first development** with TypeScript interfaces
3. **Mobile-first responsive design** testing
4. **Accessibility testing** with screen readers and keyboard navigation
5. **Performance monitoring** using browser dev tools

### Build & Deployment
- **Production build** optimized for performance
- **Static asset optimization** with Vite
- **Environment-specific configurations** for staging/production
- **Vercel deployment** with automatic previews

## 🏗️ Architecture Decisions

### State Management
- **React Query** for server state and caching
- **React Context** for authentication state
- **Local state** with useState for component-specific data
- **Form state** managed by React Hook Form

### Code Organization
- **Feature-based folder structure** for scalability
- **Separation of concerns** between UI, business logic, and data
- **Custom hooks** for reusable logic
- **Type definitions** centralized in `/types` directory

### Performance Optimizations
- **Code splitting** with React.lazy for route-based chunks
- **Image optimization** with proper loading strategies
- **Bundle analysis** and optimization
- **Caching strategies** with React Query

---

Built with ❤️ for Nigerian students by the BAABA.ng team.