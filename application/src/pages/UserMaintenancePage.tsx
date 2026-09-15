import React, { useCallback, useEffect, useState } from 'react';
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
import Toast from 'react-native-toast-message';
import { User } from '../entity/User.entity';
import { UserService } from '../services/UserService';
import { Fonts, FontsSize } from '../constants/Fonts';

const userService = new UserService();

const UserListItem = ({
  item,
  onEdit,
  onToggleActive,
  onDelete,
}: {
  item: User;
  onEdit: (u: User) => void;
  onToggleActive: (u: User) => void;
  onDelete: (u: User) => void;
}) => (
  <View style={[styles.item, !item.active && styles.itemInactive]}>
    <View style={styles.itemIconBadge}>
      <Icon name="account-circle" size={30} color="#6C5CE7" />
    </View>
    <View style={styles.itemInfo}>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemStatus}>
        {item.active ? 'Activo' : 'Desactivado'}
      </Text>
    </View>
    <Pressable
      style={styles.itemAction}
      onPress={() => onEdit(item)}
      hitSlop={8}>
      <Icon name="pencil-outline" size={20} color="#636E72" />
    </Pressable>
    <Pressable
      style={styles.itemAction}
      onPress={() => onToggleActive(item)}
      hitSlop={8}>
      <Icon
        name={item.active ? 'account-off-outline' : 'account-check-outline'}
        size={20}
        color={item.active ? '#E74C3C' : '#27AE60'}
      />
    </Pressable>
    <Pressable
      style={styles.itemAction}
      onPress={() => onDelete(item)}
      hitSlop={8}>
      <Icon name="trash-can-outline" size={20} color="#E74C3C" />
    </Pressable>
  </View>
);

const UserMaintenancePage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al cargar usuarios' });
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreateModal = useCallback(() => {
    setEditingUser(null);
    setFormName('');
    setModalVisible(true);
  }, []);

  const openEditModal = useCallback((user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setEditingUser(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!formName.trim()) {
      Toast.show({ type: 'error', text1: 'El nombre es requerido' });
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        await userService.rename(editingUser.user_id, formName.trim());
        Toast.show({ type: 'success', text1: 'Usuario actualizado' });
      } else {
        await userService.create(formName.trim());
        Toast.show({ type: 'success', text1: 'Usuario creado' });
      }
      closeModal();
      loadUsers();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  }, [formName, editingUser, closeModal, loadUsers]);

  const activeCount = users.filter(u => u.active).length;

  const handleToggleActive = useCallback(
    (user: User) => {
      const willActivate = !user.active;

      if (!willActivate && activeCount <= 1) {
        Alert.alert(
          'No se puede desactivar',
          'Debe quedar al menos un usuario activo para poder entrar a la app.',
        );
        return;
      }

      Alert.alert(
        willActivate ? 'Activar usuario' : 'Desactivar usuario',
        willActivate
          ? `"${user.name}" volverá a aparecer en la pantalla de selección.`
          : `"${user.name}" ya no aparecerá en la pantalla de selección. Las órdenes y movimientos de caja que hizo no se pierden.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: willActivate ? 'Activar' : 'Desactivar',
            style: willActivate ? 'default' : 'destructive',
            onPress: async () => {
              try {
                await userService.setActive(user.user_id, willActivate);
                loadUsers();
              } catch (e) {
                Toast.show({ type: 'error', text1: 'Error al actualizar' });
              }
            },
          },
        ],
      );
    },
    [loadUsers, activeCount],
  );

  const handleDelete = useCallback(
    (user: User) => {
      if (user.active && activeCount <= 1) {
        Alert.alert(
          'No se puede eliminar',
          'Debe quedar al menos un usuario activo para poder entrar a la app. Creá otro usuario antes de eliminar este.',
        );
        return;
      }

      Alert.alert(
        'Eliminar usuario',
        `¿Eliminar a "${user.name}"? Esta acción no se puede deshacer.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: async () => {
              try {
                await userService.delete(user.user_id);
                Toast.show({ type: 'success', text1: 'Usuario eliminado' });
                loadUsers();
              } catch (e: any) {
                if (e?.message === 'HAS_HISTORY') {
                  Alert.alert(
                    'No se puede eliminar',
                    `"${user.name}" tiene órdenes o movimientos de caja registrados a su nombre, así que no se puede eliminar sin perder ese historial. Podés desactivarlo en su lugar.`,
                    [
                      { text: 'Entendido', style: 'cancel' },
                      {
                        text: 'Desactivar',
                        onPress: () => handleToggleActive(user),
                      },
                    ],
                  );
                } else {
                  Toast.show({ type: 'error', text1: 'Error al eliminar' });
                }
              }
            },
          },
        ],
      );
    },
    [loadUsers, activeCount, handleToggleActive],
  );

  const renderItem = useCallback(
    ({ item }: { item: User }) => (
      <UserListItem
        item={item}
        onEdit={openEditModal}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />
    ),
    [openEditModal, handleToggleActive, handleDelete],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6C5CE7', '#A29BFE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}>
        <View style={styles.headerContent}>
          <Icon name="account-group" size={28} color="#FFF" />
          <Text style={styles.headerTitle}>Usuarios</Text>
          <Text style={styles.headerSubtitle}>
            {users.filter(u => u.active).length} activo
            {users.filter(u => u.active).length !== 1 ? 's' : ''}
          </Text>
        </View>
      </LinearGradient>

      <FlatList
        data={users}
        keyExtractor={item => String(item.user_id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="account-off-outline" size={60} color="#DFE6E9" />
            <Text style={styles.emptyText}>No hay usuarios</Text>
          </View>
        }
      />

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={openCreateModal}>
        <Icon name="plus" size={28} color="#FFF" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalSheet}>
            <LinearGradient
              colors={['#6C5CE7', '#A29BFE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingUser ? 'Editar usuario' : 'Nuevo usuario'}
              </Text>
              <Pressable onPress={closeModal} hitSlop={12}>
                <Icon name="close" size={24} color="#FFF" />
              </Pressable>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formName}
                onChangeText={setFormName}
                placeholder="Ej: María, Juan, Cajero 1..."
                placeholderTextColor="#B2BEC3"
                maxLength={50}
                autoFocus
              />

              <View style={styles.modalActions}>
                <Pressable style={styles.cancelBtn} onPress={closeModal}>
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
                    colors={['#6C5CE7', '#A29BFE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
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

export default UserMaintenancePage;

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
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  itemInactive: {
    opacity: 0.5,
  },
  itemIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#F3F1FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  itemStatus: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#B2BEC3',
    marginTop: 2,
  },
  itemAction: {
    padding: 6,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabPressed: {
    backgroundColor: '#5B4BC4',
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
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#2D3436',
    borderWidth: 1,
    borderColor: '#D6CCFB',
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
