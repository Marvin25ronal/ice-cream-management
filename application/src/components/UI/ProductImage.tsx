import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { Product } from '../../entity/Product.entity';
import { ImagesDefinition } from '../../shared/ImagesConstants';
import { ImageStorageService } from '../../services/ImageStorageService';

interface ProductImageProps {
  product?: Product;
  imageName?: string;
  style: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

/**
 * Universal Product Image component that handles both legacy and filesystem images
 */
const ProductImage: React.FC<ProductImageProps> = ({
  product,
  imageName,
  style,
  resizeMode = 'cover',
}) => {
  // Determine image source
  const getImageSource = () => {
    // If product is provided, use its image system
    if (product) {
      // Safe check: if image_type doesn't exist (migration not run), default to 'legacy'
      const imageType = product.image_type || 'legacy';

      try {
        switch (imageType) {
          case 'filesystem':
            // New filesystem images - image column contains full path
            if (product.image) {
              const uri = ImageStorageService.getImageUri(product.image);
              return { uri };
            }
            break;

          case 'url':
            // Future: remote URLs - image column contains URL
            if (product.image) {
              return { uri: product.image };
            }
            break;

          case 'legacy':
          default:
            // Legacy require() images - image column contains name for lookup
            const legacyImage = ImagesDefinition.find(
              img => img.name === product.image
            );
            if (legacyImage) {
              return legacyImage.image;
            }
            break;
        }
      } catch (error) {
        console.warn('⚠️ Error loading product image, using legacy fallback:', error);
        // If any error, try legacy system as fallback
        const legacyImage = ImagesDefinition.find(
          img => img.name === product.image
        );
        if (legacyImage) {
          return legacyImage.image;
        }
      }
    }

    // If imageName is provided (for backward compatibility)
    if (imageName) {
      const legacyImage = ImagesDefinition.find(img => img.name === imageName);
      if (legacyImage) {
        return legacyImage.image;
      }
    }

    // Default fallback image
    return require('../../../assets/images/products/defaultb.png');
  };

  const imageSource = getImageSource();

  return <Image source={imageSource} style={style} resizeMode={resizeMode} />;
};

export default ProductImage;
