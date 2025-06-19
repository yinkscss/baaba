import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Building, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../context/AuthContext';
import { useAgentManagedProperties } from '../../../hooks/useDashboard';
import type { Property } from '../../../types';
import { PropertyEditForm } from '../../../components/forms/PropertyEditForm';
import { DeletePropertyConfirmation } from '../../../components/forms/DeletePropertyConfirmation';

const ManagedPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: properties, isLoading, updateProperty, deleteProperty } = useAgentManagedProperties(user?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Property['status'] | 'all'>('all');
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);

  const filteredProperties = properties?.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
  };

  const handleDeleteProperty = (property: Property) => {
    setDeletingProperty(property);
  };

  const handleViewProperty = (propertyId: string) => {
    navigate(`/properties/${propertyId}`);
  };

  const handleUpdateProperty = async (updates: Partial<Property>) => {
    if (!editingProperty) return;
    
    try {
      await updateProperty.mutateAsync({
        propertyId: editingProperty.id,
        updates
      });
      setEditingProperty(null);
    } catch (error) {
      console.error('Failed to update property:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProperty) return;
    
    try {
      await deleteProperty.mutateAsync(deletingProperty.id);
      setDeletingProperty(null);
    } catch (error) {
      console.error('Failed to delete property:', error);
    }
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
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
            Managed Properties
          </h1>
          <p className="mt-1 text-text-secondary">
            Manage properties on behalf of your landlord clients
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

      {/* Properties List */}
      <div className="space-y-4">
        {filteredProperties?.map((property) => (
          <Card key={property.id} className="border border-nav overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Property Image */}
                <div className="w-full md:w-1/4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={property.images[0] || 'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Property Details */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-text-primary">{property.title}</h3>
                      <p className="text-sm text-text-secondary">{property.location}</p>
                      <p className="text-sm text-text-secondary">₦{property.price.toLocaleString()} per year</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        property.status === 'active' 
                          ? 'bg-accent-green/10 text-accent-green' 
                          : property.status === 'paused'
                          ? 'bg-warning-DEFAULT/10 text-warning-DEFAULT'
                          : 'bg-error-DEFAULT/10 text-error-DEFAULT'
                      }`}>
                        {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                      </span>
                      {property.featured && (
                        <span className="px-2 py-1 text-xs rounded-full bg-accent-blue/10 text-accent-blue">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex flex-wrap gap-4">
                    <div className="flex items-center text-text-secondary text-sm">
                      <span className="font-medium">{property.bedrooms}</span>
                      <span className="ml-1">Beds</span>
                    </div>
                    <div className="flex items-center text-text-secondary text-sm">
                      <span className="font-medium">{property.bathrooms}</span>
                      <span className="ml-1">Baths</span>
                    </div>
                    <div className="flex items-center text-text-secondary text-sm">
                      <span className="font-medium">{property.size}</span>
                      <span className="ml-1">m²</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewProperty(property.id)}
                    >
                      <Eye size={16} className="mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleEditProperty(property)}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="danger"
                      onClick={() => handleDeleteProperty(property)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties?.length === 0 && (
        <div className="rounded-lg border border-nav p-8 text-center">
          <p className="text-text-secondary">No properties found</p>
        </div>
      )}

      {/* Edit Property Modal */}
      <AnimatePresence>
        {editingProperty && (
          <PropertyEditForm
            property={editingProperty}
            onSubmit={handleUpdateProperty}
            onCancel={() => setEditingProperty(null)}
            isLoading={updateProperty.isLoading}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingProperty && (
          <DeletePropertyConfirmation
            propertyTitle={deletingProperty.title}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeletingProperty(null)}
            isLoading={deleteProperty.isLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagedPropertiesPage;