import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {themeInterface} from '../../interface/themeInterface';
import {Fonts} from '../../constants/Fonts';
import IconSelector, {type_class_icon} from '../UI/IconSelector';
import {TreeNode} from '../../interface/TreeInterface';
import CategoryBreadcrumb from './CategoryBreadcrumb';

interface ModernActionButtonsProps {
  actualNode: TreeNode | undefined;
  setActualNode: (node: TreeNode) => void;
  loadTree: () => void;
  clearSelectedItems: () => void;
  goToPayment: () => void;
  goToEditShoppingCart: () => void;
}

const ModernActionButtons: React.FC<ModernActionButtonsProps> = ({
  actualNode,
  setActualNode,
  loadTree,
  clearSelectedItems,
  goToPayment,
  goToEditShoppingCart,
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const shoppingCart: number[] = useSelector(
    (state: any) => state.shoppingCart.value,
  );

  const cartItemCount = shoppingCart.length;
  const dimensions = Dimensions.get('window');

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 12,
      backgroundColor: 'white',
      borderBottomWidth: 3,
      borderBottomColor: '#E9ECEF',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    breadcrumbContainer: {
      flex: 1,
      marginRight: 12,
    },
    buttonsContainer: {
      flexDirection: 'row',
      gap: 10,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderRadius: 16,
      minWidth: 120,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    buttonText: {
      color: 'white',
      fontFamily: Fonts.LatoBold,
      fontSize: 15,
      marginLeft: 8,
      letterSpacing: 0.3,
      flexShrink: 0,
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -6,
      backgroundColor: '#FF006E',
      borderRadius: 12,
      minWidth: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'white',
      elevation: 3,
    },
    badgeText: {
      color: 'white',
      fontFamily: Fonts.LatoBlack,
      fontSize: 12,
    },
  });

  const ActionButton = ({
    icon,
    iconClass,
    label,
    gradientColors,
    onPress,
    showBadge = false,
    badgeCount = 0,
  }: {
    icon: string;
    iconClass: type_class_icon;
    label: string;
    gradientColors: string[];
    onPress: () => void;
    showBadge?: boolean;
    badgeCount?: number;
  }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient colors={gradientColors} style={styles.button}>
        <IconSelector
          icon_class={iconClass}
          color="white"
          icon={icon}
          size={22}
        />
        <Text style={styles.buttonText}>{label}</Text>
        {showBadge && badgeCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badgeCount}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.breadcrumbContainer}>
        <CategoryBreadcrumb
          currentNode={actualNode}
          onNavigate={node => setActualNode(node)}
          onHome={loadTree}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <ActionButton
          icon="trash-2"
          iconClass={type_class_icon.Feather}
          label="Limpiar"
          gradientColors={['#EF476F', '#c9184a']}
          onPress={clearSelectedItems}
        />

        <ActionButton
          icon="edit-3"
          iconClass={type_class_icon.Feather}
          label="Editar"
          gradientColors={['#00B4D8', '#0288D1']}
          onPress={goToEditShoppingCart}
          showBadge={true}
          badgeCount={cartItemCount}
        />

        <ActionButton
          icon="credit-card"
          iconClass={type_class_icon.Feather}
          label="Facturar"
          gradientColors={['#06D6A0', '#029b74']}
          onPress={goToPayment}
          showBadge={true}
          badgeCount={cartItemCount}
        />
      </View>
    </View>
  );
};

export default ModernActionButtons;
