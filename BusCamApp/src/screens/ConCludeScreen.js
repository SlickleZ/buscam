/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView,
View,
Text,
StyleSheet,
TouchableOpacity,
TouchableHighlight,
PermissionsAndroid,
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
import RNFS from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
const FormData = require('form-data');
import {API_KEY, API_URL} from '@env';
const axios = require('axios');

const ConCludeScreen = ({route, navigation}) => {

    const [currentDate, setCurrentDate] = React.useState(''); // use for display date and send data (count when this screen is mounted)
    const [currentTime, setCurrentTime] = React.useState(''); // use for send data with current time! (count before send data)
    const [currentPosition, setCurrentPosition] = React.useState({}); // use for send data with current position (positioning before send data)

    // --- Modal corner ---
    const [isConfirmModalVisible, setConfirmModalVisible] = React.useState(false);
    const [isCancel, setIsCancel] = React.useState(false);
    const [confirmModalTopic, setConfirmModalTopic] = React.useState('');
    const [confirmModalDesc, setConfirmModalDesc] = React.useState('');
    const [confirmModalPositiveButton, setConfirmModalPositiveButton] = React.useState('');
    const [confirmModalNegativeButton, setConfirmModalNegativeButton] = React.useState('');

    const [isResultModalVisible, setResultModalVisible] = React.useState(false);
    const [resultModalTopic, setResultModalTopic] = React.useState('');
    const [resultModalDesc, setResultModalDesc] = React.useState('');
    const [resultModalPositiveButton, setResultModalPositiveButton] = React.useState('');

    React.useEffect(() => {
        // console.log(route.params);
        setCurrentDate(dateFormat());
    }, [route.params]);

    React.useEffect(() => {
        if (!isCancel) {
            getPosition();
            setCurrentTime(timeFormat());
        }
    }, [getPosition, isCancel]);

    const dateFormat = () => {
        var date = new Date();
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };
    const timeFormat = () => {
        var date = new Date();
        return `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    };

    const requestPositionPermission = async () => {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'คำอนุญาตในการเข้าถึงตำเเหน่ง',
              message:'Buscam ต้องการเข้าถึงตำเหน่ง',
              buttonNeutral: 'ถามฉันอีกครั้ง',
              buttonNegative: 'ยกเลิก',
              buttonPositive: 'ตกลง',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          // console.warn(err);
          return false;
        }
    };

    const getPosition = React.useCallback(async () => {
        let hasLocationPermission = await requestPositionPermission();
        if (hasLocationPermission) {
            const watchId = Geolocation.getCurrentPosition(
                (position) => {
                //   console.log(position.coords.latitude, position.coords.longitude);
                  setCurrentPosition({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                  });
                },
                (error) => {
                //   console.log(error.code, error.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000, distanceFilter: 0 }
            );
            Geolocation.clearWatch(watchId);
        }
    }, []);

    const sendConfirmHandler = React.useCallback(() => {
        setConfirmModalTopic('ยืนยันการเช็คอิน');
        setConfirmModalDesc(`โปรดตรวจสอบข้อมูลก่อนกดยืนยัน${'\n'}ยืนยันที่จะเช็คอินหรือไม่?`);
        setConfirmModalPositiveButton('ยืนยัน');
        setConfirmModalNegativeButton('ยกเลิก');
        setIsCancel(false);
        setConfirmModalVisible(true);
    }, []);

    const cancelHandler = React.useCallback(() => {
        setConfirmModalTopic('ยกเลิกการเช็คอิน');
        setConfirmModalDesc(`ต้องการที่จะยกเลิกการเช็คอินนี้หรือไม่?${'\n'}`);
        setConfirmModalPositiveButton('ตกลง');
        setConfirmModalNegativeButton('ยกเลิก');
        setIsCancel(true);
        setConfirmModalVisible(true);
    }, []);

    const sendData = React.useCallback(() => {
        if (!isCancel) {
            // TODO : id, empId, name, busId, seatId, position, dateTime,
            setConfirmModalVisible(false);
            const image = {
                uri : route.params.uri,
                type : 'image/jpeg',
                name : `${route.params.id}$${currentDate}$${currentTime}.jpg`,
            };
            /* Comment these console log after test */
           /* route.params.uri is the path to image file */

           const formData = new FormData();
           formData.append('id', `${route.params.id}$${currentDate}$${currentTime}`);
           formData.append('empId', route.params.id);
           formData.append('name', route.params.name);
           formData.append('busId', route.params.busNo);
           formData.append('seatId', route.params.qrVal);
           formData.append('position', `${currentPosition.latitude} ${currentPosition.longitude}`);
           formData.append('dateTime', `${currentDate} ${currentTime}`);
           formData.append('image', image);
        //    console.log(`${API_URL}/checkIn/check`);
           axios({
               method: 'post',
               url: `${API_URL}/checkIn/check`,
               headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${API_KEY}`,
               },
               data: formData,
           })
           .then((res) => {
            setResultModalTopic('เช็คอินสำเร็จ');
            setResultModalDesc('ได้รับข้อมูลการเช็คอินเเล้ว');
            setResultModalPositiveButton('ตกลง');
            setResultModalVisible(true);
           })
           .catch(err => {
            // console.log(err);
            setResultModalTopic('เช็คอินไม่สำเร็จ');
            setResultModalPositiveButton('ตกลง');
            if (err.response.status === 500) {
                setResultModalDesc(`การเช็คอินไม่สำเร็จ${'\n'}โปรดติดต่อผู้ดูเเลระบบ`);
            } else {
                setResultModalDesc(`การเช็คอินไม่สำเร็จ${'\n'}เพราะมีความผิดพลาดจากเซิร์ฟเวอร์`);
            }
            setResultModalVisible(true);
           });

            // console.log(route.params.id);
            // console.log(route.params.name);
            // console.log(route.params.busNo);
            // console.log(route.params.qrVal);
            // console.log(currentDate);
            // console.log(currentTime);
            // console.log(currentPosition.latitude, currentPosition.longitude);
        } else {
            RNFS.unlink(route.params.uri);
            setConfirmModalVisible(false);
            navigation.navigate('selectMode');
        }
    }, [currentDate, currentPosition.latitude, currentPosition.longitude, currentTime, isCancel, navigation, route.params.busNo, route.params.id, route.params.name, route.params.qrVal, route.params.uri]);

    const resultHandler = React.useCallback(() => {
            RNFS.unlink(route.params.uri);
            setResultModalVisible(false);
            navigation.navigate('selectMode');
    }, [navigation, route.params.uri]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>ตรวจสอบข้อมูล</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.contentText}>{`ชื่อ-นามสกุล : ${route.params.name}`}</Text>
                <Text style={styles.contentText}>{`รหัสรถ : ${route.params.busNo}`}</Text>
                <Text style={styles.contentText}>{`รหัสที่นั่ง : ${route.params.qrVal}`}</Text>
                <Text style={styles.contentText}>{`รหัสพนักงาน : ${route.params.id}`}</Text>
                <Text style={styles.contentText}>{`วันที่ : ${currentDate}`}</Text>
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, {backgroundColor: '#4AD0B3'}]}
                    onPress={sendConfirmHandler}
                >
                    <Text style={styles.buttonText}>ยืนยันข้อมูล</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, {backgroundColor: '#E9896A'}]}
                    onPress={cancelHandler}
                >
                    <Text style={styles.buttonText}>ยกเลิก</Text>
                </TouchableOpacity>
            </View>


            {/* {Confirm modal} */}
            <Modal
                isVisible={isConfirmModalVisible}
                onBackdropPress={() => setConfirmModalVisible(false)}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationIn={'zoomIn'}
                animationOut={'zoomOut'}
                hasBackdrop={false}
                style={styles.modal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>{confirmModalTopic}</Text>
                    </View>
                    <View style={styles.modalContentContainer}>
                        <Text style={styles.modalContent}>{confirmModalDesc}</Text>
                    </View>
                    <View style={styles.modalButtonContainer}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={sendData}
                        >
                                <Text style={[styles.buttonText, {color: '#FFFF'}]}>{confirmModalPositiveButton}</Text>
                        </TouchableOpacity>
                        <TouchableHighlight
                            style={[styles.modalButton, {backgroundColor: '#EEE6E6'}]}
                            onPress={() => {
                                setConfirmModalVisible(false);
                            }}
                            underlayColor={'rgba(0,0,0,0.2)'}
                        >
                                <Text style={[styles.buttonText, {color: '#767676'}]}>{confirmModalNegativeButton}</Text>
                        </TouchableHighlight>
                    </View>
                </View>
            </Modal>


            {/* {Result modal} */}
            <Modal
                isVisible={isResultModalVisible}
                useNativeDriver={true}
                hideModalContentWhileAnimating={true}
                animationIn={'bounceIn'}
                animationOut={'bounceOut'}
                hasBackdrop={false}
                style={styles.modal}
            >
                <View style={[styles.modalContainer, {height: hp('30%')}]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>{resultModalTopic}</Text>
                    </View>
                    <View style={styles.modalContentContainer}>
                        <Text style={styles.modalContent}>{resultModalDesc}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={resultHandler}
                        >
                                <Text style={styles.modalButtonText}>{resultModalPositiveButton}</Text>
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
    modalButtonContainer: {
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
    modalButtonText: {
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
        width: '100%',
    },
    modalContainer: {
        backgroundColor: '#ffff',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        height: hp('45%'),
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
    buttonContainer: {
        flex: 0.4,
        // backgroundColor: 'blue',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    button: {
        width: wp(90),
        height: hp(7),
        borderRadius: 10,
        justifyContent: 'center',
    },
    buttonText: {
        textAlign: 'center',
        fontSize: hp(3.15),
        fontFamily: 'Kanit-Bold',
    },
    contentText: {
        fontFamily: 'Kanit-Regular',
        fontSize: hp(2),
        color: 'black',
    },
    contentContainer: {
        width: wp(90),
        height: hp(45),
        backgroundColor: '#F7F8F9',
        paddingHorizontal: wp(3),
        justifyContent: 'space-evenly',
        alignItems: 'flex-start',
        borderRadius: 20,
    },
    headerText: {
        fontFamily: 'Kanit-Bold',
        fontSize: hp(3.8),
        color: 'white',
    },
    headerContainer: {
        textAlign: 'center',
    },
    container: {
        width: wp(100),
        height: hp(100),
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backgroundColor: '#28496E',
    },
});

export default ConCludeScreen;
