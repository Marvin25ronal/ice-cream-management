import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState, useRef } from 'react';
import CustomInputComponent from '../components/UI/CustomInputComponent';
import { useForm } from 'react-hook-form';
import { type_class_icon } from '../components/UI/IconSelector';
import { themeInterface } from '../interface/themeInterface';
import { useSelector } from 'react-redux';
import { ProductService } from '../services/ProductService';
import { Product } from '../entity/Product.entity';
import { AlertFunctions } from '../shared/AlertsFunctions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { EditProductParamList } from '../routes/EditProductNavigator';
import { Utils } from '../constants/utils';
import { Fonts } from '../constants/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ProductImage from '../components/UI/ProductImage';
import ModalComponent from '../components/UI/ModalComponent';
import GenericModal from '../components/UI/GenericModal';
import { useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface DayAvailability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const DAYS = [
  { key: 'monday', label: 'Lun', fullName: 'Lunes' },
  { key: 'tuesday', label: 'Mar', fullName: 'Martes' },
  { key: 'wednesday', label: 'Mié', fullName: 'Miércoles' },
  { key: 'thursday', label: 'Jue', fullName: 'Jueves' },
  { key: 'friday', label: 'Vie', fullName: 'Viernes' },
  { key: 'saturday', label: 'Sáb', fullName: 'Sábado' },
  { key: 'sunday', label: 'Dom', fullName: 'Domingo' },
];

const EditProduct = ({ route }: { route: any }) => {
  const { productId } = route.params || -1;
  const { control, watch, handleSubmit, setValue } = useForm();
  const [productService] = useState(new ProductService());
  const [product, setProduct] = useState<Product>();
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const navigation = useNavigation<StackNavigationProp<EditProductParamList>>();

  // Modal state for delete confirmation
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const modalProgress = useSharedValue(0);

  // Day availability state - default all enabled (1)
  const [dayAvailability, setDayAvailability] = useState<DayAvailability>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  // Character count for name
  const productName = watch('name');
  const nameLength = productName?.length || 0;
  const maxNameLength = 50;

  useEffect(() => {
    if (productId !== -1) {
      productService.getProduct(productId).then(product => {
        setValue('name', product.name);
        setValue('price', product.price.toString());
        setProduct(product);

        // Load day availability from product (after migration 001 is executed)
        const loadedDays = {
          monday: product.monday === 1 || product.monday === undefined,
          tuesday: product.tuesday === 1 || product.tuesday === undefined,
          wednesday: product.wednesday === 1 || product.wednesday === undefined,
          thursday: product.thursday === 1 || product.thursday === undefined,
          friday: product.friday === 1 || product.friday === undefined,
          saturday: product.saturday === 1 || product.saturday === undefined,
          sunday: product.sunday === 1 || product.sunday === undefined,
        };

        console.log('📥 Cargando producto:', product);
        console.log('📅 Días cargados desde BD:', {
          monday: product.monday,
          tuesday: product.tuesday,
          wednesday: product.wednesday,
          thursday: product.thursday,
          friday: product.friday,
          saturday: product.saturday,
          sunday: product.sunday,
        });
        console.log('📅 Estado de días interpretado:', loadedDays);

        setDayAvailability(loadedDays);
      });
    }
  }, [productId]);

  const toggleDay = (day: keyof DayAvailability) => {
    setDayAvailability(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      paddingHorizontal: 16,
      paddingVertical: 24,
    },
    header: {
      marginBottom: 24,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      fontFamily: Fonts.LatoBlack,
      color: '#2C3E50',
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      fontFamily: Fonts.LatoRegular,
      color: '#7F8C8D',
    },
    productImageCard: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      padding: 20,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
    },
    imageContainer: {
      position: 'relative',
    },
    productImage: {
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 4,
      borderColor: '#FFD6FF',
    },
    imageGradientBorder: {
      position: 'absolute',
      width: 176,
      height: 176,
      borderRadius: 88,
      top: -8,
      left: -8,
    },
    imageBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#FF006E',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 3,
      borderColor: theme.CARD_BACKGROUND_COLOR,
    },
    imageBadgeText: {
      color: 'white',
      fontSize: 12,
      fontFamily: Fonts.LatoBold,
    },
    section: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 20,
      padding: 20,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingBottom: 12,
      borderBottomWidth: 2,
      borderBottomColor: '#F0F0F0',
    },
    sectionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FFD6FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: Fonts.LatoBold,
      color: '#2C3E50',
      flex: 1,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 14,
      fontFamily: Fonts.LatoBold,
      color: '#34495E',
      marginBottom: 8,
      marginLeft: 4,
    },
    characterCount: {
      fontSize: 12,
      fontFamily: Fonts.LatoRegular,
      color: '#95A5A6',
      textAlign: 'right',
      marginTop: 4,
      marginRight: 4,
    },
    characterCountWarning: {
      color: '#E74C3C',
    },
    priceContainer: {
      marginBottom: 0,
    },
    priceLabel: {
      fontSize: 14,
      fontFamily: Fonts.LatoBold,
      color: '#34495E',
      marginBottom: 8,
      marginLeft: 4,
    },
    priceHelper: {
      fontSize: 12,
      fontFamily: Fonts.LatoRegular,
      color: '#95A5A6',
      marginTop: 4,
      marginLeft: 4,
    },
    // Day Availability Styles
    daysGrid: {
      marginTop: 8,
    },
    daysRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    dayButton: {
      flex: 1,
      marginHorizontal: 4,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    dayButtonInner: {
      paddingVertical: 14,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 60,
    },
    dayButtonInactive: {
      backgroundColor: '#E8E8E8',
    },
    dayLabel: {
      fontSize: 13,
      fontFamily: Fonts.LatoBold,
      marginBottom: 2,
    },
    dayLabelActive: {
      color: '#FFFFFF',
    },
    dayLabelInactive: {
      color: '#95A5A6',
    },
    dayFullName: {
      fontSize: 9,
      fontFamily: Fonts.LatoRegular,
    },
    dayFullNameActive: {
      color: 'rgba(255, 255, 255, 0.85)',
    },
    dayFullNameInactive: {
      color: '#BDC3C7',
    },
    dayIcon: {
      marginTop: 4,
    },
    availabilityHint: {
      marginTop: 12,
      padding: 12,
      backgroundColor: '#F0F8FF',
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#3498DB',
    },
    availabilityHintText: {
      fontSize: 12,
      fontFamily: Fonts.LatoRegular,
      color: '#5D6D7E',
      lineHeight: 18,
    },
    // Save Button
    saveButtonContainer: {
      marginBottom: 24,
      marginTop: 8,
    },
    saveButton: {
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#FF006E',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    saveButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 32,
    },
    saveButtonIcon: {
      marginRight: 10,
    },
    saveButtonText: {
      fontSize: 18,
      fontFamily: Fonts.LatoBold,
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    // Delete Button
    deleteButtonContainer: {
      marginBottom: 24,
      marginTop: 8,
    },
    deleteButton: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: '#E74C3C',
    },
    deleteButtonInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 32,
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
    },
    deleteButtonIcon: {
      marginRight: 10,
    },
    deleteButtonText: {
      fontSize: 18,
      fontFamily: Fonts.LatoBold,
      color: '#E74C3C',
      letterSpacing: 0.5,
    },
  });

  const updateProduct = async (data: any) => {
    // Prepare data with day availability
    const updateData = {
      ...data,
      // Convert boolean to 0/1 for database
      monday: dayAvailability.monday ? 1 : 0,
      tuesday: dayAvailability.tuesday ? 1 : 0,
      wednesday: dayAvailability.wednesday ? 1 : 0,
      thursday: dayAvailability.thursday ? 1 : 0,
      friday: dayAvailability.friday ? 1 : 0,
      saturday: dayAvailability.saturday ? 1 : 0,
      sunday: dayAvailability.sunday ? 1 : 0,
    };

    console.log('🔄 Guardando producto con datos:', updateData);
    console.log('📅 Estado de días:', dayAvailability);

    await productService
      .updateProductPrice(productId, updateData)
      .then(() => {
        console.log('✅ Product updated successfully', updateData);
        AlertFunctions.updateProductSuccess();
        navigation.reset({
          index: 0,
          routes: [{ name: Utils.screens.EDIT_LIST_PRODUCT }],
        });
      })
      .catch(error => {
        AlertFunctions.updateProductError();
      });
  };

  const handleDeletePress = () => {
    modalProgress.value = withSpring(1);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await productService.deleteProduct(productId);
      console.log('✅ Product deleted successfully');

      // Close modal
      modalProgress.value = withSpring(0);
      setDeleteModalVisible(false);

      // Show success message
      AlertFunctions.deleteProductSuccess();

      // Navigate back to product list
      navigation.reset({
        index: 0,
        routes: [{ name: Utils.screens.EDIT_LIST_PRODUCT }],
      });
    } catch (error) {
      console.error('❌ Error deleting product:', error);
      modalProgress.value = withSpring(0);
      setDeleteModalVisible(false);
      AlertFunctions.deleteProductError();
    }
  };

  const handleDeleteCancel = () => {
    modalProgress.value = withSpring(0);
    setDeleteModalVisible(false);
  };

  // Day gradient colors
  const getDayGradient = (isActive: boolean, index: number) => {
    if (!isActive) return ['#E8E8E8', '#E8E8E8'];

    const gradients = [
      ['#FF6B9D', '#FF006E'], // Pink (Monday)
      ['#C44569', '#A73489'], // Rose (Tuesday)
      ['#8E44AD', '#6C3483'], // Purple (Wednesday)
      ['#5B2C6F', '#4A235A'], // Deep Purple (Thursday)
      ['#00B4DB', '#0083B0'], // Blue (Friday)
      ['#06D6A0', '#00A878'], // Mint (Saturday)
      ['#FF9A56', '#FF6B35'], // Orange (Sunday)
    ];

    return gradients[index % gradients.length];
  };

  const renderDayButton = (day: typeof DAYS[0], index: number) => {
    const isActive = dayAvailability[day.key as keyof DayAvailability];
    const gradient = getDayGradient(isActive, index);

    return (
      <TouchableOpacity
        key={day.key}
        style={styles.dayButton}
        onPress={() => toggleDay(day.key as keyof DayAvailability)}
        activeOpacity={0.8}
      >
        {isActive ? (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.dayButtonInner}
          >
            <Text style={[styles.dayLabel, styles.dayLabelActive]}>
              {day.label}
            </Text>
            <Text style={[styles.dayFullName, styles.dayFullNameActive]}>
              {day.fullName}
            </Text>
            <Icon
              name="check-circle"
              size={16}
              color="rgba(255, 255, 255, 0.9)"
              style={styles.dayIcon}
            />
          </LinearGradient>
        ) : (
          <View style={[styles.dayButtonInner, styles.dayButtonInactive]}>
            <Text style={[styles.dayLabel, styles.dayLabelInactive]}>
              {day.label}
            </Text>
            <Text style={[styles.dayFullName, styles.dayFullNameInactive]}>
              {day.fullName}
            </Text>
            <Icon
              name="circle-outline"
              size={16}
              color="#BDC3C7"
              style={styles.dayIcon}
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              Editar Producto
            </Text>
            <Text style={styles.headerSubtitle}>
              {productId !== -1 ? `ID del producto: #${productId}` : 'Nuevo Producto'}
            </Text>
          </View>

          {/* Product Image Card */}
          <View style={styles.productImageCard}>
            <View style={styles.imageContainer}>
              <LinearGradient
                colors={['#FF006E', '#C44569', '#8E44AD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.imageGradientBorder}
              />
              <ProductImage
                product={product}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.imageBadge}>
                <Text style={styles.imageBadgeText}>Producto</Text>
              </View>
            </View>
          </View>

          {/* Basic Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="information" size={20} color="#FF006E" />
              </View>
              <Text style={styles.sectionTitle}>Información Básica</Text>
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Nombre del Producto</Text>
              <CustomInputComponent
                control={control}
                name="name"
                icon_class={type_class_icon.FontAwesome5}
                icon_name="ice-cream"
                place_holder="Ej: Helado de Vainilla"
                keyboardType="default"
                fontSize={16}
                iconSize={20}
                rules={{
                  required: 'El nombre es requerido',
                  maxLength: {
                    value: maxNameLength,
                    message: `El nombre no puede exceder ${maxNameLength} caracteres`
                  }
                }}
              />
              <Text
                style={[
                  styles.characterCount,
                  nameLength > maxNameLength * 0.9 && styles.characterCountWarning
                ]}
              >
                {nameLength} / {maxNameLength} caracteres
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio</Text>
              <CustomInputComponent
                control={control}
                name="price"
                icon_class={type_class_icon.FontAwesome5}
                icon_name="dollar-sign"
                place_holder="0.00"
                keyboardType="numeric"
                fontSize={16}
                iconSize={20}
                rules={{
                  required: 'El precio es requerido',
                  min: {
                    value: 0,
                    message: 'El precio debe ser mayor a 0'
                  }
                }}
              />
              <Text style={styles.priceHelper}>
                Ingrese el precio en formato decimal (ej: 25.50)
              </Text>
            </View>
          </View>

          {/* Availability Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="calendar-check" size={20} color="#8E44AD" />
              </View>
              <Text style={styles.sectionTitle}>Disponibilidad</Text>
            </View>

            <View style={styles.daysGrid}>
              {/* First Row: Monday - Thursday */}
              <View style={styles.daysRow}>
                {DAYS.slice(0, 4).map((day, index) => renderDayButton(day, index))}
              </View>

              {/* Second Row: Friday - Sunday */}
              <View style={styles.daysRow}>
                {DAYS.slice(4, 7).map((day, index) => renderDayButton(day, index + 4))}
              </View>
            </View>

            <View style={styles.availabilityHint}>
              <Text style={styles.availabilityHintText}>
                Toca cada día para activar o desactivar la disponibilidad del producto.
                Los días seleccionados están resaltados con color.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(updateProduct)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF006E', '#C44569', '#8E44AD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Icon
                  name="content-save"
                  size={24}
                  color="#FFFFFF"
                  style={styles.saveButtonIcon}
                />
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Delete Button */}
          <View style={styles.deleteButtonContainer}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeletePress}
              activeOpacity={0.8}
            >
              <View style={styles.deleteButtonInner}>
                <Icon
                  name="delete-forever"
                  size={24}
                  color="#E74C3C"
                  style={styles.deleteButtonIcon}
                />
                <Text style={styles.deleteButtonText}>Eliminar Producto</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      {/* Delete Confirmation Modal */}
      <ModalComponent
        visible={deleteModalVisible}
        setVisible={setDeleteModalVisible}
        progress={modalProgress}
        width="85%"
        height="auto"
      >
        <GenericModal
          text={`¿Estás seguro de que deseas eliminar "${product?.name}"? Esta acción no se puede deshacer.`}
          confirm={handleDeleteConfirm}
          cancel={handleDeleteCancel}
        />
      </ModalComponent>
    </KeyboardAvoidingView>
  );
};

export default EditProduct;
