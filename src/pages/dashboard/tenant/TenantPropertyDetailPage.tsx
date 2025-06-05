import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Share2, Calendar, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils';
import { MOCK_PROPERTIES } from '../../properties/mock-data';

const TenantPropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContact, setShowContact] = useState(false);

  // Find the property from mock data
  const property = MOCK_PROPERTIES.find(p => p.id === id);

  if (!property) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="mb-2 text-xl font-semibold text-text-primary">Property Not Found</h2>
        <p className="text-text-secondary">The property you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary md:text-3xl">
          Property Details
        </h1>
        <p className="mt-1 text-text-secondary">
          View detailed information about this property
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <Card className="mb-6 border border-nav overflow-hidden">
            <CardContent className="p-0">
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
              <div className="mt-4 flex gap-4 overflow-x-auto p-4">
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
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="mb-6 border border-nav">
            <CardHeader>
              <CardTitle>Property Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h2 className="mb-2 text-2xl font-bold text-text-primary">{property.title}</h2>
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
            </CardContent>
          </Card>

          {/* Features and Amenities */}
          <Card className="mb-6 border border-nav">
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
                <Button className="w-full">Apply Now</Button>
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
                  <p className="font-medium">Mr. Oluwaseun Adebayo</p>
                  <p className="text-text-secondary">+234 801 234 5678</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Availability Card */}
          <Card className="border border-nav">
            <CardHeader>
              <CardTitle>Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-accent-blue" />
                  <div>
                    <p className="text-sm text-text-secondary">Move-in Date</p>
                    <p className="font-medium text-text-primary">September 1, 2024</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-accent-blue" />
                  <div>
                    <p className="text-sm text-text-secondary">Minimum Stay</p>
                    <p className="font-medium text-text-primary">1 year</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TenantPropertyDetailPage;