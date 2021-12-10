/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {BackHandler,
  PermissionsAndroid,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  View,
  Text} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp} from 'react-native-responsive-screen';
import QRCodeScreen from './screens/QRCodeScreen';
import SelectModeScreen from './screens/SelectModeScreen';
import FindFriendScreen from './screens/FindFriendScreen';
import NumBusScreen from './screens/NumBusScreen';
import SelfieScreen from './screens/SelfieScreen';
import ConCludeScreen from './screens/ConCludeScreen';
import PinScreen from './screens/PinScreen';
import LogInScreen from './screens/LogInScreen';
import {NavigationContainer} from '@react-navigation/native';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {enableScreens} from 'react-native-screens';
import 'react-native-gesture-handler';
import RNBootSplash from 'react-native-bootsplash';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';

enableScreens(false);
const Stack = createStackNavigator();
const LOGIN_KEY = '@key_state';

const Main = () => {

  const [initialRoute, setInitialRoute] = React.useState('pin');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isModalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  React.useEffect(() => {
    readKey();
    requestPermission();
    setTimeout(() => {
      RNBootSplash.hide({fade: true});
    }, 50);
  }, []);

  React.useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        setModalVisible(true);
      }
    });

    return () => {
      // Unsubscribe to network state updates
      // console.log('in return :');
      unsubscribe();
    };
  }, []);

  const requestPermission = async () => {
    try {
      await PermissionsAndroid.requestMultiple(
        [
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ]
      );
    } catch (err) {
      // console.warn(err);
    }
  };

  const readKey = async () => {
    try {
      await AsyncStorage.getItem(LOGIN_KEY, (err, result) => {
        if (err) {
          // console.log(err);
        }
        if (result) {
          // console.log(result);
          setInitialRoute('pin');
        } else if (result === null) {
          // console.log(result);
          setInitialRoute('logIn');
        }
      });
      // console.log('set isLoading to true');
      setIsLoading(true);
    } catch (e) {
      // console.log(e);
    }
  };

  const internetCheck = React.useCallback(async () => {
    await NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        setModalVisible(false);
        setModalVisible(true);
      } else {
        setModalVisible(false);
      }
    });
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{gestureEnabled: false}}
            >
            <Stack.Screen
              name="logIn"
              component={LogInScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="pin"
              component={PinScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="selectMode"
              component={SelectModeScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="findFriend"
              component={FindFriendScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                title: '',
                headerTransparent: true,
                headerMode: 'float',
                headerStyle: {
                  height: hp('10%'),
                },
                headerBackImage: () => (
                  <Icon
                    name="ios-chevron-back"
                    size={hp(3.8)}
                    solid
                    style={{color: '#29496E'}}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="numBus"
              component={NumBusScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                title: '',
                headerTransparent: true,
                headerMode: 'float',
                headerStyle: {
                  height: hp('10%'),
                },
                headerBackImage: () => (
                  <Icon
                    name="ios-chevron-back"
                    size={hp(3.8)}
                    solid
                    style={{color: '#29496E'}}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="QRCode"
              component={QRCodeScreen}
              options={{
                title: 'สเเกน QR Code',
                headerStyle: {
                  backgroundColor: '#28496E',
                  height: hp('10%'),
                },
                headerTitleStyle: {
                  fontFamily: 'Kanit-Bold',
                  fontSize: hp(3.8),
                  color: 'white',
                },
                headerTintColor: 'black',
                headerTitleAlign: 'center',
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerBackImage: () => (
                  <Icon
                    name="ios-chevron-back"
                    size={hp(3.8)}
                    solid
                    style={{color: 'white'}}
                  />
                ),
              }}
            />
            <Stack.Screen
              name="selfie"
              component={SelfieScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                title: 'ยืนยันตัวตน',
                headerStyle: {
                  backgroundColor: '#28496E',
                  height: hp('10%'),
                },
                headerTitleStyle: {
                  fontFamily: 'Kanit-Bold',
                  fontSize: hp(3.8),
                  color: 'white',
                },
                headerTintColor: 'black',
                headerTitleAlign: 'center',
                headerLeft: () => null,
              }}
            />
            <Stack.Screen
              name="conclude"
              component={ConCludeScreen}
              options={{
                cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
                headerShown: false,
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
        <Modal
            isVisible={isModalVisible}
            onBackdropPress={() => setModalVisible(false)}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            animationIn={'fadeInUpBig'}
            animationOut={'fadeOutDownBig'}
            hasBackdrop={false}
            style={styles.modal}
        >
          <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderText}>ขออภัย</Text>
              </View>
              <View style={styles.modalContentContainer}>
                  <Text style={styles.modalContent}>{`ไม่พบสัญญาณอินเทอร์เน็ต${'\n'}กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต`}</Text>
              </View>
              <View style={styles.buttonContainer}>
                  <TouchableOpacity
                      style={styles.modalButton}
                      onPress={internetCheck}
                  >
                          <Text style={styles.buttonText}>ตกลง</Text>
                  </TouchableOpacity>
              </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  } else {
    return null;
  }
};

const styles = StyleSheet.create({
  modalContentContainer: {
    padding: 15,
    // backgroundColor: 'gray',
  },
  modalContent: {
      textAlign: 'center',
      fontFamily: 'Kanit-Regular',
      fontSize: hp(2),
  },
  buttonContainer: {
      // backgroundColor: 'red',
      flex: 0.5,
      alignItems: 'center',
      justifyContent: 'space-evenly',
  },
  modalButton: {
      width: wp('60%'),
      height: hp('7%'),
      backgroundColor: '#28496E',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 50,
  },
  modalHeaderText: {
      textAlign: 'center',
      fontFamily: 'Kanit-Bold',
      fontSize: hp(3.3),
  },
  modalHeader: {
      // backgroundColor: 'skyblue',
      width: '100%',
  },
  modalContainer: {
      backgroundColor: '#ffff',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      height: hp('30%'),
      width: wp('77%'),
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: {
      width: 0,
      height: 7,
      },
      shadowOpacity: 0.71,
      shadowRadius: 6.27,
      elevation: 15,
  },
  modal: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontFamily: 'Kanit-Bold',
    fontSize: hp(2.8),
    color: 'white',
  },
  container: {
      flex: 1,
      width: wp('100%'),
      height: hp('100%'),
      backgroundColor: 'white',
  },
});

export default Main;
