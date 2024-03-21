import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { Utils } from '../constants/utils'
import { themeInterface } from '../interface/themeInterface'
import { COMMANDS, IUSBPrinter, USBPrinter } from 'react-native-ect-thermal-receipt-printer';
import { CreateBackup, CreateDatabase, connectToDatabase } from '../store/db/Database'
import { Category } from '../entity/Category.entity'
import { HomeServices } from '../services/HomeServices'
import { TreeNode } from '../interface/TreeInterface'
import { useLoading } from '../shared/LoaderHook'
import MenuCardComponent from '../components/Home/MenuCardComponent'
import { Fonts } from '../constants/Fonts'
import IconSelector, { type_class_icon } from '../components/UI/IconSelector'
import AntDesign from 'react-native-vector-icons/AntDesign'
const HomePage = () => {
  const [homeService] = useState(new HomeServices())
  const [actualNode, setActualNode] = useState<TreeNode>()
  const { loadingState, setTrueLoading } = useLoading()
  const [data, setdata] = useState<TreeNode>()
  const dispatch = useDispatch()
  const navigation = useNavigation();
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const [printers, setprinters] = useState<IUSBPrinter[]>()
  const [currentPrinter, setCurrentPrinter] = useState<IUSBPrinter>()
  useEffect(() => {
    getTree();
  }, [])
  const getTree = async () => {
    homeService.getCategoriesMenu().then((tree: TreeNode) => {
      console.log(tree)
      setdata(tree)
      setActualNode(tree)
    }).catch((error) => {
      console.log(error)
    })
  }
  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      flex: 1,
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      flexDirection: 'row',
      padding: 10
    },
    buttonsContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      height: '10%',
    },
    button: {
      backgroundColor: 'blue',
      height: '100%',
      paddingHorizontal: 20,
      marginHorizontal: 40,
      justifyContent: 'center',
      borderRadius: 10,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 5,
      borderColor: theme.HEADER_TEXT_COLOR,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    buttonText: {
      color: 'white',
      fontFamily: Fonts.LatoBold,
      fontSize: 18,
      marginLeft: 10,
    },
  })
  const _connectPrinter = (printer: IUSBPrinter) => USBPrinter.connectPrinter(printer.vendor_id, printer.product_id).then(() => setCurrentPrinter(printer))

  return (
    // <View style={styles.page}>
    //   <Text style={{ color: 'red' }}>Home Screen</Text>
    //   <View>
    //     {/* <Button
    //       onPress={() => { 
    //         // USBPrinter.init().then(async () => {
    //         //   console.log("Iniciamos")
    //         //   USBPrinter.getDeviceList().then(async (items) => {
    //         //     setprinters(items)
    //         //     _connectPrinter(items[0])
    //         //   }).catch(() => {
    //         //     Alert.alert("Errorr")
    //         //     console.log("Error")
    //         //   })
    //         // })

    //       }}
    //       title="Learn More"
    //       color="#841584"
    //       accessibilityLabel="Learn more about this purple button"
    //     />
    //     {/* <Button
    //     onPress={()=>{
    //       USBPrinter.printText("<C>sample text</C>\n");
    //       USBPrinter.closeConn()
    //     }}
    //     color="red"
    //     title="Print"/> */}
    //     {/* <Button
    //       onPress={() => {
    //         console.log("Entramos")
    //         CreateDatabase().then((db) => {
    //           console.log(db)
    //         }).catch((error) => {
    //           console.log(error)
    //         })
    //         let db = connectToDatabase().then((db) => {
    //           console.log("Eea")
    //           db.transaction(tx => {
    //             tx.executeSql(
    //               'SELECT * from Category',
    //               [],
    //               (_, resultSet) => {
    //                 const rows = resultSet.rows;
    //                 const tables = [];

    //                 for (let i = 0; i < rows.length; i++) {
    //                   tables.push(rows.item(i));
    //                 }

    //                 console.log('Tablas:', tables);
    //               },
    //               (_, error) => {
    //                 console.error('Error al obtener las tablas:', error);
    //               }
    //             );
    //           })
    //         })
    //         connectToDatabase().then((db) => {
    //           db.manager.find(Category).then((categories) => {
    //             console.log(categories)
    //           })
    //           db.getRepository(Category).save({
    //             name: "Ejemplo",
    //             description: "Ejemplo",
    //             image: "Ejemplo",
    //             order: 1
    //           })
    //           db.manager.find(Category).then((categories) => {
    //             console.log(categories)
    //           })
    //         })
    //       }}
    //       title="ejemplo"
    //     />
    //     <Button
    //       onPress={() => {
    //         CreateBackup()
    //       }}
    //       title="Menu"
    //     /> */}
    //   </View>

    // </View>

    <View style={styles.page}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.HOME_BUTTON_COLOR }} onPress={() => {
          setActualNode(data)
        }} >
          <IconSelector icon_class={type_class_icon.Feather} color="white" icon="menu" size={20} />
          <Text style={styles.buttonText}>Menú</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.BACK_BUTTON_COLOR }} >
          <IconSelector icon_class={type_class_icon.Ionicons} color="white" icon="arrow-back" size={20} />
          <Text style={styles.buttonText}>Atrás</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.CLEAN_BUTTON_COLOR }} >
          <IconSelector icon_class={type_class_icon.Feather} color="white" icon="trash" size={20} />
          <Text style={styles.buttonText}>Limpiar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.EDIT_BUTTON_COLOR }} >
          <IconSelector icon_class={type_class_icon.Feather} color="white" icon="edit" size={20} />
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...styles.button, backgroundColor: theme.PAY_BUTTON_COLOR }} >
          <IconSelector icon_class={type_class_icon.Ionicons} color="white" icon="document" size={20} />
          <Text style={styles.buttonText}>Facturar</Text>
        </TouchableOpacity>
      </View>
      {
        !loadingState && actualNode && actualNode.children && actualNode.children.map((node: TreeNode, index: number) => (
          <MenuCardComponent key={index} {...node} image={node.image} onPress={() => {
            setActualNode(node)
          }} />
        ))
      }

    </View >
  )
}

export default HomePage

