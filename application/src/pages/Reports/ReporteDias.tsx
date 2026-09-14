import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ReportService, DayOfWeekSales } from '../../services/ReportService';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL } from '../../constants/utils';

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-13.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const reportService = new ReportService();

const todayStr = () =>
  new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const chartConfig = {
  backgroundColor: '#FFF',
  backgroundGradientFrom: '#FFF',
  backgroundGradientTo: '#FFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(9, 132, 227, ${opacity})`,
  labelColor: () => '#636E72',
  style: { borderRadius: 16 },
};

const ReporteDias = ({ route }: { route: any }) => {
  const initialStart = route?.params?.start ?? todayStr();
  const initialEnd = route?.params?.end ?? todayStr();

  const [days, setDays] = useState<DayOfWeekSales[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const data = await reportService.getSalesByDayOfWeek(r.start, r.end);
      setDays(data);
    } catch (e) {
      console.error('Error reporte días:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(range);
    }, [load, range]),
  );

  const handleDateChange = useCallback(
    (r: DateRange) => {
      setRange(r);
      load(r);
    },
    [load],
  );

  const totalRevenue = days.reduce((acc, d) => acc + d.totalRevenue, 0);
  const totalOrders = days.reduce((acc, d) => acc + d.totalOrders, 0);
  const withSales = days.filter(d => d.totalOrders > 0);
  const bestDay = [...days].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  const worstDay = [...withSales].sort(
    (a, b) => a.totalRevenue - b.totalRevenue,
  )[0];
  const ranking = [...days].sort((a, b) => b.totalRevenue - a.totalRevenue);

  const chartData = {
    labels: days.map(d => d.dayName),
    datasets: [{ data: days.map(d => d.totalRevenue) }],
  };

  return (
    <View style={styles.container}>
      <ReportDateFilter
        onChange={handleDateChange}
        accentColor="#0984E3"
        accentGradient={['#0984E3', '#74B9FF']}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0984E3" />
        </View>
      ) : totalOrders === 0 ? (
        <Text style={styles.noData}>Sin ventas en este período</Text>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.delay(0).springify()}
            style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={styles.kpiLabel}>Total período</Text>
              <Text style={styles.kpiValue}>
                {CURRENCY_SYMBOL} {totalRevenue.toFixed(2)}
              </Text>
            </View>
            <View style={styles.kpi}>
              <Text style={styles.kpiLabel}>Órdenes totales</Text>
              <Text style={styles.kpiValue}>{totalOrders}</Text>
            </View>
          </Animated.View>

          <ReportSectionTitle
            title="Ventas por día de la semana"
            accentColor="#0984E3"
          />
          <Animated.View
            entering={FadeInDown.delay(60).springify()}
            style={styles.chartCard}>
            <BarChart
              data={chartData}
              width={CHART_WIDTH - 32}
              height={200}
              yAxisLabel={CURRENCY_SYMBOL + ' '}
              yAxisSuffix=""
              chartConfig={chartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(120).springify()}
            style={styles.highlightRow}>
            {bestDay && (
              <View style={[styles.highlightCard, styles.highlightBest]}>
                <Icon name="medal" size={20} color="#27AE60" />
                <Text style={styles.highlightLabel}>Mejor día</Text>
                <Text style={styles.highlightDay}>{bestDay.dayName}</Text>
                <Text style={styles.highlightValue}>
                  {CURRENCY_SYMBOL} {bestDay.totalRevenue.toFixed(2)}
                </Text>
              </View>
            )}
            {worstDay && (
              <View style={[styles.highlightCard, styles.highlightWorst]}>
                <Icon name="star-outline" size={20} color="#E17055" />
                <Text style={styles.highlightLabel}>Día más bajo</Text>
                <Text style={styles.highlightDay}>{worstDay.dayName}</Text>
                <Text style={styles.highlightValue}>
                  {CURRENCY_SYMBOL} {worstDay.totalRevenue.toFixed(2)}
                </Text>
              </View>
            )}
          </Animated.View>

          <ReportSectionTitle title="Ranking de días" accentColor="#0984E3" />
          <Animated.View
            entering={FadeInDown.delay(180).springify()}
            style={styles.rankCard}>
            {ranking.map((d, index) => {
              const pct =
                totalRevenue > 0 ? (d.totalRevenue / totalRevenue) * 100 : 0;
              return (
                <View
                  key={d.dayName}
                  style={[
                    styles.rankRow,
                    index === ranking.length - 1 && styles.lastRow,
                  ]}>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankDayName}>{d.dayName}</Text>
                    <View style={styles.progressBg}>
                      <View
                        style={[styles.progressFill, { width: `${pct}%` }]}
                      />
                    </View>
                    <Text style={styles.dayPct}>
                      {pct.toFixed(0)}% del total
                    </Text>
                  </View>
                  <View style={styles.rankRight}>
                    <Text style={styles.rankRevenue}>
                      {CURRENCY_SYMBOL} {d.totalRevenue.toFixed(2)}
                    </Text>
                    <Text style={styles.rankOrders}>
                      {d.totalOrders} órdenes
                    </Text>
                    <Text style={styles.rankAvg}>
                      Prom. {CURRENCY_SYMBOL}{' '}
                      {(d.totalOrders > 0
                        ? d.totalRevenue / d.totalOrders
                        : 0
                      ).toFixed(2)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

export default ReporteDias;

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
    paddingBottom: 32,
  },
  noData: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
    textAlign: 'center',
    marginTop: 40,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  kpi: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  kpiLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  kpiValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#2D3436',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  chart: {
    borderRadius: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  highlightCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 14,
    gap: 4,
    borderTopWidth: 3,
    elevation: 2,
  },
  highlightBest: {
    borderTopColor: '#27AE60',
  },
  highlightWorst: {
    borderTopColor: '#E17055',
  },
  highlightLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  highlightDay: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  highlightValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
  },
  rankCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
    gap: 12,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  rankInfo: {
    flex: 1,
    gap: 4,
  },
  rankDayName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  progressBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F0F0F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0984E3',
  },
  dayPct: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
  },
  rankRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  rankRevenue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  rankOrders: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  rankAvg: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
  },
});
