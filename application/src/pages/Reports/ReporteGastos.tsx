import React, {memo, useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {BarChart} from 'react-native-chart-kit';
import Animated, {FadeInDown} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import {ExpenseService} from '../../services/ExpenseService';
import {ReportService, SalesSummary} from '../../services/ReportService';
import {PrintService} from '../../services/PrintService';
import {Expense} from '../../entity/Expense.entity';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL} from '../../constants/utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const expenseService = new ExpenseService();
const reportService = new ReportService();
const printService = new PrintService();

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
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(255, 99, 72, ${opacity})`,
  labelColor: () => '#636E72',
  style: {borderRadius: 16},
};

// ---------------------------------------------------------------------------
// Memoized item
// ---------------------------------------------------------------------------
interface ItemProps {
  item: Expense;
}

const ExpenseItem = memo(({item}: ItemProps) => {
  const color = item.expenseType?.color ?? '#FF6348';
  const iconName = item.expenseType?.icon ?? 'cash';
  const typeName = item.expenseType?.name ?? 'Gasto';
  const date = item.date ? new Date(item.date) : null;
  const timeStr = date
    ? `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    : '';

  return (
    <View style={styles.expItem}>
      <View style={[styles.expIconBadge, {backgroundColor: color + '22'}]}>
        <Icon name={iconName} size={20} color={color} />
      </View>
      <View style={styles.expInfo}>
        <Text style={styles.expType}>{typeName}</Text>
        {!!item.notes && (
          <Text style={styles.expNotes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
        <Text style={styles.expTime}>{timeStr}</Text>
      </View>
      <Text style={[styles.expAmount, {color}]}>
        {CURRENCY_SYMBOL} {item.amount.toFixed(2)}
      </Text>
    </View>
  );
});
ExpenseItem.displayName = 'ExpenseItem';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const ReporteGastos = ({route}: {route: any}) => {
  const initialStart = route?.params?.start ?? todayStr();
  const initialEnd = route?.params?.end ?? todayStr();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [range, setRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const [exp, sum] = await Promise.all([
        expenseService.getByDateRange(r.start, r.end),
        reportService.getSalesSummary(r.start, r.end),
      ]);
      setExpenses(exp);
      setSummary(sum);
    } catch (e) {
      console.error('Error reporte gastos:', e);
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

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalVentas = summary?.totalRevenue ?? 0;
  const neto = totalVentas - totalExpenses;
  const netoPositive = neto >= 0;

  // BarChart: gastos agrupados por tipo
  const typeMap = new Map<string, number>();
  expenses.forEach(e => {
    const name = e.expenseType?.name ?? 'Otro';
    typeMap.set(name, (typeMap.get(name) ?? 0) + e.amount);
  });
  const typeEntries = [...typeMap.entries()].sort((a, b) => b[1] - a[1]);
  const chartData = {
    labels: typeEntries.map(([name]) =>
      name.length > 8 ? name.substring(0, 7) + '.' : name,
    ),
    datasets: [{data: typeEntries.map(([, v]) => v)}],
  };

  const handlePrint = useCallback(async () => {
    if (printing) {
      return;
    }
    Alert.alert(
      'Imprimir cierre',
      '¿Deseas imprimir el resumen del cierre del día?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Imprimir',
          onPress: async () => {
            setPrinting(true);
            try {
              await printService.initPrinter();
              await printService.connectPrinter();
              await printService.printDailySummary(
                range.start,
                totalVentas,
                summary?.cash ?? 0,
                summary?.card ?? 0,
                expenses,
                totalExpenses,
                neto,
              );
            } catch (e) {
              Toast.show({type: 'error', text1: 'Error al imprimir cierre'});
            } finally {
              setPrinting(false);
            }
          },
        },
      ],
    );
  }, [
    printing,
    range.start,
    totalVentas,
    summary,
    expenses,
    totalExpenses,
    neto,
  ]);

  const renderItem = useCallback(
    ({item}: {item: Expense}) => <ExpenseItem item={item} />,
    [],
  );

  const keyExtractor = useCallback(
    (item: Expense) => String(item.expense_id),
    [],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <ReportDateFilter
          onChange={handleDateChange}
          accentColor="#FF6348"
          accentGradient={['#FF6348', '#FF8C42']}
        />

        {/* Neto destacado */}
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={styles.netoCard}>
          <LinearGradient
            colors={netoPositive ? ['#27AE60', '#2ECC71'] : ['#E74C3C', '#FF6B6B']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.netoGradient}>
            <View style={styles.netoRow}>
              <View>
                <Text style={styles.netoLabel}>Neto del período</Text>
                <Text style={styles.netoValue}>
                  {CURRENCY_SYMBOL} {neto.toFixed(2)}
                </Text>
              </View>
              <Icon
                name={netoPositive ? 'trending-up' : 'trending-down'}
                size={40}
                color="rgba(255,255,255,0.5)"
              />
            </View>
            <View style={styles.netoBreakdown}>
              <View style={styles.netoBreakdownItem}>
                <Text style={styles.netoBreakdownLabel}>Ventas</Text>
                <Text style={styles.netoBreakdownValue}>
                  {CURRENCY_SYMBOL} {totalVentas.toFixed(2)}
                </Text>
              </View>
              <Icon
                name="minus"
                size={16}
                color="rgba(255,255,255,0.7)"
              />
              <View style={styles.netoBreakdownItem}>
                <Text style={styles.netoBreakdownLabel}>Gastos</Text>
                <Text style={styles.netoBreakdownValue}>
                  {CURRENCY_SYMBOL} {totalExpenses.toFixed(2)}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* BarChart por tipo */}
        {typeEntries.length > 0 && (
          <>
            <ReportSectionTitle
              title="Gastos por tipo"
              accentColor="#FF6348"
            />
            <Animated.View
              entering={FadeInDown.delay(80).springify()}
              style={styles.chartCard}>
              <BarChart
                data={chartData}
                width={CHART_WIDTH - 32}
                height={180}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
                withInnerLines={false}
                yAxisLabel=""
                yAxisSuffix=""
              />
            </Animated.View>
          </>
        )}

        <ReportSectionTitle title="Gastos registrados" accentColor="#FF6348" />
      </>
    ),
    [
      handleDateChange,
      neto,
      netoPositive,
      totalVentas,
      totalExpenses,
      typeEntries,
      chartData,
    ],
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Icon name="cash-remove" size={60} color="#DFE6E9" />
        <Text style={styles.emptyText}>Sin gastos en este período</Text>
      </View>
    ),
    [],
  );

  const ListFooter = useCallback(
    () => (
      <Pressable
        style={({pressed}) => [
          styles.printBtn,
          pressed && {opacity: 0.85},
        ]}
        onPress={handlePrint}
        disabled={printing}>
        <LinearGradient
          colors={['#FF6348', '#FF8C42']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.printGradient}>
          <Icon
            name={printing ? 'loading' : 'printer-outline'}
            size={22}
            color="#FFF"
          />
          <Text style={styles.printText}>
            {printing ? 'Imprimiendo...' : 'Imprimir cierre del día'}
          </Text>
        </LinearGradient>
      </Pressable>
    ),
    [handlePrint, printing],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ReportDateFilter
          onChange={handleDateChange}
          accentColor="#FF6348"
          accentGradient={['#FF6348', '#FF8C42']}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#FF6348" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={expenses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ReporteGastos;

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
  listContent: {
    paddingBottom: 32,
  },
  // Neto card
  netoCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  netoGradient: {
    padding: 20,
    gap: 16,
  },
  netoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  netoLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  netoValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 36,
    color: '#FFF',
  },
  netoBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  netoBreakdownItem: {
    flex: 1,
    gap: 2,
  },
  netoBreakdownLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.75)',
  },
  netoBreakdownValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
  // Chart
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
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
  // Expense items
  expItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  expIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  expInfo: {
    flex: 1,
    gap: 3,
  },
  expType: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  expNotes: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  expTime: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
  },
  expAmount: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
  },
  // Print button
  printBtn: {
    margin: 16,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#FF6348',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  printGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  printText: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
});
