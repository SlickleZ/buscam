/* eslint-disable handle-callback-err */
import React from 'react';
import {SafeAreaView,
TextInput,
StyleSheet,
TouchableOpacity,
View,
Text,
StatusBar,
InteractionManager,
Image,
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
const axios = require('axios');
import {API_KEY, API_URL} from '@env';

const NumBusScreen = ({navigation, route}) => {

    const [digit1, setDigit1] = React.useState('');
    const [digit2, setDigit2] = React.useState('');
    const [digit3, setDigit3] = React.useState('');
    const [digit4, setDigit4] = React.useState('');
    const [isModalVisible, setModalVisible] = React.useState(false);
    const [modalHeader, setModalHeader] = React.useState('');
    const [modalDesc, setModalDesc] = React.useState('');

    const input1 = React.useRef();
    const input2 = React.useRef();
    const input3 = React.useRef();
    const input4 = React.useRef();

    React.useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            input1.current?.focus();
          });
    }, []);

    const checkNumBus = React.useCallback(() => {
        if (digit1 && digit2 && digit3 && digit4){
            // console.log(digit1 + digit2 + digit3 + digit4);
            isNumBusValid(`${digit1}${digit2}${digit3}${digit4}`);
        } else {
            setModalHeader('ข้อผิดพลาด');
            setModalDesc('กรุณากรอกรหัสรถให้ครบทุกหลัก');
            setModalVisible(true);
        }
    }, [digit1, digit2, digit3, digit4, isNumBusValid]);


    const isNumBusValid = React.useCallback((numBus) => {
        // console.log(`${API_URL}/bus/get/${numBus}`);
        // TODO : send number to server to check that numBus is valid  for today or not
        axios.get(`${API_URL}/bus/get/${numBus}`, {
            headers: {
                Authorization: `Bearer ${API_KEY}`,
            },
        })
        .then((res) => {
            // console.log('In then: ', res);
           if (res.data.available === 'yes') {
                navigation.navigate('QRCode', {...route.params, busNo: numBus});
           } else {
                setModalHeader('ข้อผิดพลาด');
                setModalDesc('รถบัสไม่ได้ให้บริการอยู่ในขณะนี้');
                setModalVisible(true);
           }
        })
        .catch((err) => {
            // console.log('In err: ', err);
            setModalHeader('ข้อผิดพลาด');
            setModalDesc('ไม่พบรถบัสนี้ในระบบ');
            setModalVisible(true);
        });
    }, [navigation, route.params]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="white" animated={true} />
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>กรอกรหัสรถโดยสาร</Text>
            </View>
            <View style={styles.digitsContainer}>
                <TextInput
                    style={styles.input}
                    ref={input1}
                    // autoFocus={true}
                    keyboardType={'numeric'}
                    maxLength={1}
                    textAlign="center"
                    value={digit1}
                    onChangeText={(text) => {
                        setDigit1(text);
                        if (text.length === 1){
                            input2.current.focus();
                        }
                    }}
                />
                <TextInput
                    style={styles.input}
                    ref={input2}
                    keyboardType={'numeric'}
                    maxLength={1}
                    textAlign="center"
                    value={digit2}
                    onChangeText={(text) => {
                        setDigit2(text);
                        if (text.length === 1){
                            input3.current.focus();
                        }
                    }}
                />
                <TextInput
                    style={styles.input}
                    ref={input3}
                    keyboardType={'numeric'}
                    maxLength={1}
                    textAlign="center"
                    value={digit3}
                    onChangeText={(text) => {
                        setDigit3(text);
                        if (text.length === 1){
                            input4.current.focus();
                        }
                    }}
                />
                <TextInput
                    style={styles.input}
                    ref={input4}
                    keyboardType={'numeric'}
                    maxLength={1}
                    textAlign="center"
                    value={digit4}
                    onChangeText={(text) => {
                        setDigit4(text);
                        input4.current.blur();
                    }}
                />
            </View>
            <TouchableOpacity
            onPress={checkNumBus}
            style={styles.button}
            >
                <Text style={styles.buttonText}>ต่อไป</Text>
            </TouchableOpacity>
            <Image
                source={{uri: 'bus'}}
                resizeMethod={'scale'}
                resizeMode={'stretch'}
                style={styles.busIcon}
            />
            <View style={styles.road} />
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
                        <Text style={styles.modalHeaderText}>{modalHeader}</Text>
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
                                <Text style={styles.buttonText}>ตกลง</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
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
    container: {
        flex: 1,
        width: wp('100%'),
        height: hp('100%'),
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    input: {
        height: hp('6%'),
        width: wp('10%'),
        margin: 12,
        borderWidth: 1,
        fontSize: hp(2.3),
        fontFamily: 'Kanit-Bold',
        borderRadius: 5,
        justifyContent: 'center',
        backgroundColor: '#E5E5E5',
    },
    digitsContainer: {
        alignItems: 'center',
        height: hp('10%'),
        // backgroundColor: 'blue',
        flexDirection: 'row',
    },
    button: {
        width: wp('35%'),
        height: hp('6%'),
        backgroundColor: '#28496E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        position: 'absolute',
        top: hp('40%'),
    },
    buttonText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Bold',
        fontSize: hp(2.8),
        color: 'white',
    },
    headerContainer: {
        marginTop: hp('10%'),
        marginBottom: hp('5%'),
    },
    headerText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Bold',
        fontSize: hp(4.55),
        color: '#29496F',
    },
    busIcon: {
        width: hp('35%'),
        height: hp('35%'),
        position: 'absolute',
        top: hp('55%'),
    },
    road: {
        position: 'absolute',
        backgroundColor: '#28496E',
        width: wp('100%'),
        height: hp('40%'),
        zIndex: -1,
        top: hp('70%'),
    },
  });

export default NumBusScreen;
