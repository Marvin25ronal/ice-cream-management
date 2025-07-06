import { Product } from "../entity/Product.entity";
import { connectToDatabase } from "../store/db/Database";

export class ProductService {
    private async getDatabase() {
        return await connectToDatabase();
    }

    getProduct(productId: number): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            let db = await this.getDatabase();
            db.manager.findOneBy(Product, { product_id: productId }).then((product) => {
                if (product) {
                    resolve(product);
                } else {
                    reject(new Error("Product not found"));
                }
            }).catch((error: any) => {
                console.error(error);
                reject(error);
            });
        });
    }

    updateProductPrice(productId: number, data: { name: string, price: string }): Promise<Product> {
        return new Promise(async (resolve, reject) => {
            let db = await this.getDatabase();
            db.manager.findOneBy(Product, { product_id: productId }).then((product) => {
                if (product) {
                    product.price = data.price ? parseFloat(data.price) : 0; // Ensure price is a number
                    product.name = data.name; // Update the name
                    product.last_update = new Date(); // Update the last update date
                    db.manager.save(product).then((updatedProduct) => {
                        resolve(updatedProduct);
                    }).catch((error: any) => {
                        console.error(error);
                        reject(error);
                    });
                } else {
                    reject(new Error("Product not found"));
                }
            }).catch((error: any) => {
                console.error(error);
                reject(error);
            });
        });
    }
}