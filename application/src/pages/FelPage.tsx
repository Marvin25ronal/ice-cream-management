import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import WebView from 'react-native-webview'

const FelPage = () => {
    return (
        <WebView source={{ uri: 'https://farm3.sat.gob.gt/menu/login.jsf' }} style={{ flex: 1 }} />
    )
}

export default FelPage

const styles = StyleSheet.create({})