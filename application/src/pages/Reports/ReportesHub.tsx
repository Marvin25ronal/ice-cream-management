import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ReportService, HubKPIs} from '../../services/ReportService';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL, Utils} from '../../constants/utils';

const reportService = new ReportService();

const todayStr = () =>
  new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

interface HubCardProps {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  gradientColors: [string, string];
  onPress: () => void;
  delay: number;
}

const HubCard = ({
  icon,
  title,
  subtitle,
  value,
  gradientColors,
  onPress,
  delay,
}: HubCardProps) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <Pressable
      style={({pressed}) => [styles.card, pressed && {opacity: 0.85}]}
      onPress={onPress}>
      <LinearGradient
        colors={gradientColors}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.cardGradient}>
        <View style={styles.cardLeft}>
          <View style={styles.cardIconBadge}>
            <Icon name={icon} size={26} color="#FFF" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.cardValue} numberOfLines={2} adjustsFontSizeToFit>
            {value}
          </Text>
          <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </View>
      </LinearGradient>
    </Pressable>
  </Animated.View>
);

const ReportesHub = ({navigation}: {navigation: any}) => {
  const [kpis, setKpis] = useState<HubKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>({
    start: todayStr(),
    end: todayStr(),
  });

  const loadKPIs = useCallback(
    async (r: DateRange) => {
      setLoading(true);
      try {
        const data = await reportService.getHubKPIs(r.start, r.end);
        setKpis(data);
      } catch (e) {
        console.error('Error cargando KPIs del hub:', e);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      loadKPIs(range);
    }, [loadKPIs, range]),
  );

  const handleDateChange = useCallback(
    (r: DateRange) => {
      setRange(r);
      loadKPIs(r);
    },
    [loadKPIs],
  );

  const netoPositive = (kpis?.neto ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <ReportDateFilter
        onChange={handleDateChange}
        accentColor="#F59E0B"
        accentGradient={['#F59E0B', '#FCD34D']}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <HubCard
            icon="cash-multiple"
            title="Ventas"
            subtitle={`${kpis?.totalOrdenes ?? 0} órdenes completadas`}
            value={`${CURRENCY_SYMBOL} ${(kpis?.totalVentas ?? 0).toFixed(2)}`}
            gradientColors={['#27AE60', '#2ECC71']}
            onPress={() =>
              navigation.navigate(Utils.screens.REPORTE_VENTAS, {
                start: range.start,
                end: range.end,
              })
            }
            delay={0}
          />

          <HubCard
            icon="trophy-outline"
            title="Productos"
            subtitle="Más vendido"
            value={kpis?.topProduct ?? '—'}
            gradientColors={['#8B5CF6', '#A78BFA']}
            onPress={() =>
              navigation.navigate(Utils.screens.REPORTE_PRODUCTOS, {
                start: range.start,
                end: range.end,
              })
            }
            delay={80}
          />

          <HubCard
            icon="shape-outline"
            title="Categorías"
            subtitle="Mayor ingreso"
            value={kpis?.topCategory ?? '—'}
            gradientColors={['#F59E0B', '#FCD34D']}
            onPress={() =>
              navigation.navigate(Utils.screens.REPORTE_CATEGORIAS, {
                start: range.start,
                end: range.end,
              })
            }
            delay={160}
          />

          <HubCard
            icon="cash-minus"
            title="Gastos & Cierre"
            subtitle={`Neto: ${CURRENCY_SYMBOL} ${(kpis?.neto ?? 0).toFixed(2)}`}
            value={`${CURRENCY_SYMBOL} ${(kpis?.totalGastos ?? 0).toFixed(2)}`}
            gradientColors={['#FF6348', '#FF8C42']}
            onPress={() =>
              navigation.navigate(Utils.screens.REPORTE_GASTOS, {
                start: range.start,
                end: range.end,
              })
            }
            delay={240}
          />

          {/* Neto resumen */}
          <Animated.View
            entering={FadeInDown.delay(320).springify()}
            style={[
              styles.netoCard,
              {borderLeftColor: netoPositive ? '#27AE60' : '#E74C3C'},
            ]}>
            <Text style={styles.netoLabel}>Balance neto del período</Text>
            <Text
              style={[
                styles.netoValue,
                {color: netoPositive ? '#27AE60' : '#E74C3C'},
              ]}>
              {CURRENCY_SYMBOL} {(kpis?.neto ?? 0).toFixed(2)}
            </Text>
            <Icon
              name={netoPositive ? 'trending-up' : 'trending-down'}
              size={22}
              color={netoPositive ? '#27AE60' : '#E74C3C'}
              style={styles.netoIcon}
            />
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

export default ReportesHub;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  cardLeft: {
    flex: 1,
    gap: 4,
  },
  cardIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#FFF',
  },
  cardSubtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.8)',
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: 130,
  },
  cardValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 20,
    color: '#FFF',
    textAlign: 'right',
  },
  netoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  netoLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    flex: 1,
  },
  netoValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    marginRight: 8,
  },
  netoIcon: {},
});
