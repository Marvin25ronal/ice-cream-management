import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { User } from '../../entity/User.entity';
import { UserService } from '../../services/UserService';
import { Fonts, FontsSize } from '../../constants/Fonts';

const userService = new UserService();

interface Props {
  visible: boolean;
  title: string;
  subtitle?: string;
  onSelect: (user: User) => void;
  onCancel: () => void;
}

/**
 * Selector simple de usuario para atribuir una acción puntual (ej. "¿quién
 * está eliminando esta orden?"). A diferencia de UserSelectPage, NO cambia
 * el usuario activo de la app ni registra hora de llegada.
 */
const UserPickerModal = ({
  visible,
  title,
  subtitle,
  onSelect,
  onCancel,
}: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      userService
        .getActive()
        .then(setUsers)
        .catch(e => console.error('Error cargando usuarios:', e))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{title}</Text>
          {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#6C5CE7"
              style={styles.loader}
            />
          ) : (
            <View style={styles.list}>
              {users.map(user => (
                <TouchableOpacity
                  key={user.user_id}
                  style={styles.userRow}
                  activeOpacity={0.7}
                  onPress={() => onSelect(user)}>
                  <Icon name="account-circle" size={28} color="#6C5CE7" />
                  <Text style={styles.userName}>{user.name}</Text>
                  <Icon name="chevron-right" size={20} color="#B2BEC3" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UserPickerModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
  },
  title: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.large,
    color: '#2D3436',
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.small,
    color: '#636E72',
    textAlign: 'center',
    marginTop: 4,
  },
  loader: {
    marginVertical: 24,
  },
  list: {
    marginTop: 16,
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8F7FF',
    borderRadius: 12,
    padding: 12,
  },
  userName: {
    flex: 1,
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#2D3436',
  },
  cancelBtn: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelText: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: '#636E72',
  },
});
