import RNFS from 'react-native-fs';
import { launchImageLibrary } from 'react-native-image-picker';
import { Product } from '../entity/Product.entity';
import { ImagesDefinition } from '../shared/ImagesConstants';
import { ImageSourcePropType } from 'react-native';

export class ImageStorageService {
  private static IMAGES_DIR = `${RNFS.DocumentDirectoryPath}/product_images`;

  /**
   * Initialize the images directory
   */
  static async initializeDirectory(): Promise<void> {
    try {
      const dirExists = await RNFS.exists(this.IMAGES_DIR);
      if (!dirExists) {
        await RNFS.mkdir(this.IMAGES_DIR);
        console.log('✅ Images directory created:', this.IMAGES_DIR);
      }
    } catch (error) {
      console.error('❌ Error creating images directory:', error);
      throw error;
    }
  }

  /**
   * Pick an image from device gallery
   */
  static async pickImage(): Promise<{
    uri: string;
    fileName: string;
    type: string;
  } | null> {
    return new Promise((resolve, reject) => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          quality: 0.8,
          maxWidth: 1024,
          maxHeight: 1024,
        },
        response => {
          if (response.didCancel) {
            resolve(null);
            return;
          }

          if (response.errorCode) {
            reject(new Error(response.errorMessage || 'Error picking image'));
            return;
          }

          const asset = response.assets?.[0];
          if (asset && asset.uri) {
            resolve({
              uri: asset.uri,
              fileName: asset.fileName || `image_${Date.now()}.jpg`,
              type: asset.type || 'image/jpeg',
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Save image to app's document directory
   * @param sourceUri - Source URI of the image (from image picker)
   * @param customFileName - Optional custom filename
   * @returns Path to saved image
   */
  static async saveImage(
    sourceUri: string,
    customFileName?: string
  ): Promise<string> {
    try {
      await this.initializeDirectory();

      const fileName =
        customFileName || `product_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      const destinationPath = `${this.IMAGES_DIR}/${fileName}`;

      // Copy file to our directory
      await RNFS.copyFile(sourceUri, destinationPath);

      console.log('✅ Image saved:', destinationPath);
      return destinationPath;
    } catch (error) {
      console.error('❌ Error saving image:', error);
      throw error;
    }
  }

  /**
   * Delete an image from storage
   */
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const exists = await RNFS.exists(imagePath);
      if (exists) {
        await RNFS.unlink(imagePath);
        console.log('✅ Image deleted:', imagePath);
      }
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      throw error;
    }
  }

  /**
   * Check if an image exists
   */
  static async imageExists(imagePath: string): Promise<boolean> {
    try {
      return await RNFS.exists(imagePath);
    } catch (error) {
      console.error('❌ Error checking image existence:', error);
      return false;
    }
  }

  /**
   * Get image URI for React Native Image component
   * For filesystem images, returns file:// URI
   */
  static getImageUri(imagePath: string): string {
    if (imagePath.startsWith('file://')) {
      return imagePath;
    }
    return `file://${imagePath}`;
  }

  /**
   * Get all saved images
   */
  static async getAllImages(): Promise<string[]> {
    try {
      await this.initializeDirectory();
      const files = await RNFS.readDir(this.IMAGES_DIR);
      return files.map(file => file.path);
    } catch (error) {
      console.error('❌ Error reading images directory:', error);
      return [];
    }
  }

  /**
   * Get image source for React Native Image/ImageBackground components
   * Supports both legacy (require) and filesystem images
   * @param product - Product entity with image info
   * @param imageName - Optional legacy image name (for backward compatibility)
   * @returns ImageSourcePropType for use in Image/ImageBackground source prop
   */
  static getImageSource(
    product?: Product,
    imageName?: string
  ): ImageSourcePropType {
    // If product is provided, use its image system
    if (product) {
      // Safe check: if image_type doesn't exist (migration not run), default to 'legacy'
      const imageType = product.image_type || 'legacy';

      try {
        switch (imageType) {
          case 'filesystem':
            // New filesystem images - image column contains full path
            if (product.image) {
              const uri = this.getImageUri(product.image);
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
    return require('../../assets/images/products/defaultb.png');
  }
}
