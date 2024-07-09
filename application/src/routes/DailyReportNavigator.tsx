import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Utils } from '../constants/utils'
import { StackNavigationOptions, createStackNavigator } from '@react-navigation/stack'
import { useSelector } from 'react-redux'
import { RootState } from '../store/redux/store'
import { Fonts, FontsSize } from '../constants/Fonts'
import { getHeaderTitle } from '@react-navigation/elements'
import CustomHeader from '../components/UI/CustomHeader'
import DailyReport from '../pages/DailyReport'
export type DailyReportParamList = {
    [Utils.screens.DAILY_REPORT]: undefined
}
const Stack = createStackNavigator<DailyReportParamList>();
const DailyReportNavigator = () => {
    const theme = useSelector((state: RootState) => state.theme.value);
    const options: StackNavigationOptions = {
        headerStyle: {
            backgroundColor: theme.HEADER_COLOR,

        },
        headerTitleStyle: {
            color: theme.HEADER_TEXT_COLOR,
            fontFamily: Fonts.LatoBold,
            fontSize: FontsSize.large
        },
        headerTintColor: theme.HEADER_TEXT_COLOR,
        headerShown: true,
        header: ({ navigation, route, options, back }) => {
            const title = getHeaderTitle(options, route.name)
            return <CustomHeader title={title} backOption={back} navigation={navigation} />
        }
    }

    return (
        <Stack.Navigator>
            <Stack.Screen name={Utils.screens.DAILY_REPORT} component={DailyReport} options={options} />
        </Stack.Navigator>
    )
}

export default DailyReportNavigator
