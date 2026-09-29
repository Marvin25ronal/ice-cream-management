import {
  Dimensions,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { themeInterface } from '../../interface/themeInterface';
import { closeMenu } from '../../store/redux/menuReducer';
import { navigate } from '../../navigation/navigationRef';
import { MENU_SECTIONS } from '../../constants/menuItems';
import { Fonts, FontsSize } from '../../constants/Fonts';
import IconSelector, { type_class_icon } from '../UI/IconSelector';
import BackDrop from '../UI/BackDrop';
import { getVersionString } from '../../constants/AppConfig';
import UserSelectPage from '../../pages/UserSelectPage';

const NUM_COLUMNS = 4;
const ICON_CONTAINER_SIZE = 60;
const ICON_SIZE = 28;
const DRAG_CLOSE_THRESHOLD = 100;
const DRAG_RANGE = 300;

const BottomSheetMenu = () => {
  const dispatch = useDispatch();
  const isOpen: boolean = useSelector((state: any) => state.menu.isOpen);
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const activeUser = useSelector((state: any) => state.user.activeUser);
  const [mounted, setMounted] = useState(false);
  const [userSwitcherVisible, setUserSwitcherVisible] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      progress.value = withTiming(1, { duration: 280 });
    } else {
      progress.value = withTiming(0, { duration: 220 }, finished => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    dispatch(closeMenu());
  };

  const handleSelect = (routeName: string, params?: object) => {
    navigate(routeName, params);
    dispatch(closeMenu());
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 6 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          progress.value = 1 - Math.min(gestureState.dy / DRAG_RANGE, 1);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > DRAG_CLOSE_THRESHOLD) {
          handleClose();
        } else {
          progress.value = withTiming(1, { duration: 180 });
        }
      },
      onPanResponderTerminate: () => {
        progress.value = withTiming(1, { duration: 180 });
      },
    }),
  ).current;

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(progress.value, [0, 1], [420, 0]),
      },
    ],
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 1, 1]),
  }));

  const { width } = Dimensions.get('window');
  const horizontalPadding = 22;
  const itemGap = 10;
  const itemWidth =
    (width - horizontalPadding * 2 - itemGap * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.MODAL_BACKGROUND_COLOR,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
      paddingHorizontal: horizontalPadding,
      paddingBottom: 28,
      height: '92%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 20,
    },
    dragArea: {
      paddingTop: 12,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.DIVIDER_COLOR,
      opacity: 0.6,
      marginBottom: 18,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    title: {
      fontSize: FontsSize.xxl,
      fontFamily: Fonts.LatoBlack,
      color: theme.MODAL_TEXT_COLOR,
      letterSpacing: 0.2,
    },
    subtitle: {
      fontSize: FontsSize.small + 1,
      fontFamily: Fonts.LatoRegular,
      color: theme.MODAL_TEXT_COLOR,
      opacity: 0.5,
      marginTop: 2,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(128, 128, 128, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    userButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(108, 92, 231, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    userActiveDot: {
      position: 'absolute',
      bottom: 1,
      right: 1,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: '#00B894',
      borderWidth: 1.5,
      borderColor: theme.MODAL_BACKGROUND_COLOR,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 8,
    },
    section: {
      marginBottom: 26,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: FontsSize.small + 1,
      fontFamily: Fonts.LatoBold,
      color: theme.MODAL_TEXT_COLOR,
      opacity: 0.55,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: itemGap,
    },
    item: {
      width: itemWidth,
      alignItems: 'center',
    },
    iconContainer: {
      width: ICON_CONTAINER_SIZE,
      height: ICON_CONTAINER_SIZE,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: FontsSize.small,
      fontFamily: Fonts.LatoBold,
      color: theme.MODAL_TEXT_COLOR,
      textAlign: 'center',
    },
    footer: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.DIVIDER_COLOR,
    },
    userSwitcherOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    versionText: {
      fontSize: 12,
      fontFamily: Fonts.LatoRegular,
      color: theme.MODAL_TEXT_COLOR,
      opacity: 0.4,
      textAlign: 'center',
    },
  });

  if (!mounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={mounted}
      statusBarTranslucent
      animationType="none">
      <BackDrop open={progress} extraFunction={handleClose} zindex={0} />
      <View style={styles.container} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.dragArea} {...panResponder.panHandlers}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Menú</Text>
                <Text style={styles.subtitle}>Explora todas las opciones</Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={styles.userButton}
                  activeOpacity={0.7}
                  onPress={() => setUserSwitcherVisible(true)}>
                  <IconSelector
                    icon_class={type_class_icon.MaterialCommunityIcons}
                    icon="account-circle"
                    size={20}
                    color="#6C5CE7"
                  />
                  {!!activeUser && <View style={styles.userActiveDot} />}
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  activeOpacity={0.7}
                  onPress={handleClose}>
                  <IconSelector
                    icon_class={type_class_icon.AntDesign}
                    icon="close"
                    size={18}
                    color={theme.MODAL_TEXT_COLOR}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {MENU_SECTIONS.map(section => (
              <View key={section.key} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View
                    style={[
                      styles.sectionDot,
                      { backgroundColor: section.accentColor },
                    ]}
                  />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>
                <View style={styles.grid}>
                  {section.items.map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={styles.item}
                      activeOpacity={0.8}
                      onPress={() => handleSelect(item.routeName, item.params)}>
                      <LinearGradient
                        colors={item.gradientColors}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.iconContainer,
                          Platform.OS === 'ios'
                            ? {
                                shadowColor: item.gradientColors[0],
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 10,
                              }
                            : { elevation: 6 },
                        ]}>
                        <IconSelector
                          icon_class={item.iconClass}
                          icon={item.icon}
                          size={ICON_SIZE}
                          color="#FFFFFF"
                        />
                      </LinearGradient>
                      <Text style={styles.label} numberOfLines={2}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.versionText}>
              Version {getVersionString(false)}
            </Text>
          </View>
        </Animated.View>
      </View>

      <Modal
        visible={userSwitcherVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setUserSwitcherVisible(false)}>
        <View style={styles.userSwitcherOverlay}>
          <UserSelectPage
            onCancel={() => setUserSwitcherVisible(false)}
            onSelected={() => setUserSwitcherVisible(false)}
          />
        </View>
      </Modal>
    </Modal>
  );
};

export default BottomSheetMenu;
