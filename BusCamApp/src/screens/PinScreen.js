/* eslint-disable react-native/no-inline-styles */
import React, {useState, useCallback} from 'react';
import {SafeAreaView, StyleSheet, StatusBar, ActivityIndicator, Text, BackHandler, TouchableOpacity, View, TouchableHighlight} from 'react-native';
import PINCode, {hasUserSetPinCode, deleteUserPinCode, resetPinCodeInternalStates} from '@haskkor/react-native-pincode';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Fontisto';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-community/async-storage';
import Modal from 'react-native-modal';

const USER_KEY = '@key_user';
const LOGIN_KEY = '@key_state';

const PinScreen = ({navigation}) => {

    const [codeStatus, setCodeStatus] = useState('choose');
    const [visible, setVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalVisible, setModalVisible] = React.useState(false);

    React.useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => true);
        return () =>
          BackHandler.removeEventListener('hardwareBackPress', () => true);
      }, []);

    const resetPinHandler = React.useCallback(async () => {
    const keys = [USER_KEY, LOGIN_KEY];
    try {
        setModalVisible(false);
        await AsyncStorage.multiRemove(keys);
        await deleteUserPinCode();
        await resetPinCodeInternalStates();
        navigation.navigate('logIn');
    } catch (e) {
        // console.log(e);
    }
    }, [navigation]);

    const firstCheck = async () => {
        setVisible(true);
        let checkPin = await hasUserSetPinCode();
        if (checkPin) {
            setCodeStatus('enter');
        } else {
            setCodeStatus('choose');
        }
        setIsLoading(false);
    };

    useFocusEffect(
        useCallback(() => {
            firstCheck();
            return () => {
                setVisible(false);
            };
        }, [])
    );

    const finishProcess = useCallback(() => {
        if (codeStatus === 'choose') {
            setIsLoading(true);
            setCodeStatus('enter');
            setIsLoading(false);
        } else {
            setVisible(false);
            navigation.navigate('selectMode');
        }
    }, [codeStatus, navigation]);

    if (!isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar backgroundColor="#28496E" animated={true} />
                <Icon
                    name="locked"
                    size={hp(4.4)}
                    solid
                    style={{color: 'white', marginTop: hp('8%'), textAlign: 'center'}}
                />
                {visible &&
                    <PINCode
                        status={codeStatus}
                        finishProcess={finishProcess}
                        touchIDDisabled={true}
                        disableLockScreen={true}
                        buttonDeleteText={null}
                        titleChoose={'ตั้งค่ารหัส PIN'}
                        subtitleChoose={'กรอกรหัส PIN ในการเข้าใช้งานครั้งเเรก'}
                        titleConfirm={'ยืนยันรหัส PIN'}
                        titleConfirmFailed={'รหัส PIN ไม่ตรงกัน'}
                        subtitleConfirm={'กรอกรหัส PIN อีกครั้ง'}
                        titleAttemptFailed={'กรอกรหัส PIN ไม่ถูกต้อง'}
                        subtitleError={'กรุณาลองใหม่อีกครั้ง'}
                        titleEnter={'กรอกรหัส PIN'}
                        subtitleEnter={'เพื่อเข้าใช้งานเเอปพลิเคชัน'}
                        delayBetweenAttempts={1000}
                        bottomLeftComponent={() => {
                            if (codeStatus === 'enter') {
                                    return (
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(true)}
                                    >
                                        <Text style={styles.forgotPIN}>ลืม PIN</Text>
                                    </TouchableOpacity>
                                );
                            } else {
                                return null;
                            }
                        }
                        }

                        colorCircleButtons={'transparent'}
                        numbersButtonOverlayColor={'rgba(255, 255, 255, 0.1)'}
                        stylePinCodeButtonNumber={'white'}
                        stylePinCodeButtonNumberPressed={'white'}
                        stylePinCodeColorSubtitle={'white'}
                        stylePinCodeColorTitle={'white'}
                        stylePinCodeColumnButtons={{
                            alignItems: 'center',
                            width: wp('25%'),
                        }}
                        stylePinCodeDeleteButtonColorShowUnderlay={'white'}
                        stylePinCodeColumnDeleteButton={{
                            marginTop: wp('5%'),
                        }}
                        stylePinCodeHiddenPasswordSizeEmpty={15}
                        stylePinCodeHiddenPasswordSizeFull={18}
                        stylePinCodeTextButtonCircle={{
                            fontFamily: 'Kanit-Medium',
                            fontSize: hp(3.8),
                        }}
                        stylePinCodeTextSubtitle={{
                            fontFamily: 'Kanit-Regular',
                            fontSize: hp(2.3),
                        }}
                        stylePinCodeTextTitle={{
                            fontFamily: 'Kanit-Bold',
                            fontSize: hp(3.3),
                            marginBottom: hp('2%'),
                        }}
                        stylePinCodeMainContainer={{paddingVertical: hp('0%')}}
                    />
                }
                <Modal
                    isVisible={isModalVisible}
                    onBackdropPress={() => setModalVisible(false)}
                    useNativeDriver={true}
                    hideModalContentWhileAnimating={true}
                    animationIn={'zoomIn'}
                    animationOut={'zoomOut'}
                    hasBackdrop={false}
                    style={styles.modal}
                    >
                        <View style={styles.modalContainer}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalHeaderText}>ลืมรหัส PIN</Text>
                            </View>
                            <View style={styles.modalContentContainer}>
                                <Text style={[styles.modalContent, {marginBottom: hp(1)}]}>จำเป็นที่จะต้องเข้าสู่ระบบใหม่อีกครั้ง</Text>
                                <Text style={styles.modalContent}>ยืนยันที่จะรีเซ็ทรหัส PIN หรือไม่?</Text>
                            </View>
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity
                                    style={styles.modalButton}
                                    onPress={resetPinHandler}
                                >
                                        <Text style={styles.buttonText}>ยืนยัน</Text>
                                </TouchableOpacity>
                                <TouchableHighlight
                                    style={[styles.modalButton, {backgroundColor: '#EEE6E6'}]}
                                    onPress={() => setModalVisible(false)}
                                    underlayColor={'rgba(0,0,0,0.2)'}
                                >
                                        <Text style={[styles.buttonText, {color: '#767676'}]}>ยกเลิก</Text>
                                </TouchableHighlight>
                            </View>
                        </View>
                    </Modal>
            </SafeAreaView>
        );
    } else {
        return (
            <SafeAreaView style={styles.container} >
                <StatusBar backgroundColor="#28496E" animated={true} />
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.loadingText}>กำลังโหลด</Text>
            </SafeAreaView>
        );
    }
};

