import React, {memo, useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {PieChart} from 'react-native-chart-kit';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {ReportService, CategorySales} from '../../services/ReportService';
import ReportDateFilter, {
  DateRange,
} from '../../components/Reports/ReportDateFilter';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL} from '../../constants/utils';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 32;

const reportService = new ReportService();

const CATEGORY_COLORS = [
  '#F59E0B',
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#06B6D4',
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
  color: (opacity = 1) => `rgba(245, 158, 11, ${opacity})`,
  labelColor: () => '#636E72',
};

// ---------------------------------------------------------------------------
// Memoized item
// ---------------------------------------------------------------------------
interface ItemProps {
  item: CategorySales;
  color: string;
}

const CategoryItem = memo(({item, color}: ItemProps) => (
  <View style={styles.catItem}>
    <View style={[styles.catDot, {backgroundColor: color}]} />
    <View style={styles.catInfo}>
      <Text style={styles.catName}>{item.category_name}</Text>
      <Text style={styles.catSub}>{item.total_qty} unidades</Text>
    </View>
    <View style={styles.catRight}>
      <Text style={styles.catRevenue}>
        {CURRENCY_SYMBOL} {item.total_revenue.toFixed(2)}
      </Text>
      <Text style={styles.catPct}>{item.percentage.toFixed(1)}%</Text>
    </View>
  </View>
));
CategoryItem.displayName = 'CategoryItem';

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
const ReporteCategorias = ({route}: {route: any}) => {
  const initialStart = route?.params?.start ?? todayStr();
  const initialEnd = route?.params?.end ?? todayStr();

  const [categories, setCategories] = useState<CategorySales[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<DateRange>({
    start: initialStart,
    end: initialEnd,
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const data = await reportService.getCategorySales(r.start, r.end);
      setCategories(data);
    } catch (e) {
      console.error('Error reporte categorías:', e);
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

  const pieData = categories.map((c, i) => ({
    name: c.category_name,
    population: c.total_revenue,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
    legendFontColor: '#2D3436',
    legendFontSize: 11,
  }));

  const renderItem = useCallback(
    ({item, index}: {item: CategorySales; index: number}) => (
      <CategoryItem
        item={item}
        color={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
      />
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item: CategorySales) => String(item.category_id),
    [],
  );

  const ListHeader = useCallback(
    () => (
      <>
        <ReportDateFilter
          onChange={handleDateChange}
          accentColor="#F59E0B"
          accentGradient={['#F59E0B', '#FCD34D']}
        />

        {/* Pie chart */}
        {categories.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(0).springify()}
            style={styles.chartCard}>
            <PieChart
              data={pieData}
              width={CHART_WIDTH - 32}
              height={180}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="8"
              absolute={false}
            />
          </Animated.View>
        )}

        {/* Stats summary */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{categories.length}</Text>
            <Text style={styles.summaryLabel}>Categorías con ventas</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {CURRENCY_SYMBOL}{' '}
              {categories
                .reduce((acc, c) => acc + c.total_revenue, 0)
                .toFixed(2)}
            </Text>
            <Text style={styles.summaryLabel}>Revenue total</Text>
          </View>
        </Animated.View>

        <ReportSectionTitle title="Desglose por categoría" accentColor="#F59E0B" />
      </>
    ),
    [handleDateChange, categories, pieData],
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
          accentColor="#F59E0B"
          accentGradient={['#F59E0B', '#FCD34D']}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#F59E0B" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
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

export default ReporteCategorias;

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
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    margin: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    alignItems: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
  },
  summaryValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#F59E0B',
  },
  summaryLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    textAlign: 'center',
  },
  // Category items
  catItem: {
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
  catDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  catInfo: {
    flex: 1,
    gap: 3,
  },
  catName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  catSub: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
  },
  catRight: {
    alignItems: 'flex-end',
    gap: 3,
  },
  catRevenue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  catPct: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#F59E0B',
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
