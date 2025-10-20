import { StyleSheet, Text, View, SafeAreaView, StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { themeInterface } from '../interface/themeInterface';
import { HomeServices } from '../services/HomeServices';
import { TreeNode } from '../interface/TreeInterface';
import { useLoading } from '../shared/LoaderHook';
import { Product } from '../entity/Product.entity';
import ModalComponent from '../components/UI/ModalComponent';
import ClearSelectedItemsModal from '../components/Home/ClearSelectedItemsModal';
import { SCREENS } from '../constants/navigation/screeens';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../routes/StackNavigator';
import { addToCart, clearCart } from '../store/redux/carReducer';
import { clearOrder } from '../store/redux/orderReducer';
import Animated, { useSharedValue, withSpring } from 'react-native-reanimated';

// Modern Components
import ModernProductCard from '../components/Home/ModernProductCard';
import ModernActionButtons from '../components/Home/ModernActionButtons';
import CartSummary from '../components/Home/CartSummary';
import CategoryBreadcrumb from '../components/Home/CategoryBreadcrumb';

const HomePage = ({ route }: { route: any }) => {
  const [homeService] = useState(new HomeServices());
  const [actualNode, setActualNode] = useState<TreeNode>();
  const { loadingState } = useLoading();
  const reload = route ? route?.params : undefined;
  const [data, setdata] = useState<TreeNode>();
  const dispatch = useDispatch();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const shoppingCart: number[] = useSelector(
    (state: any) => state.shoppingCart.value,
  );
  const [visible, setVisible] = useState(false);

  const progress = useSharedValue(0);

  useEffect(() => {
    setTimeout(() => {
      getTree();
      dispatch(clearCart());
    }, 500);
  }, []);

  useEffect(() => {
    if (reload) {
      getTree();
    }
  }, [reload]);

  const getTree = async () => {
    homeService
      .getCategoriesMenu()
      .then((tree: TreeNode) => {
        setdata(tree);
        setActualNode(tree);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const loadTree = () => {
    setActualNode(data);
  };

  const addProduct = (product: Product) => {
    dispatch(addToCart(product.product_id));
  };

  const clearSelectedItems = () => {
    setVisible(true);
    dispatch(clearOrder());
    progress.value = withSpring(1);
  };

  const goToPayment = () => {
    if (shoppingCart.length > 0) {
      navigation.navigate(SCREENS.EDIT_SHOPPING_CART, { edit: false });
    }
  };

  const goToEditShoppingCart = () => {
    if (shoppingCart.length > 0) {
      navigation.navigate(SCREENS.EDIT_SHOPPING_CART, { edit: true });
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
    },
    page: {
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      flex: 1,
    },
    contentContainer: {
      paddingBottom: 100,
      paddingTop: 10,
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 8,
      paddingTop: 10,
      justifyContent: 'flex-start',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyStateText: {
      fontSize: 18,
      color: '#6C757D',
      fontFamily: 'Lato-Regular',
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        backgroundColor={theme.HEADER_COLOR}
        barStyle="light-content"
      />

      {/* Modern Action Buttons - Fixed at Top */}
      <ModernActionButtons
        loadTree={loadTree}
        actualNode={actualNode}
        setActualNode={setActualNode}
        clearSelectedItems={clearSelectedItems}
        goToPayment={goToPayment}
        goToEditShoppingCart={goToEditShoppingCart}
      />

      {/* Category Breadcrumb Navigation */}
      

      {/* Main Content - Product/Category Grid */}
      <Animated.ScrollView
        style={styles.page}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}>
        <View style={styles.gridContainer}>
          {/* Render Categories */}
          {!loadingState &&
            actualNode &&
            actualNode.children &&
            actualNode.children.map((node: TreeNode, index: number) => (
              <ModernProductCard
                key={`category-${node.category_id}-${index}`}
                id={node.category_id}
                name={node.name}
                description={node.description}
                image={node.image}
                onPress={() => {
                  setActualNode(node);
                }}
                isProduct={false}
              />
            ))}

          {/* Render Products */}
          {!loadingState &&
            actualNode &&
            actualNode.products &&
            actualNode.products.map((product: Product, index: number) => (
              <ModernProductCard
                key={`product-${product.product_id}-${index}`}
                id={product.product_id}
                name={product.name}
                image={product.image}
                price={product.price}
                onPress={() => {
                  addProduct(product);
                }}
                isProduct={true}
              />
            ))}
        </View>

        {/* Empty State */}
        {!loadingState &&
          actualNode &&
          !actualNode.children?.length &&
          !actualNode.products?.length && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No items available in this category
              </Text>
            </View>
          )}
      </Animated.ScrollView>


      {/* Clear Cart Confirmation Modal */}
      <ModalComponent
        visible={visible}
        setVisible={setVisible}
        height={'50%'}
        width={'50%'}
        progress={progress}>
        <ClearSelectedItemsModal
          confirm={() => {
            dispatch(clearCart());
            setVisible(false);
            progress.value = withSpring(0);
          }}
          cancel={() => {
            setVisible(false);
            progress.value = withSpring(0);
          }}
        />
      </ModalComponent>
    </SafeAreaView>
  );
};

export default HomePage;
