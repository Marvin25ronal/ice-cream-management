import React, {memo, useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {BarChart} from 'react-native-chart-kit';
import Animated, {FadeInDown} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
      <Text style={styles.rankCategory} numberOfLines={2}>
        {item.category_path}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilterId, setCategoryFilterId] = useState<number | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  useEffect(() => {
    const start = route?.params?.start;
    const end = route?.params?.end;
    if (!start || !end) {
      return;
    }
    setRange(prev =>
      prev.start === start && prev.end === end ? prev : {start, end},
    );
  }, [route?.params?.start, route?.params?.end]);

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const data = await reportService.getProductRanking(r.start, r.end);
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

  const sorted = useMemo(
    () =>
      sortBy === 'qty'
        ? [...products].sort((a, b) => b.total_qty - a.total_qty)
        : [...products].sort((a, b) => b.total_revenue - a.total_revenue),
    [products, sortBy],
  );

  const categoryOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of products) {
      if (!map.has(p.category_id)) {
        map.set(p.category_id, p.category_path);
      }
    }
    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1], 'es', {sensitivity: 'base'}),
    );
  }, [products]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return sorted.filter(p => {
      if (
        categoryFilterId !== null &&
        p.category_id !== categoryFilterId
      ) {
        return false;
      }
      if (
        q &&
        !p.product_name.toLowerCase().includes(q) &&
        !p.category_path.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [sorted, searchQuery, categoryFilterId]);

  const filtersActive =
    searchQuery.trim().length > 0 || categoryFilterId !== null;

  const selectedCategoryLabel =
    categoryFilterId === null
      ? 'Todas'
      : categoryOptions.find(([id]) => id === categoryFilterId)?.[1] ??
        'Categoría';

  const top10 = filtered.slice(0, 10);

  const chartData = useMemo(
    () => ({
      labels: top10.map((_, i) => `#${i + 1}`),
      datasets: [
        {
          data: top10.map(p =>
            sortBy === 'qty' ? p.total_qty : p.total_revenue,
          ),
        },
      ],
    }),
    [top10, sortBy],
  );

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

  const totalFiltered = filtered.length;
  const avgPrice =
    totalFiltered > 0
      ? filtered.reduce((acc, p) => acc + p.total_revenue, 0) /
        filtered.reduce((acc, p) => acc + p.total_qty, 0)
      : 0;

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setCategoryFilterId(null);
  }, []);

  const ListHeader = useCallback(
    () => (
      <>
        <View style={styles.filterCard}>
          <View style={styles.searchRow}>
            <Icon name="magnify" size={20} color="#636E72" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por producto o ruta de categoría…"
              placeholderTextColor="#B2BEC3"
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
          <View style={styles.filterActions}>
            <Pressable
              style={({pressed}) => [
                styles.categoryButton,
                pressed && {opacity: 0.85},
              ]}
              onPress={() => setCategoryModalVisible(true)}>
              <Icon name="shape-outline" size={18} color="#8B5CF6" />
              <Text style={styles.categoryButtonText} numberOfLines={1}>
                {selectedCategoryLabel}
              </Text>
              <Icon name="chevron-down" size={20} color="#636E72" />
            </Pressable>
            {filtersActive ? (
              <Pressable
                style={({pressed}) => [
                  styles.clearChip,
                  pressed && {opacity: 0.85},
                ]}
                onPress={clearFilters}>
                <Icon name="filter-off-outline" size={16} color="#636E72" />
                <Text style={styles.clearChipText}>Limpiar</Text>
              </Pressable>
            ) : null}
          </View>
          {filtersActive && products.length > 0 ? (
            <Text style={styles.filterHint}>
              Mostrando {totalFiltered} de {products.length} productos con ventas
            </Text>
          ) : null}
        </View>

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

        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalFiltered}</Text>
            <Text style={styles.statLabel}>
              {filtersActive ? 'En vista' : 'Productos distintos'}
            </Text>
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
      searchQuery,
      selectedCategoryLabel,
      filtersActive,
      products.length,
      totalFiltered,
      clearFilters,
      sortBy,
      top10,
      chartData,
      avgPrice,
    ],
  );

  const ListEmpty = useCallback(() => {
    if (products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Sin ventas en este período</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <Icon name="filter-variant-remove" size={40} color="#B2BEC3" />
        <Text style={styles.emptyTitle}>Sin coincidencias</Text>
        <Text style={styles.emptyText}>
          Prueba otro nombre, otra categoría o limpia los filtros.
        </Text>
      </View>
    );
  }, [products.length]);

  const renderCategoryRow = useCallback(
    ({item}: {item: [number, string]}) => {
      const [id, name] = item;
      const selected = categoryFilterId === id;
      return (
        <Pressable
          style={({pressed}) => [
            styles.modalRow,
            selected && styles.modalRowSelected,
            pressed && {opacity: 0.85},
          ]}
          onPress={() => {
            setCategoryFilterId(id);
            setCategoryModalVisible(false);
          }}>
          <Text
            style={[styles.modalRowText, selected && styles.modalRowTextSelected]}
            numberOfLines={3}>
            {name}
          </Text>
          {selected ? (
            <Icon name="check" size={20} color="#8B5CF6" />
          ) : null}
        </Pressable>
      );
    },
    [categoryFilterId],
  );

  return (
    <View style={styles.container}>
      <ReportDateFilter
        onChange={handleDateChange}
        accentColor="#8B5CF6"
        accentGradient={['#8B5CF6', '#A78BFA']}
      />
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setCategoryModalVisible(false)}
          />
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Filtrar por categoría</Text>
            <Pressable
              style={({pressed}) => [
                styles.modalRow,
                categoryFilterId === null && styles.modalRowSelected,
                pressed && {opacity: 0.85},
              ]}
              onPress={() => {
                setCategoryFilterId(null);
                setCategoryModalVisible(false);
              }}>
              <Text
                style={[
                  styles.modalRowText,
                  categoryFilterId === null && styles.modalRowTextSelected,
                ]}>
                Todas las categorías
              </Text>
              {categoryFilterId === null ? (
                <Icon name="check" size={20} color="#8B5CF6" />
              ) : null}
            </Pressable>
            <FlatList
              data={categoryOptions}
              keyExtractor={([id]) => String(id)}
              renderItem={renderCategoryRow}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
            />
            <Pressable
              style={({pressed}) => [
                styles.modalClose,
                pressed && {opacity: 0.85},
              ]}
              onPress={() => setCategoryModalVisible(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  filterCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    paddingVertical: 0,
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  categoryButtonText: {
    flex: 1,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#2D3436',
  },
  clearChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  clearChipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  filterHint: {
    marginTop: 10,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
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
    gap: 2,
  },
  rankName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  rankCategory: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#8B5CF6',
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
    paddingHorizontal: 24,
  },
  emptyTitle: {
    marginTop: 12,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
  emptyText: {
    marginTop: 8,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
    textAlign: 'center',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    maxHeight: '72%',
  },
  modalTitle: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#2D3436',
    marginBottom: 12,
  },
  modalList: {
    maxHeight: 360,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalRowSelected: {
    backgroundColor: '#F5F3FF',
    marginHorizontal: -8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderBottomWidth: 0,
  },
  modalRowText: {
    flex: 1,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    marginRight: 8,
  },
  modalRowTextSelected: {
    fontFamily: Fonts.LatoBold,
    color: '#5B21B6',
  },
  modalClose: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 14,
  },
  modalCloseText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#8B5CF6',
  },
});
