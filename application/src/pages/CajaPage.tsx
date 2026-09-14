import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  FlatList,
  TextInput,
} from 'react-native';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { useSelector } from 'react-redux';
import { themeInterface } from '../interface/themeInterface';
import { Fonts, FontsSize } from '../constants/Fonts';
import { CURRENCY_SYMBOL } from '../constants/utils';
import { CashRegisterService } from '../services/CashRegisterService';
import { CashRegister } from '../entity/CashRegister.entity';

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-11.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 *
 * La lógica (carga de saldo/historial, validaciones, llamadas al servicio y
 * mensajes de Toast) es fiel al bytecode decompilado. El detalle visual exacto
 * (espaciados, tamaños) se reconstruyó siguiendo el mismo lenguaje de diseño
 * que PayPage/GastosPage — revisar contra tu recuerdo del diseño original.
 */

const formatDateTime = (date: Date) =>
  new Date(date).toLocaleDateString('es-GT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

type AdjustMode = 'opening' | 'adjustment';

const HistoryItem = ({
  item,
  index,
}: {
  item: CashRegister;
  index: number;
}) => {
  const isOpening = item.type === 'opening';
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 35).springify()}
      style={styles.histItem}>
      <View
        style={[
          styles.histIconBadge,
          { backgroundColor: isOpening ? '#E8F5E9' : '#FFF8E1' },
        ]}>
        <Icon
          name={isOpening ? 'safe' : 'pencil-circle-outline'}
          size={20}
          color={isOpening ? '#27AE60' : '#F59E0B'}
        />
      </View>
      <View style={styles.histInfo}>
        <Text style={styles.histType}>
          {isOpening ? 'Configuración inicial' : 'Rectificación'}
        </Text>
        {!!item.reason && (
          <Text style={styles.histReason} numberOfLines={2}>
            {item.reason}
          </Text>
        )}
        <Text style={styles.histDate}>{formatDateTime(item.date)}</Text>
      </View>
      <Text style={[styles.histAmount, isOpening && { color: '#27AE60' }]}>
        {CURRENCY_SYMBOL} {item.amount.toFixed(2)}
      </Text>
    </Animated.View>
  );
};

