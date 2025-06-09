import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Share2, Calendar, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/utils';
import { useProperty } from '../../hooks/useDashboard';
import InspectionRequestForm from '../../components/forms/InspectionRequestForm';

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [showInspectionForm, setShowInspectionForm] = useState(false);

  const { data: property, isLoading } = useProperty(id || '');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Property Not Found</h2>
        <p className="text-text-secondary">The property you're looking for doesn't exist.</p>
      </div>
    );
  }

  const handleInspectionSuccess = () => {
    // Show success message or redirect
    console.log('Inspection request submitted successfully!');
  };

  return (
    <div className="container mx-auto px-4 pb-12 pt-24">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6 overflow-hidden rounded-lg">
            <div className="relative aspect-video">
              <img
                src={property.images[selectedImage]}
                alt={property.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {property.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      selectedImage === index ? 'bg-accent-blue w-4' : 'bg-background/50'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-4 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 ${
                    selectedImage === index ? 'ring-2 ring-accent-blue' : ''
                  }`}
                >
                  <img
                    src={image}
                    alt={`View ${index + 1}`}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Property Details */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-text-primary">{property.title}</h1>
            <div className="mb-4 flex items-center text-text-secondary">
              <MapPin size={18} className="mr-2" />
              <span>{property.address}</span>
            </div>
            <div className="mb-6 flex flex-wrap gap-6">
              <div className="flex items-center text-text-primary">
                <Bed size={20} className="mr-2 text-accent-blue" />
                <span>{property.bedrooms} Bedroom</span>
              </div>
              <div className="flex items-center text-text-primary">
                <Bath size={20} className="mr-2 text-accent-blue" />
                <span>{property.bathrooms} Bathroom</span>
              </div>
              <div className="flex items-center text-text-primary">
                <Square size={20} className="mr-2 text-accent-blue" />
                <span>{property.size} m²</span>
              </div>
            </div>
            <p className="text-text-secondary">{property.description}</p>
          </div>

          {/* Features and Amenities */}
          <Card className="mb-8 border border-nav">
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <Check size={16} className="mr-2 text-accent-green" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="mb-8 border border-nav">
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-text-muted">Move-in Date</p>
                  <div className="mt-1 flex items-center">
                    <Calendar size={16} className="mr-2 text-accent-blue" />
                    <span>Available Now</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Minimum Stay</p>
                  <p className="mt-1">1 year</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Card */}
          <Card className="border border-nav">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="text-3xl font-bold text-accent-blue">
                  {formatCurrency(property.price)}
                  <span className="text-sm font-normal text-text-muted">/year</span>
                </p>
              </div>
              <div className="space-y-3">
                <Button 
                  className="w-full"
                  onClick={() => setShowInspectionForm(true)}
                >
                  Apply Now
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowContact(!showContact)}>
                  Contact Landlord
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Heart size={18} />
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Share2 size={18} />
                  </Button>
                </div>
              </div>

              {showContact && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 border-t border-nav pt-4"
                >
                  <p className="font-medium">Property Owner</p>
                  <p className="text-text-secondary">Contact via platform</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Property Status */}
          <Card className="border border-nav">
            <CardHeader>
              <CardTitle>Property Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Status</span>
                  <span className={`font-medium capitalize ${
                    property.status === 'active' ? 'text-accent-green' : 
                    property.status === 'rented' ? 'text-warning-DEFAULT' : 
                    'text-text-muted'
                  }`}>
                    {property.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Available</span>
                  <span className={`font-medium ${property.available ? 'text-accent-green' : 'text-error-DEFAULT'}`}>
                    {property.available ? 'Yes' : 'No'}
                  </span>
                </div>
                {property.featured && (
                  <div className="flex items-center text-accent-blue">
                    <Check size={16} className="mr-2" />
                    <span>Featured Property</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inspection Request Form Modal */}
      <AnimatePresence>
        {showInspectionForm && (
          <InspectionRequestForm
            propertyId={property.id}
            propertyTitle={property.title}
            onClose={() => setShowInspectionForm(false)}
            onSuccess={handleInspectionSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetailPage;