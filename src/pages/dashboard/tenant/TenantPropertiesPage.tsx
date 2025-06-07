import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyCard } from '../../../components/ui/property-card';
import { SearchBar } from '../../../components/ui/search-bar';
import { useProperties } from '../../../hooks/useDashboard';

const TenantPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [bedrooms, setBedrooms] = useState<number | ''>('');
  const [location, setLocation] = useState('');

  // Use real data from Supabase
  const { data: properties, isLoading } = useProperties({
    search: searchQuery,
    priceRange,
    bedrooms: bedrooms === '' ? undefined : bedrooms,
    location
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Find Your Perfect Space
          </h1>
          <p className="mt-1 text-text-secondary">
            Browse through our curated list of student-friendly properties
          </p>
        </div>
      </div>

      <div className="relative">
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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {properties?.map((property) => (
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

      {properties?.length === 0 && (
        <div className="my-12 text-center">
          <p className="mb-4 text-lg text-text-secondary">
            No properties found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default TenantPropertiesPage;