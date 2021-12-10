/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  Vibration,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import BarcodeMask from 'react-native-barcode-mask';
import Icon from 'react-native-vector-icons/Ionicons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import Modal from 'react-native-modal';
const axios = require('axios');
import {API_KEY, API_URL} from '@env';


const QRCodeScreen = ({navigation, route}) => {

  const [flash, setFlash] = useState(false);
  const [bound, setBound] = useState({});
  const [cameraVisible, setCameraVisible] = useState(true);
  const [barcodeValue, setBarcodeValue] = useState('');
  const [isBarcodeRead, setIsBarcodeRead] = useState(false);
  const [isModalVisible, setModalVisible] = React.useState(false);
  const [modalHeader, setModalHeader] = React.useState('');
  const [modalDesc, setModalDesc] = React.useState('');

  const scanner = useRef();

  useEffect(() => {
    if (isBarcodeRead) {
      // console.log('in change screen');
      setFlash(false);
      navigation.navigate('selfie', {
        ...route.params,
        qrVal: barcodeValue,
      });
    }
  }, [barcodeValue, isBarcodeRead, navigation, route.params]);

  useEffect(() => {
    return () => {
      // console.log('Bye Camera');
      setCameraVisible(false);
    };
  }, []);


  const readBarcode = ({barcodes}) => {
    if (!isBarcodeRead) {
      var horizontal =
        barcodes[0].bounds.size.width + barcodes[0].bounds.origin.x;
      var vertical =
        barcodes[0].bounds.size.height + barcodes[0].bounds.origin.y;
      if (
        horizontal >= bound.x &&
        horizontal <= bound.x + bound.width &&
        vertical >= bound.y &&
        vertical <= bound.y + bound.height
      ) {
        // console.log(barcodes[0].type);
        checkQRInForm(barcodes[0].data);
        // console.log('after check');
      }
    }
  };

  const checkQRInForm = (barcodes) => {
    // TODO : check QR code value is valid for the app
    // TODO : makes some pattern of QR code that ensure this is our qr code. If yes go to next screen, If no return to home.
    // Or transform data that read from QR code to new data that showing real seat number. If success go to next screen, If no return to home.
    if (isBarcodeRead) {
      return;
    }
    // console.log(`${API_URL}/bus/validate-seat`);
    axios({
      method: 'post',
      url: `${API_URL}/bus/validate-seat`,
      data: {
        busId: route.params.busNo,
        seatId: barcodes,
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    })
    .then((res) => {
      // console.log('In then: ', res);
      setBarcodeValue(barcodes);
      Vibration.vibrate();
    })
    .catch((err) => {
      // console.log('In err: ', err);
      setCameraVisible(false);
      setModalHeader('ข้อผิดพลาด');
      if (err.response.status === 404) {
        setModalDesc('ไม่พบรถบัสนี้ในระบบ');
      } else if (err.response.status === 401 || err.response.status === 400) {
        setModalDesc('กรุณาสเเกน QR Code ที่ถูกต้อง');
      } else {
        setModalDesc('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }
      setModalVisible(true);
    });
    setIsBarcodeRead(true);
  };

  const toggleFlash = () => {
    setFlash(!flash);
  };

  const onLayoutMeasuredHandler = (e) => {
    // console.log(JSON.stringify(e));
    setBound(e.nativeEvent.layout);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#28496E" animated={true} />
      {cameraVisible &&
        <View>
          <View
          style={[
            styles.flashIconContainer,
            {
              backgroundColor: flash
                ? 'rgba(255, 255, 255,0.4)'
                : 'rgba(0, 0, 0, 0.3)',
            },
          ]}>
          <Icon
            name={flash ? 'flash-sharp' : 'flash-outline'}
            size={hp(4.4)}
            solid
            style={{textAlign: 'center', color: 'white', padding: 5}}
            onPress={() => toggleFlash()}
          />
          </View>
          <View style={styles.contentContainer}>
            <Text style={styles.contentText}>
              โปรดวาง QR Code ตำเเหน่งที่นั่ง{'\n'}ไว้ในพื้นที่ที่กำหนด
            </Text>
          </View>
        </View>
      }
      {cameraVisible ? (
        <RNCamera
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
          ref={scanner}
          type={RNCamera.Constants.Type.back}
          captureAudio={false}
          flashMode={
            flash
              ? RNCamera.Constants.FlashMode.torch
              : RNCamera.Constants.FlashMode.off
          }
          onGoogleVisionBarcodesDetected={readBarcode}
          googleVisionBarcodeType={
            RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE
          }
          pendingAuthorizationView={<ActivityIndicator size={'large'} />}>
          <BarcodeMask
            width={250}
            height={250}
            edgeColor="#62B1F6"
            showAnimatedLine={true}
            onLayoutMeasured={onLayoutMeasuredHandler}
          />
        </RNCamera>
      ) : null}
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
                        navigation.navigate('selectMode');
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
  buttonText: {
    textAlign: 'center',
    fontFamily: 'Kanit-Bold',
    fontSize: hp(2.8),
    color: 'white',
  },
  container: {
    backgroundColor: '#28496E',
    width: wp('100%'),
    height: hp('100%'),
  },
  flashIconContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: hp('72.5%'),
    width: 45,
    height: 45,
    zIndex: 1,
    borderRadius: 100,
    borderColor: 'white',
  },
  contentContainer: {
    position: 'absolute',
    zIndex: 1,
    width: '70%',
    top: hp('10%'),
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    paddingVertical: 20,
    alignSelf: 'center',
  },
  contentText: {
    fontSize: hp(2),
    textAlign: 'center',
    color: 'white',
    fontFamily: 'Kanit-Regular',
  },
});

export default QRCodeScreen;
