import { Dimensions, StyleSheet, Text, View, useColorScheme } from 'react-native'
import React, { useEffect } from 'react'
import { themeInterface } from '../../interface/themeInterface';
import { useDispatch, useSelector } from 'react-redux';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { setTheme } from '../../store/redux/themeReducer';
import { darkTheme } from '../../styles/Theme';
const image = require('../../../assets/images/app/logo-sarita-1.png')
export const WIDTH = Dimensions.get('window').width;
export const HEIGHT_SCREEN = Dimensions.get('screen').height
const SplashScreen = ({ callback }: { callback: any }) => {
    const isDarkMode = useColorScheme() === 'dark';
    const dispatch = useDispatch();
    const scaleLogo = useSharedValue(1)
    useEffect(() => {
        if (isDarkMode) {
            dispatch(setTheme(darkTheme))
        } else {
            dispatch(setTheme(darkTheme))
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            startAnimation.value = withTiming(-HEIGHT_SCREEN , { duration: 500 })
            scaleLogo.value = withTiming(0.35, { duration: 500 })
            // console.log('ya')
            callback(true)
        }, 500)
    }, [])
    const theme: themeInterface = useSelector((state: any) => state.theme.value);
    const startAnimation = useSharedValue(0)
    const reanimatedScaleLogo = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scaleLogo.value
                }
            ]
        }
    })
    const reanimatedBackground = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: startAnimation.value
                }
            ]
        }
    })
    return (
        <>
            <Animated.View style={[
                {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: theme.SPLASH_SCREEN_BACKGROUND_COLOR,
                    zIndex: 1
                },
                reanimatedBackground
            ]}
            >
                <Animated.View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Animated.Image source={image}

                        style={[
                            reanimatedScaleLogo
                        ]}
                    />
                </Animated.View>
            </Animated.View>
        </>
    )
}

export default SplashScreen

const styles = StyleSheet.create({})