import { Product } from "../entity/Product.entity";

export interface TreeNode {
    name: string;
    description: string;
    image: string;
    category_id: number;
    parent_id: number | null;
    children: TreeNode[] | null;
    parent?: TreeNode | null;
    products?: Product[] | null;
}