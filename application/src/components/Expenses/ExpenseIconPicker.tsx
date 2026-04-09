import React, {memo, useCallback} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {Fonts, FontsSize} from '../../constants/Fonts';

// Íconos curados agrupados por categoría
export const EXPENSE_ICON_GROUPS: {label: string; icons: string[]}[] = [
  {
    label: 'Alimentos',
    icons: [
      'food-apple',
      'food',
      'basket',
      'cart',
      'shopping',
      'leaf',
      'sprout',
      'silverware-fork-knife',
    ],
  },
  {
    label: 'Servicios',
    icons: [
      'lightning-bolt',
      'water',
      'fire',
      'gas-station',
      'gas-cylinder',
      'wifi',
      'lightbulb',
      'home-lightbulb',
    ],
  },
  {
    label: 'Personal',
    icons: [
      'account-group',
      'account-cash',
      'account',
      'briefcase',
      'hand-coin',
      'human-greeting',
      'badge-account',
      'account-tie',
    ],
  },
  {
    label: 'Transporte',
    icons: [
      'truck',
      'car',
      'bus',
      'motorbike',
      'bicycle',
      'fuel',
      'map-marker',
      'road-variant',
    ],
  },
  {
    label: 'Mantenimiento',
    icons: [
      'wrench',
      'hammer',
      'toolbox',
      'broom',
      'cog',
      'hammer-screwdriver',
      'screwdriver',
      'hydraulic-oil-level',
    ],
  },
  {
    label: 'Finanzas',
    icons: [
      'cash',
      'cash-multiple',
      'bank',
      'credit-card',
      'wallet',
      'receipt',
      'currency-usd',
      'cash-register',
    ],
  },
  {
    label: 'Oficina',
    icons: [
      'office-building',
      'printer',
      'laptop',
      'cellphone',
      'email',
      'package',
      'archive',
      'clipboard-text',
    ],
  },
  {
    label: 'Salud',
    icons: [
      'medical-bag',
      'hospital-box',
      'pill',
      'heart-pulse',
      'stethoscope',
      'hospital',
      'ambulance',
      'bandage',
    ],
  },
  {
    label: 'Otros',
    icons: [
      'dots-horizontal-circle',
      'tag',
      'label',
      'star',
      'help-circle',
      'plus-circle',
      'circle',
      'shape',
    ],
  },
];

export const ALL_EXPENSE_ICONS: string[] = EXPENSE_ICON_GROUPS.flatMap(
  g => g.icons,
);

interface Props {
  visible: boolean;
  selectedIcon: string;
  selectedColor: string;
  onSelect: (icon: string) => void;
  onClose: () => void;
}

interface GroupItem {
  label: string;
  icons: string[];
}

const ITEM_SIZE = 56;
const NUM_COLS = 6;

const IconGridItem = memo(
  ({
    name,
    isSelected,
    color,
    onPress,
  }: {
    name: string;
    isSelected: boolean;
    color: string;
    onPress: () => void;
  }) => (
    <Pressable
      style={({pressed}) => [
        styles.iconCell,
        isSelected && [styles.iconCellSelected, {backgroundColor: color + '22', borderColor: color}],
        pressed && styles.iconCellPressed,
      ]}
      onPress={onPress}
      hitSlop={4}>
      <Icon name={name} size={26} color={isSelected ? color : '#636E72'} />
    </Pressable>
  ),
);
IconGridItem.displayName = 'IconGridItem';

const GroupSection = memo(
  ({
    group,
    selectedIcon,
    selectedColor,
    onSelect,
  }: {
    group: GroupItem;
    selectedIcon: string;
    selectedColor: string;
    onSelect: (icon: string) => void;
  }) => (
    <View style={styles.group}>
      <Text style={styles.groupLabel}>{group.label}</Text>
      <View style={styles.iconRow}>
        {group.icons.map(name => (
          <IconGridItem
            key={name}
            name={name}
            isSelected={selectedIcon === name}
            color={selectedColor}
            onPress={() => onSelect(name)}
          />
        ))}
      </View>
    </View>
  ),
);
GroupSection.displayName = 'GroupSection';

const ExpenseIconPicker = memo(
  ({visible, selectedIcon, selectedColor, onSelect, onClose}: Props) => {
    const renderGroup = useCallback(
      ({item}: {item: GroupItem}) => (
        <GroupSection
          group={item}
          selectedIcon={selectedIcon}
          selectedColor={selectedColor}
          onSelect={onSelect}
        />
      ),
      [selectedIcon, selectedColor, onSelect],
    );

    const keyExtractor = useCallback((item: GroupItem) => item.label, []);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header */}
            <LinearGradient
              colors={['#FF6348', '#FF8C42']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.header}>
              <View style={styles.headerLeft}>
                <Icon name="emoticon-happy-outline" size={22} color="#FFF" />
                <Text style={styles.headerTitle}>Elige un ícono</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            {/* Preview del seleccionado */}
            <View style={styles.previewRow}>
              <View
                style={[
                  styles.previewBadge,
                  {backgroundColor: selectedColor + '22'},
                ]}>
                <Icon name={selectedIcon} size={32} color={selectedColor} />
              </View>
              <Text style={styles.previewText}>
                Ícono seleccionado:{' '}
                <Text style={[styles.previewName, {color: selectedColor}]}>
                  {selectedIcon}
                </Text>
              </Text>
            </View>

            {/* Grid de íconos por categoría */}
            <FlatList
              data={EXPENSE_ICON_GROUPS}
              keyExtractor={keyExtractor}
              renderItem={renderGroup}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Botón confirmar */}
            <View style={styles.footer}>
              <Pressable style={styles.confirmBtn} onPress={onClose}>
                <LinearGradient
                  colors={['#FF6348', '#FF8C42']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={styles.confirmGradient}>
                  <Icon name="check" size={20} color="#FFF" />
                  <Text style={styles.confirmText}>Confirmar</Text>
                </LinearGradient>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

ExpenseIconPicker.displayName = 'ExpenseIconPicker';

export default ExpenseIconPicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '85%',
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
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  previewBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#636E72',
    flex: 1,
  },
  previewName: {
    fontFamily: Fonts.LatoBold,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  group: {
    marginTop: 16,
  },
  groupLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconCell: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 14,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCellSelected: {
    borderWidth: 2,
  },
  iconCellPressed: {
    opacity: 0.7,
    transform: [{scale: 0.93}],
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  confirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  confirmText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
});
