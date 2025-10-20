import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {themeInterface} from '../../interface/themeInterface';
import {Fonts} from '../../constants/Fonts';
import IconSelector, {type_class_icon} from '../UI/IconSelector';
import {TreeNode} from '../../interface/TreeInterface';

interface CategoryBreadcrumbProps {
  currentNode: TreeNode | undefined;
  onNavigate: (node: TreeNode) => void;
  onHome: () => void;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  currentNode,
  onNavigate,
  onHome,
}) => {
  const theme: themeInterface = useSelector((state: any) => state.theme.value);

  // Build breadcrumb trail from root to current node
  const buildBreadcrumbTrail = (): TreeNode[] => {
    if (!currentNode) return [];

    const trail: TreeNode[] = [];
    let node: TreeNode | null | undefined = currentNode;

    while (node && node.parent) {
      trail.unshift(node);
      node = node.parent;
    }

    return trail;
  };

  const breadcrumbTrail = buildBreadcrumbTrail();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomColor: '#E9ECEF',
    },
    scrollView: {
      flexGrow: 0,
    },
    breadcrumbContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    homeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      marginRight: 8,
    },
    breadcrumbButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      marginRight: 8,
    },
    breadcrumbText: {
      color: 'white',
      fontFamily: Fonts.LatoBold,
      fontSize: 14,
      marginLeft: 6,
    },
    separator: {
      marginHorizontal: 4,
    },
    currentCategory: {
      backgroundColor: '#E1F5FE',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: '#0288D1',
    },
    currentCategoryText: {
      color: '#0288D1',
      fontFamily: Fonts.LatoBlack,
      fontSize: 14,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}>
        <View style={styles.breadcrumbContainer}>
          <TouchableOpacity onPress={onHome} activeOpacity={0.8}>
            <LinearGradient
              colors={['#595758', '#3d3c3d']}
              style={styles.homeButton}>
              <IconSelector
                icon_class={type_class_icon.Feather}
                color="white"
                icon="home"
                size={18}
              />
              <Text style={styles.breadcrumbText}>Inicio</Text>
            </LinearGradient>
          </TouchableOpacity>

          {breadcrumbTrail.map((node, index) => (
            <React.Fragment key={node.category_id}>
              <View style={styles.separator}>
                <IconSelector
                  icon_class={type_class_icon.Feather}
                  color="#ADB5BD"
                  icon="chevron-right"
                  size={18}
                />
              </View>

              {index === breadcrumbTrail.length - 1 ? (
                <View style={styles.currentCategory}>
                  <Text style={styles.currentCategoryText} numberOfLines={1}>
                    {node.name}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => onNavigate(node)}
                  activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#7209B7', '#560bad']}
                    style={styles.breadcrumbButton}>
                    <Text style={styles.breadcrumbText} numberOfLines={1}>
                      {node.name}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default CategoryBreadcrumb;
