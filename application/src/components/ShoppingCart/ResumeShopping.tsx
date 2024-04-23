import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { AgrupatedProducts } from '../../pages/EditShoppingCartPage'
import { useSelector } from 'react-redux';
import { themeInterface } from '../../interface/themeInterface';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL } from '../../constants/utils';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import { useNavigation } from '@react-navigation/native';


const ResumeShopping = ({ elements }: { elements: AgrupatedProducts[] }) => {
    const [total, setTotal] = useState(0)
    useEffect(() => {
        const totalPrices = elements.reduce((total, item) => {
            // Sumar el precio de cada producto en la propiedad `products` del elemento
            return total + item.products.reduce((subtotal, product) => subtotal + product.price, 0);
        }, 0);
        setTotal(totalPrices)
    }, [elements])
    const navigation = useNavigation()
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const styles = StyleSheet.create({
        cardContainer: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            paddingHorizontal: 10,
            paddingVertical: 5,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            marginVertical: 10,
            borderRadius: 10,
            margin: 10,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'space-between',
            height: '100%',
        },
        totalContainer: {
            marginTop: 10,
            alignItems: 'center',
            flexGrow: 2,
            justifyContent: 'center'
        },
        totalTitle: {
            fontFamily: Fonts.LatoRegular,
            color: theme.MODAL_TEXT_COLOR,
            fontSize: FontsSize.xxl
        },
        price: {
            fontFamily: Fonts.LatoBold,
            color: theme.MODAL_TEXT_COLOR,
            fontSize: FontsSize.x2xl,
            marginTop: 20
        },
        actionsContainer: {
            flexDirection: 'column',
            width: '100%'
        },
        button: {
            backgroundColor: 'blue',
            paddingHorizontal: 20,
            justifyContent: 'center',
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 5,
            borderColor: theme.HEADER_TEXT_COLOR,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
            paddingVertical: 10,
            marginTop: 20,
            width: '100%'
        },


    })
    return (
        <View style={styles.cardContainer}>
            <View style={styles.totalContainer}>
                <Text style={styles.totalTitle}>Total</Text>
                <Text style={styles.price}>
                    {CURRENCY_SYMBOL} {total}
                </Text>
            </View>
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.CANCEL_BUTTON_COLOR }}
                    onPress={() => {
                        navigation.goBack();
                    }}
                >
                    <IconSelector icon_class={type_class_icon.FontAwesome5} icon='backspace' size={30} color={'white'} />
                </TouchableOpacity>
                <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.CONFIRM_BUTTON_COLOR }}>
                    <IconSelector icon_class={type_class_icon.Feather} icon='shopping-cart' size={30} color={'white'} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default ResumeShopping

