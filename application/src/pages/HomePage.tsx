import { Alert, Button, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { Utils } from '../constants/utils'
import { themeInterface } from '../interface/themeInterface'
import { COMMANDS, IUSBPrinter, USBPrinter } from 'react-native-ect-thermal-receipt-printer';
import { CreateBackup, connectToDatabase } from '../store/db/Database'
import { Category } from '../entity/Category.entity'
import { HomeServices } from '../services/HomeServices'
import { TreeNode } from '../interface/TreeInterface'
import { useLoading } from '../shared/LoaderHook'
import MenuCardComponent from '../components/Home/MenuCardComponent'
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
    }
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
    //     <Button
    //       onPress={() => {
    //         console.log("Entramos")
    //         // let db = connectToDatabase().then((db) => {
    //         //   console.log("Eea")
    //         //   db.transaction(tx => {
    //         //     tx.executeSql(
    //         //       'SELECT * from Category',
    //         //       [],
    //         //       (_, resultSet) => {
    //         //         const rows = resultSet.rows;
    //         //         const tables = [];

    //         //         for (let i = 0; i < rows.length; i++) {
    //         //           tables.push(rows.item(i));
    //         //         }

    //         //         console.log('Tablas:', tables);
    //         //       },
    //         //       (_, error) => {
    //         //         console.error('Error al obtener las tablas:', error);
    //         //       }
    //         //     );
    //         //   })
    //         // })
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
    //     />
    //   </View>

    // </View>
    <View style={styles.page}>
      {
        !loadingState && actualNode && actualNode.children && actualNode.children.map((node: TreeNode, index: number) => (
          <MenuCardComponent key={index} {...node} image={node.image} />
        ))
      }
    </View>
  )
}

export default HomePage

