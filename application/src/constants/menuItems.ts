import { Utils } from './utils';
import { type_class_icon } from '../components/UI/IconSelector';

export interface MenuItemData {
  /** Identificador único del item dentro del menú (para keys de lista, independiente de routeName/params). */
  key: string;
  routeName: string;
  /** Params opcionales para navegar directo a una pantalla anidada, ej. { screen: Utils.screens.X }. */
  params?: object;
  icon: string;
  iconClass: type_class_icon;
  label: string;
  gradientColors: [string, string];
}

export interface MenuSectionData {
  key: string;
  title: string;
  accentColor: string;
  items: MenuItemData[];
}

export const MENU_SECTIONS: MenuSectionData[] = [
  {
    key: 'tomadores',
    title: 'Tomadores',
    accentColor: '#FF6B9D',
    items: [
      {
        key: 'cobradora',
        routeName: Utils.screens.HOME_STACK,
        icon: 'cash-register',
        iconClass: type_class_icon.FontAwesome5,
        label: 'Cobradora',
        gradientColors: ['#FF6B9D', '#FF9AC1'],
      },
      {
        key: 'ordenes',
        routeName: Utils.screens.ORDER_STACK,
        icon: 'documents',
        iconClass: type_class_icon.Entypo,
        label: 'Ordenes',
        gradientColors: ['#9D4EDD', '#C77DFF'],
      },
      {
        key: 'caja',
        routeName: Utils.screens.CAJA_STACK,
        icon: 'safe-square-outline',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Caja',
        gradientColors: ['#27AE60', '#6EE7A8'],
      },
      {
        key: 'fel',
        routeName: Utils.screens.FEL,
        icon: 'book-check-outline',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'FEL',
        gradientColors: ['#06B6D4', '#67E8F9'],
      },
    ],
  },
  {
    key: 'productos',
    title: 'Productos',
    accentColor: '#EC4899',
    items: [
      {
        key: 'editar-productos',
        routeName: Utils.screens.EDIT_LIST_PRODUCT_STACK,
        icon: 'dropbox',
        iconClass: type_class_icon.AntDesign,
        label: 'Editar Productos',
        gradientColors: ['#EC4899', '#F9A8D4'],
      },
      {
        key: 'materia-prima',
        routeName: Utils.screens.MATERIA_PRIMA_STACK,
        icon: 'package-variant',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Materia Prima',
        gradientColors: ['#00B894', '#55EFC4'],
      },
      {
        key: 'recetas',
        routeName: Utils.screens.EDIT_LIST_PRODUCT_STACK,
        params: { screen: Utils.screens.PRODUCT_RECIPES_LIST },
        icon: 'clipboard-list-outline',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Recetas',
        gradientColors: ['#8E44AD', '#C77DFF'],
      },
    ],
  },
  {
    key: 'reportes',
    title: 'Reportes',
    accentColor: '#F59E0B',
    items: [
      {
        key: 'reportes',
        routeName: Utils.screens.REPORTES_STACK,
        icon: 'chart-box',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Reportes',
        gradientColors: ['#F59E0B', '#FBBF24'],
      },
      {
        key: 'gastos',
        routeName: Utils.screens.GASTOS_STACK,
        icon: 'cash-minus',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Gastos',
        gradientColors: ['#FF6348', '#FF9478'],
      },
    ],
  },
  {
    key: 'administracion',
    title: 'Administración',
    accentColor: '#64748B',
    items: [
      {
        key: 'backup',
        routeName: Utils.screens.BACKUP,
        icon: 'backup-restore',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Backup',
        gradientColors: ['#10B981', '#6EE7B7'],
      },
      {
        key: 'historial-materia-prima',
        routeName: Utils.screens.MATERIA_PRIMA_STACK,
        params: { screen: Utils.screens.MATERIA_PRIMA_HISTORIAL },
        icon: 'history',
        iconClass: type_class_icon.MaterialCommunityIcons,
        label: 'Historial M. Prima',
        gradientColors: ['#00B894', '#55EFC4'],
      },
    ],
  },
];
