import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Fonts, FontsSize} from '../../constants/Fonts';

interface Props {
  title: string;
  accentColor?: string;
}

const ReportSectionTitle = memo(({title, accentColor = '#27AE60'}: Props) => (
  <View style={styles.container}>
    <View style={[styles.bar, {backgroundColor: accentColor}]} />
    <Text style={styles.title}>{title}</Text>
  </View>
));

ReportSectionTitle.displayName = 'ReportSectionTitle';

export default ReportSectionTitle;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  bar: {
    width: 4,
    height: 18,
    borderRadius: 2,
  },
  title: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
});
