import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building, Upload, Plus, Minus, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/Card';
import { useAuth } from '../../../context/AuthContext';
import { useManagedLandlords } from '../../../hooks/useDashboard';
import { supabase } from '../../../lib/supabase';

interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  amenities: string[];
  images: FileList;
  landlordId?: string; // For agents to select landlord
}

const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedLandlordId, setSelectedLandlordId] = useState<string>('');
  
  // Fetch managed landlords if user is an agent
  const { data: managedLandlords, isLoading: loadingLandlords } = useManagedLandlords(
    user?.role === 'agent' ? user.id : ''
  );
  
  const { register, handleSubmit, formState: { errors }, watch } = useForm<PropertyFormData>();
  
  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('property_images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property_images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Validate landlord selection for agents
      if (user?.role === 'agent' && !selectedLandlordId) {
        setError('Please select a landlord for this property.');
        return;
      }

      // Upload images
      const imageUrls = await uploadImages(selectedFiles);

      // Determine the landlord ID
      const landlordId = user?.role === 'agent' ? selectedLandlordId : user?.id;

      // Create property listing
      const { error: insertError } = await supabase
        .from('properties')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          location: data.location,
          address: data.address,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          size: data.size,
          amenities,
          images: imageUrls,
          landlord_id: landlordId,
          status: 'active'
        });

      if (insertError) throw insertError;
      
      // Navigate based on user role
      if (user?.role === 'agent') {
        navigate('/dashboard/agent/managed-properties');
      } else {
        navigate('/dashboard/landlord/my-properties');
      }
    } catch (err: any) {
      console.error('Error adding property:', err);
      setError(err.message || 'Failed to add property. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role === 'agent' && loadingLandlords) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-blue border-r-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Add New Property</h1>
        <p className="mt-2 text-text-secondary">
          {user?.role === 'agent' 
            ? 'List a property for one of your managed landlords.'
            : 'List your property to reach thousands of potential student tenants.'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-error-DEFAULT/10 p-4 text-error-DEFAULT">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Landlord Selection (for agents only) */}
        {user?.role === 'agent' && (
          <Card>
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
              <CardDescription>
                Select the landlord who owns this property.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  Select Landlord *
                </label>
                <select
                  className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary"
                  value={selectedLandlordId}
                  onChange={(e) => setSelectedLandlordId(e.target.value)}
                  required
                >
                  <option value="">Choose a landlord...</option>
                  {managedLandlords?.map((landlord) => (
                    <option key={landlord.id} value={landlord.id}>
                      {landlord.firstName} {landlord.lastName} ({landlord.email})
                      {landlord.verified && ' ✓'}
                    </option>
                  ))}
                </select>
                {managedLandlords?.length === 0 && (
                  <p className="mt-2 text-sm text-text-secondary">
                    No managed landlords found. Please contact your administrator.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide the essential details about the property.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Property Title"
              placeholder="e.g., Modern Studio Near University of Lagos"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />
            
            <div>
              <label className="mb-1 block text-sm font-medium text-text-primary">
                Description
              </label>
              <textarea
                className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
                rows={4}
                placeholder="Describe the property..."
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-error-DEFAULT">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Price per Year (₦)"
                type="number"
                placeholder="Enter price"
                error={errors.price?.message}
                {...register('price', { required: 'Price is required' })}
              />
              
              <Input
                label="Size (m²)"
                type="number"
                placeholder="Property size"
                error={errors.size?.message}
                {...register('size', { required: 'Size is required' })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Number of Bedrooms"
                type="number"
                placeholder="Number of bedrooms"
                error={errors.bedrooms?.message}
                {...register('bedrooms', { required: 'Number of bedrooms is required' })}
              />
              
              <Input
                label="Number of Bathrooms"
                type="number"
                placeholder="Number of bathrooms"
                error={errors.bathrooms?.message}
                {...register('bathrooms', { required: 'Number of bathrooms is required' })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
            <CardDescription>
              Specify where the property is located.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Location"
              placeholder="e.g., Yaba, Lagos"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
            />
            
            <Input
              label="Full Address"
              placeholder="Enter the complete address"
              error={errors.address?.message}
              {...register('address', { required: 'Address is required' })}
            />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>
              List the features and amenities available in the property.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex space-x-2">
              <Input
                placeholder="Add an amenity (e.g., Wi-Fi, Security)"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
              />
              <Button 
                type="button" 
                onClick={handleAddAmenity}
                disabled={!newAmenity.trim()}
              >
                <Plus size={16} className="mr-2" />
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center rounded-full bg-nav px-3 py-1 text-sm text-text-primary"
                >
                  <span>{amenity}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(index)}
                    className="ml-2 text-text-muted hover:text-error-DEFAULT"
                  >
                    <Minus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Property Images</CardTitle>
            <CardDescription>
              Upload high-quality images of the property. You can upload multiple images.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-nav bg-background p-6 transition-colors hover:border-accent-blue">
                <Upload size={24} className="mb-2 text-text-muted" />
                <span className="text-sm text-text-secondary">Click to upload images</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute right-1 top-1 rounded-full bg-error-DEFAULT p-1 text-background hover:bg-error-dark"
                    >
                      <Minus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(user?.role === 'agent' ? '/dashboard/agent/managed-properties' : '/dashboard/landlord/my-properties')}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            <Building size={16} className="mr-2" />
            Add Property
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPropertyPage;