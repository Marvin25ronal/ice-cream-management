import { RouteProp } from "@react-navigation/native"
import { DimensionValue } from "react-native"
import { SharedValue } from "react-native-reanimated"
import { RootStackParamList } from "../routes/StackNavigator"
import { Utils } from "../constants/utils"
import { SCREENS } from "../constants/navigation/screeens"

export interface ModalProps {
    children?: JSX.Element | JSX.Element[]
    visible: boolean
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    width: DimensionValue
    height: DimensionValue
    progress: SharedValue<number>
    notCloseWithBackdrop?: boolean
    notCloseButton?: boolean
}

export interface BackDropProps {
    open: SharedValue<number>,
    extraFunction?: any,
    notclose?: boolean,
    opacity?: number
    zindex?: number
}
