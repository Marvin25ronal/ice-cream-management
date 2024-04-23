import { StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { HomeServices } from '../services/HomeServices';
import { Product } from '../entity/Product.entity';

const EditShoppingCartPage = () => {
    const shoppingCart: number[] = useSelector((state: any) => state.shoppingCart.value);
    const [homeService] = useState(new HomeServices());
    const [elements, setElements] = useState<Product[]>([])
    useEffect(() => {
        //get data
        homeService.getProductByProductID(shoppingCart).then((products) => {
            setElements(products)
        }).catch((error) => {
            console.log(error)
        })
    }, [])

    return (
        <View>
            {elements.map((element) => {
                return <Text style={{color:'black'}} key={element.product_id}>{element.name}</Text>

            }
            )}
            <Text>EditShoppingCartPage</Text>
        </View>
    )
}

export default EditShoppingCartPage

const styles = StyleSheet.create({})