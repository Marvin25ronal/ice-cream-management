import {
  StyleSheet,
  View,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { HomeServices } from '../services/HomeServices';
import { Product } from '../entity/Product.entity';
import Animated from 'react-native-reanimated';
import { themeInterface } from '../interface/themeInterface';
import ShoppingCartListItem from '../components/ShoppingCart/ShoppingCartListItem';
import ResumeShopping from '../components/ShoppingCart/ResumeShopping';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

export interface AgrupatedProducts {
  id: number;
  products: Product[];
}

const EditShoppingCartPage = ({ route }: { route: any }) => {
  const shoppingCart: number[] = useSelector(
    (state: any) => state.shoppingCart.value,
  );
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const [homeService] = useState(new HomeServices());
  const [elements, setElements] = useState<
    { products: Product[]; id: number }[]
  >([]);

  // Get from router edit var
  const { edit } = route.params;

  useEffect(() => {
    // Get data
    homeService
      .getProductByProductID(shoppingCart)
      .then(products => {
        // Group elements by product id
        let elem: AgrupatedProducts[] = [];
        shoppingCart.forEach(item => {
          if (elem.find(e => item == e.id)) {
            let element = elem.find(e => e.id == item);
            let product = products.find(e => e.product_id == item);
            if (product) element?.products.push(product);
          } else {
            let element: AgrupatedProducts = {
              id: item,
              products: products.filter(e => e.product_id == item),
            };
            elem.push(element);
          }
        });
        setElements(elem);
      })
      .catch(error => {
        console.log(error);
      });
    console.log(shoppingCart);
  }, [shoppingCart]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'row',
      width: '100%',
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    cartItemsContainer: {
      width: isTablet ? '65%' : '100%',
      height: '100%',
    },
    scrollViewContent: {
      paddingVertical: 8,
      paddingBottom: 24,
    },
    summaryContainer: {
      width: isTablet ? '35%' : '100%',
      height: '100%',
      minWidth: isTablet ? 320 : undefined,
      maxWidth: isTablet ? 450 : undefined,
    },
  });

  return (
    <View style={styles.container}>
      {/* Product List Section */}
      <View style={styles.cartItemsContainer}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}>
          {elements.map((item, index) => (
            <ShoppingCartListItem key={index} item={item} edit={edit} />
          ))}
        </Animated.ScrollView>
      </View>

      {/* Summary Section */}
      <View style={styles.summaryContainer}>
        <ResumeShopping elements={elements} />
      </View>
    </View>
  );
};

export default EditShoppingCartPage;
