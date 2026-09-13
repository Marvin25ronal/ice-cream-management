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
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ReportService, OrderStatusReport } from '../../services/ReportService';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import KpiCard from '../../components/Reports/KpiCard';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import { Fonts, FontsSize } from '../../constants/Fonts';

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-13.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const reportService = new ReportService();

const HOURS_LABELS = [
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
];

const todayStr = () =>
  new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const completedChartConfig = {
  backgroundColor: '#FFF',
  backgroundGradientFrom: '#FFF',
  backgroundGradientTo: '#FFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
  labelColor: () => '#636E72',
  style: { borderRadius: 16 },
};

const cancelledChartConfig = {
  ...completedChartConfig,
  color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
};

const ReporteOrdenes = ({ route }: { route: any }) => {
  const initialStart = route?.params?.start ?? todayStr();
  const initialEnd = route?.params?.end ?? todayStr();

  const [data, setData] = useState<OrderStatusReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const result = await reportService.getOrderStatusReport(r.start, r.end);
      setData(result);
    } catch (e) {
      console.error('Error reporte órdenes:', e);
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

  const conversionRate = data?.conversionRate ?? 0;
  const conversionMessage =
    conversionRate >= 90
      ? 'Excelente tasa de cierre'
      : 'Hay margen de mejora en el cierre de órdenes';

  const completedData = {
    labels: HOURS_LABELS,
    datasets: [{ data: data?.completedByHour ?? new Array(15).fill(0) }],
  };
  const cancelledData = {
    labels: HOURS_LABELS,
    datasets: [{ data: data?.cancelledByHour ?? new Array(15).fill(0) }],
  };

  return (
    <View style={styles.container}>
      <ReportDateFilter
        onChange={handleDateChange}
        accentColor="#E17055"
        accentGradient={['#E17055', '#FDCB6E']}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#E17055" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.delay(0).springify()}
            style={styles.kpiRow}>
            <KpiCard
              icon="clipboard-list-outline"
              value={String(data?.totalOrders ?? 0)}
              label="Total órdenes"
              gradientColors={['#E17055', '#FDCB6E']}
            />
            <KpiCard
              icon="check-circle-outline"
              value={String(data?.completedOrders ?? 0)}
              label="Completadas"
              gradientColors={['#27AE60', '#2ECC71']}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(60).springify()}
            style={styles.kpiRow}>
            <KpiCard
              icon="close-circle-outline"
              value={String(data?.cancelledOrders ?? 0)}
              label="Canceladas"
              gradientColors={['#E74C3C', '#FF6B6B']}
            />
            <KpiCard
              icon="percent-outline"
              value={`${conversionRate.toFixed(1)}%`}
              label="Tasa de conversión"
              gradientColors={['#0984E3', '#74B9FF']}
            />
          </Animated.View>

          <Text style={styles.conversionMessage}>{conversionMessage}</Text>

          <ReportSectionTitle
            title="Completadas por hora"
            accentColor="#27AE60"
          />
          <Animated.View
            entering={FadeInDown.delay(120).springify()}
            style={styles.chartCard}>
            <BarChart
              data={completedData}
              width={CHART_WIDTH - 32}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={completedChartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </Animated.View>

          <ReportSectionTitle
            title="Canceladas por hora"
            accentColor="#E74C3C"
          />
          <Animated.View
            entering={FadeInDown.delay(180).springify()}
            style={styles.chartCard}>
            <BarChart
              data={cancelledData}
              width={CHART_WIDTH - 32}
              height={180}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={cancelledChartConfig}
              style={styles.chart}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

export default ReporteOrdenes;

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
  kpiRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  conversionMessage: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 8,
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
});
