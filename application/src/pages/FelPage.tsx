import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import WebView from 'react-native-webview';
const url = 'https://farm3.sat.gob.gt/menu/login.jsf';
const url2 = 'https://webbrowsertools.com/test-download-with/';
const FelPage = () => {
  return <WebView source={{ uri: url }} style={{ flex: 1 }} />;
};

export default FelPage;

const styles = StyleSheet.create({});
