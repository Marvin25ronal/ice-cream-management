import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import CategoryProductsChooser from '../components/Maintenance/EditProducts/CategoryProductsChooser'
import { HomeServices } from '../services/HomeServices'
import { TreeNode } from '../interface/TreeInterface'
import Animated from 'react-native-reanimated'
import EditProductListItem from '../components/Maintenance/EditProducts/EditProductListItem'
import { Product } from '../entity/Product.entity'

const EditListProducts = () => {
    const [data, setdata] = useState<TreeNode>()
    const [homeService] = useState(new HomeServices())
    const [actualNode, setActualNode] = useState<TreeNode>()
    const [products, setProducts] = useState([] as Product[])
    const getTree = async () => {
        homeService.getCategoriesMenu().then((tree: TreeNode) => {
            // console.log(tree)
            setdata(tree)
            setActualNode(tree)
        }).catch((error) => {
            console.log(error)
        })
    }
    useEffect(() => {
        getTree();
    }, [])
    const renderTree = (node: TreeNode | undefined) => {
        if (!node) return null;
        //ver si es un nodo hoja
        if (node.children && node.children.length > 0) {
            return node.children.map((child: TreeNode) => (
                <View key={child.category_id + 'category'}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16, color: 'black' }}>{child.name}</Text>
                    {renderTree(child)}
                </View>
            ))
        } else {
            return node.products?.map((product: Product) => (
                <EditProductListItem
                    key={product.product_id + 'product'}
                    product={product}
                />
            ))
        }
    }
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            alignItems: 'center',
            flexDirection: 'column',
        },
        categoryChooser: {
            width: '100%',
            padding: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 10,
        },
        scrollView: {
            width: '100%',
            flex: 1,
        },
    })
    return (
        <View style={styles.container}>
            <View style={styles.categoryChooser}>
                <CategoryProductsChooser
                    categories={data}
                    selectedNode={actualNode}
                    setNode={setActualNode}
                />
            </View>
            <Animated.ScrollView
                style={styles.scrollView}
                contentContainerStyle={{ padding: 10 }}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                horizontal={false}
            >

                {renderTree(actualNode)}


            </Animated.ScrollView>
        </View>
    )
}

export default EditListProducts

const styles = StyleSheet.create({})