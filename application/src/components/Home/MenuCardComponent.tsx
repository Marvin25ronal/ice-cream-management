import { ImageBackground, StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { ImagesDefinition } from '../../shared/ImagesConstants'

import { Fonts, FontsSize } from '../../constants/Fonts'

const MenuCardComponent = ({ name, description, image, onPress, onLongPress, isProduct = false }: { name: String, description: String, image: String, onPress: any, onLongPress?: any, isProduct?: boolean }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const dimensions = Dimensions.get('window')
    const styles = StyleSheet.create({
        container: {
            width: '20%',
            height: dimensions.height * 0.38,
            padding: 10
        },
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            width: '100%',
            height: '100%',
            borderRadius: 25,
            overflow: 'hidden',
            borderWidth: 5,
            borderColor: isProduct ? theme.CARD_BORDER_COLOR_PRODUCT : 'white',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.34,
            shadowRadius: 6.27,

            elevation: 10,
        },
        imageBackground: {
            flex: 1, // Para que la imagen ocupe todo el espacio del contenedor
            justifyContent: 'center',
            alignItems: 'center',
            resizeMode: 'cover', // Ajusta la imagen para cubrir todo el área

        },
        textContainer: {
            backgroundColor: isProduct ? theme.CARD_TEXT_BACKGROUND_COLOR_PRODUCT : theme.CARD_TEXT_BACKGROUND_COLOR,
            width: '100%',
            height: 'auto',
            position: 'absolute',
            top: '75%',
            opacity: 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10
        },
        text: {
            color: 'white',
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.extraLarge,
            textAlign: 'center'
        }
    })
    let backgroundImage = ImagesDefinition.find((img) => img.name === image)?.image

    if (!backgroundImage) {
        backgroundImage = require('../../../assets/images/products/defaultb.png')
    }


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card} onPress={onPress} onLongPress={onLongPress}
            >
                <ImageBackground
                    source={backgroundImage} // Ruta relativa a la imagen en tus assets
                    style={styles.imageBackground}
                >
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>{name}</Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        </View>
    )
}

export default MenuCardComponent

