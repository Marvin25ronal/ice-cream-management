import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { RawMaterial } from '../entity/RawMaterial.entity';
import { RawMaterialService } from '../services/RawMaterialService';
import { ImageStorageService } from '../services/ImageStorageService';
import { Fonts, FontsSize } from '../constants/Fonts';
import { CURRENCY_SYMBOL, Utils } from '../constants/utils';

const rawMaterialService = new RawMaterialService();

const UNIT_OPTIONS = ['Unidad', 'g', 'kg', 'ml', 'L'];

const formatStock = (stock: number) =>
  Number.isInteger(stock) ? String(stock) : stock.toFixed(2);

const formatMoney = (amount: number) =>
  `${CURRENCY_SYMBOL} ${amount.toFixed(2)}`;

const RawMaterialMaintenancePage = () => {
  const activeUser = useSelector((state: any) => state.user.activeUser);
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<RawMaterial[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal crear/editar
  const [formVisible, setFormVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [formName, setFormName] = useState('');
  const [formUnit, setFormUnit] = useState(UNIT_OPTIONS[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formPresets, setFormPresets] = useState<number[]>([]);
  const [presetInput, setPresetInput] = useState('');
  const [pickingImage, setPickingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  // Modal agregar stock
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockTarget, setStockTarget] = useState<RawMaterial | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [stockTotalCost, setStockTotalCost] = useState('');
  const [stockReason, setStockReason] = useState('');
  const [registeringStock, setRegisteringStock] = useState(false);

  // Modal rectificar stock
  const [rectifyModalVisible, setRectifyModalVisible] = useState(false);
  const [rectifyTarget, setRectifyTarget] = useState<RawMaterial | null>(null);
  const [rectifyNewStock, setRectifyNewStock] = useState('');
  const [rectifyReason, setRectifyReason] = useState('');
  const [rectifying, setRectifying] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rawMaterialService.getAll();
      setItems(data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al cargar materia prima' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setFormName('');
    setFormUnit(UNIT_OPTIONS[0]);
    setFormDescription('');
    setFormImage(null);
    setFormPresets([]);
    setPresetInput('');
    setFormVisible(true);
  }, []);

  const openEditModal = useCallback((item: RawMaterial) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormUnit(item.unit);
    setFormDescription(item.description ?? '');
    setFormImage(item.image ?? null);
    setFormPresets(item.reorder_presets ?? []);
    setPresetInput('');
    setFormVisible(true);
  }, []);

  const handleAddPreset = useCallback(() => {
    const value = parseFloat(presetInput.replace(',', '.'));
    if (!value || value <= 0) {
      Toast.show({ type: 'error', text1: 'Ingresa una cantidad válida' });
      return;
    }
    setFormPresets(prev =>
      prev.includes(value) ? prev : [...prev, value].sort((a, b) => a - b),
    );
    setPresetInput('');
  }, [presetInput]);

  const handleRemovePreset = useCallback((value: number) => {
    setFormPresets(prev => prev.filter(v => v !== value));
  }, []);

  const closeFormModal = useCallback(() => {
    setFormVisible(false);
    setEditingItem(null);
  }, []);

  const handlePickImage = useCallback(async () => {
    setPickingImage(true);
    try {
      const picked = await ImageStorageService.pickImage();
      if (picked) {
        const savedPath = await ImageStorageService.saveImage(picked.uri);
        setFormImage(savedPath);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'No se pudo cargar la imagen' });
    } finally {
      setPickingImage(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      Toast.show({ type: 'error', text1: 'El nombre es requerido' });
      return;
    }
    setSaving(true);
    try {
      const data = {
        name: formName.trim(),
        unit: formUnit,
        description: formDescription.trim(),
        image: formImage,
        reorderPresets: formPresets,
      };
      if (editingItem) {
        await rawMaterialService.update(editingItem.raw_material_id, data);
        Toast.show({ type: 'success', text1: 'Materia prima actualizada' });
      } else {
        await rawMaterialService.create(data);
        Toast.show({ type: 'success', text1: 'Materia prima creada' });
      }
      closeFormModal();
      loadItems();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  }, [
    formName,
    formUnit,
    formDescription,
    formImage,
    formPresets,
    editingItem,
    closeFormModal,
    loadItems,
  ]);

  const handleDeactivate = useCallback(
    (item: RawMaterial) => {
      Alert.alert(
        'Desactivar materia prima',
        `¿Deseas desactivar "${item.name}"? Dejará de aparecer para vincularse a productos nuevos, pero su historial se conserva.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              try {
                await rawMaterialService.setActive(item.raw_material_id, false);
                Toast.show({
                  type: 'success',
                  text1: 'Materia prima desactivada',
                });
                loadItems();
              } catch (e) {
                Toast.show({ type: 'error', text1: 'Error al desactivar' });
              }
            },
          },
        ],
      );
    },
    [loadItems],
  );

  const openStockModal = useCallback((item: RawMaterial) => {
    setStockTarget(item);
    setStockQuantity('');
    setStockTotalCost('');
    setStockReason('');
    setStockModalVisible(true);
  }, []);

  const closeStockModal = useCallback(() => {
    setStockModalVisible(false);
    setStockTarget(null);
  }, []);

  const handleRegisterStock = useCallback(async () => {
    if (!stockTarget) {
      return;
    }
    const quantity = parseFloat(stockQuantity.replace(',', '.'));
    if (!quantity || quantity <= 0) {
      Toast.show({ type: 'error', text1: 'Ingresa una cantidad válida' });
      return;
    }
    const totalCost = parseFloat(stockTotalCost.replace(',', '.'));
    const unitCost =
      !isNaN(totalCost) && totalCost > 0 ? totalCost / quantity : null;

    setRegisteringStock(true);
    try {
      await rawMaterialService.registerMovement(
        stockTarget.raw_material_id,
        quantity,
        stockReason.trim() || 'Compra',
        activeUser?.user_id ?? null,
        unitCost,
      );
      Toast.show({
        type: 'success',
        text1: `Se agregaron ${formatStock(quantity)} ${stockTarget.unit}`,
      });
      closeStockModal();
      loadItems();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al registrar la entrada' });
    } finally {
      setRegisteringStock(false);
    }
  }, [
    stockTarget,
    stockQuantity,
    stockTotalCost,
    stockReason,
    activeUser,
    closeStockModal,
    loadItems,
  ]);

  const openRectifyModal = useCallback((item: RawMaterial) => {
    setRectifyTarget(item);
    setRectifyNewStock(formatStock(item.stock));
    setRectifyReason('');
    setRectifyModalVisible(true);
  }, []);

  const closeRectifyModal = useCallback(() => {
    setRectifyModalVisible(false);
    setRectifyTarget(null);
  }, []);

  const handleRectifyStock = useCallback(async () => {
    if (!rectifyTarget) {
      return;
    }
    const actualStock = parseFloat(rectifyNewStock.replace(',', '.'));
    if (isNaN(actualStock) || actualStock < 0) {
      Toast.show({ type: 'error', text1: 'Ingresa una cantidad válida' });
      return;
    }
    if (!rectifyReason.trim()) {
      Toast.show({ type: 'error', text1: 'El motivo es requerido' });
      return;
    }
    const delta = actualStock - rectifyTarget.stock;
    if (delta === 0) {
      Toast.show({ type: 'error', text1: 'No hay diferencia que registrar' });
      return;
    }
    setRectifying(true);
    try {
      await rawMaterialService.rectifyStock(
        rectifyTarget.raw_material_id,
        actualStock,
        rectifyReason.trim(),
        activeUser?.user_id ?? null,
      );
      Toast.show({
        type: 'success',
        text1: `Stock corregido: ${delta > 0 ? '+' : ''}${formatStock(delta)} ${
          rectifyTarget.unit
        }`,
      });
      closeRectifyModal();
      loadItems();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al rectificar el stock' });
    } finally {
      setRectifying(false);
    }
  }, [
    rectifyTarget,
    rectifyNewStock,
    rectifyReason,
    activeUser,
    closeRectifyModal,
    loadItems,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: RawMaterial }) => (
      <View style={[styles.card, !item.active && styles.cardInactive]}>
        {item.image ? (
          <Image
            source={{ uri: ImageStorageService.getImageUri(item.image) }}
            style={styles.cardImage}
          />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Icon name="package-variant" size={26} color="#B2F1E0" />
          </View>
        )}
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cardStock}>
            {formatStock(item.stock)} {item.unit}
          </Text>
          {item.avg_cost > 0 && (
            <Text style={styles.cardCost}>
              {formatMoney(item.avg_cost)}/{item.unit} · Valor:{' '}
              {formatMoney(item.stock * item.avg_cost)}
            </Text>
          )}
          {!!item.description && (
            <Text style={styles.cardDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.stockButton]}
            onPress={() => openStockModal(item)}>
            <Icon name="plus" size={20} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openRectifyModal(item)}>
            <Icon name="scale-balance" size={20} color="#F59E0B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openEditModal(item)}>
            <Icon name="pencil-outline" size={20} color="#636E72" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeactivate(item)}>
            <Icon name="trash-can-outline" size={20} color="#E17055" />
          </TouchableOpacity>
        </View>
      </View>
    ),
    [openStockModal, openRectifyModal, openEditModal, handleDeactivate],
  );

  const keyExtractor = useCallback(
    (item: RawMaterial) => String(item.raw_material_id),
    [],
  );

  const totalInventoryValue = items.reduce(
    (sum, item) => sum + item.stock * item.avg_cost,
    0,
  );

  const ListEmpty = useCallback(
    () =>
      loading ? null : (
        <View style={styles.emptyContainer}>
          <Icon name="package-variant-closed" size={60} color="#DFE6E9" />
          <Text style={styles.emptyText}>No hay materia prima registrada</Text>
          <Text style={styles.emptySubText}>
            Presiona "+" para agregar tu primer insumo
          </Text>
        </View>
      ),
    [loading],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00B894', '#00CEC9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() =>
            navigation.navigate(Utils.screens.MATERIA_PRIMA_HISTORIAL)
          }>
          <Icon name="history" size={22} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Icon name="package-variant" size={28} color="#FFF" />
          <Text style={styles.headerTitle}>Materia Prima</Text>
          <Text style={styles.headerSubtitle}>
            {items.length} insumo{items.length !== 1 ? 's' : ''}
          </Text>
          {totalInventoryValue > 0 && (
            <Text style={styles.headerValue}>
              Valor en inventario: {formatMoney(totalInventoryValue)}
            </Text>
          )}
        </View>
      </LinearGradient>

      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={openCreateModal}>
        <Icon name="plus" size={28} color="#FFF" />
      </Pressable>

      {/* Modal crear/editar */}
      <Modal
        visible={formVisible}
        transparent
        animationType="slide"
        onRequestClose={closeFormModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={['#00B894', '#00CEC9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingItem ? 'Editar materia prima' : 'Nueva materia prima'}
              </Text>
              <Pressable onPress={closeFormModal} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            <ScrollView
              style={styles.modalBodyScroll}
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Fotografía</Text>
              <Pressable
                style={styles.imagePickerBtn}
                onPress={handlePickImage}
                disabled={pickingImage}>
                {formImage ? (
                  <Image
                    source={{ uri: ImageStorageService.getImageUri(formImage) }}
                    style={styles.imagePickerPreview}
                  />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Icon
                      name="camera-plus-outline"
                      size={30}
                      color="#00B894"
                    />
                  </View>
                )}
                <View style={styles.imagePickerInfo}>
                  <Text style={styles.imagePickerLabel}>
                    {formImage ? 'Cambiar foto' : 'Agregar foto'}
                  </Text>
                  <Text style={styles.imagePickerSub}>Opcional</Text>
                </View>
                <Icon name="chevron-right" size={18} color="#B2BEC3" />
              </Pressable>

              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Ej: Cono, Vaso 8oz, Leche..."
                placeholderTextColor="#B2BEC3"
                maxLength={50}
              />

              <Text style={styles.label}>Unidad de medida</Text>
              <View style={styles.unitRow}>
                {UNIT_OPTIONS.map(unit => (
                  <Pressable
                    key={unit}
                    style={[
                      styles.unitChip,
                      formUnit === unit && styles.unitChipActive,
                    ]}
                    onPress={() => setFormUnit(unit)}>
                    <Text
                      style={[
                        styles.unitChipText,
                        formUnit === unit && styles.unitChipTextActive,
                      ]}>
                      {unit}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Cantidades típicas de compra</Text>
              <Text style={styles.helperText}>
                Para seleccionarlas rápido al reabastecer, ej. si siempre
                compras bolsas de 25
              </Text>
              {formPresets.length > 0 && (
                <View style={styles.unitRow}>
                  {formPresets.map(value => (
                    <View key={value} style={styles.presetChip}>
                      <Text style={styles.presetChipText}>
                        {formatStock(value)} {formUnit}
                      </Text>
                      <Pressable
                        onPress={() => handleRemovePreset(value)}
                        hitSlop={8}>
                        <Icon name="close" size={16} color="#FFF" />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              <View style={styles.presetAddRow}>
                <TextInput
                  style={[styles.input, styles.presetInput]}
                  value={presetInput}
                  onChangeText={setPresetInput}
                  placeholder="Ej: 25"
                  placeholderTextColor="#B2BEC3"
                  keyboardType="decimal-pad"
                  onSubmitEditing={handleAddPreset}
                />
                <Pressable
                  style={styles.presetAddBtn}
                  onPress={handleAddPreset}>
                  <Icon name="plus" size={22} color="#FFF" />
                </Pressable>
              </View>

              <Text style={styles.label}>¿Para qué se usa?</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={formDescription}
                onChangeText={setFormDescription}
                placeholder="Ej: Se usa para servir helados de 1 y 2 bolas"
                placeholderTextColor="#B2BEC3"
                multiline
                numberOfLines={3}
                maxLength={150}
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={closeFormModal}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    pressed && styles.saveBtnPressed,
                  ]}
                  onPress={handleSave}
                  disabled={saving}>
                  <LinearGradient
                    colors={['#00B894', '#00CEC9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}>
                    <Text style={styles.saveBtnText}>
                      {saving ? 'Guardando...' : 'Guardar'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal agregar stock */}
      <Modal
        visible={stockModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeStockModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={['#00B894', '#00CEC9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Agregar stock{stockTarget ? `: ${stockTarget.name}` : ''}
              </Text>
              <Pressable onPress={closeStockModal} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            <ScrollView
              style={styles.modalBodyScroll}
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {stockTarget && (
                <Text style={styles.currentStockText}>
                  Stock actual: {formatStock(stockTarget.stock)}{' '}
                  {stockTarget.unit}
                  {stockTarget.avg_cost > 0 &&
                    ` · Costo: ${formatMoney(stockTarget.avg_cost)}/${
                      stockTarget.unit
                    }`}
                </Text>
              )}

              {!!stockTarget?.reorder_presets.length && (
                <>
                  <Text style={styles.label}>Compra rápida</Text>
                  <View style={styles.unitRow}>
                    {stockTarget.reorder_presets.map(value => {
                      const selected =
                        parseFloat(stockQuantity.replace(',', '.')) === value;
                      return (
                        <Pressable
                          key={value}
                          style={[
                            styles.unitChip,
                            selected && styles.unitChipActive,
                          ]}
                          onPress={() => setStockQuantity(String(value))}>
                          <Text
                            style={[
                              styles.unitChipText,
                              selected && styles.unitChipTextActive,
                            ]}>
                            {formatStock(value)} {stockTarget.unit}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={styles.label}>
                Cantidad comprada ({stockTarget?.unit}) *
              </Text>
              <TextInput
                style={styles.input}
                value={stockQuantity}
                onChangeText={setStockQuantity}
                placeholder="Ej: 25"
                placeholderTextColor="#B2BEC3"
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Costo total pagado</Text>
              <TextInput
                style={styles.input}
                value={stockTotalCost}
                onChangeText={setStockTotalCost}
                placeholder="Ej: 50.00 (opcional)"
                placeholderTextColor="#B2BEC3"
                keyboardType="decimal-pad"
              />
              {(() => {
                const qty = parseFloat(stockQuantity.replace(',', '.'));
                const total = parseFloat(stockTotalCost.replace(',', '.'));
                if (qty > 0 && total > 0) {
                  return (
                    <Text style={styles.unitCostPreview}>
                      Costo unitario: {formatMoney(total / qty)}/
                      {stockTarget?.unit}
                    </Text>
                  );
                }
                return null;
              })()}

              <Text style={styles.label}>Motivo</Text>
              <TextInput
                style={styles.input}
                value={stockReason}
                onChangeText={setStockReason}
                placeholder="Ej: Compra bolsa de 25 conos"
                placeholderTextColor="#B2BEC3"
                maxLength={100}
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={closeStockModal}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    pressed && styles.saveBtnPressed,
                  ]}
                  onPress={handleRegisterStock}
                  disabled={registeringStock}>
                  <LinearGradient
                    colors={['#00B894', '#00CEC9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}>
                    <Text style={styles.saveBtnText}>
                      {registeringStock ? 'Guardando...' : 'Agregar'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal rectificar stock */}
      <Modal
        visible={rectifyModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeRectifyModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={['#F59E0B', '#FBBF24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Rectificar stock{rectifyTarget ? `: ${rectifyTarget.name}` : ''}
              </Text>
              <Pressable onPress={closeRectifyModal} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            <ScrollView
              style={styles.modalBodyScroll}
              contentContainerStyle={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {rectifyTarget && (
                <Text style={styles.rectifyCurrentText}>
                  Stock en sistema: {formatStock(rectifyTarget.stock)}{' '}
                  {rectifyTarget.unit}
                </Text>
              )}

              <Text style={styles.label}>
                Stock real (conteo físico) ({rectifyTarget?.unit}) *
              </Text>
              <TextInput
                style={styles.input}
                value={rectifyNewStock}
                onChangeText={setRectifyNewStock}
                placeholder="Ej: 18"
                placeholderTextColor="#B2BEC3"
                keyboardType="decimal-pad"
              />

              {(() => {
                if (!rectifyTarget) {
                  return null;
                }
                const actual = parseFloat(rectifyNewStock.replace(',', '.'));
                if (isNaN(actual)) {
                  return null;
                }
                const delta = actual - rectifyTarget.stock;
                if (delta === 0) {
                  return null;
                }
                return (
                  <Text
                    style={[
                      styles.rectifyDeltaPreview,
                      { color: delta > 0 ? '#00B894' : '#E17055' },
                    ]}>
                    Diferencia: {delta > 0 ? '+' : ''}
                    {formatStock(delta)} {rectifyTarget.unit}
                  </Text>
                );
              })()}

              <Text style={styles.label}>Motivo *</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={rectifyReason}
                onChangeText={setRectifyReason}
                placeholder="Ej: 2 conos rotos, producto dañado, diferencia de conteo..."
                placeholderTextColor="#B2BEC3"
                multiline
                numberOfLines={3}
                maxLength={150}
              />

              <Text style={styles.helperText}>
                Se registrará hoy, {new Date().toLocaleDateString('es-GT')}
              </Text>

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={closeRectifyModal}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.saveBtn,
                    pressed && styles.saveBtnPressed,
                  ]}
                  onPress={handleRectifyStock}
                  disabled={rectifying}>
                  <LinearGradient
                    colors={['#F59E0B', '#FBBF24']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}>
                    <Text style={styles.saveBtnText}>
                      {rectifying ? 'Guardando...' : 'Rectificar'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default RawMaterialMaintenancePage;

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
    position: 'relative',
  },
  historyButton: {
    position: 'absolute',
    top: 20,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
  headerValue: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardInactive: {
    opacity: 0.5,
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#F1FFF9',
  },
  cardImagePlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    marginRight: 12,
    backgroundColor: '#F1FFF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  cardStock: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#00B894',
    marginTop: 2,
  },
  cardCost: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    marginTop: 2,
  },
  cardDescription: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockButton: {
    backgroundColor: '#00B894',
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
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#00B894',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabPressed: {
    backgroundColor: '#00A383',
    transform: [{ scale: 0.95 }],
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
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    flex: 1,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#FFF',
    marginRight: 12,
  },
  modalBodyScroll: {
    flexShrink: 1,
  },
  modalBody: {
    padding: 20,
    gap: 6,
  },
  helperText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small - 1,
    color: '#B2BEC3',
    marginBottom: 6,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#00B894',
  },
  presetChipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#FFF',
  },
  presetAddRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  presetInput: {
    flex: 1,
  },
  presetAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DFE6E9',
    marginBottom: 6,
  },
  imagePickerPreview: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1FFF9',
  },
  imagePickerPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F1FFF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerInfo: {
    flex: 1,
  },
  imagePickerLabel: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  imagePickerSub: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    marginTop: 2,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
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
    backgroundColor: '#F1FFF9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#B2F1E0',
  },
  unitRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DFE6E9',
  },
  unitChipActive: {
    backgroundColor: '#00B894',
    borderColor: '#00B894',
  },
  unitChipText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#636E72',
  },
  unitChipTextActive: {
    color: '#FFF',
  },
  currentStockText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#00B894',
    marginBottom: 10,
  },
  unitCostPreview: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    color: '#00B894',
    marginTop: 4,
  },
  rectifyCurrentText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#F59E0B',
    marginBottom: 10,
  },
  rectifyDeltaPreview: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.small,
    marginTop: 4,
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
