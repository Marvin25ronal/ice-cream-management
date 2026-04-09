import React, {memo, useCallback, useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {ExpenseType} from '../../entity/ExpenseType.entity';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL} from '../../constants/utils';

interface Props {
  visible: boolean;
  expenseTypes: ExpenseType[];
  onClose: () => void;
  onSave: (typeId: number, amount: number, notes: string) => void;
  saving?: boolean;
}


const RegisterExpenseModal = memo(
  ({visible, expenseTypes, onClose, onSave, saving}: Props) => {
    const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
    const [amountText, setAmountText] = useState('');
    const [notes, setNotes] = useState('');

    const selectedType = expenseTypes.find(
      t => t.expense_type_id === selectedTypeId,
    );
    const requiresNotes = selectedType?.is_custom === 1;

    useEffect(() => {
      if (!visible) {
        setSelectedTypeId(null);
        setAmountText('');
        setNotes('');
      }
    }, [visible]);

    const handleSave = useCallback(() => {
      if (!selectedTypeId) return;
      const amount = parseFloat(amountText.replace(',', '.'));
      if (isNaN(amount) || amount <= 0) return;
      if (requiresNotes && !notes.trim()) return;
      onSave(selectedTypeId, amount, notes.trim());
    }, [selectedTypeId, amountText, notes, requiresNotes, onSave]);

    const isValid =
      selectedTypeId !== null &&
      parseFloat(amountText.replace(',', '.')) > 0 &&
      (!requiresNotes || notes.trim().length > 0);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.sheet}>
            {/* Header */}
            <LinearGradient
              colors={['#FF6348', '#FF8C42']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.header}>
              <View style={styles.headerLeft}>
                <Icon name="cash-minus" size={24} color="#FFF" />
                <Text style={styles.headerTitle}>Registrar Gasto</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            <ScrollView
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {/* Selector de tipo */}
              <Text style={styles.sectionLabel}>Categoría del gasto</Text>
              <View style={styles.typeGrid}>
                {expenseTypes.map(type => {
                  const color = type.color ?? '#FF6348';
                  const iconName = type.icon ?? 'cash';
                  const isSelected = selectedTypeId === type.expense_type_id;

                  return (
                    <Pressable
                      key={type.expense_type_id}
                      style={({pressed}) => [
                        styles.typeChip,
                        isSelected && {
                          backgroundColor: color,
                          borderColor: color,
                        },
                        pressed && styles.typeChipPressed,
                      ]}
                      onPress={() => setSelectedTypeId(type.expense_type_id)}>
                      <Icon
                        name={iconName}
                        size={18}
                        color={isSelected ? '#FFF' : color}
                      />
                      <Text
                        style={[
                          styles.typeChipText,
                          isSelected && styles.typeChipTextSelected,
                        ]}
                        numberOfLines={1}>
                        {type.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Monto */}
              <Text style={styles.sectionLabel}>Monto</Text>
              <View style={styles.amountRow}>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyText}>{CURRENCY_SYMBOL}</Text>
                </View>
                <TextInput
                  style={styles.amountInput}
                  value={amountText}
                  onChangeText={setAmountText}
                  placeholder="0.00"
                  placeholderTextColor="#B2BEC3"
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>

              {/* Notas */}
              <Text style={styles.sectionLabel}>
                Notas{requiresNotes ? ' *' : ' (opcional)'}
              </Text>
              <TextInput
                style={[
                  styles.notesInput,
                  requiresNotes &&
                    !notes.trim() &&
                    amountText.length > 0 &&
                    styles.notesInputError,
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder={
                  requiresNotes
                    ? 'Describe este gasto...'
                    : 'Descripción adicional...'
                }
                placeholderTextColor="#B2BEC3"
                multiline
                numberOfLines={3}
                maxLength={200}
                textAlignVertical="top"
              />

              {/* Botones */}
              <View style={styles.actions}>
                <Pressable style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={!isValid || saving}>
                  <LinearGradient
                    colors={
                      isValid ? ['#FF6348', '#FF8C42'] : ['#DFE6E9', '#DFE6E9']
                    }
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.saveBtnGradient}>
                    <Icon
                      name="check"
                      size={18}
                      color={isValid ? '#FFF' : '#B2BEC3'}
                    />
                    <Text
                      style={[
                        styles.saveBtnText,
                        !isValid && styles.saveBtnTextDisabled,
                      ]}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

RegisterExpenseModal.displayName = 'RegisterExpenseModal';

export default RegisterExpenseModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#FFF',
  },
  body: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
  },
  sectionLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 10,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    backgroundColor: '#F8F9FA',
  },
  typeChipPressed: {
    opacity: 0.8,
    transform: [{scale: 0.97}],
  },
  typeChipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    maxWidth: 80,
  },
  typeChipTextSelected: {
    color: '#FFF',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  currencyBadge: {
    width: 48,
    height: 52,
    backgroundColor: '#FF6348',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyText: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#FFF',
  },
  amountInput: {
    flex: 1,
    backgroundColor: '#F1F9FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.LatoBlack,
    fontSize: 28,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  notesInput: {
    backgroundColor: '#F1F9FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#B3E5FC',
    height: 80,
  },
  notesInputError: {
    borderColor: '#FF6348',
    backgroundColor: '#FFF5F2',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
  saveBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  saveBtnText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
  saveBtnTextDisabled: {
    color: '#B2BEC3',
  },
});
