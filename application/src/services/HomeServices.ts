import { DataSource, PrimaryColumnCannotBeNullableError } from "typeorm";
import { connectToDatabase } from "../store/db/Database";
import { TreeNode } from "../interface/TreeInterface";
import { Category } from "../entity/Category.entity";

export class HomeServices {


    private async getDatabase() {
        return await connectToDatabase();
    }
    getCategoriesMenu(): Promise<TreeNode> {
        return new Promise(async (resolve, reject) => {
            let db = await this.getDatabase();
            let tree: TreeNode;
            db?.manager.find(Category).then((categories) => {
                tree = this.constructTree(categories, null);
                resolve(tree)
            }).catch((error: any) => {
                console.log(error)
                reject(error)
            })
        })
    }
    private constructTree(categories: Category[], actual: Category | null): TreeNode {
        let root: TreeNode = {
            name: 'Root',
            category_id: -1,
            parent_id: null,
            description: '',
            image: '',
            children: []
        }
        let childs = categories.filter((category) => category.parent_id == null);
        for (let i = 0; i < childs.length; i++) {
            root.children?.push(this.addChilds(categories, childs[i]))
        }
        return root;
    }
    private addChilds(categories: Category[], actual: Category): TreeNode {
        let node: TreeNode = {
            name: actual.name,
            category_id: actual.category_id,
            parent_id: actual.parent_id,
            description: actual.description,
            image: actual.image,
            children: []
        }
        let childs = categories.filter((category) => category.parent_id == actual.category_id);
        if (childs.length == 0)
            return node;
        for (let i = 0; i < childs.length; i++) {
            node.children?.push(this.addChilds(categories, childs[i]))
        }
        return node;
    }

}