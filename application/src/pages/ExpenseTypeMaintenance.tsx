import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import {ExpenseType} from '../entity/ExpenseType.entity';
import {ExpenseTypeService} from '../services/ExpenseTypeService';
import ExpenseTypeListItem from '../components/Expenses/ExpenseTypeListItem';
import ExpenseIconPicker from '../components/Expenses/ExpenseIconPicker';
import ExpenseColorPicker from '../components/Expenses/ExpenseColorPicker';
import {Fonts, FontsSize} from '../constants/Fonts';
import Toast from 'react-native-toast-message';

const expenseTypeService = new ExpenseTypeService();

const ExpenseTypeMaintenance = () => {
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingType, setEditingType] = useState<ExpenseType | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsCustom, setFormIsCustom] = useState(false);
  const [formIcon, setFormIcon] = useState('cash');
  const [formColor, setFormColor] = useState('#FF6348');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await expenseTypeService.getAll();
      setTypes(data);
    } catch (e) {
      Toast.show({type: 'error', text1: 'Error al cargar tipos de gasto'});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTypes();
  }, [loadTypes]);

  const openCreateModal = useCallback(() => {
    setEditingType(null);
    setFormName('');
    setFormDescription('');
    setFormIsCustom(false);
    setFormIcon('cash');
    setFormColor('#FF6348');
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((item: ExpenseType) => {
    setEditingType(item);
    setFormName(item.name);
    setFormDescription(item.description ?? '');
    setFormIsCustom(item.is_custom === 1);
    setFormIcon(item.icon ?? 'cash');
    setFormColor(item.color ?? '#FF6348');
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingType(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      Toast.show({type: 'error', text1: 'El nombre es requerido'});
      return;
    }
    setSaving(true);
    try {
      if (editingType) {
        await expenseTypeService.update(editingType.expense_type_id, {
          name: formName.trim(),
          description: formDescription.trim(),
          is_custom: formIsCustom ? 1 : 0,
          icon: formIcon,
          color: formColor,
        });
        Toast.show({type: 'success', text1: 'Tipo actualizado correctamente'});
      } else {
        await expenseTypeService.create(
          formName.trim(),
          formDescription.trim(),
          formIsCustom ? 1 : 0,
          formIcon,
          formColor,
        );
        Toast.show({type: 'success', text1: 'Tipo creado correctamente'});
      }
      closeModal();
      loadTypes();
    } catch (e) {
      Toast.show({type: 'error', text1: 'Error al guardar'});
    } finally {
      setSaving(false);
    }
  }, [formName, formDescription, formIsCustom, editingType, closeModal, loadTypes]);

  const handleDelete = useCallback((item: ExpenseType) => {
    Alert.alert(
      'Eliminar tipo',
      `¿Deseas eliminar "${item.name}"? Los gastos registrados con este tipo no se borrarán.`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseTypeService.deactivate(item.expense_type_id);
              Toast.show({type: 'success', text1: 'Tipo eliminado'});
              loadTypes();
            } catch (e) {
              Toast.show({type: 'error', text1: 'Error al eliminar'});
            }
          },
        },
      ],
    );
  }, [loadTypes]);

  const renderItem = useCallback(
    ({item}: {item: ExpenseType}) => (
      <ExpenseTypeListItem
        item={item}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />
    ),
    [openEditModal, handleDelete],
  );

  const keyExtractor = useCallback(
    (item: ExpenseType) => String(item.expense_type_id),
    [],
  );

  const ListEmpty = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Icon name="tag-off-outline" size={60} color="#DFE6E9" />
        <Text style={styles.emptyText}>No hay tipos de gasto</Text>
        <Text style={styles.emptySubText}>
          Presiona "+" para agregar uno nuevo
        </Text>
      </View>
    ),
    [],
  );

  return (
    <View style={styles.container}>
      {/* Header gradient */}
      <LinearGradient
        colors={['#FF6348', '#FF8C42']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="tag-multiple" size={28} color="#FFF" />
          <Text style={styles.headerTitle}>Tipos de Gasto</Text>
          <Text style={styles.headerSubtitle}>
            {types.length} categoría{types.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={types}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <Pressable
        style={({pressed}) => [styles.fab, pressed && styles.fabPressed]}
        onPress={openCreateModal}>
        <Icon name="plus" size={28} color="#FFF" />
      </Pressable>

      {/* Icon Picker */}
      <ExpenseIconPicker
        visible={iconPickerVisible}
        selectedIcon={formIcon}
        selectedColor={formColor}
        onSelect={setFormIcon}
        onClose={() => setIconPickerVisible(false)}
      />

      {/* Color Picker */}
      <ExpenseColorPicker
        visible={colorPickerVisible}
        currentColor={formColor}
        onSelect={setFormColor}
        onClose={() => setColorPickerVisible(false)}
      />

      {/* Modal crear/editar */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            {/* Modal Header */}
            <LinearGradient
              colors={['#FF6348', '#FF8C42']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingType ? 'Editar tipo' : 'Nuevo tipo de gasto'}
              </Text>
              <Pressable onPress={closeModal} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            <View style={styles.modalBody}>
              {/* Selector de ícono */}
              <Text style={styles.label}>Ícono</Text>
              {/* Fila ícono + color lado a lado */}
              <View style={styles.iconColorRow}>
                {/* Selector de ícono */}
                <Pressable
                  style={({pressed}) => [
                    styles.iconSelectorBtn,
                    {flex: 1},
                    pressed && {opacity: 0.8},
                  ]}
                  onPress={() => setIconPickerVisible(true)}>
                  <View
                    style={[
                      styles.iconPreviewBadge,
                      {backgroundColor: formColor + '22'},
                    ]}>
                    <Icon name={formIcon} size={26} color={formColor} />
                  </View>
                  <View style={styles.iconSelectorInfo}>
                    <Text style={styles.iconSelectorLabel} numberOfLines={1}>
                      {formIcon}
                    </Text>
                    <Text style={styles.iconSelectorSub}>Ícono</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="#B2BEC3" />
                </Pressable>

                {/* Selector de color */}
                <Pressable
                  style={({pressed}) => [
                    styles.iconSelectorBtn,
                    {flex: 1},
                    pressed && {opacity: 0.8},
                  ]}
                  onPress={() => setColorPickerVisible(true)}>
                  <View
                    style={[styles.colorSwatch, {backgroundColor: formColor}]}>
                    <Icon name="palette" size={20} color="#FFF" />
                  </View>
                  <View style={styles.iconSelectorInfo}>
                    <Text style={styles.iconSelectorLabel} numberOfLines={1}>
                      {formColor}
                    </Text>
                    <Text style={styles.iconSelectorSub}>Color</Text>
                  </View>
                  <Icon name="chevron-right" size={18} color="#B2BEC3" />
                </Pressable>
              </View>

              {/* Nombre */}
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Ej: Ingredientes, Agua, Luz..."
                placeholderTextColor="#B2BEC3"
                maxLength={50}
              />

              {/* Descripción */}
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Descripción opcional..."
                placeholderTextColor="#B2BEC3"
                multiline
                numberOfLines={3}
                maxLength={150}
              />

              {/* Toggle campo libre */}
              <Pressable
                style={styles.toggleRow}
                onPress={() => setFormIsCustom(v => !v)}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>Requiere descripción</Text>
                  <Text style={styles.toggleSub}>
                    El usuario deberá escribir una nota al usar este tipo
                  </Text>
                </View>
                <View
                  style={[styles.toggle, formIsCustom && styles.toggleActive]}>
                  {formIsCustom && (
                    <Icon name="check" size={16} color="#FFF" />
                  )}
                </View>
              </Pressable>

              {/* Botones */}
              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={closeModal}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({pressed}) => [
                    styles.saveBtn,
                    pressed && styles.saveBtnPressed,
                  ]}
                  onPress={handleSave}
                  disabled={saving}>
                  <LinearGradient
                    colors={['#FF6348', '#FF8C42']}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    style={styles.saveBtnGradient}>
                    <Text style={styles.saveBtnText}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default ExpenseTypeMaintenance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
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
    fontSize: 22,
    color: '#FFF',
    marginTop: 6,
  },
  headerSubtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: 'rgba(255,255,255,0.85)',
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#636E72',
    marginTop: 12,
  },
  emptySubText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#B2BEC3',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FF6348',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#FF6348',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabPressed: {
    backgroundColor: '#E55039',
    transform: [{scale: 0.95}],
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#FFF',
  },
  modalBody: {
    padding: 20,
    gap: 6,
  },
  label: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F1F9FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#B3E5FC',
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    gap: 12,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  toggleSub: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    marginTop: 2,
  },
  toggle: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#DFE6E9',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#FF6348',
    borderColor: '#FF6348',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#DFE6E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
  iconSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  iconPreviewBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconSelectorInfo: {
    flex: 1,
  },
  iconSelectorLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  iconSelectorSub: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    marginTop: 2,
  },
  iconColorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    flex: 2,
    borderRadius: 14,
    overflow: 'hidden',
  },
  saveBtnPressed: {
    opacity: 0.85,
  },
  saveBtnGradient: {
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
});
