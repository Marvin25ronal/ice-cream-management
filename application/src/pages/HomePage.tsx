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
const HomePage = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation();
  const theme: themeInterface = useSelector((state: any) => state.theme.value);
  const [printers, setprinters] = useState<IUSBPrinter[]>()
  const [currentPrinter, setCurrentPrinter] = useState<IUSBPrinter>()
  const styles = StyleSheet.create({
    page: {
      backgroundColor: theme.PAGE_BACKGROUND_COLOR,
      flex: 1, alignItems: 'center', justifyContent: 'center'
    }
  })
  const _connectPrinter = (printer: IUSBPrinter) => USBPrinter.connectPrinter(printer.vendor_id, printer.product_id).then(() => setCurrentPrinter(printer))

  return (
    <View style={styles.page}>
      <Text style={{ color: 'red' }}>Home Screen</Text>
      <View>
        {/* <Button
          onPress={() => { 
            // USBPrinter.init().then(async () => {
            //   console.log("Iniciamos")
            //   USBPrinter.getDeviceList().then(async (items) => {
            //     setprinters(items)
            //     _connectPrinter(items[0])
            //   }).catch(() => {
            //     Alert.alert("Errorr")
            //     console.log("Error")
            //   })
            // })

          }}
          title="Learn More"
          color="#841584"
          accessibilityLabel="Learn more about this purple button"
        />
        {/* <Button
        onPress={()=>{
          USBPrinter.printText("<C>sample text</C>\n");
          USBPrinter.closeConn()
        }}
        color="red"
        title="Print"/> */}
        <Button
          onPress={() => {
            console.log("Entramos")
            // let db = connectToDatabase().then((db) => {
            //   console.log("Eea")
            //   db.transaction(tx => {
            //     tx.executeSql(
            //       'SELECT * from Category',
            //       [],
            //       (_, resultSet) => {
            //         const rows = resultSet.rows;
            //         const tables = [];

            //         for (let i = 0; i < rows.length; i++) {
            //           tables.push(rows.item(i));
            //         }

            //         console.log('Tablas:', tables);
            //       },
            //       (_, error) => {
            //         console.error('Error al obtener las tablas:', error);
            //       }
            //     );
            //   })
            // })
            connectToDatabase().then((db) => {
              db.manager.find(Category).then((categories) => {
                console.log(categories)
              })
              db.getRepository(Category).save({
                name: "Ejemplo",
                description: "Ejemplo",
                image: "Ejemplo",
                order: 1
              })
              db.manager.find(Category).then((categories) => {
                console.log(categories)
              })
            })
          }}
          title="ejemplo"
        />
        <Button
          onPress={() => {
            CreateBackup()
          }}
          title="Menu"
        />
      </View>

    </View>
  )
}

export default HomePage

