import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Expense} from '../entity/Expense.entity';
import {ExpenseType} from '../entity/ExpenseType.entity';
import {ExpenseService} from '../services/ExpenseService';
import {ExpenseTypeService} from '../services/ExpenseTypeService';
import ExpenseListItem from '../components/Expenses/ExpenseListItem';
import RegisterExpenseModal from '../components/Expenses/RegisterExpenseModal';
import {Fonts, FontsSize} from '../constants/Fonts';
import {CURRENCY_SYMBOL, Utils} from '../constants/utils';
import Toast from 'react-native-toast-message';

const expenseService = new ExpenseService();
const expenseTypeService = new ExpenseTypeService();

const GastosPage = ({navigation}: {navigation: any}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toLocaleDateString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
  );

  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{scale: fabScale.value}],
  }));

  const loadExpenseTypes = useCallback(async () => {
    try {
      const types = await expenseTypeService.getAll();
      setExpenseTypes(types);
    } catch (e) {
      console.error('Error al cargar tipos de gasto:', e);
    }
  }, []);

  const loadExpenses = useCallback(async (dateStr?: string) => {
    setLoading(true);
    try {
      const date = dateStr ?? selectedDate;
      const data = await expenseService.getByDate(date);
      setExpenses(data);
      setTotal(data.reduce((acc, e) => acc + e.amount, 0));
    } catch (e) {
      Toast.show({type: 'error', text1: 'Error al cargar gastos'});
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // Recarga tipos cada vez que la pantalla entra en foco
  // (cubre el caso de volver desde ExpenseTypeMaintenance con tipos nuevos)
  useFocusEffect(
    useCallback(() => {
      loadExpenseTypes();
    }, [loadExpenseTypes]),
  );

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleOpenModal = useCallback(() => {
    fabScale.value = withSpring(0.9, {}, () => {
      fabScale.value = withSpring(1);
    });
    setModalVisible(true);
  }, [fabScale]);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSaveExpense = useCallback(
    async (typeId: number, amount: number, notes: string) => {
      setSaving(true);
      try {
        await expenseService.create(typeId, amount, notes);
        Toast.show({
          type: 'success',
          text1: 'Gasto registrado',
          text2: `${CURRENCY_SYMBOL} ${amount.toFixed(2)} guardado correctamente`,
        });
        handleCloseModal();
        loadExpenses();
      } catch (e) {
        Toast.show({type: 'error', text1: 'Error al guardar el gasto'});
      } finally {
        setSaving(false);
      }
    },
    [handleCloseModal, loadExpenses],
  );

  const handleDeleteExpense = useCallback(
    (item: Expense) => {
      const typeName = item.expenseType?.name ?? 'Gasto';
      Alert.alert(
        'Eliminar gasto',
        `¿Deseas eliminar este gasto de ${typeName} por ${CURRENCY_SYMBOL} ${item.amount.toFixed(2)}?`,
        [
          {text: 'Cancelar', style: 'cancel'},
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await expenseService.delete(item.expense_id);
                Toast.show({type: 'success', text1: 'Gasto eliminado'});
                loadExpenses();
              } catch (e) {
                Toast.show({type: 'error', text1: 'Error al eliminar'});
              }
            },
          },
        ],
      );
    },
    [loadExpenses],
  );

  const renderItem = useCallback(
    ({item}: {item: Expense}) => (
      <ExpenseListItem item={item} onDelete={handleDeleteExpense} />
    ),
    [handleDeleteExpense],
  );

  const keyExtractor = useCallback(
    (item: Expense) => String(item.expense_id),
    [],
  );

  const todayStr = new Date().toLocaleDateString('es-GT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const ListHeader = useCallback(
    () => (
      <>
        {/* Summary card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View style={styles.summarySection}>
            <LinearGradient
              colors={['#FF6348', '#FF8C42']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryLabel}>Total gastos hoy</Text>
                  <Text style={styles.summaryTotal}>
                    {CURRENCY_SYMBOL} {total.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{expenses.length}</Text>
                  <Text style={styles.countLabel}>
                    gasto{expenses.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
              <Text style={styles.summaryDate}>{todayStr}</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {expenses.length > 0 && (
          <Text style={styles.listSectionTitle}>Gastos del día</Text>
        )}
      </>
    ),
    [total, expenses.length, todayStr],
  );

  const ListEmpty = useCallback(
    () => (
      <Animated.View
        entering={FadeInUp.delay(200).springify()}
        style={styles.emptyContainer}>
        <Icon name="cash-remove" size={72} color="#DFE6E9" />
        <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
        <Text style={styles.emptySubtitle}>
          Presiona el botón "+" para registrar{'\n'}un gasto del día
        </Text>
      </Animated.View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Acceso rápido a tipos de gasto */}
      <Pressable
        style={({pressed}) => [
          styles.settingsRow,
          pressed && {opacity: 0.7},
        ]}
        onPress={() =>
          navigation.navigate(Utils.screens.EXPENSE_TYPE_MAINTENANCE)
        }>
        <Icon name="tag-multiple-outline" size={18} color="#FF6348" />
        <Text style={styles.settingsText}>Administrar tipos de gasto</Text>
        <Icon name="chevron-right" size={18} color="#B2BEC3" />
      </Pressable>

      <FlatList
        data={expenses}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Animated.View style={[styles.fabContainer, fabStyle]}>
        <Pressable
          style={({pressed}) => [styles.fab, pressed && styles.fabPressed]}
          onPress={handleOpenModal}>
          <LinearGradient
            colors={['#FF6348', '#FF8C42']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.fabGradient}>
            <Icon name="plus" size={28} color="#FFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>

      <RegisterExpenseModal
        visible={modalVisible}
        expenseTypes={expenseTypes}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
        saving={saving}
      />
    </View>
  );
};

export default GastosPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  listContent: {
    paddingBottom: 110,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsText: {
    flex: 1,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#FF6348',
  },
  summarySection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#FF6348',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  summaryTotal: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 36,
    color: '#FFF',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  countText: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 28,
    color: '#FFF',
  },
  countLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
  },
  summaryDate: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
    textTransform: 'capitalize',
  },
  listSectionTitle: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#636E72',
    marginTop: 12,
  },
  emptySubtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
    textAlign: 'center',
    lineHeight: 22,
  },
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 28,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#FF6348',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
