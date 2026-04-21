import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {LineChart, PieChart} from 'react-native-chart-kit';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ReportService, SalesSummary} from '../../services/ReportService';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import KpiCard from '../../components/Reports/KpiCard';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL} from '../../constants/utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const reportService = new ReportService();

const HOURS_LABELS = [
  '8', '9', '10', '11', '12', '13', '14',
  '15', '16', '17', '18', '19', '20', '21', '22',
];

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
  color: (opacity = 1) => `rgba(39, 174, 96, ${opacity})`,
  labelColor: () => '#636E72',
  style: {borderRadius: 16},
  propsForDots: {r: '4', strokeWidth: '2', stroke: '#27AE60'},
};

const ReporteVentas = ({route}: {route: any}) => {
  const initialStart = route?.params?.start ?? todayStr();
  const initialEnd = route?.params?.end ?? todayStr();

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const data = await reportService.getSalesSummary(r.start, r.end);
      setSummary(data);
    } catch (e) {
      console.error('Error reporte ventas:', e);
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

  const cashPct =
    summary && summary.totalRevenue > 0
      ? ((summary.cash / summary.totalRevenue) * 100).toFixed(0)
      : '0';
  const cardPct =
    summary && summary.totalRevenue > 0
      ? ((summary.card / summary.totalRevenue) * 100).toFixed(0)
      : '0';

  const pieData = [
    {
      name: 'Efectivo',
      population: summary?.cash ?? 0,
      color: '#27AE60',
      legendFontColor: '#2D3436',
      legendFontSize: 12,
    },
    {
      name: 'Tarjeta',
      population: summary?.card ?? 0,
      color: '#74B9FF',
      legendFontColor: '#2D3436',
      legendFontSize: 12,
    },
  ];

  const lineData = {
    labels: HOURS_LABELS,
    datasets: [
      {
        data:
          summary && summary.ordersByHour.length > 0
            ? summary.ordersByHour
            : new Array(15).fill(0),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <ReportDateFilter
        onChange={handleDateChange}
        accentColor="#27AE60"
        accentGradient={['#27AE60', '#2ECC71']}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#27AE60" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>

          {/* KPI row */}
          <Animated.View
            entering={FadeInDown.delay(0).springify()}
            style={styles.kpiRow}>
            <KpiCard
              icon="cash-multiple"
              value={`${CURRENCY_SYMBOL} ${(summary?.totalRevenue ?? 0).toFixed(2)}`}
              label="Total vendido"
              gradientColors={['#27AE60', '#2ECC71']}
            />
            <KpiCard
              icon="receipt"
              value={String(summary?.completedOrders ?? 0)}
              label="Órdenes"
              gradientColors={['#00B894', '#55EFC4']}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(60).springify()}
            style={styles.kpiRow}>
            <KpiCard
              icon="ticket-percent-outline"
              value={`${CURRENCY_SYMBOL} ${(summary?.avgTicket ?? 0).toFixed(2)}`}
              label="Ticket promedio"
              gradientColors={['#0984E3', '#74B9FF']}
            />
            <KpiCard
              icon="clock-time-eight-outline"
              value={summary?.peakHour || '—'}
              label="Hora pico"
              gradientColors={['#6C5CE7', '#A29BFE']}
            />
          </Animated.View>

          {/* Orders by hour */}
          <ReportSectionTitle
            title="Actividad por hora"
            accentColor="#27AE60"
          />
          <Animated.View
            entering={FadeInDown.delay(120).springify()}
            style={styles.chartCard}>
            <LineChart
              data={lineData}
              width={CHART_WIDTH - 32}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </Animated.View>

          {/* Payment methods */}
          <ReportSectionTitle
            title="Métodos de pago"
            accentColor="#27AE60"
          />
          <Animated.View
            entering={FadeInDown.delay(180).springify()}
            style={styles.chartCard}>
            {(summary?.cash ?? 0) + (summary?.card ?? 0) > 0 ? (
              <PieChart
                data={pieData}
                width={CHART_WIDTH - 32}
                height={160}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="8"
                absolute={false}
              />
            ) : (
              <Text style={styles.noData}>Sin datos de pago</Text>
            )}
            <View style={styles.payRow}>
              <View style={styles.payItem}>
                <Text style={styles.payLabel}>Efectivo</Text>
                <Text style={styles.payValue}>
                  {CURRENCY_SYMBOL} {(summary?.cash ?? 0).toFixed(2)}
                </Text>
                <Text style={styles.payPct}>{cashPct}%</Text>
              </View>
              <View style={styles.payDivider} />
              <View style={styles.payItem}>
                <Text style={styles.payLabel}>Tarjeta</Text>
                <Text style={styles.payValue}>
                  {CURRENCY_SYMBOL} {(summary?.card ?? 0).toFixed(2)}
                </Text>
                <Text style={styles.payPct}>{cardPct}%</Text>
              </View>
            </View>
          </Animated.View>

          {/* Extra KPIs */}
          <ReportSectionTitle title="KPIs adicionales" accentColor="#27AE60" />
          <Animated.View
            entering={FadeInDown.delay(240).springify()}
            style={styles.extraKpiCard}>
            <View style={styles.extraKpiRow}>
              <Text style={styles.extraKpiLabel}>Órdenes canceladas</Text>
              <Text style={styles.extraKpiValue}>
                {summary?.cancelledOrders ?? 0}
              </Text>
            </View>
            <View style={styles.extraKpiRow}>
              <Text style={styles.extraKpiLabel}>Tasa de conversión</Text>
              <Text style={styles.extraKpiValue}>
                {(summary?.conversionRate ?? 0).toFixed(1)}%
              </Text>
            </View>
            <View style={[styles.extraKpiRow, styles.lastRow]}>
              <Text style={styles.extraKpiLabel}>Productos por orden</Text>
              <Text style={styles.extraKpiValue}>
                {(summary?.avgProductsPerOrder ?? 0).toFixed(1)}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

export default ReporteVentas;

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
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 12,
  },
  noData: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
    paddingVertical: 32,
  },
  payRow: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
  },
  payItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  payDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  payLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  payValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  payPct: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
  },
  extraKpiCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  extraKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  extraKpiLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
  extraKpiValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
});
