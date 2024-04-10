import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { Fonts, FontsSize } from '../../constants/Fonts'

const NumberIndicator = ({ elements = 0 }: { elements: number }) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const styles = StyleSheet.create({
        indicator: {
            backgroundColor: theme.NUMBER_INDICATOR_BACKGROUND,
            position: 'absolute',
            width: theme.NUMBER_INDICATOR_SIZE,
            height: theme.NUMBER_INDICATOR_SIZE,
            zIndex: 1,
            right: 0,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.TEXT_INDICATOR_COLOR,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        text_indicator: {
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.extraLarge,
            color: theme.TEXT_INDICATOR_COLOR
        }
    })
    return (
        <View style={styles.indicator}>
            <Text style={styles.text_indicator}>
                {elements}
            </Text>
        </View>
    )
}

export default NumberIndicator

