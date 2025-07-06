import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../../interface/themeInterface';
import { useSelector } from 'react-redux';
import { Product } from '../../../entity/Product.entity';
import { CURRENCY_SYMBOL, Utils } from '../../../constants/utils';
import { ImagesDefinition } from '../../../shared/ImagesConstants'
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { EditProductParamList } from '../../../routes/EditProductNavigator';

const EditProductListItem = ({ product }: { product: Product }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const navigation = useNavigation<StackNavigationProp<EditProductParamList>>()
    const styles = StyleSheet.create({
        container: {
            width: '100%',
            padding: 10,
        },
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            padding: 15,
            borderRadius: 10,
            flexDirection: 'row',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
        },
        image: {
            width: 50,
            height: 50,
            borderRadius: 10,
            marginRight: 10,
        },
        description: {
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'column',
        },
        name: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'black',
        },
        price: {
            fontSize: 14,
            color: 'black',
        },
    })
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card}
                onPress={() => {
                    navigation.navigate(Utils.screens.EDIT_PRODUCT, {
                        productId: product.product_id
                    })
                }}
            >
                <View style={styles.image}>
                    <Image
                        source={
                            ImagesDefinition.find((img) => img.name === product.image)?.image || ImagesDefinition[0].image
                        }
                        width={50}
                        height={50}
                        style={styles.image}
                    />
                </View>
                <View style={styles.description}>
                    <Text style={styles.name}>
                        {product.name}
                    </Text>
                    <Text style={styles.price}>
                        {CURRENCY_SYMBOL}   {product.price}
                    </Text>
                    <Text>
                        {product.last_update?.toDateString()}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    )
}

export default EditProductListItem

const styles = StyleSheet.create({})