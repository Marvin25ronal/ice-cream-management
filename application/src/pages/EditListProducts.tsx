import { FlatList, StyleSheet, View } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import CategoryProductsChooser from '../components/Maintenance/EditProducts/CategoryProductsChooser';
import { HomeServices } from '../services/HomeServices';
import { TreeNode } from '../interface/TreeInterface';
import EditProductListItem from '../components/Maintenance/EditProducts/EditProductListItem';
import { Product } from '../entity/Product.entity';
import ProductSkeleton from '../components/Maintenance/EditProducts/ProductSkeleton';
import CategoryChooserSkeleton from '../components/Maintenance/EditProducts/CategoryChooserSkeleton';
import CategoryHeader from '../components/Maintenance/EditProducts/CategoryHeader';

// Constantes para la paginación
const BATCH_SIZE = 5; // Número de elementos a cargar por lote
const INITIAL_LOAD = 5; // Carga inicial

interface CategoryWithProducts {
  category_id: number;
  name: string;
  type: 'category';
}

interface ProductItem extends Product {
  type: 'product';
}

type ListItem = CategoryWithProducts | ProductItem;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  categoryChooser: {
    width: '100%',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  listContainer: {
    width: '100%',
    flex: 1,
  },
  listContent: {
    padding: 10,
  },
});

const EditListProducts = () => {
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
      .getCategoriesMenu()
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

  // Convertir el árbol en una lista plana
  const flattenTree = useCallback((node: TreeNode | undefined): ListItem[] => {
    if (!node) {
      return [];
    }

    const items: ListItem[] = [];

    if (node.children && node.children.length > 0) {
      node.children.forEach((child: TreeNode) => {
        // Agregar categoría
        items.push({
          category_id: child.category_id,
          name: child.name,
          type: 'category',
        } as CategoryWithProducts);

        // Agregar items hijos (recursivo)
        items.push(...flattenTree(child));
      });
    } else if (node.products && node.products.length > 0) {
      // Agregar productos
      node.products.forEach((product: Product) => {
        items.push({
          ...product,
          type: 'product',
        } as ProductItem);
      });
    }

    return items;
  }, []);

  // Actualizar lista plana cuando cambie el nodo actual
  useEffect(() => {
    const items = flattenTree(actualNode);
    setAllItems(items);
    setCurrentIndex(INITIAL_LOAD);
    // Cargar los primeros elementos
    setDisplayedItems(items.slice(0, INITIAL_LOAD));
  }, [actualNode, flattenTree]);

  // Cargar más elementos
  const loadMoreItems = useCallback(() => {
    if (currentIndex >= allItems.length) {
      return; // Ya se cargaron todos
    }

    const nextIndex = currentIndex + BATCH_SIZE;
    const newItems = allItems.slice(currentIndex, nextIndex);

    // Agregar los nuevos elementos a los existentes
    setDisplayedItems(prev => [...prev, ...newItems]);
    setCurrentIndex(nextIndex);
  }, [currentIndex, allItems]);

  // Renderizar cada item
  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    if (item.type === 'category') {
      return <CategoryHeader name={item.name} />;
    } else {
      return <EditProductListItem product={item as Product} />;
    }
  }, []);

  // Key extractor
  const keyExtractor = useCallback((item: ListItem, index: number) => {
    if (item.type === 'category') {
      return `category-${item.category_id}-${index}`;
    } else {
      return `product-${(item as Product).product_id}-${index}`;
    }
  }, []);

  // Renderizar footer (skeleton mientras carga más)
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

export default EditListProducts;
