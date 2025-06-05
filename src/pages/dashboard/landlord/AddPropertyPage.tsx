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
}

const AddPropertyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<{ file: File; preview: string }[]>([]);
  
  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>();

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
      const newImages = Array.from(files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setPreviewImages([...previewImages, ...newImages]);
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setIsSubmitting(true);

      // Upload images first
      const imageFiles = previewImages.map(img => img.file);
      const imageUrls = await uploadImages(imageFiles);

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
          landlord_id: user?.id,
          status: 'active'
        });

      if (insertError) throw insertError;

      navigate('/dashboard/landlord/my-properties');
    } catch (error) {
      console.error('Error adding property:', error);
      // Handle error (show error message to user)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Add Property</h1>
        <p className="mt-2 text-text-secondary">
          List your property
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
            <CardDescription>
              Basic information about your property
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              placeholder="Property title"
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
                placeholder="Property description"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-error-DEFAULT">{errors.description.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Price"
                type="number"
                placeholder="Monthly rent"
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
                label="Bedrooms"
                type="number"
                placeholder="Number of bedrooms"
                error={errors.bedrooms?.message}
                {...register('bedrooms', { required: 'Number of bedrooms is required' })}
              />
              
              <Input
                label="Bathrooms"
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
            <CardDescription>Property location details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Location"
              placeholder="Area or neighborhood"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
            />
            
            <Input
              label="Address"
              placeholder="Full address"
              error={errors.address?.message}
              {...register('address', { required: 'Address is required' })}
            />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
            <CardDescription>Available features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex space-x-2">
              <Input
                placeholder="Add amenity"
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
            <CardTitle>Images</CardTitle>
            <CardDescription>Upload property images</CardDescription>
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
                {previewImages.map((img, index) => (
                  <div key={index} className="relative aspect-video overflow-hidden rounded-lg">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPreviewImages(previewImages.filter((_, i) => i !== index))}
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
            onClick={() => navigate('/dashboard/landlord/my-properties')}
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