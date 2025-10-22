import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { CreateBackup, RestoreBackup } from '../store/db/Database';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { Fonts, FontsSize } from '../constants/Fonts';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MaintenancePage = () => {
  const theme = useSelector((state: RootState) => state.theme.value);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreateBackup = async () => {
    setIsProcessing(true);
    try {
      const path = await CreateBackup();
      Alert.alert(
        'Backup creado',
        `El backup se guardó exitosamente en:\n${path}`,
        [{ text: 'OK' }],
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear el backup');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });

      if (result && result[0]) {
        const file = result[0];
        // Verificar que sea un archivo .db
        if (file.name && file.name.endsWith('.db')) {
          // Usar fileCopyUri que es la ruta local copiada
          const filePath = file.fileCopyUri?.replace('file://', '') || '';
          setSelectedFile(filePath);
          Alert.alert(
            'Archivo seleccionado',
            `Archivo: ${file.name}\n\nAhora presiona "Restaurar Backup" para aplicar los cambios.`,
          );
        } else {
          Alert.alert(
            'Archivo inválido',
            'Por favor selecciona un archivo .db válido',
          );
        }
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {
        console.log('Selección cancelada');
      } else {
        Alert.alert('Error', 'No se pudo seleccionar el archivo');
        console.error(error);
      }
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedFile) {
      Alert.alert(
        'Sin archivo',
        'Por favor selecciona primero un archivo de backup',
      );
      return;
    }

    Alert.alert(
      'Confirmar restauración',
      '¿Estás seguro de que deseas restaurar este backup? Se creará un respaldo automático de la base de datos actual antes de continuar.\n\nLa aplicación debe cerrarse después de la restauración.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Restaurar',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await RestoreBackup(selectedFile);
              Alert.alert(
                'Backup restaurado',
                'La base de datos ha sido restaurada exitosamente. Por favor, cierra y vuelve a abrir la aplicación para ver los cambios.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setSelectedFile(null);
                    },
                  },
                ],
              );
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo restaurar el backup. La base de datos actual se mantuvo intacta.',
              );
              console.error(error);
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ],
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    text: {
      color: theme.LABEL_FORM_COLOR,
      fontSize: FontsSize.x2xl,
      fontFamily: Fonts.LatoBold,
    },
    card: {
      backgroundColor: theme.CARD_BACKGROUND_COLOR,
      borderRadius: 10,
      width: 'auto',
      padding: 30,
      marginVertical: 10,
      minWidth: 250,
      borderWidth: 5,
      borderColor: 'white',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardText: {
      color: 'white',
      fontSize: FontsSize.large,
      fontFamily: Fonts.LatoBold,
      marginLeft: 10,
    },
    selectedFileText: {
      color: theme.TEXT_COLOR,
      fontSize: FontsSize.medium,
      fontFamily: Fonts.LatoRegular,
      marginTop: 10,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    title: {
      color: theme.TEXT_COLOR,
      fontSize: FontsSize.x2xl,
      fontFamily: Fonts.LatoBold,
      marginBottom: 30,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Base de Datos</Text>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.EDIT_BUTTON_COLOR },
          isProcessing && { opacity: 0.5 },
        ]}
        onPress={handleCreateBackup}
        disabled={isProcessing}>
        <Icon name="save" size={24} color="white" />
        <Text style={styles.cardText}>
          {isProcessing ? 'Procesando...' : 'Hacer Backup'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: '#2196F3' },
          isProcessing && { opacity: 0.5 },
        ]}
        onPress={handleSelectFile}
        disabled={isProcessing}>
        <Icon name="folder-open" size={24} color="white" />
        <Text style={styles.cardText}>Seleccionar Archivo</Text>
      </TouchableOpacity>

      {selectedFile && (
        <Text style={styles.selectedFileText} numberOfLines={2}>
          Archivo: {selectedFile.split('/').pop()}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: '#DC3545' },
          (!selectedFile || isProcessing) && { opacity: 0.5 },
        ]}
        onPress={handleRestoreBackup}
        disabled={!selectedFile || isProcessing}>
        <Icon name="restore" size={24} color="white" />
        <Text style={styles.cardText}>
          {isProcessing ? 'Procesando...' : 'Restaurar Backup'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MaintenancePage;
