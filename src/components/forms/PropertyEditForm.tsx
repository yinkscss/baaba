import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, Minus, Upload, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import type { Property } from '../../types';
import { supabase } from '../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  location: z.string().min(1, 'Location is required'),
  address: z.string().min(1, 'Address is required'),
  bedrooms: z.number().min(0, 'Bedrooms must be 0 or more'),
  bathrooms: z.number().min(0, 'Bathrooms must be 0 or more'),
  size: z.number().min(0, 'Size must be positive'),
  available: z.boolean(),
  featured: z.boolean(),
  status: z.enum(['active', 'paused', 'rented'])
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyEditFormProps {
  property: Property;
  onSubmit: (data: Partial<Property>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PropertyEditForm({ property, onSubmit, onCancel, isLoading }: PropertyEditFormProps) {
  const [amenities, setAmenities] = useState<string[]>(property.amenities || []);
  const [newAmenity, setNewAmenity] = useState('');
  const [previewImages, setPreviewImages] = useState<string[]>(property.images || []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      address: property.address,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.size,
      available: property.available,
      featured: property.featured,
      status: property.status
    }
  });

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
    
    // If it's a new file, remove from selectedFiles
    if (index >= property.images.length) {
      const fileIndex = index - property.images.length;
      setSelectedFiles(prev => prev.filter((_, i) => i !== fileIndex));
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];
    
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${property.landlordId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
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

  const onFormSubmit = async (data: PropertyFormData) => {
    try {
      setUploadingImages(true);
      
      // Determine which original images to keep
      const keptOriginalImages = property.images.filter((_, index) => 
        previewImages.includes(property.images[index])
      );
      
      // Upload new images
      const newImageUrls = await uploadImages(selectedFiles);
      
      // Combine kept original images with new uploaded images
      const allImages = [...keptOriginalImages, ...newImageUrls];
      
      await onSubmit({
        ...data,
        amenities,
        images: allImages
      });
      
      setUploadingImages(false);
    } catch (error) {
      console.error('Error updating property:', error);
      setUploadingImages(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <Card className="border border-nav">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Edit Property</CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-text-primary">Basic Information</h3>
                
                <Input
                  label="Property Title"
                  error={errors.title?.message}
                  {...register('title')}
                />
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-text-primary">
                    Description
                  </label>
                  <textarea
                    className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary placeholder-text-muted focus:border-accent-blue focus:outline-none"
                    rows={4}
                    {...register('description')}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-error-DEFAULT">{errors.description.message}</p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Price per Year (₦)"
                    type="number"
                    error={errors.price?.message}
                    {...register('price', { valueAsNumber: true })}
                  />
                  
                  <Input
                    label="Size (m²)"
                    type="number"
                    error={errors.size?.message}
                    {...register('size', { valueAsNumber: true })}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Number of Bedrooms"
                    type="number"
                    error={errors.bedrooms?.message}
                    {...register('bedrooms', { valueAsNumber: true })}
                  />
                  
                  <Input
                    label="Number of Bathrooms"
                    type="number"
                    error={errors.bathrooms?.message}
                    {...register('bathrooms', { valueAsNumber: true })}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-text-primary">Location</h3>
                
                <Input
                  label="Location"
                  error={errors.location?.message}
                  {...register('location')}
                />
                
                <Input
                  label="Full Address"
                  error={errors.address?.message}
                  {...register('address')}
                />
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-text-primary">Status</h3>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-text-primary">
                      Property Status
                    </label>
                    <select
                      className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary"
                      {...register('status')}
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="rented">Rented</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="available"
                      className="h-4 w-4 rounded border-nav bg-background text-accent-blue focus:ring-accent-blue"
                      {...register('available')}
                    />
                    <label htmlFor="available" className="text-sm font-medium text-text-primary">
                      Available for Rent
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      className="h-4 w-4 rounded border-nav bg-background text-accent-blue focus:ring-accent-blue"
                      {...register('featured')}
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-text-primary">
                      Featured Property
                    </label>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-text-primary">Amenities</h3>
                
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
              </div>

              {/* Images */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-text-primary">Property Images</h3>
                
                <div className="mb-4">
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-nav bg-background p-6 transition-colors hover:border-accent-blue">
                    <Upload size={24} className="mb-2 text-text-muted" />
                    <span className="text-sm text-text-secondary">Click to upload additional images</span>
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
              </div>

              {/* Submit */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading || uploadingImages}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  isLoading={isLoading || uploadingImages}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}