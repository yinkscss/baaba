import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Shield, Users, Scale, Building, Check, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroSection } from '../components/ui/hero-section-1';
import { HeroSection45 } from '../components/ui/hero-section-45';
import { SearchBar } from '../components/ui/search-bar';
import { HowToUse } from '../components/ui/how-to-use';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    navigate(`/properties?search=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <HeroSection />

      <HeroSection45 
        badge="BAABA.ng"
        heading="AI-Powered Solutions for Your Housing Journey"
      />

      <HowToUse />

      {/* Property Search Demo */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-text-primary md:text-4xl mb-4">Find Your Perfect Space</h2>
            <p className="text-text-secondary">Browse through our curated list of student-friendly properties.</p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <SearchBar
              placeholder="Search by location or university..."
              onSearch={handleSearch}
              suggestions={[
                "University of Lagos",
                "Covenant University",
                "University of Ibadan",
                "Yaba, Lagos",
                "Ota, Ogun",
                "Abuja, FCT"
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;