import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Instagram, Shield, ArrowRight } from 'lucide-react';
import { SplineScene } from '../../components/ui/spline';
import { Spotlight } from '../../components/ui/spotlight';
import { GlareCard } from '../../components/ui/glare-card';
import { BlurFade } from '../../components/ui/blur-fade';
import { RainbowButton } from '../../components/ui/rainbow-button';
import { StarBorder } from '../../components/ui/star-border';
import { FeatureSteps } from '../../components/ui/feature-section';
import { HeroGeometric } from '../../components/ui/shape-landing-hero';
import { useAuth } from '../../context/AuthContext';

const RoommateLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const features = [
    {
      icon: <Music className="h-6 w-6 text-accent-blue" />,
      title: "Music-Based Matching",
      description: "Connect through shared music taste with Spotify integration"
    },
    {
      icon: <Instagram className="h-6 w-6 text-accent-blue" />,
      title: "Social Compatibility",
      description: "Find roommates with similar interests and lifestyles"
    },
    {
      icon: <Shield className="h-6 w-6 text-accent-blue" />,
      title: "Privacy-First Algorithm",
      description: "Your data is secure and only used with your consent"
    }
  ];

  const howItWorksFeatures = [
    {
      step: "Step 1",
      title: "Connect Your Spotify & Instagram",
      content: "Link your accounts to help us understand your preferences",
      image: "https://images.pexels.com/photos/6146704/pexels-photo-6146704.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      step: "Step 2",
      title: "Complete Your Lifestyle Profile",
      content: "Tell us about your habits, schedule, and living preferences",
      image: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      step: "Step 3",
      title: "Receive Top Matches in Seconds",
      content: "Get matched with compatible roommates instantly",
      image: "https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black">
      {/* Hero Section */}
      <section className="relative min-h-screen py-32 md:py-40">
        <div className="container mx-auto px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative z-10">
              <BlurFade delay={0.25} inView>
                <h1 className="text-4xl font-bold text-text-primary md:text-6xl">
                  Find Your Ideal Roommate
                </h1>
              </BlurFade>
              
              <BlurFade delay={0.35} inView>
                <p className="mt-6 text-lg text-text-secondary">
                  BAABA.COM uses your Spotify and Instagram data plus lifestyle preferences to connect you with compatible students.
                </p>
              </BlurFade>

              <BlurFade delay={0.45} inView>
                <div className="mt-8 flex flex-wrap gap-4">
                  <RainbowButton 
                    onClick={() => navigate(user ? '/dashboard' : '/register')}
                    className="rounded-xl px-5 text-base"
                  >
                    <span className="flex items-center">
                      {user ? 'Go to Dashboard' : 'Get Started'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </RainbowButton>
                  
                  {!user && (
                    <StarBorder
                      as="button"
                      onClick={() => navigate('/login')}
                      className="rounded-xl px-5"
                    >
                      Already Have an Account? Login
                    </StarBorder>
                  )}
                </div>
              </BlurFade>
            </div>

            <div className="relative h-[500px]">
              <SplineScene 
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="h-full w-full"
              />
              <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <FeatureSteps
        features={howItWorksFeatures}
        title="How BAABA.COM Works"
        autoPlayInterval={4000}
        imageHeight="h-[400px]"
        className="bg-black/30"
      />

      {/* Features */}
      <section className="bg-black/30 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <GlareCard className="flex flex-col items-center justify-center p-6">
                  <div className="mb-4 w-fit rounded-full bg-accent-blue/10 p-3">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-center text-text-secondary">
                    {feature.description}
                  </p>
                </GlareCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <HeroGeometric 
        badge="Trust & Security"
        title1="Built for Nigerian"
        title2="Students"
      />
    </div>
  );
};

export default RoommateLandingPage;