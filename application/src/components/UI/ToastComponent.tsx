import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Toast from 'react-native-toast-message';
import { themeInterface } from '../../interface/themeInterface';
import { useSelector } from 'react-redux';
import { WIDTH } from './SplashScreen';
import { Fonts, FontsSize } from '../../constants/Fonts';

const ToastComponent = () => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const styles = StyleSheet.create({
    error: {
      backgroundColor: '#a4133c',
      width: WIDTH * 0.50,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      borderColor: '#6a040f',
      borderWidth: 5
    },
    text1: {
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBlack,
      color: 'white',
    },
    info: {
      backgroundColor: theme.FORM_COLOR,
      width: WIDTH * 0.90,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      borderLeftColor: '#84DFFF',
      borderLeftWidth: 5,
      borderWidth: 1,
    },
    text2: {
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoRegular,
      color: 'white',
      marginBottom: 10
    },
    success: {
      backgroundColor: '#2dc653',
      width: WIDTH * 0.50,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 10,
      borderColor: '#01B701',
      borderWidth: 5,
    }
  })
  const ToastConfiguration = {
    success: ({ text1, text2 }: any) => (
      <View style={styles.success}>
        <Text style={styles.text1}>{text1}</Text>
        <Text style={styles.text2}>{text2}</Text>
      </View>
    ),
    error: ({ text1, text2 }: any) => (
      <View style={styles.error}>
        <Text style={styles.text1}>{text1}</Text>
        <Text style={styles.text2}>{text2}</Text>
      </View>
    ),
    info: ({ text1, text2 }: any) => (
      <View style={styles.info}>
        <Text style={styles.text1}>{text1}</Text>
        <Text style={styles.text2}>{text2}</Text>
      </View>
    )

  }
  return (
    <Toast config={{ ...ToastConfiguration }} position='top' />
  )
}

export default ToastComponent

const styles = StyleSheet.create({})