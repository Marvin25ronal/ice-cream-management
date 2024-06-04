import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { CreateBackup } from '../store/db/Database'
import { useSelector } from 'react-redux'
import { RootState } from '../store/redux/store'
import { Fonts, FontsSize } from '../constants/Fonts'

const MaintenancePage = () => {
    const theme = useSelector((state: RootState) => state.theme.value)
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',

        },
        text: {
            color: theme.LABEL_FORM_COLOR,
            fontSize: FontsSize.x2xl,
            fontFamily: Fonts.LatoBold
        },
        card: {
            backgroundColor: theme.CARD_BACKGROUND_COLOR,
            borderRadius: 10,
            width: 'auto',
            padding: 30,
          
            borderWidth: 5,
            borderColor: 'white',
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,

            elevation: 5,
        },
        cardText: {
            color: 'white',
            fontSize: FontsSize.large,
            fontFamily: Fonts.LatoBold,
        }
    })
    return (
        <View style={styles.container}>
            <TouchableOpacity style={[styles.card, { backgroundColor: theme.EDIT_BUTTON_COLOR }]} onPress={() => {
                CreateBackup()
            }}>
                <Text style={styles.cardText}>Hacer Backup</Text>
            </TouchableOpacity>
        </View>
    )
}

export default MaintenancePage
