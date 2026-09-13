import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ReportService, PeriodComparison } from '../../services/ReportService';
import ReportSectionTitle from '../../components/Reports/ReportSectionTitle';
import { Fonts, FontsSize } from '../../constants/Fonts';
import { CURRENCY_SYMBOL } from '../../constants/utils';

/**
 * Recuperado desde app-release-3.apk (decompilado con hermes-dec) el 2026-09-13.
 * Cambios hechos en otra PC y nunca subidos al repositorio.
 */

const reportService = new ReportService();

type Mode = 'week' | 'month';

interface DeltaRowProps {
  label: string;
  current: string;
  prev: string;
  pct: number;
  icon: string;
}

const DeltaRow = ({ label, current, prev, pct, icon }: DeltaRowProps) => {
  const positive = pct >= 0;
  return (
    <View style={styles.deltaRow}>
      <View style={styles.deltaIconWrap}>
        <Icon name={icon} size={18} color="#6C5CE7" />
      </View>
      <View style={styles.deltaInfo}>
        <Text style={styles.deltaLabel}>{label}</Text>
        <Text style={styles.deltaPrev}>Anterior: {prev}</Text>
      </View>
      <View style={styles.deltaRight}>
        <Text style={styles.deltaCurrent}>{current}</Text>
        <View
          style={[
            styles.deltaBadge,
            { backgroundColor: positive ? '#E8F8EF' : '#FDECEA' },
          ]}>
          <Icon
            name={positive ? 'trending-up' : 'trending-down'}
            size={12}
            color={positive ? '#27AE60' : '#E74C3C'}
          />
          <Text
            style={[
              styles.deltaPct,
              { color: positive ? '#27AE60' : '#E74C3C' },
            ]}>
            {positive ? '+' : ''}
            {pct.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const ReporteComparativo = () => {
  const [mode, setMode] = useState<Mode>('week');
  const [data, setData] = useState<PeriodComparison | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (m: Mode) => {
    setLoading(true);
    try {
      const result = await reportService.getPeriodComparison(m);
      setData(result);
    } catch (e) {
      console.error('Error reporte comparativo:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(mode);
    }, [load, mode]),
  );

  const changeMode = useCallback(
    (m: Mode) => {
      setMode(m);
      load(m);
    },
    [load],
  );

  const netPositive = (data?.currentNet ?? 0) >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.modeBar}>
        {(['week', 'month'] as Mode[]).map(m => {
          const active = m === mode;
          const label = m === 'week' ? 'Semana' : 'Mes';
          const icon = m === 'week' ? 'calendar-week' : 'calendar-month';
          if (!active) {
            return (
              <TouchableOpacity
                key={m}
                style={styles.modeChipInactive}
                onPress={() => changeMode(m)}>
                <Icon name={icon} size={14} color="#636E72" />
                <Text style={styles.modeChipText}>{label}</Text>
              </TouchableOpacity>
            );
          }
          return (
            <LinearGradient
              key={m}
              colors={['#6C5CE7', '#A29BFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modeChip}>
              <Icon name={icon} size={14} color="#FFF" />
              <Text style={styles.modeChipTextActive}>{label}</Text>
            </LinearGradient>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6C5CE7" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.delay(0).springify()}
            style={styles.periodHeader}>
            <Text style={styles.periodLabel}>
              {mode === 'month' ? 'Últimos 30 días' : 'Últimos 7 días'}
            </Text>
            <Text style={styles.periodSub}>
              vs. {mode === 'month' ? 'mes' : 'semana'} anterior
            </Text>
          </Animated.View>

          <ReportSectionTitle
            title="Métricas del período actual"
            accentColor="#6C5CE7"
          />
          <Animated.View
            entering={FadeInDown.delay(60).springify()}
            style={styles.card}>
            <DeltaRow
              label="Ventas"
              current={`${CURRENCY_SYMBOL} ${(
                data?.currentRevenue ?? 0
              ).toFixed(2)}`}
              prev={`${CURRENCY_SYMBOL} ${(data?.prevRevenue ?? 0).toFixed(2)}`}
              pct={data?.revenueChange ?? 0}
              icon="cash-multiple"
            />
            <View style={styles.divider} />
            <DeltaRow
              label="Órdenes completadas"
              current={String(data?.currentOrders ?? 0)}
              prev={String(data?.prevOrders ?? 0)}
              pct={data?.ordersChange ?? 0}
              icon="receipt"
            />
            <View style={styles.divider} />
            <DeltaRow
              label="Balance neto"
              current={`${CURRENCY_SYMBOL} ${(data?.currentNet ?? 0).toFixed(
                2,
              )}`}
              prev={`${CURRENCY_SYMBOL} ${(data?.prevNet ?? 0).toFixed(2)}`}
              pct={data?.netChange ?? 0}
              icon="scale-balance"
            />
          </Animated.View>

          <ReportSectionTitle
            title="Balance neto actual"
            accentColor="#6C5CE7"
          />
          <Animated.View
            entering={FadeInDown.delay(120).springify()}
            style={styles.netoCardWrap}>
            <LinearGradient
              colors={
                netPositive ? ['#27AE60', '#2ECC71'] : ['#E74C3C', '#FF6B6B']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.netoCard}>
              <Icon
                name={netPositive ? 'trending-up' : 'trending-down'}
                size={36}
                color="rgba(255,255,255,0.8)"
              />
              <View style={styles.netoInfo}>
                <Text style={styles.netoLabel}>Balance neto del período</Text>
                <Text style={styles.netoValue}>
                  {CURRENCY_SYMBOL} {(data?.currentNet ?? 0).toFixed(2)}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </ScrollView>
      )}
    </View>
  );
};

export default ReporteComparativo;

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
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  modeBar: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
    paddingBottom: 0,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  modeChipInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'white',
  },
  modeChipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  modeChipTextActive: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: 'white',
  },
  periodHeader: {
    marginBottom: 4,
  },
  periodLabel: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#2D3436',
  },
  periodSub: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 12,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  deltaIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F1FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deltaInfo: {
    flex: 1,
  },
  deltaLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  deltaPrev: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    marginTop: 2,
  },
  deltaRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  deltaCurrent: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  deltaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  deltaPct: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
  },
  netoCardWrap: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  netoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  netoInfo: {
    flex: 1,
  },
  netoLabel: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
  },
  netoValue: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.xxl,
    color: 'white',
    marginTop: 4,
  },
});
