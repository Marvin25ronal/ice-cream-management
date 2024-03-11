import { Alert } from 'react-native';
import { enablePromise, openDatabase } from 'react-native-sqlite-storage'
import RNFS from 'react-native-fs'
import { DataSource } from 'typeorm';
import { Category } from '../../entity/Category.entity';
enablePromise(true)

export const connectToDatabase = async () => {

    const AppDataSource = new DataSource({
        type: 'react-native',
        database: 'IceCreamDatabase.db',
        location: 'default',
        logging: ['query', 'error', 'schema'],
        entities: [Category],
        synchronize: false,
    })
    // ;(await AppDataSource.initialize()).manager.find(Category).then((categories) => {
    //     console.log(categories)
    // }
    // )
    return AppDataSource.initialize()
    // return openDatabase(
    //     {
    //         name: "IceCreamDatabase.db",
    //         createFromLocation: '~/IceCreamDatabase.db',
    //         location: 'default'
    //     }, ((db) => {
    //         console.log("Base de datos conectada")
    //     }),
    //     ((e) => {
    //         console.log("Error al conectar la base de datos ")
    //         console.log(e.message)
    //         console.log(e)
    //     })
    // )
}

export const CreateDatabase = async () => {
    return openDatabase(
        {
            name: "IceCreamDatabase.db",
            createFromLocation: '~/IceCreamDatabase.db',
            location: 'default'
        }, ((db) => {
            console.log("Base de datos conectada")
        }),
        ((e) => {
            console.log("Error al conectar la base de datos ")
            console.log(e.message)
            console.log(e)
        })
    )
}

export const CreateBackup = async () => {
    const packageName = 'com.application'; // Reemplaza esto con el nombre del paquete de tu aplicación
    const databaseName = 'IceCreamDatabase.db'; // Reemplaza esto con el nombre de tu base de datos

    const sourcePath = `/data/data/${packageName}/databases/${databaseName}`;
    const destinationPath = `${RNFS.DownloadDirectoryPath}/${databaseName}`;
    console.log('destinationPath', destinationPath)
    try {
        await RNFS.copyFile(sourcePath, destinationPath);
        console.log('Copia de seguridad de la base de datos realizada con éxito');
        Alert.alert('Copia de seguridad realizada', `La copia de seguridad de la base de datos se ha realizado con éxito en ${destinationPath}`);
    } catch (error) {
        console.error('Error al hacer la copia de seguridad de la base de datos', error);
        Alert.alert('Error al hacer el backup');
    }
}