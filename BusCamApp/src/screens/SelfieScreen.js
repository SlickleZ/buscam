/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/Ionicons';
import {launchCamera} from 'react-native-image-picker';
import Modal from 'react-native-modal';


const SelfieScreen = ({route, navigation}) => {
  const [filePath, setFilePath] = useState({});
  const [modalHeader, setModalHeader] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [isModalVisible, setModalVisible] = React.useState(false);

  useEffect(() => {
    if (Object.keys(filePath).length !== 0){
        navigation.navigate('conclude', {
          ...route.params,
          ...filePath,
        });
    }
  }, [filePath, navigation, route.params]);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'คำอนุญาตในการเข้าถึงกล้อง',
          message:'Buscam ต้องการเข้าถึงกล้อง',
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

  const captureImage = async () => {
    let options = {
      mediaType: 'photo',
      maxWidth: 600,
      maxHeight: 600,
      cameraType: 'front',
      quality: 1,
      saveToPhotos: false,
    };
    let isCameraPermitted = await requestCameraPermission();
    if (isCameraPermitted) {
      launchCamera(options, response => {
        // console.log('Response = ', response);
        if (response.didCancel) {
          setModalHeader('โปรดระวัง');
          setModalDesc('โปรดกดปุ่มเปิดกล้องถ่ายภาพเพื่อยืนยัน');
          setModalVisible(true);
          return;
        } else if (response.errorCode === 'camera_unavailable') {
          setModalHeader('ข้อผิดพลาด');
          setModalDesc('ไม่พบแอปพลิเคชันกล้องในอุปกรณ์นี้');
          setModalVisible(true);
          return;
        } else if (response.errorCode === 'permission') {
          setModalHeader('ข้อผิดพลาด');
          setModalDesc('โปรดอนุญาตให้แอปเข้าถึงกล้อง');
          setModalVisible(true);
          return;
        } else if (response.errorCode === 'others') {
          setModalHeader('ข้อผิดพลาด');
          setModalDesc(response.errorMessage);
          setModalVisible(true);
          return;
        }
        setFilePath({
          uri: response.assets[0].uri,
        });
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#28496E" animated={true} />
        <Text style={styles.description}>กรุณาถ่ายภาพตัวเองให้เห็นที่นั่งเพื่อยืนยันตัวตน</Text>
        <Icon
            name={'camera'}
            size={hp(26)}
            solid
            style={{color: '#5C91CF', marginVertical: hp('5%')}}
        />
        <TouchableOpacity
          activeOpacity={0.5}
          style={styles.buttonStyle}
          onPress={captureImage}>
          <Text style={styles.buttonTextStyle}>เปิดกล้อง</Text>
        </TouchableOpacity>
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

export default SelfieScreen;

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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  buttonTextStyle: {
    textAlign: 'center',
    fontFamily: 'Kanit-Bold',
    fontSize: hp(2.8),
    color: 'white',
  },
  buttonStyle: {
    width: wp('35%'),
    height: hp('6%'),
    backgroundColor: '#28496E',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginVertical: hp('5%'),
  },
  description: {
    fontFamily: 'Kanit-Regular',
    fontSize: hp(2.3),
    color: 'black',
    marginBottom: hp('5%'),
  },
});
