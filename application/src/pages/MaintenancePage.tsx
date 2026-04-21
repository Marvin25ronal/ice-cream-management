import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import React, { useState } from 'react';
import { CreateBackup, RestoreBackup } from '../store/db/Database';
import { useSelector } from 'react-redux';
import { RootState } from '../store/redux/store';
import { Fonts, FontsSize } from '../constants/Fonts';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { migrationService } from '../database/MigrationService';
import { allMigrations } from '../migrations';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

interface ActionCardProps {
  icon: string;
  title: string;
  description: string;
  gradientColors: string[];
  onPress: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  badge?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  title,
  description,
  gradientColors,
  onPress,
  disabled = false,
  isProcessing = false,
  badge,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isProcessing}
      activeOpacity={0.8}
      style={[styles.cardTouchable, (disabled || isProcessing) && styles.cardDisabled]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}>
        <View style={styles.cardContent}>
          {/* Icon Section */}
          <View style={styles.cardIconContainer}>
            <View style={styles.iconCircle}>
              <Icon name={icon} size={32} color="#FFFFFF" />
            </View>
          </View>

          {/* Text Section */}
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>

            {/* Badge for processing state */}
            {isProcessing && (
              <View style={styles.processingBadge}>
                <Icon name="hourglass-empty" size={14} color="#FFFFFF" />
                <Text style={styles.processingText}>Procesando...</Text>
              </View>
            )}

            {/* Badge for selected file */}
            {badge && !isProcessing && (
              <View style={styles.successBadge}>
                <Icon name="check-circle" size={14} color="#FFFFFF" />
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>

          {/* Arrow Icon */}
          <View style={styles.cardArrow}>
            <Icon
              name="arrow-forward-ios"
              size={20}
              color="rgba(255, 255, 255, 0.8)"
            />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

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

  const handleRunMigrations = async () => {
    Alert.alert(
      'Ejecutar Migraciones',
      `Se ejecutarán ${allMigrations.length} migraciones disponibles.\n\n¿Deseas continuar?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Ejecutar',
          onPress: async () => {
            setIsProcessing(true);
            try {
              const result = await migrationService.runMigrations(allMigrations);

              if (result.success) {
                Alert.alert(
                  'Migraciones Completadas',
                  `Se ejecutaron ${result.executed} migración(es) exitosamente.${
                    result.executed === 0
                      ? '\n\nNo había migraciones pendientes.'
                      : '\n\nLos cambios se han aplicado a la base de datos.'
                  }`,
                  [{ text: 'OK' }],
                );
              } else {
                Alert.alert(
                  'Error en Migraciones',
                  `Se ejecutaron ${result.executed} migración(es) antes del error.\n\nErrores:\n${result.errors.join('\n')}`,
                  [{ text: 'OK' }],
                );
              }
            } catch (error: any) {
              Alert.alert(
                'Error',
                `No se pudieron ejecutar las migraciones: ${error.message}`,
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

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>

      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerIconContainer}>
          <Icon name="settings" size={40} color={theme.HEADER_COLOR} />
        </View>
        <Text style={styles.headerTitle}>Gestión de Base de Datos</Text>
        <Text style={styles.headerSubtitle}>
          Administra migraciones y copias de seguridad
        </Text>
      </View>

      {/* Migrations Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="sync" size={24} color="#7209B7" />
          <Text style={styles.sectionTitle}>Migraciones</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Actualiza el esquema de la base de datos con las últimas mejoras
        </Text>

        <ActionCard
          icon="sync"
          title="Ejecutar Migraciones"
          description={`${allMigrations.length} migraciones disponibles`}
          gradientColors={['#7209B7', '#9C27B0', '#B185DB']}
          onPress={handleRunMigrations}
          isProcessing={isProcessing}
        />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Backup Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="backup" size={24} color="#06D6A0" />
          <Text style={styles.sectionTitle}>Copias de Seguridad</Text>
        </View>
        <Text style={styles.sectionDescription}>
          Protege tus datos creando y restaurando backups
        </Text>

        {/* Create Backup */}
        <ActionCard
          icon="save-alt"
          title="Crear Backup"
          description="Guarda una copia completa de tu base de datos"
          gradientColors={['#06D6A0', '#38b000', '#52B788']}
          onPress={handleCreateBackup}
          isProcessing={isProcessing}
        />

        {/* Select File */}
        <ActionCard
          icon="folder-open"
          title="Seleccionar Archivo"
          description="Elige un archivo .db para restaurar"
          gradientColors={['#00B4D8', '#2196F3', '#90E0EF']}
          onPress={handleSelectFile}
          disabled={isProcessing}
          badge={selectedFile ? selectedFile.split('/').pop() || '' : undefined}
        />

        {/* Restore Backup */}
        <ActionCard
          icon="restore"
          title="Restaurar Backup"
          description="Reemplaza la base de datos actual con el backup seleccionado"
          gradientColors={['#EF476F', '#DC3545', '#FF6D8F']}
          onPress={handleRestoreBackup}
          disabled={!selectedFile}
          isProcessing={isProcessing}
        />
      </View>

      {/* Warning Notice */}
      <View style={styles.warningContainer}>
        <Icon name="info" size={20} color="#FF8500" />
        <Text style={styles.warningText}>
          Importante: La restauración creará un backup automático antes de proceder.
          Reinicia la aplicación después de restaurar.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: isTablet ? 40 : 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },

  // Header Styles
  header: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 8,
  },
  headerIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontSize: isTablet ? 32 : 28,
    fontFamily: Fonts.LatoBold,
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: isTablet ? 18 : 16,
    fontFamily: Fonts.LatoRegular,
    color: '#6C757D',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: isTablet ? 24 : 22,
    fontFamily: Fonts.LatoBold,
    color: '#212529',
    marginLeft: 12,
  },
  sectionDescription: {
    fontSize: isTablet ? 16 : 14,
    fontFamily: Fonts.LatoRegular,
    color: '#6C757D',
    marginBottom: 20,
    lineHeight: 22,
    paddingLeft: 36,
  },

  // Action Card Styles
  cardTouchable: {
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: isTablet ? 100 : 88,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isTablet ? 24 : 20,
  },
  cardIconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: isTablet ? 60 : 52,
    height: isTablet ? 60 : 52,
    borderRadius: isTablet ? 30 : 26,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: isTablet ? 20 : 18,
    fontFamily: Fonts.LatoBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: isTablet ? 15 : 13,
    fontFamily: Fonts.LatoRegular,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  cardArrow: {
    marginLeft: 12,
    opacity: 0.8,
  },

  // Badge Styles
  processingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  processingText: {
    fontSize: 12,
    fontFamily: Fonts.LatoRegular,
    color: '#FFFFFF',
    marginLeft: 6,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: Fonts.LatoRegular,
    color: '#FFFFFF',
    marginLeft: 6,
    flexShrink: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#DEE2E6',
    marginVertical: 32,
    marginHorizontal: isTablet ? 40 : 0,
  },

  // Warning Notice
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8500',
  },
  warningText: {
    flex: 1,
    fontSize: isTablet ? 15 : 13,
    fontFamily: Fonts.LatoRegular,
    color: '#856404',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default MaintenancePage;
