import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import {
  RawMaterialMovementDetail,
  RawMaterialService,
} from '../services/RawMaterialService';
import { Fonts, FontsSize } from '../constants/Fonts';
import { CURRENCY_SYMBOL } from '../constants/utils';

const rawMaterialService = new RawMaterialService();

type FilterType = 'all' | 'purchase' | 'sale' | 'adjustment';

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'purchase', label: 'Compras' },
  { value: 'sale', label: 'Ventas' },
  { value: 'adjustment', label: 'Rectificaciones' },
];

const formatQuantity = (quantity: number) =>
  Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(2);

const formatDate = (date: Date) =>
  date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }) +
  ' ' +
  date.toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });

const RawMaterialHistoryPage = () => {
  const [movements, setMovements] = useState<RawMaterialMovementDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const loadMovements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rawMaterialService.getAllMovements();
      setMovements(data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al cargar el historial' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  const filteredMovements =
    filter === 'all' ? movements : movements.filter(m => m.type === filter);

  const renderItem = useCallback(
    ({ item }: { item: RawMaterialMovementDetail }) => {
      const isAdjustment = item.type === 'adjustment';
      const isSale = item.type === 'sale';
      const isPositive = item.quantity >= 0;
      const iconName = isAdjustment
        ? 'scale-balance'
        : isSale
        ? 'point-of-sale'
        : 'cash-plus';
      const iconColor = isAdjustment
        ? '#F59E0B'
        : isPositive
        ? '#00B894'
        : '#E17055';
      return (
        <View style={styles.row}>
          <View
            style={[
              styles.typeIcon,
              {
                backgroundColor: isAdjustment
                  ? '#FEF3C7'
                  : isPositive
                  ? '#D1FAE5'
                  : '#FFE5EC',
              },
            ]}>
            <Icon name={iconName} size={20} color={iconColor} />
          </View>

          <View style={styles.rowInfo}>
            <View style={styles.rowHeader}>
              <Text style={styles.materialName} numberOfLines={1}>
                {item.raw_material_name}
              </Text>
              <Text
                style={[
                  styles.quantityText,
                  { color: isPositive ? '#00B894' : '#E17055' },
                ]}>
                {isPositive ? '+' : ''}
                {formatQuantity(item.quantity)} {item.raw_material_unit}
              </Text>
            </View>

            {!!item.reason && (
              <Text style={styles.reasonText} numberOfLines={2}>
                {item.reason}
              </Text>
            )}

            <View style={styles.metaRow}>
              <Text style={styles.metaText}>{formatDate(item.date)}</Text>
              {item.user_name && (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Icon name="account" size={12} color="#B2BEC3" />
                  <Text style={styles.metaText}>{item.user_name}</Text>
                </>
              )}
              {isAdjustment && (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.adjustmentBadge}>Rectificación</Text>
                </>
              )}
              {isSale && (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.saleBadge}>
                    {isPositive ? 'Reversión de venta' : 'Venta'}
                  </Text>
                </>
              )}
              {!isAdjustment && !isSale && item.unit_cost != null && (
                <>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaText}>
                    {CURRENCY_SYMBOL} {item.unit_cost.toFixed(2)}/
                    {item.raw_material_unit}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      );
    },
    [],
  );

  const keyExtractor = useCallback(
    (item: RawMaterialMovementDetail) => String(item.id),
    [],
  );

  const ListEmpty = useCallback(
    () =>
      loading ? null : (
        <View style={styles.emptyContainer}>
          <Icon name="clipboard-text-outline" size={60} color="#DFE6E9" />
          <Text style={styles.emptyText}>Sin movimientos todavía</Text>
        </View>
      ),
    [loading],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00B894', '#00CEC9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="history" size={28} color="#FFF" />
          <Text style={styles.headerTitle}>Historial de Materia Prima</Text>
          <Text style={styles.headerSubtitle}>
            Compras y rectificaciones de inventario
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterRowContent}>
        {FILTERS.map((f, index) => (
          <Pressable
            key={f.value}
            style={[
              styles.filterChip,
              index === FILTERS.length - 1 && styles.filterChipLast,
              filter === f.value && styles.filterChipActive,
            ]}
            onPress={() => setFilter(f.value)}>
            <Text
              numberOfLines={1}
              style={[
                styles.filterChipText,
                filter === f.value && styles.filterChipTextActive,
              ]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={filteredMovements}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default RawMaterialHistoryPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 20,
    color: '#FFF',
    marginTop: 6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
  },
  filterRow: {
    flexGrow: 0,
    paddingTop: 14,
  },
  filterRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  filterChip: {
    flexShrink: 0,
    alignSelf: 'flex-start',
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  filterChipLast: {
    marginRight: 0,
  },
  filterChipActive: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  filterChipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  materialName: {
    flex: 1,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  quantityText: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
  },
  reasonText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small - 1,
    color: '#B2BEC3',
  },
  metaDot: {
    fontSize: FontsSize.small - 1,
    color: '#B2BEC3',
  },
  adjustmentBadge: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small - 1,
    color: '#F59E0B',
  },
  saleBadge: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small - 1,
    color: '#8E44AD',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#636E72',
    marginTop: 12,
  },
});
