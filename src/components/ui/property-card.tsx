import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import Button from './Button';

interface PropertyCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  image: string;
  featured?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  title,
  description,
  price,
  location,
  bedrooms,
  bathrooms,
  size,
  image,
  featured,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  return (
    <motion.div
      className="group relative h-full overflow-hidden rounded-4xl border border-nav bg-card/80 backdrop-blur-sm shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        borderColor: "rgba(255, 255, 255, 0.2)"
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="h-full w-full object-cover"
          animate={{ scale: isHovered ? 1.1 : 1 }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Featured Badge */}
        {featured && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-4 top-4 rounded-full bg-accent-blue px-3 py-1 text-xs font-semibold text-background"
          >
            Featured
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="absolute right-4 top-4 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            className={cn(
              "rounded-full bg-background/20 p-2 backdrop-blur-md transition-colors",
              isFavorited ? "text-accent-blue" : "text-background hover:text-accent-blue"
            )}
          >
            <Heart className="h-5 w-5" fill={isFavorited ? "currentColor" : "none"} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-background/20 p-2 text-background backdrop-blur-md transition-colors hover:text-accent-blue"
          >
            <Share2 className="h-5 w-5" />
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-2 flex items-center text-text-secondary">
            <MapPin size={16} className="mr-1" />
            <span className="text-sm">{location}</span>
          </div>
          
          <h3 className="mb-2 text-xl font-bold text-text-primary line-clamp-1">
            {title}
          </h3>
          
          <p className="mb-4 text-sm text-text-secondary line-clamp-2">
            {description}
          </p>

          {/* Property Features */}
          <div className="mb-4 flex space-x-4 border-b border-nav pb-4">
            <div className="flex items-center text-text-secondary">
              <Bed size={18} className="mr-2 text-accent-blue" />
              <span>{bedrooms} {bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center text-text-secondary">
              <Bath size={18} className="mr-2 text-accent-blue" />
              <span>{bathrooms} {bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
            <div className="flex items-center text-text-secondary">
              <Square size={18} className="mr-2 text-accent-blue" />
              <span>{size} m²</span>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-accent-blue">
                ₦{price.toLocaleString()}
              </p>
              <p className="text-xs text-text-secondary">per year</p>
            </div>
            <Link to={`/properties/${id}`}>
              <Button variant="primary" size="sm">View Details</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};