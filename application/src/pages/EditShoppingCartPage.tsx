import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { HomeServices } from '../services/HomeServices';
import { Product } from '../entity/Product.entity';
import Animated from 'react-native-reanimated';
import { themeInterface } from '../interface/themeInterface';
import ShoppingCartListItem from '../components/ShoppingCart/ShoppingCartListItem';
import ResumeShopping from '../components/ShoppingCart/ResumeShopping';
export interface AgrupatedProducts {
    id: number
    products: Product[]
}
const EditShoppingCartPage = ({ route }: { route: any }) => {
    const shoppingCart: number[] = useSelector((state: any) => state.shoppingCart.value);
    const [homeService] = useState(new HomeServices());
    const [elements, setElements] = useState<{ products: Product[], id: number }[]>([])
    
    //get from router edit var
    const { edit } = route.params
    useEffect(() => {
        //get data
        homeService.getProductByProductID(shoppingCart).then((products) => {
            //agregamos los elementos como vienen en un arreglo agrupandolos por el id
            let elem: AgrupatedProducts[] = []
            shoppingCart.forEach((item) => {
                if (elem.find(e => item == e.id)) {
                    let element = elem.find(e => e.id == item)
                    let product = products.find(e => e.product_id == item)
                    if (product)
                        element?.products.push(product)
                } else {
                    let element: AgrupatedProducts = {
                        id: item,
                        products: products.filter(e => e.product_id == item)
                    }
                    elem.push(element)
                }

            })
            setElements(elem)
        }).catch((error) => {
            console.log(error)
        })
        console.log(shoppingCart)
    }, [shoppingCart])
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'row',
            width: '100%',
            padding: 10,
            gap: 10
        },
        tableContainer: {

            width: '70%',
            height: '100%',
            flexDirection: 'column',

        },
        priceContainer: {
            // backgroundColor: 'red',
            width: '30%',
            height: '100%',
            paddingBottom: 20
        }
    })

    return (
        <View style={styles.container}>
            <Animated.ScrollView style={styles.tableContainer}>
                {
                    elements.map((item, index) => (
                        <ShoppingCartListItem key={index} item={item} edit={edit} />
                    ))
                }
            </Animated.ScrollView>
            <View style={styles.priceContainer}>
                <ResumeShopping elements={elements} />
            </View>
        </View>
    )
}

export default EditShoppingCartPage

