import { FlatList, StyleSheet, View, Text } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import CategoryProductsChooser from '../components/Maintenance/EditProducts/CategoryProductsChooser';
import { HomeServices } from '../services/HomeServices';
import { TreeNode } from '../interface/TreeInterface';
import ProductRecipeListItem from '../components/Maintenance/EditProducts/ProductRecipeListItem';
import { Product } from '../entity/Product.entity';
import ProductSkeleton from '../components/Maintenance/EditProducts/ProductSkeleton';
import CategoryChooserSkeleton from '../components/Maintenance/EditProducts/CategoryChooserSkeleton';
import CategoryHeader from '../components/Maintenance/EditProducts/CategoryHeader';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fonts, FontsSize } from '../constants/Fonts';

const BATCH_SIZE = 5;
const INITIAL_LOAD = 5;

interface CategoryWithProducts {
  category_id: number;
  name: string;
  type: 'category';
}

interface ProductRow {
  type: 'productRow';
  products: Product[];
}

type ListItem = CategoryWithProducts | ProductRow;

const ProductRecipesListPage = () => {
  const [data, setdata] = useState<TreeNode>();
  const [homeService] = useState(new HomeServices());
  const [actualNode, setActualNode] = useState<TreeNode>();
  const [isLoading, setIsLoading] = useState(true);
  const [displayedItems, setDisplayedItems] = useState<ListItem[]>([]);
  const [allItems, setAllItems] = useState<ListItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getTree = async () => {
    setIsLoading(true);
    homeService
      .getCategoriesMenu(false)
      .then((tree: TreeNode) => {
        setdata(tree);
        setActualNode(tree);
        setIsLoading(false);
      })
      .catch(error => {
        console.log(error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flattenTree = useCallback((node: TreeNode | undefined): ListItem[] => {
    if (!node) {
      return [];
    }

    const items: ListItem[] = [];

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: TreeNode) => {
        items.push({
          category_id: child.category_id,
          name: child.name,
          type: 'category',
        } as CategoryWithProducts);

        items.push(...flattenTree(child));
      });
    }

    if (node.products && node.products.length > 0) {
      for (let i = 0; i < node.products.length; i += 4) {
        const productsInRow = node.products.slice(i, i + 4);
        items.push({
          type: 'productRow',
          products: productsInRow,
        } as ProductRow);
      }
    }

    return items;
  }, []);

  useEffect(() => {
    const items = flattenTree(actualNode);
    setAllItems(items);
    setCurrentIndex(INITIAL_LOAD);
    setDisplayedItems(items.slice(0, INITIAL_LOAD));
  }, [actualNode, flattenTree]);

  const loadMoreItems = useCallback(() => {
    if (currentIndex >= allItems.length) {
      return;
    }

    const nextIndex = currentIndex + BATCH_SIZE;
    const newItems = allItems.slice(currentIndex, nextIndex);

    setDisplayedItems(prev => [...prev, ...newItems]);
    setCurrentIndex(nextIndex);
  }, [currentIndex, allItems]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'category') {
      return <CategoryHeader name={item.name} />;
    } else if (item.type === 'productRow') {
      const productRow = item as ProductRow;
      return (
        <View style={styles.productRow}>
          {productRow.products.map(product => (
            <ProductRecipeListItem key={product.product_id} product={product} />
          ))}
        </View>
      );
    }
    return null;
  }, []);

  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === 'category') {
      return `category-${item.category_id}-${index}`;
    } else if (item.type === 'productRow') {
      const productRow = item as ProductRow;
      return `productRow-${productRow.products
        .map(p => p.product_id)
        .join('-')}-${index}`;
    }
    return `item-${index}`;
  }, []);

  const renderFooter = useCallback(() => {
    if (currentIndex < allItems.length) {
      return (
        <View>
          <ProductSkeleton />
          <ProductSkeleton />
        </View>
      );
    }
    return null;
  }, [currentIndex, allItems.length]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00B894', '#00CEC9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="clipboard-list-outline" size={26} color="#FFF" />
          <Text style={styles.headerTitle}>Recetas de Productos</Text>
          <Text style={styles.headerSubtitle}>
            Selecciona un producto para configurar qué materia prima consume
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.categoryChooser}>
        {isLoading ? (
          <CategoryChooserSkeleton />
        ) : (
          <CategoryProductsChooser
            categories={data}
            selectedNode={actualNode}
            setNode={setActualNode}
          />
        )}
      </View>

      {isLoading ? (
        <View style={styles.listContainer}>
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={true}
          initialNumToRender={INITIAL_LOAD}
          maxToRenderPerBatch={BATCH_SIZE}
          windowSize={5}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
        />
      )}
    </View>
  );
};

export default ProductRecipesListPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontFamily: Fonts.LatoBlack,
    fontSize: 20,
    color: '#FFF',
    marginTop: 4,
  },
  headerSubtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 12,
  },
  categoryChooser: {
    width: '100%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
  listContent: {
    padding: 4,
    paddingBottom: 100,
  },
  productRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
