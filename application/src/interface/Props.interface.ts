import { RouteProp } from '@react-navigation/native';
import { DimensionValue } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { RootStackParamList } from '../routes/StackNavigator';
import { Utils } from '../constants/utils';
import { SCREENS } from '../constants/navigation/screeens';
import {
  Control,
  FieldValues,
  RegisterOptions,
  ValidationRule,
} from 'react-hook-form';
import { type_class_icon } from '../components/UI/IconSelector';

export interface ModalProps {
  children?: JSX.Element | JSX.Element[];
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  width: DimensionValue;
  height: DimensionValue;
  progress: SharedValue<number>;
  notCloseWithBackdrop?: boolean;
  notCloseButton?: boolean;
}

export interface BackDropProps {
  open: SharedValue<number>;
  extraFunction?: any;
  notclose?: boolean;
  opacity?: number;
  zindex?: number;
}

export interface CustomInputProps {
  control: Control;
  name: string;
  place_holder: string;
  icon_name: string;
  icon_class: type_class_icon;
  rules: RegisterOptions;
  width?: DimensionValue;
  height?: DimensionValue;
  fontSize?: number;
  defaultValue?: any;
  disabled?: boolean;
  type?: 'text' | 'number' | 'email' | 'password' | 'date';
  keyboardType?:
    | 'default'
    | 'number-pad'
    | 'decimal-pad'
    | 'numeric'
    | 'email-address'
    | 'phone-pad';
  iconSize?: number;
}

export interface ButtonComponentProps {
  onPress: () => void | null | any;
  text: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'filter';
  fontSize?: number;
}
