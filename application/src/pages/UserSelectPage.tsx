import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { UserService } from '../services/UserService';
import { User } from '../entity/User.entity';
import { setActiveUser } from '../store/redux/userReducer';
import { Fonts, FontsSize } from '../constants/Fonts';

const userService = new UserService();

const CARD_COLORS: [string, string][] = [
  ['#FF6B9D', '#C44569'],
  ['#0984E3', '#74B9FF'],
  ['#27AE60', '#2ECC71'],
  ['#6C5CE7', '#A29BFE'],
  ['#E17055', '#FDCB6E'],
  ['#00B4D8', '#48CAE4'],
];

interface Props {
  /** true = pantalla de arranque diaria, sin forma de cerrarla sin elegir. */
  mandatory?: boolean;
  /** Se llama luego de guardar la selección con éxito. */
  onSelected?: (user: User) => void;
  /** Solo aplica cuando mandatory=false: cierra sin cambiar de usuario. */
  onCancel?: () => void;
}

const UserSelectPage = ({ mandatory = false, onSelected, onCancel }: Props) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<number | null>(null);

  useEffect(() => {
    userService
      .getActive()
      .then(setUsers)
      .catch(e => console.error('Error cargando usuarios:', e))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = useCallback(
    async (user: User) => {
      setSelectingId(user.user_id);
      try {
        const selected = await userService.selectUser(user.user_id);
        dispatch(setActiveUser(selected));
        onSelected?.(selected);
      } catch (e) {
        console.error('Error seleccionando usuario:', e);
      } finally {
        setSelectingId(null);
      }
    },
    [dispatch, onSelected],
  );

  return (
    <View style={styles.container}>
      {!mandatory && onCancel && (
        <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
          <Icon name="close" size={26} color="#636E72" />
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Icon name="account-group-outline" size={48} color="#6C5CE7" />
        <Text style={styles.title}>
          {mandatory ? 'Buenos días' : 'Cambiar usuario'}
        </Text>
        <Text style={styles.subtitle}>
          {mandatory
            ? '¿Quién está usando la app hoy?'
            : 'Selecciona quién va a usar la app ahora'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6C5CE7" style={styles.loader} />
      ) : (
        <View style={styles.grid}>
          {users.map((user, index) => {
            const colors = CARD_COLORS[index % CARD_COLORS.length];
            const isSelecting = selectingId === user.user_id;
            return (
              <Animated.View
                key={user.user_id}
                entering={FadeInDown.delay(index * 80).springify()}
                style={styles.cardWrap}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={selectingId !== null}
                  onPress={() => handleSelect(user)}>
                  <LinearGradient
                    colors={colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}>
                    {isSelecting ? (
                      <ActivityIndicator size="large" color="white" />
                    ) : (
                      <Icon name="account-circle" size={44} color="white" />
                    )}
                    <Text style={styles.cardName}>{user.name}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      )}
    </View>
  );
};

export default UserSelectPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontFamily: Fonts.LatoBlack,
    fontSize: FontsSize.xxl,
    color: '#2D3436',
    marginTop: 12,
  },
  subtitle: {
    fontFamily: Fonts.LatoRegular,
    fontSize: FontsSize.medium,
    color: '#636E72',
    marginTop: 4,
    textAlign: 'center',
  },
  loader: {
    marginTop: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  cardWrap: {
    width: 140,
  },
  card: {
    width: 140,
    height: 140,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardName: {
    fontFamily: Fonts.LatoBold,
    fontSize: FontsSize.medium,
    color: 'white',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
