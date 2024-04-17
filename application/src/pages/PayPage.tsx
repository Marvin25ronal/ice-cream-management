import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationProp, RouteProp, useRoute } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootStackParamList } from '../routes/StackNavigator'
import { SCREENS } from '../constants/navigation/screeens'

const PayPage = ({ navigation }: { navigation: any }) => {
  const route = useRoute<RouteProp<RootStackParamList, SCREENS.PAYMENT>>()
  return (
    <View>
      <Text style={{color:'black'}}>
        {route.params.products.length}
      </Text>
    </View>
  )
}

export default PayPage

const styles = StyleSheet.create({})