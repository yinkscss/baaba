import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyCard } from '../../../components/ui/property-card';
import { SearchBar } from '../../../components/ui/search-bar';
import { MOCK_PROPERTIES } from '../../properties/mock-data';

const TenantPropertiesPage: React.FC = () => {
  const navigate = useNavigate();

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
          onSearch={(query) => console.log('Search:', query)}
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
        {MOCK_PROPERTIES.map((property) => (
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
    </div>
  );
};

export default TenantPropertiesPage;