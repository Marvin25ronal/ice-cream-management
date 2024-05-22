import { Easing, ImageBackground, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import React, { PropsWithChildren } from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { CardProps } from '../../interface/Card.interface'
import Animated, { Extrapolation, ReduceMotion, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { ImagesDefinition } from '../../shared/ImagesConstants'
import { WIDTH } from '../UI/SplashScreen'
import { Fonts, FontsSize } from '../../constants/Fonts'
import { TouchableHighlight } from 'react-native-gesture-handler'

const PaymentMethodCard = ({ children, width, optionSelected, setOption, imageBackground, label, progress, index }: PropsWithChildren<CardProps>) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const smallsize = 0.8
    const styles = StyleSheet.create({
        card: {
            width: width,
            justifyContent: 'center',
            borderRadius: 15,
            padding: 10,
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        cardSelected: {
            width: width,
            justifyContent: 'center',
            borderRadius: 15,
            padding: 10,
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            borderWidth: 5,
            borderColor: theme.CARD_SELECTED_BORDER_COLOR,
        },
        imageBackground: {
            justifyContent: 'center',
            alignItems: 'center',
            resizeMode: 'cover',
            aspectRatio: 1,
            backgroundColor: 'white',
        },
        textContainer: {
            backgroundColor: theme.CARD_TEXT_BACKGROUND_COLOR,
            width: '100%',
            opacity: 0.8,
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 10,
        },
        text: {
            color: 'white',
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.extraLarge,
            textAlign: 'center'
        }
    })
    const reanimatedScale = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(
                        progress.value,
                        [index - 1, index, index + 1],
                        [smallsize, 1, smallsize],
                        Extrapolation.CLAMP
                    )
                }
            ]
        }
    })
    const changeScale = async () => {
        'worklet'
        progress.value = withTiming(index, { duration: 500 })
    }
    const stylecard = index == optionSelected ? styles.cardSelected : styles.card
    let backgroundImage = ImagesDefinition.find(e => e.name == imageBackground)?.image
    return (
        <Animated.View style={[stylecard, reanimatedScale]}>
            <TouchableOpacity

                onPress={() => {
                    if (setOption)
                        setOption(index)
                    changeScale()
                }}
            >
                <ImageBackground
                    source={backgroundImage}
                    style={styles.imageBackground}
                    imageStyle={{ borderRadius: 15 }}
                >
                    <View style={styles.textContainer}>
                        <Text style={styles.text}>
                            {label}
                        </Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

        </Animated.View>
    )
}

export default PaymentMethodCard

