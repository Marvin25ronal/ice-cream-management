import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Entypo from 'react-native-vector-icons/Entypo'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
export enum type_class_icon {
    AntDesign = 'AntDesign',
    Entypo = 'Entypo',
    EvilIcons = 'EvilIcons',
    Feather = 'Feather',
    MaterialCommunityIcons = 'MaterialCommunityIcons',
    SimpleLineIcons = 'SimpleLineIcons',
    FontAwesome5 = 'FontAwesome5',
    Ionicons = 'Ionicons',
    Fontisto = 'Fontisto',
    FontAwesome = 'FontAwesome'
}
export interface IconSelectorProps {
    icon_class: type_class_icon
    color: string
    icon: string
    size: number
}
const IconSelector = ({ icon_class, color = 'black', icon, size }: IconSelectorProps) => {
    switch (icon_class) {
        case type_class_icon.AntDesign:
            return (
                <AntDesign
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.Entypo:
            return (
                <Entypo
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.EvilIcons:
            return (
                <EvilIcons
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.Feather:
            return (
                <Feather
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.MaterialCommunityIcons:
            return (
                <MaterialCommunityIcons
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.SimpleLineIcons:
            return (
                <SimpleLineIcons
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.FontAwesome5:
            return (
                <FontAwesome5Icon
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.Ionicons:
            return (
                <Ionicons
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.Fontisto:
            return (
                <Fontisto
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        case type_class_icon.FontAwesome:
            return (
                <FontAwesome
                    size={size}
                    name={icon}
                    color={color}
                />
            )
        default:
            return (
                <AntDesign
                    size={size}
                    name={'warning'}
                    color={color}
                />
            )
    }
}

export default IconSelector

const styles = StyleSheet.create({})