import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { Product } from '../../entity/Product.entity'
import { themeInterface } from '../../interface/themeInterface';
import { useDispatch, useSelector } from 'react-redux';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { AgrupatedProducts } from '../../pages/EditShoppingCartPage';
import { CURRENCY_SYMBOL } from '../../constants/utils';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import { addToCart, clearCart, removeAllProductsId, removeFromCart } from '../../store/redux/carReducer';
import ModalComponent from '../UI/ModalComponent';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import ClearSelectedItemsModal from '../Home/ClearSelectedItemsModal';

const ShoppingCartListItem = ({ item, edit }: { item: AgrupatedProducts, edit: boolean }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const dispatch = useDispatch()
    const [visible, setVisible] = useState(false)
    const progress = useSharedValue(0)
    const [selectedItems, setSelectedItems] = useState<AgrupatedProducts>()
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
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'space-between'
        },
        textContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingRight: 20,
            flexGrow: 2,
        },
        productName: {
            fontFamily: Fonts.LatoBold,
            color: theme.MODAL_TEXT_COLOR,
            fontSize: FontsSize.extraLarge
        },
        numberContainer: {
            //width: '10%',
            justifyContent: 'center',
            //alignItems:'flex-start',
        },
        actionsContainer: {
            //width: '40%',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 10,
        },
        numberText: {
            backgroundColor: theme.NUMBER_EDIT_SHOPPING_CART_BACKGROUND_COLOR,
            color: theme.NUMBER_EDIT_SHOPPING_CART_TEXT_COLOR,
            fontSize: FontsSize.xxl,
            padding: 10,
            textAlign: 'center',
            borderRadius: 10,
            borderWidth: 2,
            borderColor: theme.NUMBER_EDIT_SHOPPING_CART_BORDER_COLOR,
            fontFamily: Fonts.LatoBold,

        },
        priceText: {
            fontFamily: Fonts.LatoRegular,
            color: 'black',
            fontSize: FontsSize.xxl
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
            marginTop: 10
        },
    })
    const addProduct = (productId: number) => {
        dispatch(addToCart(productId))
    }
    const removeProduct = (productId: number) => {
        dispatch(removeFromCart(productId))
    }
    const removeById = (productId: number) => {
        dispatch(removeAllProductsId(productId))
    }

    return (
        <>
            <View style={styles.cardContainer}>
                <View style={styles.numberContainer}>
                    <Text style={styles.numberText}>
                        {item.products.length}
                    </Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.productName}>
                        {item.products[0].name}
                    </Text>
                    <Text style={styles.priceText}>
                        {CURRENCY_SYMBOL} {item.products[0].price * item.products.length}
                    </Text>
                </View>
                {
                    edit && (
                        <View style={styles.actionsContainer}>
                            <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.CANCEL_BUTTON_COLOR }}
                                onPress={() => {
                                    setSelectedItems(item)
                                    setVisible(true)
                                    progress.value = withSpring(1)
                                }}
                            >
                                <IconSelector icon_class={type_class_icon.Feather} color='white' icon='trash' size={25} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.EDIT_BUTTON_COLOR }}
                                onPress={() => {
                                    if (item.products.length == 1) {
                                        setSelectedItems(item)
                                        setVisible(true)
                                        progress.value = withSpring(1)
                                    }

                                    else
                                        removeProduct(item.id)
                                }}
                            >
                                <IconSelector icon_class={type_class_icon.AntDesign} color='white' icon='minus' size={25} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.PAY_BUTTON_COLOR }}
                                onPress={() => {
                                    addProduct(item.id)
                                }}
                            >
                                <IconSelector icon_class={type_class_icon.AntDesign} color='white' icon='plus' size={25} />
                            </TouchableOpacity>
                        </View>
                    )
                }

            </View>
            <ModalComponent visible={visible} setVisible={setVisible} height={"50%"} width={"50%"} progress={progress}>
                <ClearSelectedItemsModal confirm={() => {
                    if (selectedItems)
                        removeById(selectedItems.id)
                    setVisible(false)
                    progress.value = withSpring(0)
                }}
                    cancel={
                        () => {
                            setVisible(false)
                            progress.value = withSpring(0)
                        }
                    }
                />
            </ModalComponent>
        </>

    )
}

export default ShoppingCartListItem
