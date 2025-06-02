import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/search-bar';
import { PropertyCard } from '../../components/ui/property-card';
import { MOCK_PROPERTIES } from './mock-data';

const PropertyListingsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [location, setLocation] = useState('');

  // Filter properties based on search and filters
  const filteredProperties = MOCK_PROPERTIES.filter((property) => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = 
      property.price >= priceRange[0] && property.price <= priceRange[1];
    
    const matchesBedrooms = 
      bedrooms === '' || property.bedrooms === bedrooms;
    
    const matchesLocation = 
      location === '' || property.location.toLowerCase().includes(location.toLowerCase());
    
    return matchesSearch && matchesPrice && matchesBedrooms && matchesLocation;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  return (
    <div className="pt-20 md:pt-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary md:text-4xl">
            Find Your Perfect Student Housing
          </h1>
          <p className="mt-2 text-text-secondary">
            Browse through our curated list of properties near Nigerian universities.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-grow">
              <SearchBar
                placeholder="Search by location, university, or property type..."
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
            <Button onClick={toggleFilters} variant="secondary">
              <Filter size={18} className="mr-2" />
              Filters
            </Button>
          </div>

          {/* Results count */}
          <div className="mt-6">
            <p className="text-text-secondary">
              Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </p>
          </div>
        </div>

        {/* Property Listings */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              id={property.id}
              title={property.title}
              description={property.description}
              price={property.price}
              location={property.location}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              size={property.size}
              image={property.images[0]}
              featured={property.featured}
            />
          ))}
        </div>

        {/* No results message */}
        {filteredProperties.length === 0 && (
          <div className="my-12 text-center">
            <p className="mb-4 text-lg text-text-secondary">
              No properties match your search criteria.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setPriceRange([0, 1000000]);
                setBedrooms('');
                setLocation('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyListingsPage;