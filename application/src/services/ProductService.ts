import { Product } from '../entity/Product.entity';
import { Category } from '../entity/Category.entity';
import { connectToDatabase } from '../store/db/Database';
import { ImageStorageService } from './ImageStorageService';

export class ProductService {
  private async getDatabase() {
    return await connectToDatabase();
  }

  /**
   * Create a new product
   */
  createProduct(data: {
    name: string;
    price: number;
    category_id: number;
    image_type: string;
    image: string; // Nombre para legacy, path completo para filesystem
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
    sunday?: number;
  }): Promise<Product> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.getDatabase();

        // Get category
        const category = await db.manager.findOneBy(Category, {
          category_id: data.category_id,
        });

        if (!category) {
          reject(new Error('Category not found'));
          return;
        }

        // Get max order for this category
        const products = await db.manager.find(Product, {
          where: { category: { category_id: data.category_id } },
          order: { order: 'DESC' },
          take: 1,
        });

        const maxOrder = products.length > 0 ? products[0].order : 0;

        // Get max product_id to ensure unique ID (auto-increment not working reliably)
        const allProducts = await db.manager.find(Product, {
          order: { product_id: 'DESC' },
          take: 1,
        });

        const maxProductId = allProducts.length > 0 ? allProducts[0].product_id : 0;
        const newProductId = maxProductId + 1;

        console.log('🆔 Creating product with ID:', newProductId, '(max was:', maxProductId, ')');

        // Create new product
        const product = new Product(
          newProductId, // Use max ID + 1 to ensure uniqueness
          data.name,
          data.price,
          data.image,
          new Date(),
          new Date(),
          category,
          maxOrder + 1,
          data.monday ?? 1,
          data.tuesday ?? 1,
          data.wednesday ?? 1,
          data.thursday ?? 1,
          data.friday ?? 1,
          data.saturday ?? 1,
          data.sunday ?? 1
        );

        // Only set image_type if the column exists (migration has been run)
        try {
          product.image_type = data.image_type;
        } catch (error) {
          console.warn('⚠️ image_type column not found, skipping. Please run migration.');
        }

        const savedProduct = await db.manager.save(product);
        resolve(savedProduct);
      } catch (error) {
        console.error('❌ Error creating product:', error);
        reject(error);
      }
    });
  }

  getProduct(productId: number): Promise<Product> {
    return new Promise(async (resolve, reject) => {
      let db = await this.getDatabase();
      db.manager
        .findOneBy(Product, { product_id: productId })
        .then(product => {
          if (product) {
            resolve(product);
          } else {
            reject(new Error('Product not found'));
          }
        })
        .catch((error: any) => {
          console.error(error);
          reject(error);
        });
    });
  }

  updateProductPrice(
    productId: number,
    data: {
      name: string;
      price: string;
      monday?: number;
      tuesday?: number;
      wednesday?: number;
      thursday?: number;
      friday?: number;
      saturday?: number;
      sunday?: number;
    },
  ): Promise<Product> {
    return new Promise(async (resolve, reject) => {
      let db = await this.getDatabase();
      db.manager
        .findOneBy(Product, { product_id: productId })
        .then(product => {
          if (product) {
            product.price = data.price ? parseFloat(data.price) : 0; // Ensure price is a number
            product.name = data.name; // Update the name
            product.last_update = new Date(); // Update the last update date

            // Update day availability
            if (data.monday !== undefined) product.monday = data.monday;
            if (data.tuesday !== undefined) product.tuesday = data.tuesday;
            if (data.wednesday !== undefined) product.wednesday = data.wednesday;
            if (data.thursday !== undefined) product.thursday = data.thursday;
            if (data.friday !== undefined) product.friday = data.friday;
            if (data.saturday !== undefined) product.saturday = data.saturday;
            if (data.sunday !== undefined) product.sunday = data.sunday;

            db.manager
              .save(product)
              .then(updatedProduct => {
                resolve(updatedProduct);
              })
              .catch((error: any) => {
                console.error(error);
                reject(error);
              });
          } else {
            reject(new Error('Product not found'));
          }
        })
        .catch((error: any) => {
          console.error(error);
          reject(error);
        });
    });
  }

  /**
   * Delete a product
   * Also deletes the associated image file if it's a filesystem image
   */
  deleteProduct(productId: number): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = await this.getDatabase();

        // First, get the product to check if we need to delete an image
        const product = await db.manager.findOneBy(Product, {
          product_id: productId,
        });

        if (!product) {
          reject(new Error('Product not found'));
          return;
        }

        // If it's a filesystem image, delete the file
        if (product.image_type === 'filesystem' && product.image) {
          try {
            await ImageStorageService.deleteImage(product.image);
            console.log('✅ Product image deleted from filesystem');
          } catch (error) {
            console.warn('⚠️ Could not delete product image:', error);
            // Continue with product deletion even if image deletion fails
          }
        }

        // Delete the product from database
        await db.manager.delete(Product, { product_id: productId });
        console.log(`✅ Product ${productId} deleted from database`);

        resolve();
      } catch (error) {
        console.error('❌ Error deleting product:', error);
        reject(error);
      }
    });
  }
}
