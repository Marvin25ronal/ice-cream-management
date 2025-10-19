import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomInputComponent from '../components/UI/CustomInputComponent';
import { useForm } from 'react-hook-form';
import { type_class_icon } from '../components/UI/IconSelector';
import { themeInterface } from '../interface/themeInterface';
import { useSelector } from 'react-redux';
import { ProductService } from '../services/ProductService';
import { ImagesDefinition } from '../shared/ImagesConstants';
import { Product } from '../entity/Product.entity';
import { AlertFunctions } from '../shared/AlertsFunctions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { EditProductParamList } from '../routes/EditProductNavigator';
import { Utils } from '../constants/utils';

const EditProduct = ({ route }: { route: any }) => {
  const { productId } = route.params || -1; // Default to -1 if productId is not provided
  const { control, watch, handleSubmit, setValue } = useForm();
  const [productService] = useState(new ProductService());
  const [product, setProduct] = useState<Product>();
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const navigation = useNavigation<StackNavigationProp<EditProductParamList>>();
  useEffect(() => {
    //set form data
    if (productId !== -1) {
      productService.getProduct(productId).then(product => {
        setValue('name', product.name); // Example of setting a default value
        setValue('price', product.price.toString()); // Assuming price is a number, convert it to string for input
        setProduct(product);
      });
    }
  }, [productId]);
  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      flexDirection: 'column',
      padding: 10,
    },
    text: {
      fontSize: 15,
      fontWeight: 'bold',
      color: 'black',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'black',
      marginBottom: 20,
    },
    row: {
      flexDirection: 'column',
      justifyContent: 'space-between',
      width: '100%',
      padding: 10,
    },
    form: {
      width: '100%',
      padding: 10,
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    imagebox: {
      width: '100%',
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 100,
      borderWidth: 3,
      borderColor: theme.HEADER_COLOR,
    },
    buttonContainer: {
      width: '100%',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
    },
    button: {
      backgroundColor: theme.CONFIRM_BUTTON_COLOR,
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 16,
      color: 'white',
      fontWeight: 'bold',
    },
  });
  const updateProduct = async (data: any) => {
    await productService
      .updateProductPrice(productId, data)
      .then(() => {
        console.log('Product updated successfully', data);
        AlertFunctions.updateProductSuccess();
        // Optionally, navigate back or reset form
        // navigation.goBack();
        //clear navigation
        navigation.reset({
          index: 0,
          routes: [{ name: Utils.screens.EDIT_LIST_PRODUCT }],
        });
      })
      .catch(error => {
        AlertFunctions.updateProductError();
      });
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100} // ajusta según el header que tengas
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={styles.title}>
              Editar Producto {productId !== -1 ? `#${productId}` : ''}
            </Text>

            <View style={styles.imagebox}>
              <Image
                source={
                  ImagesDefinition.find(img => img.name === product?.image)
                    ?.image || ImagesDefinition[0].image
                }
                width={50}
                height={50}
                style={styles.image}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.text}>Nombre:</Text>
              <CustomInputComponent
                control={control}
                name="name"
                icon_class={type_class_icon.FontAwesome5}
                icon_name="pen"
                place_holder="Nombre del producto"
                keyboardType="default"
                fontSize={16}
                iconSize={20}
                rules={{ required: 'El nombre es requerido' }}
              />
            </View>

            <View style={styles.row}>
              <Text style={styles.text}>Precio:</Text>
              <CustomInputComponent
                control={control}
                name="price"
                icon_class={type_class_icon.FontAwesome5}
                icon_name="dollar-sign"
                place_holder="Precio del producto"
                keyboardType="numeric"
                fontSize={16}
                iconSize={20}
                rules={{ required: 'El precio es requerido' }}
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(updateProduct)}>
                <Text style={styles.buttonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default EditProduct;
