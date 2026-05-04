import React, {memo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {ExpenseType} from '../../entity/ExpenseType.entity';
import {Fonts, FontsSize} from '../../constants/Fonts';

interface Props {
  item: ExpenseType;
  onEdit: (item: ExpenseType) => void;
  onDelete: (item: ExpenseType) => void;
}

const ExpenseTypeListItem = memo(({item, onEdit, onDelete}: Props) => {
  const color = item.color ?? '#FF6348';
  const iconName = item.icon ?? 'cash';

  return (
    <View style={styles.container}>
      <View style={[styles.iconBadge, {backgroundColor: color + '22'}]}>
        <Icon name={iconName} size={26} color={color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
          {item.is_custom === 1 && (
            <Text style={styles.customBadge}> · libre</Text>
          )}
        </Text>
        {!!item.description && (
          <Text style={styles.description} numberOfLines={1}>
            {item.description}
          </Text>
        )}
      </View>
      <View style={styles.actions}>
        <Pressable
          style={({pressed}) => [
            styles.actionBtn,
            {backgroundColor: pressed ? '#E3F2FD' : '#F1F9FF'},
          ]}
          onPress={() => onEdit(item)}
          hitSlop={8}>
          <Icon name="pencil-outline" size={20} color="#0288D1" />
        </Pressable>
        <Pressable
          style={({pressed}) => [
            styles.actionBtn,
            {backgroundColor: pressed ? '#FFEBEE' : '#FFF5F5'},
          ]}
          onPress={() => onDelete(item)}
          hitSlop={8}>
          <Icon name="trash-can-outline" size={20} color="#E74C3C" />
        </Pressable>
      </View>
    </View>
  );
});

ExpenseTypeListItem.displayName = 'ExpenseTypeListItem';

export default ExpenseTypeListItem;

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
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    marginBottom: 2,
  },
  customBadge: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#A29BFE',
  },
  description: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
