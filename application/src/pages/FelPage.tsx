import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import WebView from 'react-native-webview';

const url = 'https://farm3.sat.gob.gt/menu/login.jsf';

const FelPage = () => {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>No se pudo cargar FEL</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <WebView
      source={{ uri: url }}
      style={{ flex: 1 }}
      originWhitelist={['https://*', 'http://*']}
      javaScriptEnabled
      domStorageEnabled
      thirdPartyCookiesEnabled
      sharedCookiesEnabled
      startInLoadingState
      renderLoading={() => (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}
      onError={(e) => {
        const { code, description, domain } = e.nativeEvent;
        setError(`domain: ${domain} | code: ${code} | ${description}`);
      }}
      onHttpError={(e) => {
        const { statusCode, description } = e.nativeEvent;
        setError(`HTTP ${statusCode} | ${description}`);
      }}
    />
  );
};

export default FelPage;

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  errorText: { textAlign: 'center', color: '#666' },
});