const styles = StyleSheet.create({
    modalContentContainer: {
        paddingHorizontal: 15,
        // backgroundColor: 'gray',
      },
      modalContent: {
          textAlign: 'center',
          fontFamily: 'Kanit-Regular',
          fontSize: hp(2),
      },
      modalButtonContainer: {
          // backgroundColor: 'red',
          flex: 0.6,
          alignItems: 'center',
          justifyContent: 'space-evenly',
      },
      modalButton: {
          width: wp('70%'),
          height: hp('7%'),
          backgroundColor: '#28496E',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 50,
      },
      buttonText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Bold',
        fontSize: hp(2.8),
        color: 'white',
      },
      modalHeaderText: {
          textAlign: 'center',
          fontFamily: 'Kanit-Bold',
          fontSize: hp(3.3),
      },
      modalHeader: {
          // backgroundColor: 'skyblue',
          width: '90%',
      },
      modalContainer: {
          backgroundColor: '#ffff',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          height: hp('40%'),
          width: wp('80%'),
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
    forgotPIN: {
        marginTop: wp('5%'),
        fontFamily: 'Kanit-Medium',
        fontSize: hp(2.3),
        color: '#4D9AF1',
    },
    loadingText: {
        marginTop: hp(1),
        fontSize: hp(2.3),
        fontFamily: 'Kanit-Medium',
        color: 'white',
    },
    container: {
        flex:1,
        backgroundColor: '#28496E',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default PinScreen;
