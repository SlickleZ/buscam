/* eslint-disable react-native/no-inline-styles */
import React, {useState, useCallback, useRef } from 'react';
import {SafeAreaView, StyleSheet, View, Text, TextInput, TouchableOpacity, StatusBar, ActivityIndicator} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
import { API_KEY, API_URL } from '@env';
const axios = require('axios');

const USER_KEY = '@key_user';
const LOGIN_KEY = '@key_state';

const LogInScreen = ({navigation}) => {

    const [id, setID] = useState('');
    const [passWord, setPassWord] = useState('');
    const [modalTopic, setModalTopic] = useState('');
    const [modalDesc, setModalDesc] = useState('');
    const [modalPositiveButton, setModalPositiveButton] = useState('');
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const inputPW = useRef();

    const passwordFocus = useCallback(() => {
        inputPW.current.focus();
    }, []);

    const logInHandler = useCallback(async () => {

        if (!id || !passWord) {
            setModalTopic('ข้อผิดพลาด');
            setModalDesc('กรุณากรอกข้อมูลให้ครบถ้วน');
            setModalPositiveButton('ตกลง');
            setModalVisible(true);
            return;
        }
        setIsLoading(true);
        // console.log(`${API_URL}/emp/login`);
        // TODO : Login Algorithms with id and password
        axios({
            method: 'POST',
            url: `${API_URL}/emp/login`,
            data: {
                id: id,
                password: passWord,
            },
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        }).then((res) => {
            const userPair = [USER_KEY, id];
            const logInPair = [LOGIN_KEY, 'true'];
            try {
                AsyncStorage.multiSet([userPair, logInPair]);
                setID('');
                setPassWord('');
                setIsLoading(false);
                navigation.navigate('pin');
            } catch (e) {
                // console.log(e);
            }
        })
        .catch(err => {
            setIsLoading(false);
            setModalTopic('ข้อผิดพลาด');
            setModalPositiveButton('ตกลง');
            setModalVisible(true);
            if (err.response.status === 404) {
                setModalDesc(`เข้าสู่ระบบไม่สำเร็จ${'\n'}เนื่องจากไม่พบข้อมูลในระบบ`);
            } else if (err.response.status === 401) {
                setModalDesc(`เข้าสู่ระบบไม่สำเร็จ${'\n'}โปรดตรวจสอบข้อมูลให้ถูกต้อง`);
            } else {
                setModalDesc(`เกิดข้อผิดพลาด${'\n'}โดยไม่ทราบสาเหตุ`);
            }
        });
    }, [id, navigation, passWord]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.circle, {backgroundColor: 'rgb(241,112,112)', left: wp(30), top: hp(-23)}]} />
            <View style={[styles.circle, {backgroundColor: 'rgb(246,192,101)', left: wp(-15), top: hp(-30)}]} />
            <StatusBar backgroundColor="#28496E" animated={true} />
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>กรุณาเข้าสู่ระบบ</Text>
            </View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    value={id}
                    autoCorrect={false}
                    maxLength={5}
                    placeholder="รหัสพนักงาน"
                    keyboardType={'numeric'}
                    textContentType={'username'}
                    onChangeText={(text) => {
                        setID(text);
                    }}
                    onSubmitEditing={passwordFocus}
                />
                <TextInput
                    style={styles.textInput}
                    ref={inputPW}
                    value={passWord}
                    placeholder="รหัสผ่าน"
                    autoCorrect={false}
                    textContentType={'password'}
                    secureTextEntry={true}
                    onChangeText={(text) => {
                        setPassWord(text);
                    }}
                />
            </View>
            <View>
                <LinearGradient
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                    colors={['rgb(246,192,101)', 'rgb(241,112,112)']}
                    style={styles.button}
                    >
                    <TouchableOpacity
                        style={styles.button}
                        onPress={logInHandler}
                    >
                            <Text style={styles.buttonText}>เข้าสู่ระบบ</Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
            <Modal
                isVisible={isModalVisible}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationIn={'zoomIn'}
                animationOut={'zoomOut'}
                hasBackdrop={false}
                style={styles.modal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>{modalTopic}</Text>
                    </View>
                    <View style={styles.modalContentContainer}>
                        <Text style={styles.modalContent}>{modalDesc}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setModalVisible(false);
                            }}
                        >
                                <Text style={styles.modalButtonText}>{modalPositiveButton}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* loading modal */}
            <Modal
                isVisible={isLoading}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationIn={'fadeIn'}
                animationOut={'fadeOut'}
                backdropOpacity={0.4}
                hasBackdrop={true}
                style={styles.modal}
            >
                <View style={styles.loadingModalContent}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={[styles.modalContent, {color: 'white', marginTop: hp(1)}]}>กำลังโหลด</Text>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    loadingModalContent: {
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    modalContentContainer: {
        paddingHorizontal: 15,
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
    modalButtonText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Bold',
        fontSize: hp(2.8),
        color: 'white',
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
        width: wp('75%'),
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
    circle: {
        width: wp(80),
        height: wp(80),
        borderRadius: Math.round(wp(100) + hp(100)) / 2,
        position: 'absolute',
    },
    button: {
        width: wp(50),
        height: hp(7),
        // backgroundColor: '#1A3BF8',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 100,
    },
    buttonText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Medium',
        fontSize: hp(2.8),
        color: 'black',
    },
    inputContainer: {
        height: hp(25),
        justifyContent: 'space-evenly',
        // backgroundColor: 'skyblue',
    },
    textInput: {
        width: wp(80),
        height: hp(7),
        borderRadius: 10,
        paddingHorizontal: 20,
        backgroundColor: '#E5E5E5',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Kanit-Regular',
        fontSize: hp(2.55),
    },
    headerContainer: {
        width: wp(100),
        // backgroundColor: 'red',
    },
    headerText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Medium',
        fontSize: hp(5.35),
        color: 'white',
    },
    container: {
        width: wp(100),
        height: hp(100),
        backgroundColor: '#29496F',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default  LogInScreen;
