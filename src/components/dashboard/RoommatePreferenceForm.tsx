import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { SpotifyLogo } from '../icons/BrandLogos';

const roommatePreferenceSchema = z.object({
  budget: z.number().min(0, 'Budget must be a positive number'),
  location: z.string().min(1, 'Location is required'),
  moveInDate: z.string().min(1, 'Move-in date is required'),
  gender: z.enum(['male', 'female', 'any']),
  cleanliness: z.number().min(1).max(5),
  noise: z.number().min(1).max(5),
  visitors: z.number().min(1).max(5),
  smokingTolerance: z.boolean(),
  petsTolerance: z.boolean(),
  spotifyProfileUrl: z.string().optional()
});

type RoommatePreferenceFormData = z.infer<typeof roommatePreferenceSchema>;

interface RoommatePreferenceFormProps {
  onSubmit: (data: RoommatePreferenceFormData) => Promise<void>;
  initialData?: Partial<RoommatePreferenceFormData>;
  isLoading?: boolean;
}

export function RoommatePreferenceForm({
  onSubmit,
  initialData,
  isLoading
}: RoommatePreferenceFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<RoommatePreferenceFormData>({
    resolver: zodResolver(roommatePreferenceSchema),
    defaultValues: {
      budget: initialData?.budget || 0,
      location: initialData?.location || '',
      moveInDate: initialData?.moveInDate || '',
      gender: initialData?.gender || 'any',
      cleanliness: initialData?.cleanliness || 3,
      noise: initialData?.noise || 3,
      visitors: initialData?.visitors || 3,
      smokingTolerance: initialData?.smokingTolerance || false,
      petsTolerance: initialData?.petsTolerance || false,
      spotifyProfileUrl: initialData?.spotifyProfileUrl || ''
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Monthly Budget (₦)"
          type="number"
          error={errors.budget?.message}
          {...register('budget', { valueAsNumber: true })}
        />

        <Input
          label="Preferred Location"
          error={errors.location?.message}
          {...register('location')}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input
          label="Move-in Date"
          type="date"
          error={errors.moveInDate?.message}
          {...register('moveInDate')}
        />

        <div>
          <label className="mb-2 block text-sm font-medium text-text-primary">
            Preferred Gender
          </label>
          <select
            className="w-full rounded-md border border-nav bg-background px-3 py-2 text-text-primary"
            {...register('gender')}
          >
            <option value="any">Any</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Lifestyle Preferences</h3>
        
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Cleanliness (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              className="w-full"
              {...register('cleanliness', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Noise Level (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              className="w-full"
              {...register('noise', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-text-primary">
              Visitors Frequency (1-5)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              className="w-full"
              {...register('visitors', { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-nav bg-background"
              {...register('smokingTolerance')}
            />
            <label className="text-sm text-text-primary">
              Smoking Tolerance
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              className="rounded border-nav bg-background"
              {...register('petsTolerance')}
            />
            <label className="text-sm text-text-primary">
              Pet Tolerance
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium text-text-primary">Music Preferences</h3>
        <div className="flex items-center space-x-4">
          <Input
            label="Spotify Profile URL"
            placeholder="https://open.spotify.com/user/..."
            error={errors.spotifyProfileUrl?.message}
            {...register('spotifyProfileUrl')}
          />
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            onClick={() => window.open('https://open.spotify.com', '_blank')}
          >
            <SpotifyLogo className="mr-2 h-4 w-4" />
            Connect Spotify
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        Save Preferences
      </Button>
    </form>
  );
}