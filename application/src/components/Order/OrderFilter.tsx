import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomInputComponent from '../UI/CustomInputComponent';
import { useForm } from 'react-hook-form';
import { type_class_icon } from '../UI/IconSelector';
import ButtonComponent from '../UI/ButtonComponent';
import Animated from 'react-native-reanimated';
import { OrderService } from '../../services/OrderServices';
import { format } from '@formkit/tempo';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/redux/store';
import LinearGradient from 'react-native-linear-gradient';
import IconSelector from '../UI/IconSelector';
import { Fonts, FontsSize } from '../../constants/Fonts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OrderFilter = ({ getOrders }: { getOrders: any }) => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const { control, handleSubmit, setValue } = useForm();
  const [orderService] = useState(new OrderService());
  const [selectedFilter, setSelectedFilter] = useState<
    'today' | 'week' | 'month' | 'custom'
  >('today');
  const [displayDate, setDisplayDate] = useState<string>('Hoy');

  const isTablet = SCREEN_WIDTH >= 768;

  // Inicializar con la fecha de hoy
  useEffect(() => {
    const today = new Date();
    const todayStr = `Hoy - ${today.toLocaleDateString()}`;
    setDisplayDate(todayStr);
    setValue('date', today.toLocaleDateString());
  }, [setValue]);

  const styles = StyleSheet.create({
    container: {
      paddingVertical: isTablet ? 12 : 16,
      paddingHorizontal: 16,
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    mainRow: {
      flexDirection: isTablet ? 'row' : 'column',
      gap: isTablet ? 16 : 16,
      alignItems: isTablet ? 'center' : 'stretch',
    },
    filterLabel: {
      fontSize: isTablet ? FontsSize.medium : FontsSize.small,
      fontFamily: Fonts.LatoBlack,
      color: theme.MODAL_TEXT_COLOR,
      minWidth: isTablet ? 120 : undefined,
      marginBottom: isTablet ? 0 : 8,
    },
    filterIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isTablet ? 12 : 0,
    },
    quickFiltersContainer: {
      flex: isTablet ? 0 : 1,
      marginBottom: isTablet ? 0 : 16,
    },
    quickFiltersLabel: {
      fontSize: isTablet ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoBold,
      color: theme.LABEL_FORM_COLOR,
      marginBottom: 8,
    },
    quickFiltersRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    quickFilterButton: {
      borderRadius: 20,
      paddingVertical: isTablet ? 12 : 10,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 2,
      borderColor: theme.INPUT_BORDER_COLOR,
      backgroundColor: theme.INPUT_BACKGROUND_COLOR,
      minHeight: isTablet ? 48 : undefined,
    },
    quickFilterButtonActive: {
      borderWidth: 0,
    },
    quickFilterText: {
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.small : FontsSize.extraSmall,
      fontFamily: Fonts.LatoBold,
      color: theme.MODAL_TEXT_COLOR,
    },
    quickFilterTextActive: {
      color: '#FFFFFF',
    },
    customFilterContainer: {
      flex: isTablet ? 1 : undefined,
      flexDirection: 'row',
      gap: 12,
      alignItems: isTablet ? 'center' : 'flex-end',
    },
    dateInputWrapper: {
      flex: 1,
    },
    searchButtonWrapper: {
      minWidth: isTablet ? 120 : 100,
      justifyContent: 'center',
      alignItems: 'center',
    },
    searchButtonGradient: {
      borderRadius: 16,
      paddingVertical: isTablet ? 12 : 14,
      paddingHorizontal: isTablet ? 20 : 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      minHeight: isTablet ? 48 : undefined,
      ...Platform.select({
        ios: {
          shadowColor: '#FF006E',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    searchButtonText: {
      fontSize: SCREEN_WIDTH >= 768 ? FontsSize.medium : FontsSize.small,
      fontFamily: Fonts.LatoBlack,
      color: '#FFFFFF',
    },
  });

  const handleQuickFilter = (filter: 'today' | 'week' | 'month' | 'custom') => {
    setSelectedFilter(filter);

    const today = new Date();
    let dateRange;
    let displayText = '';

    switch (filter) {
      case 'today':
        dateRange = { date: today.toLocaleDateString() };
        displayText = `Hoy - ${today.toLocaleDateString()}`;
        setValue('date', today.toLocaleDateString());
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        dateRange = {
          date: `${weekStart.toLocaleDateString()}-${today.toLocaleDateString()}`,
        };
        displayText = `Última Semana (${weekStart.toLocaleDateString()} - ${today.toLocaleDateString()})`;
        setValue(
          'date',
          `${weekStart.toLocaleDateString()}-${today.toLocaleDateString()}`,
        );
        break;
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(today.getDate() - 30);
        dateRange = {
          date: `${monthStart.toLocaleDateString()}-${today.toLocaleDateString()}`,
        };
        displayText = `Último Mes (${monthStart.toLocaleDateString()} - ${today.toLocaleDateString()})`;
        setValue(
          'date',
          `${monthStart.toLocaleDateString()}-${today.toLocaleDateString()}`,
        );
        break;
      default:
        return;
    }

    setDisplayDate(displayText);
    getOrders(dateRange);
  };

  const QuickFilterButton = ({
    label,
    icon,
    filter,
    gradientColors,
  }: {
    label: string;
    icon: string;
    filter: 'today' | 'week' | 'month' | 'custom';
    gradientColors: string[];
  }) => {
    const isActive = selectedFilter === filter;

    if (isActive) {
      return (
        <TouchableOpacity
          onPress={() => handleQuickFilter(filter)}
          activeOpacity={0.8}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.quickFilterButton, styles.quickFilterButtonActive]}>
            <IconSelector
              icon_class={type_class_icon.FontAwesome5}
              icon={icon}
              size={14}
              color="#FFFFFF"
            />
            <Text
              style={[styles.quickFilterText, styles.quickFilterTextActive]}>
              {label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => handleQuickFilter(filter)}
        style={styles.quickFilterButton}
        activeOpacity={0.7}>
        <IconSelector
          icon_class={type_class_icon.FontAwesome5}
          icon={icon}
          size={14}
          color={theme.LABEL_FORM_COLOR}
        />
        <Text style={styles.quickFilterText}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Todo en una sola fila en tablet */}
      <View style={styles.mainRow}>
        {/* Icono de filtro o texto en móvil */}
        {isTablet ? (
          <LinearGradient
            colors={['#FF006E', '#FF6D8F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.filterIconContainer}>
            <IconSelector
              icon_class={type_class_icon.FontAwesome5}
              icon="filter"
              size={20}
              color="#FFFFFF"
            />
          </LinearGradient>
        ) : (
          <Text style={styles.filterLabel}>Filtrar Ordenes</Text>
        )}

        {/* Quick Filters */}
        <View style={styles.quickFiltersContainer}>
          {!isTablet && (
            <Text style={styles.quickFiltersLabel}>Accesos Rápidos</Text>
          )}
          <View style={styles.quickFiltersRow}>
            <QuickFilterButton
              label="Hoy"
              icon="calendar-day"
              filter="today"
              gradientColors={['#06D6A0', '#52B788']}
            />
            <QuickFilterButton
              label="Semana"
              icon="calendar-week"
              filter="week"
              gradientColors={['#7209B7', '#B185DB']}
            />
            <QuickFilterButton
              label="Mes"
              icon="calendar-alt"
              filter="month"
              gradientColors={['#FF8500', '#FFB347']}
            />
          </View>
        </View>

        {/* Custom Date Filter */}
        <View style={styles.customFilterContainer}>
          <View style={styles.dateInputWrapper}>
            <CustomInputComponent
              control={control}
              rules={{}}
              icon_class={type_class_icon.FontAwesome5}
              icon_name="calendar"
              name="date"
              place_holder="Fecha personalizada"
              keyboardType="default"
              fontSize={isTablet ? 16 : 16}
              width={'100%'}
              type="date"
              defaultValue={displayDate}
              disabled={false}
            />
          </View>
          <TouchableOpacity
            onPress={handleSubmit(data => {
              setSelectedFilter('custom');
              getOrders(data);
            })}
            style={styles.searchButtonWrapper}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#FF006E', '#FF6D8F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.searchButtonGradient}>
              <IconSelector
                icon_class={type_class_icon.FontAwesome5}
                icon="search"
                size={16}
                color="#FFFFFF"
              />
              {isTablet && <Text style={styles.searchButtonText}>Buscar</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default OrderFilter;
