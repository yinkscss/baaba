import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { PropertyCard } from '../../../components/ui/property-card';
import { useAuth } from '../../../context/AuthContext';
import { useLandlordProperties } from '../../../hooks/useDashboard';
import type { Property } from '../../../types';

const MyPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: properties, isLoading, updatePropertyStatus } = useLandlordProperties(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Property['status'] | 'all'>('all');

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            My Properties
          </h1>
          <p className="mt-1 text-text-secondary">
            Manage and track your property listings
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard/landlord/add-property')}>
          <Plus size={18} className="mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Total Properties</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {properties?.length || 0}
                </p>
              </div>
              <div className="rounded-full bg-accent-blue/10 p-3">
                <Building className="h-6 w-6 text-accent-blue" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Active Listings</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {properties?.filter(p => p.status === 'active').length || 0}
                </p>
              </div>
              <div className="rounded-full bg-accent-green/10 p-3">
                <Building className="h-6 w-6 text-accent-green" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-nav">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">Rented Properties</p>
                <p className="mt-1 text-2xl font-bold text-text-primary">
                  {properties?.filter(p => p.status === 'rented').length || 0}
                </p>
              </div>
              <div className="rounded-full bg-warning-DEFAULT/10 p-3">
                <Building className="h-6 w-6 text-warning-DEFAULT" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="rounded-md border border-nav bg-background px-4 py-2 text-text-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Property['status'] | 'all')}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      {/* Properties Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties?.map((property) => (
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

      {filteredProperties?.length === 0 && (
        <div className="rounded-lg border border-nav p-8 text-center">
          <p className="text-text-secondary">No properties found</p>
        </div>
      )}
    </div>
  );
};

export default MyPropertiesPage;