import { DataSource, In, PrimaryColumnCannotBeNullableError } from 'typeorm';
import { connectToDatabase } from '../store/db/Database';
import { TreeNode } from '../interface/TreeInterface';
import { Category } from '../entity/Category.entity';
import { Product } from '../entity/Product.entity';

export class HomeServices {
  private async getDatabase() {
    return await connectToDatabase();
  }
  getCategoriesMenu(filterByDay: boolean = true): Promise<TreeNode> {
    return new Promise(async (resolve, reject) => {
      let db = await this.getDatabase();
      let tree: TreeNode;
      db?.manager
        .find(Category, {
          relations: {
            products: true,
          },
        })
        .then(categories => {
          // console.log("Categorias")
          // console.log(categories)
          tree = this.constructTree(categories, null, filterByDay);
          resolve(tree);
        })
        .catch((error: any) => {
          console.log(error);
          reject(error);
        });
    });
  }
  private constructTree(
    categories: Category[],
    actual: Category | null,
    filterByDay: boolean,
  ): TreeNode {
    let root: TreeNode = {
      name: 'Root',
      category_id: -1,
      parent_id: null,
      description: '',
      image: '',
      children: [],
    };
    let childs = categories.filter(category => category.parent_id == null);
    for (let i = 0; i < childs.length; i++) {
      root.children?.push(this.addChilds(categories, childs[i], root, filterByDay));
    }
    return root;
  }
  private addChilds(
    categories: Category[],
    actual: Category,
    parent: TreeNode,
    filterByDay: boolean,
  ): TreeNode {
    let productsToShow = actual.products;

    // Filter products by current day availability only if filterByDay is true
    if (filterByDay) {
      // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const today = new Date().getDay();

      productsToShow = actual.products.filter(product => {
        switch (today) {
          case 0: // Sunday
            return product.sunday === 1;
          case 1: // Monday
            return product.monday === 1;
          case 2: // Tuesday
            return product.tuesday === 1;
          case 3: // Wednesday
            return product.wednesday === 1;
          case 4: // Thursday
            return product.thursday === 1;
          case 5: // Friday
            return product.friday === 1;
          case 6: // Saturday
            return product.saturday === 1;
          default:
            return false;
        }
      });
    }

    let node: TreeNode = {
      name: actual.name,
      category_id: actual.category_id,
      parent_id: actual.parent_id,
      description: actual.description,
      image: actual.image,
      children: [],
      parent: parent,
      products: productsToShow.sort((a, b) => a.order - b.order),
    };

    let childs = categories.filter(
      category => category.parent_id == actual.category_id,
    );
    if (childs.length == 0) {
      return node;
    }
    for (let i = 0; i < childs.length; i++) {
      node.children?.push(this.addChilds(categories, childs[i], node, filterByDay));
    }
    return node;
  }

  getProductByProductID(product_id: number[]): Promise<Product[]> {
    return new Promise(async (resolve, reject) => {
      let db = await this.getDatabase();
      db?.manager
        .findBy(Product, {
          product_id: In(product_id),
        })
        .then(products => {
          resolve(products);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }
}
