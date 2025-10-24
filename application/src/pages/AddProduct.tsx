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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomInputComponent from '../components/UI/CustomInputComponent';
import { useForm } from 'react-hook-form';
import { type_class_icon } from '../components/UI/IconSelector';
import { themeInterface } from '../interface/themeInterface';
import { useSelector } from 'react-redux';
import { ProductService } from '../services/ProductService';
import { ImageStorageService } from '../services/ImageStorageService';
import { HomeServices } from '../services/HomeServices';
import { Category } from '../entity/Category.entity';
import { AlertFunctions } from '../shared/AlertsFunctions';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { EditProductParamList } from '../routes/EditProductNavigator';
import { Utils } from '../constants/utils';
import { Fonts } from '../constants/Fonts';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Toast from 'react-native-toast-message';
import { Picker } from '@react-native-picker/picker';

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

const AddProduct = () => {
  const { control, watch, handleSubmit, setValue } = useForm();
  const [productService] = useState(new ProductService());
  const [homeServices] = useState(new HomeServices());
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const navigation = useNavigation<StackNavigationProp<EditProductParamList>>();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    path?: string;
    type: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

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

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const treeData = await homeServices.getCategoriesMenu(false);

      // Flatten tree to get all categories
      const flatCategories: Category[] = [];
      const flattenTree = (node: any) => {
        if (node.category_id !== -1) {
          flatCategories.push({
            category_id: node.category_id,
            name: node.name,
            description: node.description,
            order: 0,
            parent_id: node.parent_id,
            image: node.image,
            products: [],
          } as Category);
        }
        if (node.children) {
          node.children.forEach(flattenTree);
        }
      };
      flattenTree(treeData);

      setCategories(flatCategories);
      if (flatCategories.length > 0) {
        setSelectedCategory(flatCategories[0].category_id);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al cargar categorías',
        text2: 'No se pudieron cargar las categorías disponibles',
      });
    } finally {
      setLoadingCategories(false);
    }
  };

  const toggleDay = (day: keyof DayAvailability) => {
    setDayAvailability(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleImagePicker = async () => {
    try {
      const imageResult = await ImageStorageService.pickImage();

      if (imageResult) {
        // Save the image to filesystem
        const savedPath = await ImageStorageService.saveImage(imageResult.uri);

        setSelectedImage({
          uri: imageResult.uri,
          path: savedPath,
          type: 'filesystem',
        });

        Toast.show({
          type: 'success',
          text1: 'Imagen seleccionada',
          text2: 'La imagen ha sido cargada correctamente',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'Error al seleccionar imagen',
        text2: 'No se pudo cargar la imagen seleccionada',
      });
    }
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
    // Image Section
    imageCard: {
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
      marginBottom: 16,
    },
    imagePreview: {
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 4,
      borderColor: '#FFD6FF',
    },
    imagePlaceholder: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#F0F0F0',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      borderStyle: 'dashed',
      borderColor: '#BDC3C7',
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
    imageButton: {
      borderRadius: 12,
      overflow: 'hidden',
      shadowColor: '#7209B7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    imageButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 24,
    },
    imageButtonText: {
      fontSize: 15,
      fontFamily: Fonts.LatoBold,
      color: '#FFFFFF',
      marginLeft: 8,
    },
    // Section Styles
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
    // Category Picker Styles
    pickerContainer: {
      backgroundColor: theme.INPUT_BACKGROUND_COLOR,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.INPUT_BORDER_COLOR,
      overflow: 'hidden',
      shadowColor: theme.INPUT_SHADOW_COLOR,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 3,
    },
    pickerWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 14,
    },
    pickerIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.INPUT_ICON_BACKGROUND_COLOR,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    picker: {
      flex: 1,
      color: '#2C3E50',
      fontFamily: Fonts.LatoRegular,
    },
    pickerHelper: {
      fontSize: 12,
      fontFamily: Fonts.LatoRegular,
      color: '#95A5A6',
      marginTop: 4,
      marginLeft: 4,
    },
    loadingContainer: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      fontFamily: Fonts.LatoRegular,
      color: '#7F8C8D',
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
    requiredBadge: {
      marginLeft: 6,
      backgroundColor: '#E74C3C',
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    requiredText: {
      color: 'white',
      fontSize: 10,
      fontFamily: Fonts.LatoBold,
    },
  });

  const createProduct = async (data: any) => {
    // Validation
    if (!selectedCategory) {
      Toast.show({
        type: 'error',
        text1: 'Categoría requerida',
        text2: 'Por favor seleccione una categoría',
      });
      return;
    }

    if (!selectedImage) {
      Toast.show({
        type: 'error',
        text1: 'Imagen requerida',
        text2: 'Por favor seleccione una imagen para el producto',
      });
      return;
    }

    if (!data.name || data.name.trim() === '') {
      Toast.show({
        type: 'error',
        text1: 'Nombre requerido',
        text2: 'Por favor ingrese el nombre del producto',
      });
      return;
    }

    if (!data.price || parseFloat(data.price) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Precio inválido',
        text2: 'Por favor ingrese un precio mayor a 0',
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare product data
      const productData = {
        name: data.name.trim(),
        price: parseFloat(data.price),
        category_id: selectedCategory,
        image: selectedImage.path || '', // Full filesystem path
        image_type: 'filesystem',
        monday: dayAvailability.monday ? 1 : 0,
        tuesday: dayAvailability.tuesday ? 1 : 0,
        wednesday: dayAvailability.wednesday ? 1 : 0,
        thursday: dayAvailability.thursday ? 1 : 0,
        friday: dayAvailability.friday ? 1 : 0,
        saturday: dayAvailability.saturday ? 1 : 0,
        sunday: dayAvailability.sunday ? 1 : 0,
      };

      console.log('Creating product with data:', productData);

      await productService.createProduct(productData);

      Toast.show({
        type: 'success',
        text1: 'Producto creado',
        text2: 'El producto ha sido creado exitosamente',
      });

      // Navigate back to product list
      navigation.reset({
        index: 0,
        routes: [{ name: Utils.screens.EDIT_LIST_PRODUCT }],
      });
    } catch (error: any) {
      console.error('Error creating product:', error);

      // Check if error is related to missing image_type column
      const errorMessage = error?.message || error?.toString() || '';
      if (errorMessage.includes('image_type') || errorMessage.includes('no such column')) {
        Toast.show({
          type: 'error',
          text1: 'Migración requerida',
          text2: 'Debe ejecutar la migración de base de datos primero',
          visibilityTime: 5000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error al crear producto',
          text2: 'Ha ocurrido un error al crear el producto',
        });
      }
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.headerTitle}>Nuevo Producto</Text>
            <Text style={styles.headerSubtitle}>
              Añade un nuevo producto al inventario
            </Text>
          </View>

          {/* Image Section */}
          <View style={styles.imageCard}>
            <View style={styles.imageContainer}>
              {selectedImage ? (
                <>
                  <LinearGradient
                    colors={['#FF006E', '#C44569', '#8E44AD']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.imageGradientBorder}
                  />
                  <Image
                    source={{ uri: selectedImage.uri }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <View style={styles.imageBadge}>
                    <Text style={styles.imageBadgeText}>Nuevo</Text>
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Icon name="image-plus" size={48} color="#BDC3C7" />
                  <Text
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      fontFamily: Fonts.LatoRegular,
                      color: '#95A5A6',
                    }}
                  >
                    Sin imagen
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={handleImagePicker}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#7209B7', '#8E44AD', '#9B59B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.imageButtonGradient}
              >
                <Icon name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.imageButtonText}>
                  {selectedImage ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
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
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.fieldLabel}>Nombre del Producto</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>REQUERIDO</Text>
                </View>
              </View>
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
                    message: `El nombre no puede exceder ${maxNameLength} caracteres`,
                  },
                }}
              />
              <Text
                style={[
                  styles.characterCount,
                  nameLength > maxNameLength * 0.9 &&
                    styles.characterCountWarning,
                ]}
              >
                {nameLength} / {maxNameLength} caracteres
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.priceLabel}>Precio</Text>
                <View style={styles.requiredBadge}>
                  <Text style={styles.requiredText}>REQUERIDO</Text>
                </View>
              </View>
              <CustomInputComponent
                control={control}
                name="price"
                type="number"
                icon_class={type_class_icon.FontAwesome5}
                icon_name="dollar-sign"
                place_holder="0.00"
                keyboardType="numeric"
                fontSize={16}
                iconSize={20}
                rules={{
                  required: 'El precio es requerido',
                  min: {
                    value: 0.01,
                    message: 'El precio debe ser mayor a 0',
                  },
                }}
              />
              <Text style={styles.priceHelper}>
                Ingrese el precio en formato decimal (ej: 25.50)
              </Text>
            </View>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Icon name="folder-open" size={20} color="#7209B7" />
              </View>
              <Text style={styles.sectionTitle}>Categoría</Text>
            </View>

            {loadingCategories ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7209B7" />
                <Text style={styles.loadingText}>Cargando categorías...</Text>
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.fieldLabel}>Seleccionar Categoría</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>REQUERIDO</Text>
                  </View>
                </View>
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerWrapper}>
                    <View style={styles.pickerIconContainer}>
                      <Icon
                        name="format-list-bulleted"
                        size={20}
                        color={theme.INPUT_ICON_COLOR}
                      />
                    </View>
                    <Picker
                      selectedValue={selectedCategory}
                      onValueChange={value => setSelectedCategory(value)}
                      style={styles.picker}
                    >
                      {categories.map(category => (
                        <Picker.Item
                          key={category.category_id}
                          label={category.name}
                          value={category.category_id}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
                <Text style={styles.pickerHelper}>
                  El producto se agregará a la categoría seleccionada
                </Text>
              </>
            )}
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
                {DAYS.slice(0, 4).map((day, index) =>
                  renderDayButton(day, index)
                )}
              </View>

              {/* Second Row: Friday - Sunday */}
              <View style={styles.daysRow}>
                {DAYS.slice(4, 7).map((day, index) =>
                  renderDayButton(day, index + 4)
                )}
              </View>
            </View>

            <View style={styles.availabilityHint}>
              <Text style={styles.availabilityHintText}>
                Toca cada día para activar o desactivar la disponibilidad del
                producto. Los días seleccionados están resaltados con color.
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(createProduct)}
              activeOpacity={0.9}
              disabled={loading}
            >
              <LinearGradient
                colors={['#FF006E', '#C44569', '#8E44AD']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Icon
                      name="plus-circle"
                      size={24}
                      color="#FFFFFF"
                      style={styles.saveButtonIcon}
                    />
                    <Text style={styles.saveButtonText}>Crear Producto</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default AddProduct;
