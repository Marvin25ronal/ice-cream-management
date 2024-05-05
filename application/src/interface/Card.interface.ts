import { DimensionValue, ViewStyle } from "react-native"
import Animated, { SharedValue } from "react-native-reanimated"

export interface CardProps {
    width: DimensionValue
    children?: JSX.Element
    optionSelected?: number
    setOption?: (option: number) => void
    style?: ViewStyle
    imageBackground?: string
    label?: string
    progress: SharedValue<number>
    index:number
}