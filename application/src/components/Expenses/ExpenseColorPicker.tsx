import React, {memo, useCallback, useState} from 'react';
import {Modal, Pressable, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import ColorPicker, {
  Panel1,
  HueSlider,
  PreviewText,
  ColorFormatsObject,
} from 'reanimated-color-picker';
import {Fonts, FontsSize} from '../../constants/Fonts';

interface Props {
  visible: boolean;
  currentColor: string;
  onSelect: (color: string) => void;
  onClose: () => void;
}

const ExpenseColorPicker = memo(
  ({visible, currentColor, onSelect, onClose}: Props) => {
    const [previewColor, setPreviewColor] = useState(currentColor);

    const handleChange = useCallback((colors: ColorFormatsObject) => {
      setPreviewColor(colors.hex);
    }, []);

    const handleConfirm = useCallback(() => {
      onSelect(previewColor);
      onClose();
    }, [previewColor, onSelect, onClose]);

    const handleClose = useCallback(() => {
      setPreviewColor(currentColor);
      onClose();
    }, [currentColor, onClose]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            {/* Header — cambia de color en tiempo real */}
            <View style={[styles.header, {backgroundColor: previewColor}]}>
              <View style={styles.headerLeft}>
                <Icon name="palette" size={22} color="#FFF" />
                <Text style={styles.headerTitle}>Elige un color</Text>
              </View>
              <Pressable onPress={handleClose} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </View>

            <View style={styles.body}>
              <ColorPicker
                style={styles.picker}
                value={currentColor}
                onChangeJS={handleChange}>
                {/* Cuadro HSB de selección libre */}
                <Panel1 style={styles.panel} />

                {/* Slider de tono */}
                <View style={styles.sliderRow}>
                  <Icon name="palette-outline" size={18} color="#636E72" />
                  <HueSlider style={styles.slider} />
                </View>

                {/* Preview del hex */}
                <View style={styles.hexRow}>
                  <View
                    style={[styles.colorSwatch, {backgroundColor: previewColor}]}
                  />
                  <PreviewText style={styles.hexText} colorFormat="hex" />
                </View>
              </ColorPicker>

              {/* Botones */}
              <View style={styles.actions}>
                <Pressable style={styles.cancelBtn} onPress={handleClose}>
                  <Text style={styles.cancelBtnText}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.confirmBtn, {backgroundColor: previewColor}]}
                  onPress={handleConfirm}>
                  <Icon name="check" size={18} color="#FFF" />
                  <Text style={styles.confirmText}>Aplicar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

ExpenseColorPicker.displayName = 'ExpenseColorPicker';

export default ExpenseColorPicker;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.large,
    color: '#FFF',
  },
  body: {
    padding: 20,
    paddingBottom: 28,
  },
  picker: {
    gap: 16,
  },
  panel: {
    width: '100%',
    height: 200,
    borderRadius: 14,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  slider: {
    flex: 1,
    height: 30,
    borderRadius: 10,
  },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  hexText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
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
  confirmBtn: {
    flex: 2,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  confirmText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#FFF',
  },
});
