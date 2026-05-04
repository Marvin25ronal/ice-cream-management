import React, {memo, useCallback, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CalendarPicker from 'react-native-calendar-picker';
import {Fonts, FontsSize} from '../../constants/Fonts';

export interface DateRange {
  start: string; // DD/MM/YYYY
  end: string; // DD/MM/YYYY
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

const toJsDate = (date: unknown): Date => {
  if (!date) {
    return new Date();
  }
  const m = date as {toDate?: () => Date; valueOf?: () => number};
  if (typeof m.toDate === 'function') {
    return m.toDate();
  }
  return new Date(m.valueOf?.() ?? (date as number));
};

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

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const ReportDateFilter = memo(
  ({onChange, accentColor = '#27AE60', accentGradient}: Props) => {
    const gradient = accentGradient ?? [accentColor, accentColor];
    const {width: windowWidth} = useWindowDimensions();
    const calendarWidth = Math.min(windowWidth - 32, 380);
    const calendarHeight = Math.min(340, Math.round(windowWidth * 0.85));

    const [active, setActive] = useState<FilterType>('today');
    const [customVisible, setCustomVisible] = useState(false);
    const [rangeStart, setRangeStart] = useState<Date>(new Date());
    const [rangeEnd, setRangeEnd] = useState<Date | null>(new Date());

    const handleChip = useCallback(
      (key: FilterType) => {
        if (key === 'custom') {
          const t = new Date();
          setRangeStart(t);
          setRangeEnd(t);
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

    const onCalendarDateChange = useCallback((date: unknown, type: string) => {
      if (type === 'START_DATE') {
        const d = toJsDate(date);
        setRangeStart(d);
        setRangeEnd(null);
        return;
      }
      if (type === 'END_DATE') {
        if (date == null) {
          setRangeEnd(null);
          return;
        }
        setRangeEnd(toJsDate(date));
      }
    }, []);

    const handleApplyCustom = useCallback(() => {
      let start = rangeStart;
      let end = rangeEnd ?? rangeStart;
      if (start.getTime() > end.getTime()) {
        const tmp = start;
        start = end;
        end = tmp;
      }
      setActive('custom');
      setCustomVisible(false);
      onChange({start: formatDate(start), end: formatDate(end)});
    }, [rangeStart, rangeEnd, onChange]);

    const handleCloseCustom = useCallback(() => {
      setCustomVisible(false);
    }, []);

    const rangeSummary = `${formatDate(rangeStart)} — ${
      rangeEnd ? formatDate(rangeEnd) : '…'
    }`;

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

        <Modal
          visible={customVisible}
          transparent
          animationType="fade"
          onRequestClose={handleCloseCustom}>
          <View style={styles.modalRoot}>
            <Pressable
              style={styles.modalBackdrop}
              onPress={handleCloseCustom}
            />
            <View style={styles.customSheet}>
              <Text style={styles.customTitle}>Rango personalizado</Text>
              <Text style={styles.rangeHint}>
                Toca el día de inicio y luego el de fin (puede ser el mismo día).
              </Text>
              <Text style={styles.rangeSummary}>{rangeSummary}</Text>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.calendarScroll}>
                <CalendarPicker
                  width={calendarWidth}
                  height={calendarHeight}
                  allowRangeSelection
                  selectedStartDate={rangeStart}
                  selectedEndDate={rangeEnd ?? undefined}
                  initialDate={rangeStart}
                  months={MONTHS_ES}
                  weekdays={['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']}
                  previousTitle="Anterior"
                  nextTitle="Siguiente"
                  previousTitleStyle={{color: accentColor}}
                  nextTitleStyle={{color: accentColor}}
                  textStyle={{fontFamily: Fonts.LatoRegular, color: '#2D3436'}}
                  selectedDayColor={accentColor}
                  selectedDayTextColor="#FFF"
                  todayTextStyle={{color: accentColor}}
                  onDateChange={onCalendarDateChange}
                />
              </ScrollView>

              <View style={styles.customActions}>
                <Pressable
                  style={styles.customCancel}
                  onPress={handleCloseCustom}>
                  <Text style={styles.customCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.customApply, {backgroundColor: accentColor}]}
                  onPress={handleApplyCustom}>
                  <Text style={styles.customApplyText}>Aplicar</Text>
                </Pressable>
              </View>
            </View>
          </View>
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
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  customSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '92%',
  },
  customTitle: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#2D3436',
    marginBottom: 8,
  },
  rangeHint: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    marginBottom: 6,
  },
  rangeSummary: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    marginBottom: 8,
  },
  calendarScroll: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  customActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
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
