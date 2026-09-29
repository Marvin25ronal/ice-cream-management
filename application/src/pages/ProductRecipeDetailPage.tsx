import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Toast from 'react-native-toast-message';
import { RawMaterial } from '../entity/RawMaterial.entity';
import { RawMaterialService } from '../services/RawMaterialService';
import { ProductRawMaterialService } from '../services/ProductRawMaterialService';
import { Fonts, FontsSize } from '../constants/Fonts';

const rawMaterialService = new RawMaterialService();
const productRawMaterialService = new ProductRawMaterialService();

interface RecipeRow {
  raw_material_id: number;
  name: string;
  unit: string;
  quantity: number;
}

const ProductRecipeDetailPage = ({ route }: { route: any }) => {
  const { productId, productName } = route.params || {};

  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [rows, setRows] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedRawMaterialId, setSelectedRawMaterialId] = useState<
    number | null
  >(null);
  const [quantityInput, setQuantityInput] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [materials, configs] = await Promise.all([
        rawMaterialService.getActive(),
        productRawMaterialService.getForProduct(productId),
      ]);
      setRawMaterials(materials);
      setRows(
        configs.map(c => ({
          raw_material_id: c.raw_material_id,
          name: c.raw_material_name,
          unit: c.raw_material_unit,
          quantity: c.quantity,
        })),
      );
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al cargar la receta' });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const availableMaterials = rawMaterials.filter(
    m => !rows.some(r => r.raw_material_id === m.raw_material_id),
  );

  useEffect(() => {
    if (selectedRawMaterialId == null && availableMaterials.length > 0) {
      setSelectedRawMaterialId(availableMaterials[0].raw_material_id);
    }
    if (
      selectedRawMaterialId != null &&
      !availableMaterials.some(m => m.raw_material_id === selectedRawMaterialId)
    ) {
      setSelectedRawMaterialId(
        availableMaterials.length > 0
          ? availableMaterials[0].raw_material_id
          : null,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableMaterials.length]);

  const handleAddRow = useCallback(() => {
    const quantity = parseFloat(quantityInput.replace(',', '.'));
    if (!selectedRawMaterialId) {
      Toast.show({ type: 'error', text1: 'Selecciona un insumo' });
      return;
    }
    if (!quantity || quantity <= 0) {
      Toast.show({ type: 'error', text1: 'Ingresa una cantidad válida' });
      return;
    }
    const material = rawMaterials.find(
      m => m.raw_material_id === selectedRawMaterialId,
    );
    if (!material) {
      return;
    }
    setRows(prev => [
      ...prev,
      {
        raw_material_id: material.raw_material_id,
        name: material.name,
        unit: material.unit,
        quantity,
      },
    ]);
    setQuantityInput('');
  }, [quantityInput, selectedRawMaterialId, rawMaterials]);

  const handleRemoveRow = useCallback((rawMaterialId: number) => {
    setRows(prev => prev.filter(r => r.raw_material_id !== rawMaterialId));
  }, []);

  const handleQuantityChange = useCallback(
    (rawMaterialId: number, text: string) => {
      const quantity = parseFloat(text.replace(',', '.'));
      setRows(prev =>
        prev.map(r =>
          r.raw_material_id === rawMaterialId
            ? { ...r, quantity: isNaN(quantity) ? 0 : quantity }
            : r,
        ),
      );
    },
    [],
  );

  const handleSaveRecipe = useCallback(async () => {
    const invalid = rows.some(r => !r.quantity || r.quantity <= 0);
    if (invalid) {
      Toast.show({
        type: 'error',
        text1: 'Todas las cantidades deben ser mayores a 0',
      });
      return;
    }
    setSaving(true);
    try {
      await productRawMaterialService.setForProduct(
        productId,
        rows.map(r => ({
          raw_material_id: r.raw_material_id,
          quantity: r.quantity,
        })),
      );
      Toast.show({ type: 'success', text1: 'Receta guardada' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al guardar la receta' });
    } finally {
      setSaving(false);
    }
  }, [rows, productId]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#00B894', '#00CEC9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="package-variant" size={28} color="#FFF" />
          <Text style={styles.headerTitle} numberOfLines={1}>
            {productName ?? 'Producto'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Materia prima que consume por unidad vendida
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {!loading && rows.length === 0 && (
          <Text style={styles.emptyText}>
            Este producto no descuenta materia prima todavía
          </Text>
        )}

        {rows.map(row => (
          <View key={row.raw_material_id} style={styles.row}>
            <Text style={styles.rowName} numberOfLines={1}>
              {row.name}
            </Text>
            <TextInput
              style={styles.rowQuantityInput}
              value={String(row.quantity)}
              onChangeText={text =>
                handleQuantityChange(row.raw_material_id, text)
              }
              keyboardType="decimal-pad"
            />
            <Text style={styles.rowUnit}>{row.unit}</Text>
            <TouchableOpacity
              onPress={() => handleRemoveRow(row.raw_material_id)}
              hitSlop={8}>
              <Icon name="close-circle" size={24} color="#E17055" />
            </TouchableOpacity>
          </View>
        ))}

        {availableMaterials.length > 0 ? (
          <View style={styles.addRow}>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedRawMaterialId}
                onValueChange={value => setSelectedRawMaterialId(value)}
                style={styles.picker}>
                {availableMaterials.map(material => (
                  <Picker.Item
                    key={material.raw_material_id}
                    label={material.name}
                    value={material.raw_material_id}
                  />
                ))}
              </Picker>
            </View>
            <TextInput
              style={styles.addQuantityInput}
              value={quantityInput}
              onChangeText={setQuantityInput}
              placeholder="Cant."
              placeholderTextColor="#B2BEC3"
              keyboardType="decimal-pad"
            />
            <Pressable style={styles.addBtn} onPress={handleAddRow}>
              <Icon name="plus" size={22} color="#FFF" />
            </Pressable>
          </View>
        ) : (
          !loading &&
          rawMaterials.length === 0 && (
            <Text style={styles.emptyText}>
              No hay materia prima registrada todavía. Créala primero en el
              mantenimiento de Materia Prima.
            </Text>
          )
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSaveRecipe}
          disabled={saving}
          activeOpacity={0.85}>
          <Icon name="content-save-outline" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>
            {saving ? 'Guardando...' : 'Guardar receta'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductRecipeDetailPage;

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
    fontSize: FontsSize.small,
    color: 'rgba(255,255,255,0.85)',
  },
  body: {
    padding: 16,
  },
  emptyText: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    marginBottom: 12,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  rowName: {
    flex: 1,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  rowQuantityInput: {
    width: 64,
    textAlign: 'center',
    backgroundColor: '#F1FFF9',
    borderRadius: 10,
    paddingVertical: 8,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#00B894',
  },
  rowUnit: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    minWidth: 30,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 16,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B2F1E0',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  addQuantityInput: {
    width: 72,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B2F1E0',
    paddingVertical: 12,
    textAlign: 'center',
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#00B894',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00B894',
    borderRadius: 14,
    paddingVertical: 14,
  },
  saveBtnText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
});
