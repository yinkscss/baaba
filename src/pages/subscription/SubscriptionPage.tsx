import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Shield, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free',
      price: 0,
      interval: 'month',
      description: 'Basic features for students getting started',
      features: [
        'Browse property listings',
        'Basic roommate matching',
        'Limited legal assistant access',
        'Email support'
      ],
      buttonText: 'Get Started',
      buttonVariant: 'outline' as const,
      icon: Shield
    },
    {
      name: 'Student Pro',
      price: 1999,
      interval: 'month',
      description: 'Advanced features for serious student housing seekers',
      features: [
        'All Free features',
        'Advanced roommate matching with Spotify integration',
        'Unlimited AI legal assistant access',
        'Priority property applications',
        'Virtual property tours',
        'Priority support'
      ],
      buttonText: 'Get Student Pro',
      buttonVariant: 'primary' as const,
      popular: true,
      icon: Star
    },
    {
      name: 'Landlord Pro',
      price: 5999,
      interval: 'month',
      description: 'Professional tools for property owners and agents',
      features: [
        'Unlimited property listings',
        'Featured property placement',
        'Tenant verification service',
        'Legal document templates',
        'Advanced analytics dashboard',
        'Priority support'
      ],
      buttonText: 'Get Landlord Pro',
      buttonVariant: 'outline' as const,
      icon: Zap
    }
  ];

  return (
    <div className="container mx-auto px-4 pb-12 pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="mb-4 text-3xl font-bold text-text-primary md:text-4xl">
          Choose Your Perfect Plan
        </h1>
        <p className="mb-8 text-text-secondary">
          Get access to advanced features and find your perfect student housing faster.
        </p>

        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className={`relative h-full border ${
                plan.popular ? 'border-accent-blue' : 'border-nav'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent-blue px-4 py-1 text-xs font-semibold text-background">
                    Most Popular
                  </div>
                )}
                
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent-blue/10">
                    <plan.icon className="h-6 w-6 text-accent-blue" />
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold text-text-primary">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-text-secondary">/{plan.interval}</span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="mb-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-accent-green" />
                        <span className="text-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    variant={plan.buttonVariant}
                    className="w-full"
                    onClick={() => navigate('/register')}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 rounded-lg bg-card p-6 text-left">
          <h2 className="mb-4 text-xl font-bold text-text-primary">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium text-text-primary">Can I cancel my subscription?</h3>
              <p className="text-text-secondary">
                Yes, you can cancel your subscription at any time. You'll continue to have access to your plan's features until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-medium text-text-primary">How do I upgrade my plan?</h3>
              <p className="text-text-secondary">
                You can upgrade your plan at any time from your account settings. The new rate will be prorated based on your current billing period.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-medium text-text-primary">Do you offer student discounts?</h3>
              <p className="text-text-secondary">
                Our Student Pro plan is already specially priced for students. Make sure to sign up with your student email to get access to additional benefits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;