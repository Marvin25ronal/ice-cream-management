import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { themeInterface } from '../../interface/themeInterface'
import { useSelector } from 'react-redux'
import { ModalProps } from '../../interface/Props.interface'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import BackDrop from './BackDrop'
import AntDesign from 'react-native-vector-icons/AntDesign'

const ModalComponent = ({ visible, children, setVisible, width, height, progress, notCloseWithBackdrop, notCloseButton }: ModalProps) => {
    const theme: themeInterface = useSelector((state: any) => state.theme.value)
    const icon = 40;
    const styles = StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        modal: {
            backgroundColor: theme.MODAL_BACKGROUND_COLOR,
            width: width,
            height: height,
            borderRadius: 15,
            // justifyContent: 'center',
            // alignItems: 'center',
            zIndex: 1,
        },
        close: {
            width: icon,
            height: icon,
            position: 'absolute',
            top: 20,
            right: 20,
            zIndex: 2,
            //backgroundColor:'red'
        }
    })
    const reanimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: interpolate(
                        progress.value,
                        [0, 1],
                        [0, 1],
                        Extrapolation.CLAMP
                    )
                }
            ]
        }
    })
    return (
        <>

            <Modal transparent visible={visible}
                style={{ zIndex: 0 }}
            >
                <BackDrop
                    open={progress}
                    extraFunction={() => {
                        progress.value = withSpring(0)
                        setVisible(false)
                    }}
                    notclose={notCloseWithBackdrop}
                    zindex={1}
                />
                <View style={styles.container} >

                    <Animated.View style={[styles.modal, reanimatedStyle]}>
                        <>
                            {notCloseButton == undefined ? <TouchableOpacity style={styles.close}
                                onPress={() => {
                                    progress.value = withSpring(0)
                                    setVisible(false)
                                }}
                            >
                                <AntDesign
                                    name="close"
                                    size={icon}
                                    color={theme.COLOR_CLOSE_BUTTON}
                                />
                            </TouchableOpacity> : null}

                            {children}
                        </>
                    </Animated.View>
                </View>
            </Modal>
        </>
    )
}

export default ModalComponent

