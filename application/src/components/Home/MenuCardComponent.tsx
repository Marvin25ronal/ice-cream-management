import { ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { Image } from 'react-native'
import { ImagesDefinition } from '../../shared/ImagesConstants'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Fonts, FontsSize } from '../../constants/Fonts'

const MenuCardComponent = ({ name, description, image, onPress }: { name: String, description: String, image: String, onPress: any }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const styles = StyleSheet.create({
        container: {
            width: '20%',
            height: '45%',
            padding: 10
        },
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            width: '100%',
            height: '100%',
            borderRadius: 25,
            overflow: 'hidden',
            borderWidth: 5,
            borderColor: 'white',
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
            backgroundColor: '#001d3d',
            width: '100%',
            height: '15%',
            position: 'absolute',
            top: '75%',
            opacity: 0.8,
            justifyContent: 'center',
            alignItems: 'center'
        },
        text: {
            color: 'white',
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.extraLarge
        }
    })
    const backgroundImage = ImagesDefinition.find((img) => img.name === image)?.image


    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card} onPress={onPress}  >
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

