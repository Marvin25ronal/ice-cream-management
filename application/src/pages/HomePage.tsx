import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { Utils } from '../constants/utils'
import { themeInterface } from '../interface/themeInterface'

const HomePage = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation();
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      flex: 1, alignItems: 'center', justifyContent: 'center'
    }
  })
  return (
    <View style={styles.page}>
      <Text style={{ color: 'red' }}>Home Screen</Text>
      <View>
        <Button
          onPress={() => {
            navigation.navigate(Utils.screens.MENU as never)
          }}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
      </View>

    </View>
  )
}

export default HomePage

