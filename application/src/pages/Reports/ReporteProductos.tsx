import React, {memo, useCallback, useState} from 'react';
import {
  ActivityIndicator,
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
import {ReportService, ProductRanking} from '../../services/ReportService';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL} from '../../constants/utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
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
  color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
  labelColor: () => '#636E72',
  style: {borderRadius: 16},
};

// ---------------------------------------------------------------------------
// Memoized list item
// ---------------------------------------------------------------------------
interface ItemProps {
  item: ProductRanking;
  index: number;
  sortBy: 'qty' | 'revenue';
}

const ProductRankingItem = memo(({item, index, sortBy}: ItemProps) => (
  <View style={styles.rankItem}>
    <View
      style={[
        styles.rankBadge,
        index === 0 && styles.rankBadgeGold,
        index === 1 && styles.rankBadgeSilver,
        index === 2 && styles.rankBadgeBronze,
      ]}>
      <Text
        style={[
          styles.rankNum,
          (index === 0 || index === 1 || index === 2) && styles.rankNumTop,
        ]}>
        {index + 1}
      </Text>
    </View>
    <View style={styles.rankInfo}>
      <Text style={styles.rankName} numberOfLines={1}>
        {item.product_name}
      </Text>
      <Text style={styles.rankSub}>
        {item.total_qty} uds · {CURRENCY_SYMBOL} {item.total_revenue.toFixed(2)}
      </Text>
    </View>
    <Text style={styles.rankMain}>
      {sortBy === 'qty'
        ? `${item.total_qty}`
        : `${CURRENCY_SYMBOL} ${item.total_revenue.toFixed(2)}`}
    </Text>
  </View>
));
ProductRankingItem.displayName = 'ProductRankingItem';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const ReporteProductos = ({route}: {route: any}) => {
  const initialStart = route?.params?.start ?? todayStr();
  const initialEnd = route?.params?.end ?? todayStr();

  const [products, setProducts] = useState<ProductRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'qty' | 'revenue'>('qty');
  const [range, setRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const data = await reportService.getProductRanking(r.start, r.end, 20);
      setProducts(data);
    } catch (e) {
      console.error('Error reporte productos:', e);
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

  const sorted =
    sortBy === 'qty'
      ? [...products].sort((a, b) => b.total_qty - a.total_qty)
      : [...products].sort((a, b) => b.total_revenue - a.total_revenue);

  const top10 = sorted.slice(0, 10);

  const chartData = {
    labels: top10.map((_, i) => `#${i + 1}`),
    datasets: [
      {
        data: top10.map(p =>
          sortBy === 'qty' ? p.total_qty : p.total_revenue,
        ),
      },
    ],
  };

  const renderItem = useCallback(
    ({item, index}: {item: ProductRanking; index: number}) => (
      <ProductRankingItem item={item} index={index} sortBy={sortBy} />
    ),
    [sortBy],
  );

  const keyExtractor = useCallback(
    (item: ProductRanking) => String(item.product_id),
    [],
  );

  const totalProducts = products.length;
  const avgPrice =
    totalProducts > 0
      ? products.reduce((acc, p) => acc + p.total_revenue, 0) /
        products.reduce((acc, p) => acc + p.total_qty, 0)
      : 0;

  const ListHeader = useCallback(
    () => (
      <>
        <ReportDateFilter
          onChange={handleDateChange}
          accentColor="#8B5CF6"
          accentGradient={['#8B5CF6', '#A78BFA']}
        />

        {/* Toggle */}
        <View style={styles.toggleRow}>
          <Pressable
            style={sortBy === 'qty' ? styles.toggleActive : styles.toggleInactive}
            onPress={() => setSortBy('qty')}>
            {sortBy === 'qty' ? (
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.toggleGradient}>
                <Text style={styles.toggleTextActive}>Cantidad</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleText}>Cantidad</Text>
            )}
          </Pressable>
          <Pressable
            style={
              sortBy === 'revenue' ? styles.toggleActive : styles.toggleInactive
            }
            onPress={() => setSortBy('revenue')}>
            {sortBy === 'revenue' ? (
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.toggleGradient}>
                <Text style={styles.toggleTextActive}>Ingresos</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleText}>Ingresos</Text>
            )}
          </Pressable>
        </View>

        {/* Chart */}
        {top10.length > 0 && (
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
        )}

        {/* Stats row */}
        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalProducts}</Text>
            <Text style={styles.statLabel}>Productos distintos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {CURRENCY_SYMBOL} {avgPrice.toFixed(2)}
            </Text>
            <Text style={styles.statLabel}>Precio prom. vendido</Text>
          </View>
        </Animated.View>

        <ReportSectionTitle title="Ranking" accentColor="#8B5CF6" />
      </>
    ),
    [
      handleDateChange,
      sortBy,
      top10,
      chartData,
      totalProducts,
      avgPrice,
    ],
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sin ventas en este período</Text>
      </View>
    ),
    [],
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ReportDateFilter
          onChange={handleDateChange}
          accentColor="#8B5CF6"
          accentGradient={['#8B5CF6', '#A78BFA']}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ReporteProductos;

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
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  toggleActive: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  toggleInactive: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  toggleText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    textAlign: 'center',
  },
  toggleTextActive: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#FFF',
  },
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
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  statValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#8B5CF6',
  },
  statLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    textAlign: 'center',
  },
  // Rank items
  rankItem: {
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
  rankBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0EBFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankBadgeGold: {backgroundColor: '#FFF3CD'},
  rankBadgeSilver: {backgroundColor: '#F0F0F0'},
  rankBadgeBronze: {backgroundColor: '#FBE9DC'},
  rankNum: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.small,
    color: '#8B5CF6',
  },
  rankNumTop: {color: '#2D3436'},
  rankInfo: {
    flex: 1,
    gap: 3,
  },
  rankName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  rankSub: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
  },
  rankMain: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#8B5CF6',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 48,
  },
  emptyText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
  },
});
