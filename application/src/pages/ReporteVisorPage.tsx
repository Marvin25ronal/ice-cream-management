import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { ExpenseService } from '../services/ExpenseService';
import { ReportService, SalesSummary } from '../services/ReportService';
import { PdfService } from '../services/PdfService';
import { CashRegisterService } from '../services/CashRegisterService';
import { Expense } from '../entity/Expense.entity';
import ReportDateFilter, {
  DateRange,
} from '../components/Reports/ReportDateFilter';
import { Fonts, FontsSize } from '../constants/Fonts';
import { CURRENCY_SYMBOL } from '../constants/utils';

const expenseService = new ExpenseService();
const reportService = new ReportService();
const pdfService = new PdfService();
const cashRegisterService = new CashRegisterService();

const todayStr = () =>
  new Date().toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

/**
 * Visor del "Cierre del día" en pantalla (para cuando no se puede/quiere
 * imprimir) con opción de generar el mismo resumen como PDF y enviarlo
 * (WhatsApp, correo, etc.) vía el selector nativo de compartir.
 */
const ReporteVisorPage = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [physicalCash, setPhysicalCash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [range, setRange] = useState<DateRange>({
    start: todayStr(),
    end: todayStr(),
  });

  const load = useCallback(async (r: DateRange) => {
    setLoading(true);
    try {
      const [exp, sum, cash] = await Promise.all([
        expenseService.getByDateRange(r.start, r.end),
        reportService.getSalesSummary(r.start, r.end),
        cashRegisterService.getCurrent(),
      ]);
      setExpenses(exp);
      setSummary(sum);
      setPhysicalCash(cash?.amount ?? 0);
    } catch (e) {
      console.error('Error cargando visor de reporte:', e);
      Toast.show({ type: 'error', text1: 'Error al cargar el reporte' });
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffectOnMount(load, range);

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

  // Conciliación de caja física: lo que ya había + efectivo de ventas -
  // gastos pagados = lo que debería haber en caja ahora.
  const cashSales = summary?.cash ?? 0;
  const expectedCash = physicalCash + cashSales - totalExpenses;
  const expectedCashPositive = expectedCash >= 0;

  const handleGeneratePdf = useCallback(async () => {
    setGeneratingPdf(true);
    try {
      const label =
        range.start === range.end
          ? range.start
          : `${range.start} - ${range.end}`;
      await pdfService.openPrintDialog({
        date: label,
        totalSales: totalVentas,
        cash: summary?.cash ?? 0,
        card: summary?.card ?? 0,
        expenses,
        totalExpenses,
        netBalance: neto,
        physicalCash,
      });
    } catch (e: any) {
      // El usuario cerrando el diálogo también cae acá; no es un error real.
      console.log('Diálogo de impresión/PDF cerrado:', e?.message);
    } finally {
      setGeneratingPdf(false);
    }
  }, [
    range,
    totalVentas,
    summary,
    expenses,
    totalExpenses,
    neto,
    physicalCash,
  ]);

  const renderExpense = useCallback(
    ({ item }: { item: Expense }) => (
      <View style={styles.expItem}>
        <Text style={styles.expLabel} numberOfLines={1}>
          {item.expenseType?.name ?? 'Gasto'}
          {item.notes ? ` - ${item.notes}` : ''}
        </Text>
        <Text style={styles.expAmount}>
          {CURRENCY_SYMBOL} {item.amount.toFixed(2)}
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      <ReportDateFilter
        onChange={handleDateChange}
        accentColor="#7209B7"
        accentGradient={['#7209B7', '#B185DB']}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7209B7" />
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={item => String(item.expense_id)}
          renderItem={renderExpense}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              <View style={styles.netoCard}>
                <LinearGradient
                  colors={
                    netoPositive
                      ? ['#27AE60', '#2ECC71']
                      : ['#E74C3C', '#FF6B6B']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.netoGradient}>
                  <Text style={styles.netoLabel}>Neto del período</Text>
                  <Text style={styles.netoValue}>
                    {CURRENCY_SYMBOL} {neto.toFixed(2)}
                  </Text>
                </LinearGradient>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Total Ventas</Text>
                  <Text style={styles.summaryValueBold}>
                    {CURRENCY_SYMBOL} {totalVentas.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Efectivo</Text>
                  <Text style={styles.summaryValue}>
                    {CURRENCY_SYMBOL} {(summary?.cash ?? 0).toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.lastRow]}>
                  <Text style={styles.summaryLabel}>Tarjeta</Text>
                  <Text style={styles.summaryValue}>
                    {CURRENCY_SYMBOL} {(summary?.card ?? 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Caja</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Saldo en caja</Text>
                  <Text style={styles.summaryValue}>
                    {CURRENCY_SYMBOL} {physicalCash.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>+ Efectivo de ventas</Text>
                  <Text style={styles.summaryValue}>
                    {CURRENCY_SYMBOL} {cashSales.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>- Gastos pagados</Text>
                  <Text style={styles.summaryValue}>
                    {CURRENCY_SYMBOL} {totalExpenses.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Físico en caja ahora</Text>
                  <Text
                    style={[
                      styles.summaryValueBold,
                      expectedCashPositive
                        ? styles.positiveValue
                        : styles.negativeValue,
                    ]}>
                    {CURRENCY_SYMBOL} {expectedCash.toFixed(2)}
                  </Text>
                </View>
                <View style={[styles.summaryRow, styles.lastRow]}>
                  <Text style={styles.summaryLabel}>Tarjeta (al banco)</Text>
                  <Text style={styles.summaryValue}>
                    {CURRENCY_SYMBOL} {(summary?.card ?? 0).toFixed(2)}
                  </Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>
                Gastos ({expenses.length})
              </Text>
            </>
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>Sin gastos en este período</Text>
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.pdfBtn}
              onPress={handleGeneratePdf}
              disabled={generatingPdf}>
              <LinearGradient
                colors={['#7209B7', '#B185DB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.pdfGradient}>
                {generatingPdf ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Icon name="file-pdf-box" size={22} color="#FFF" />
                )}
                <Text style={styles.pdfText}>
                  {generatingPdf
                    ? 'Abriendo...'
                    : 'Imprimir / Guardar como PDF'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          }
        />
      )}
    </View>
  );
};

// Carga inicial (equivalente a useFocusEffect(useCallback(...)), pero esta
// pantalla no depende de re-cargar al volver a enfocarse, solo al montar
// o cambiar el rango de fechas.
function useFocusEffectOnMount(load: (r: DateRange) => void, range: DateRange) {
  React.useEffect(() => {
    load(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default ReporteVisorPage;

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
    padding: 16,
    paddingBottom: 40,
  },
  netoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  netoGradient: {
    padding: 20,
  },
  netoLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
  },
  netoValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 32,
    color: 'white',
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
  summaryValue: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  summaryValueBold: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  positiveValue: {
    color: '#27AE60',
  },
  negativeValue: {
    color: '#E74C3C',
  },
  sectionTitle: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  expItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  expLabel: {
    flex: 1,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  expAmount: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FF6348',
  },
  emptyText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
    textAlign: 'center',
    paddingVertical: 24,
  },
  pdfBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#7209B7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  pdfGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  pdfText: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: 'white',
  },
});
