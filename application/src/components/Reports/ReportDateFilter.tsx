import React, {memo, useCallback, useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts, FontsSize} from '../../constants/Fonts';

export interface DateRange {
  start: string; // DD/MM/YYYY
  end: string;   // DD/MM/YYYY
}

type FilterType = 'today' | 'week' | 'month' | 'custom';

interface Props {
  onChange: (range: DateRange) => void;
  accentColor?: string;
  accentGradient?: string[];
}

const formatDate = (d: Date): string =>
  d.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const todayRange = (): DateRange => {
  const t = formatDate(new Date());
  return {start: t, end: t};
};

const weekRange = (): DateRange => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 7);
  return {start: formatDate(from), end: formatDate(today)};
};

const monthRange = (): DateRange => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);
  return {start: formatDate(from), end: formatDate(today)};
};

const CHIPS: {key: FilterType; label: string; icon: string}[] = [
  {key: 'today', label: 'Hoy', icon: 'calendar-today'},
  {key: 'week', label: 'Semana', icon: 'calendar-week'},
  {key: 'month', label: 'Mes', icon: 'calendar-month'},
  {key: 'custom', label: 'Personalizado', icon: 'calendar-edit'},
];

const ReportDateFilter = memo(
  ({onChange, accentColor = '#27AE60', accentGradient}: Props) => {
    const gradient = accentGradient ?? [accentColor, accentColor];
    const [active, setActive] = useState<FilterType>('today');
    const [customVisible, setCustomVisible] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const handleChip = useCallback(
      (key: FilterType) => {
        if (key === 'custom') {
          const today = formatDate(new Date());
          setCustomStart(today);
          setCustomEnd(today);
          setCustomVisible(true);
          return;
        }
        setActive(key);
        const range =
          key === 'today'
            ? todayRange()
            : key === 'week'
            ? weekRange()
            : monthRange();
        onChange(range);
      },
      [onChange],
    );

    const handleApplyCustom = useCallback(() => {
      if (!customStart || !customEnd) {
        return;
      }
      setActive('custom');
      setCustomVisible(false);
      onChange({start: customStart, end: customEnd});
    }, [customStart, customEnd, onChange]);

    const handleCloseCustom = useCallback(() => {
      setCustomVisible(false);
    }, []);

    return (
      <>
        <View style={styles.container}>
          {CHIPS.map(chip => {
            const isActive = active === chip.key;
            return isActive ? (
              <LinearGradient
                key={chip.key}
                colors={gradient}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.chip}>
                <Icon name={chip.icon} size={14} color="#FFF" />
                <Text style={styles.chipTextActive}>{chip.label}</Text>
              </LinearGradient>
            ) : (
              <Pressable
                key={chip.key}
                style={({pressed}) => [
                  styles.chip,
                  styles.chipInactive,
                  pressed && {opacity: 0.7},
                ]}
                onPress={() => handleChip(chip.key)}>
                <Icon name={chip.icon} size={14} color="#636E72" />
                <Text style={styles.chipText}>{chip.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Custom date range modal */}
        <Modal
          visible={customVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseCustom}>
          <Pressable style={styles.overlay} onPress={handleCloseCustom}>
            <View style={styles.customSheet}>
              <Text style={styles.customTitle}>Rango personalizado</Text>

              <Text style={styles.customLabel}>Fecha inicio (DD/MM/AAAA)</Text>
              <TextInput
                style={styles.customInput}
                value={customStart}
                onChangeText={setCustomStart}
                placeholder="08/04/2026"
                placeholderTextColor="#B2BEC3"
                keyboardType="numeric"
                maxLength={10}
              />

              <Text style={styles.customLabel}>Fecha fin (DD/MM/AAAA)</Text>
              <TextInput
                style={styles.customInput}
                value={customEnd}
                onChangeText={setCustomEnd}
                placeholder="08/04/2026"
                placeholderTextColor="#B2BEC3"
                keyboardType="numeric"
                maxLength={10}
              />

              <View style={styles.customActions}>
                <Pressable
                  style={styles.customCancel}
                  onPress={handleCloseCustom}>
                  <Text style={styles.customCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.customApply,
                    {backgroundColor: accentColor},
                  ]}
                  onPress={handleApplyCustom}>
                  <Text style={styles.customApplyText}>Aplicar</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      </>
    );
  },
);

ReportDateFilter.displayName = 'ReportDateFilter';

export default ReportDateFilter;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipInactive: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  chipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  chipTextActive: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#FFF',
  },
  // Custom modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  customSheet: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  customTitle: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#2D3436',
    marginBottom: 20,
  },
  customLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  customInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  customActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  customCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customCancelText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
  customApply: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customApplyText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
});