const CajaPage = () => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const [cashRegisterService] = useState(new CashRegisterService());
  const [current, setCurrent] = useState<CashRegister | null>(null);
  const [history, setHistory] = useState<CashRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mode, setMode] = useState<AdjustMode>('opening');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [currentRecord, all] = await Promise.all([
        cashRegisterService.getCurrent(),
        cashRegisterService.getAll(),
      ]);
      setCurrent(currentRecord);
      setHistory(all);
    } catch (error) {
      console.error('Error cargando caja:', error);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const startEditing = useCallback(
    (newMode: AdjustMode) => {
      setMode(newMode);
      setAmountInput(
        newMode === 'adjustment' && current ? String(current.amount) : '',
      );
      setReasonInput('');
      setIsEditing(true);
    },
    [current],
  );

  const cancelEditing = useCallback(() => setIsEditing(false), []);

  const confirm = useCallback(async () => {
    const amount = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(amount) || amount < 0) {
      Toast.show({ type: 'error', text1: 'Ingresa un monto válido' });
      return;
    }
    if (mode === 'adjustment' && !reasonInput.trim()) {
      Toast.show({
        type: 'error',
        text1: 'El motivo de rectificación es obligatorio',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode !== 'opening') {
        await cashRegisterService.registerAdjustment(
          amount,
          reasonInput.trim(),
        );
        Toast.show({
          type: 'success',
          text1: 'Caja rectificada',
          text2: `Nuevo saldo: ${CURRENCY_SYMBOL} ${amount.toFixed(2)}`,
        });
      } else {
        await cashRegisterService.registerOpening(amount);
        Toast.show({
          type: 'success',
          text1: 'Caja configurada',
          text2: `Saldo inicial: ${CURRENCY_SYMBOL} ${amount.toFixed(2)}`,
        });
      }
      cancelEditing();
      loadData();
    } catch (error) {
      console.error('Error al registrar caja:', error);
      Toast.show({ type: 'error', text1: 'No se pudo guardar el movimiento' });
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amountInput,
    reasonInput,
    mode,
    cashRegisterService,
    cancelEditing,
    loadData,
  ]);

  const isConfigured = !!current;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.PAGE_BACKGROUND_COLOR },
      ]}>
      <FlatList
        data={history}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          <HistoryItem item={item} index={index} />
        )}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <>
            <Animated.View
              entering={FadeInDown.delay(0).springify()}
              style={styles.statusCard}>
              <LinearGradient
                colors={
                  isConfigured ? ['#27AE60', '#2ECC71'] : ['#636E72', '#B2BEC3']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statusGradient}>
                <View style={styles.statusRow}>
                  <View style={styles.statusLeft}>
                    <Text style={styles.statusLabel}>Saldo en caja</Text>
                    <Text style={styles.statusAmount}>
                      {isConfigured
                        ? `${CURRENCY_SYMBOL} ${current!.amount.toFixed(2)}`
                        : 'Sin configurar'}
                    </Text>
                    {isConfigured && (
                      <Text style={styles.statusSub}>
                        {current!.type === 'opening'
                          ? 'Configuración inicial'
                          : 'Última rectificación'}{' '}
                        · {formatDateTime(current!.date)}
                      </Text>
                    )}
                  </View>
                  <Icon
                    name="safe-square-outline"
                    size={48}
                    color="rgba(255,255,255,0.35)"
                  />
                </View>
              </LinearGradient>
            </Animated.View>

            {!isConfigured && !isEditing && (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>Caja sin configurar</Text>
                <Text style={styles.emptySubtitle}>
                  Ingresa el monto que tienes ahora{'\n'}en caja para comenzar
                </Text>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => startEditing('opening')}>
                  <Text style={styles.primaryButtonText}>Configurar caja</Text>
                </TouchableOpacity>
              </View>
            )}

            {isConfigured && !isEditing && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => startEditing('adjustment')}>
                <Text style={styles.primaryButtonText}>Rectificar caja</Text>
              </TouchableOpacity>
            )}

            {isEditing && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>
                  {mode === 'opening' ? 'Configurar caja' : 'Rectificar caja'}
                </Text>
                {mode === 'adjustment' && (
                  <Text style={styles.formSubtitle}>
                    Ingresa el monto real que tienes en caja ahora mismo e
                    indica el motivo del ajuste.
                  </Text>
                )}
                <Text style={styles.label}>Monto en caja</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amountInput}
                  onChangeText={setAmountInput}
                  placeholder="0.00"
                  placeholderTextColor="#B2BEC3"
                  keyboardType="numeric"
                />
                {mode === 'adjustment' && (
                  <>
                    <Text style={styles.label}>Motivo del ajuste *</Text>
                    <TextInput
                      style={styles.reasonInput}
                      value={reasonInput}
                      onChangeText={setReasonInput}
                      placeholder="Ej: Cambio de turno, retiro para banco, error en conteo..."
                      placeholderTextColor="#B2BEC3"
                      multiline
                      numberOfLines={3}
                      maxLength={200}
                      textAlignVertical="top"
                    />
                  </>
                )}
                <View style={styles.formButtonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={cancelEditing}
                    disabled={isSubmitting}>
                    <Text style={styles.buttonTextColor}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={confirm}
                    disabled={isSubmitting}>
                    <Text style={styles.buttonTextColor}>Confirmar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {history.length > 0 && (
              <Text style={styles.historyTitle}>Historial</Text>
            )}
          </>
        }
      />
    </View>
  );
};

export default CajaPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  statusGradient: {
    padding: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flex: 1,
  },
  statusLabel: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoRegular,
    color: 'rgba(255,255,255,0.85)',
  },
  statusAmount: {
    fontSize: FontsSize.xxl,
    fontFamily: Fonts.LatoBlack,
    color: 'white',
    marginTop: 4,
  },
  statusSub: {
    fontSize: FontsSize.small,
    fontFamily: Fonts.LatoRegular,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: FontsSize.large,
    fontFamily: Fonts.LatoBold,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoRegular,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButtonText: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoBold,
    color: 'white',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: FontsSize.large,
    fontFamily: Fonts.LatoBold,
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: FontsSize.small,
    fontFamily: Fonts.LatoRegular,
    color: '#636E72',
    marginBottom: 12,
  },
  label: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoBold,
    marginBottom: 6,
    marginTop: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoRegular,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoRegular,
    minHeight: 80,
  },
  formButtonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#27AE60',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ba181b',
  },
  buttonTextColor: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoBold,
    color: 'white',
  },
  historyTitle: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoBold,
    marginBottom: 8,
  },
  histItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  histIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  histInfo: {
    flex: 1,
  },
  histType: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoBold,
  },
  histReason: {
    fontSize: FontsSize.small,
    fontFamily: Fonts.LatoRegular,
    color: '#636E72',
    marginTop: 2,
  },
  histDate: {
    fontSize: FontsSize.small,
    fontFamily: Fonts.LatoRegular,
    color: '#B2BEC3',
    marginTop: 2,
  },
  histAmount: {
    fontSize: FontsSize.medium,
    fontFamily: Fonts.LatoBold,
  },
});
