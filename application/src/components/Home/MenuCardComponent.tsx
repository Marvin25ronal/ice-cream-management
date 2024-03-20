import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { Image } from 'react-native'
import { ImagesDefinition } from '../../shared/ImagesConstants'

const MenuCardComponent = ({ name, description, image }: { name: String, description: String, image: String }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const styles = StyleSheet.create({
        container: {
            width: '25%',
            height: '50%',
            padding: 10
        },
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            width: '100%',
            height: '100%',
            borderRadius: 25,
            overflow: 'hidden'
        },
        imageBackground: {
            flex: 1, // Para que la imagen ocupe todo el espacio del contenedor
            justifyContent: 'center',
            alignItems: 'center',
            resizeMode: 'cover', // Ajusta la imagen para cubrir todo el área

        },
    })
    /*
    ../../../assets/images/categories/banana.png
 LOG  ../../../assets/images/categories/frozen.jpg
 LOG  ../../../assets/images/categories/paleta.jpg
 LOG  ../../../assets/images/categories/envasados.jpg
 LOG  ../../../assets/images/categories/pasteles.jpg
 LOG  ../../../assets/images/categories/soda.jpg
 */
    const backgroundImage = ImagesDefinition.find((img) => img.name === image)?.image


    return (
        <View style={styles.container}>

            <View style={styles.card}>
                <ImageBackground
                    source={backgroundImage} // Ruta relativa a la imagen en tus assets
                    style={styles.imageBackground}
                >
                </ImageBackground>
            </View>
        </View>
    )
}

export default MenuCardComponent

