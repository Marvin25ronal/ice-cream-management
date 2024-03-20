export interface TreeNode {
    name: string;
    description: string;
    image: string;
    category_id: number;
    parent_id: number | null;
    children: TreeNode[] | null;
}