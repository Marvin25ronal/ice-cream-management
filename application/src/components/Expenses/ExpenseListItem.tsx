import React, {memo} from 'react';
import {StyleSheet, Text, View, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {format} from '@formkit/tempo';
import {Expense} from '../../entity/Expense.entity';
import {Fonts, FontsSize} from '../../constants/Fonts';
import {CURRENCY_SYMBOL} from '../../constants/utils';

interface Props {
  item: Expense;
  onDelete: (item: Expense) => void;
}

const ExpenseListItem = memo(({item, onDelete}: Props) => {
  const color = item.expenseType?.color ?? '#FF6348';
  const iconName = item.expenseType?.icon ?? 'cash';
  const typeName = item.expenseType?.name ?? 'Gasto';
  const timeStr = item.date ? format(new Date(item.date), 'HH:mm') : '';

  return (
    <View style={styles.container}>
      <View style={[styles.iconBadge, {backgroundColor: color + '22'}]}>
        <Icon name={iconName} size={22} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.typeName}>{typeName}</Text>
        {!!item.notes && (
          <Text style={styles.notes} numberOfLines={1}>
            {item.notes}
          </Text>
        )}
        <Text style={styles.time}>{timeStr}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.amount}>
          {CURRENCY_SYMBOL} {item.amount.toFixed(2)}
        </Text>
        <Pressable
          style={({pressed}) => [
            styles.deleteBtn,
            pressed && styles.deleteBtnPressed,
          ]}
          onPress={() => onDelete(item)}
          hitSlop={8}>
          <Icon name="trash-can-outline" size={18} color="#E74C3C" />
        </Pressable>
      </View>
    </View>
  );
});

ExpenseListItem.displayName = 'ExpenseListItem';

export default ExpenseListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 5,
    borderRadius: 16,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  typeName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  notes: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    marginTop: 2,
  },
  time: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    marginTop: 3,
  },
  right: {
    alignItems: 'flex-end',
    gap: 8,
  },
  amount: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.medium,
    color: '#E17055',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnPressed: {
    backgroundColor: '#FFEBEE',
  },
});
