import { enablePromise, openDatabase } from 'react-native-sqlite-storage'
import RNFS from 'react-native-fs';
enablePromise(true)

export const connectToDatabase = async () => {
   
    return openDatabase(
        {
            name:"IceCreamDatabase.db",
            createFromLocation:'/data/data/com.application/files/databases/IceCreamDatabase.db'
        },((db)=>{
            console.log("Base de datos conectada")
        }),
        ((e)=>{
            console.log("Error al conectar la base de datos ")
            console.log(e.message)
            console.log(e)
        })
    )
}