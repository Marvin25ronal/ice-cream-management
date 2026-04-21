import React, {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts, FontsSize} from '../../constants/Fonts';

interface Props {
  icon: string;
  value: string;
  label: string;
  gradientColors: string[];
  iconBg?: string;
}

const KpiCard = memo(({icon, value, label, gradientColors, iconBg}: Props) => (
  <View style={styles.container}>
    <LinearGradient
      colors={gradientColors}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.gradient}>
      <View style={[styles.iconBadge, iconBg ? {backgroundColor: iconBg} : null]}>
        <Icon name={icon} size={22} color="#FFF" />
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </LinearGradient>
  </View>
));

KpiCard.displayName = 'KpiCard';

export default KpiCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  gradient: {
    padding: 16,
    gap: 6,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  value: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#FFF',
  },
  label: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
  },
});
