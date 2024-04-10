import { Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { BackDropProps } from '../../interface/Props.interface'
import Animated, { useAnimatedProps, useAnimatedStyle, withTiming } from 'react-native-reanimated'

const BackDrop = ({ open, extraFunction, notclose, opacity = 0.8, zindex = 0 }: BackDropProps) => {
    const animatedProps = useAnimatedProps(() => ({
        pointerEvents: open.value < 1 ? ("none" as const) : ("box-none" as const),
    }))
    const style = useAnimatedStyle(() => ({
        backgroundColor: "black",
        opacity: opacity * open.value,
        zIndex: zindex
    }));
    return (
        <Animated.View
            style={[StyleSheet.absoluteFill, style]}
            animatedProps={animatedProps}
        >
            <Pressable
                style={StyleSheet.absoluteFill}
                onPress={() => {
                    if (notclose == undefined || notclose == false) {
                        open.value = withTiming(0)
                        if (extraFunction) {
                            extraFunction()
                        }
                    }
                }}
            />
        </Animated.View>
    )
}

export default BackDrop
