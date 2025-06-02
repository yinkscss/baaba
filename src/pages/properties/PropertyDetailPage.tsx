import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Bed, Bath, Square, Heart, Share2, Calendar, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { formatCurrency } from '../../lib/utils';

// Mock property data (in a real app, this would come from your API)
const MOCK_PROPERTY = {
  id: '1',
  title: 'Modern Studio Near University of Lagos',
  description: 'This beautifully designed studio apartment offers the perfect blend of comfort and convenience for students. Located just minutes from the University of Lagos campus, this property features modern amenities, secure access, and a vibrant student community.',
  price: 250000,
  location: 'Yaba, Lagos',
  address: '123 University Road, Yaba, Lagos',
  bedrooms: 1,
  bathrooms: 1,
  size: 35,
  amenities: [
    'Wi-Fi Included',
    'Air Conditioning',
    '24/7 Security',
    'Water Supply',
    'Backup Generator',
    'Furnished',
    'Balcony',
    'CCTV'
  ],
  images: [
    'https://images.pexels.com/photos/1918291/pexels-photo-1918291.jpeg',
    'https://images.pexels.com/photos/1643384/pexels-photo-1643384.jpeg',
    'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
  ],
  landlord: {
    name: 'Mr. Oluwaseun Adebayo',
    phone: '+234 801 234 5678',
    responseRate: 95,
    responseTime: '2 hours',
    properties: 5,
    verified: true
  },
  availability: {
    status: 'available',
    moveInDate: '2024-09-01',
    minimumStay: '1 year'
  },
  features: [
    'Recently renovated',
    'Close to public transport',
    'Shopping centers nearby',
    'Quiet neighborhood',
    'Good mobile network coverage',
    'Regular water supply'
  ],
  policies: {
    smoking: false,
    pets: false,
    visitors: 'Allowed (with registration)',
    utilities: 'Not included in rent'
  }
};

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showContact, setShowContact] = useState(false);

  // In a real app, you would fetch the property data based on the ID
  const property = MOCK_PROPERTY;

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
                    <span>{new Date(property.availability.moveInDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Minimum Stay</p>
                  <p className="mt-1">{property.availability.minimumStay}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card className="mb-8 border border-nav">
            <CardHeader>
              <CardTitle>House Rules & Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-text-muted">Smoking</p>
                  <p className="mt-1">{property.policies.smoking ? 'Allowed' : 'Not allowed'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Pets</p>
                  <p className="mt-1">{property.policies.pets ? 'Allowed' : 'Not allowed'}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Visitors</p>
                  <p className="mt-1">{property.policies.visitors}</p>
                </div>
                <div>
                  <p className="text-sm text-text-muted">Utilities</p>
                  <p className="mt-1">{property.policies.utilities}</p>
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
                <Button className="w-full">Schedule Viewing</Button>
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
                  <p className="font-medium">{property.landlord.name}</p>
                  <p className="text-text-secondary">{property.landlord.phone}</p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Landlord Card */}
          <Card className="border border-nav">
            <CardHeader>
              <CardTitle>About the Landlord</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Response Rate</span>
                  <span className="font-medium">{property.landlord.responseRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Response Time</span>
                  <span className="font-medium">{property.landlord.responseTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Properties</span>
                  <span className="font-medium">{property.landlord.properties}</span>
                </div>
                {property.landlord.verified && (
                  <div className="flex items-center text-accent-green">
                    <Check size={16} className="mr-2" />
                    <span>Verified Landlord</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;