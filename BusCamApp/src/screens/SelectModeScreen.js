/* eslint-disable handle-callback-err */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {SafeAreaView,
  Text,
  StatusBar,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  BackHandler,
  PermissionsAndroid,
  TouchableHighlight} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
import Fontisto from 'react-native-vector-icons/Fontisto';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import AsyncStorage from '@react-native-community/async-storage';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import RNFS from 'react-native-fs';
var FormData = require('form-data');
import {API_KEY, API_URL} from '@env';
const axios = require('axios');


const USER_KEY = '@key_user';
const LOGIN_KEY = '@key_state';


const SelectModeScreen = ({navigation}) => {

    const [profile, setProfile] = React.useState({});
    const [imageToShow, setImageToShow] = React.useState({});
    const [id, setID] = React.useState(''); // use to request profile from server
    const [isModalVisible, setModalVisible] = React.useState(false);

    const [isModalCautionVisible, setModalCautionVisible] = React.useState(false);
    const [modalCautionHeader, setModalCautionHeader] = React.useState('');
    const [modalCautionDesc, setModalCautionDesc] = React.useState('');

    const [isModalPickerVisible, setModalPickerVisible] = React.useState(false);

    const logOutHandler = React.useCallback(async () => {
      const keys = [USER_KEY, LOGIN_KEY];
      try {
        await AsyncStorage.multiRemove(keys);
        setModalVisible(false);
        navigation.navigate('logIn');
      } catch (e) {
        // console.log(e);
      }
    }, [navigation]);

    const readKey = async () => {

        await AsyncStorage.getItem(USER_KEY)
        .then((result) => {
          // console.log(result);
          setID(result);
          requestProfile(result);
          requestProfileImage(result);
        })
        .catch(err => {
          // console.log(err);
        });
    };

    const requestProfile = React.useCallback((id_person) => {
      // console.log(`${API_URL}/emp/get/${id_person}`);
      // TODO : use id to request profile (name, pic) from server
      axios.get(`${API_URL}/emp/get/${id_person}`,
          {
            params: {
              id: id_person,
            },
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
      ).then(res => {
          setProfile(res.data);
      }).catch(err => {
          // console.log(err);
          setModalCautionHeader('ข้อผิดพลาด');
          setModalCautionDesc('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
          setModalCautionVisible(true);
      });
    }, []);

    const requestProfileImage = React.useCallback((id_person) => {
        axios.get(`${API_URL}/emp/profile-image/${id_person}`,
        {
          params: {
            id: id_person,
          },
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        })
        .then(res => {
            setImageToShow({
              uri: `${API_URL}/emp/profile-image/${id_person}?random=${Math.floor(Math.random() * 50) + 1}`,
              method: 'GET',
              headers: {
                Authorization: `Bearer ${API_KEY}`,
              },
              cache: 'force-cache',
            });
        })
        .catch(err => {
          if (err.response.status){
            setImageToShow({
              uri: 'user',
              cache: 'force-cache',
            });
          }
        });
    }, []);

    React.useEffect(() => {
      BackHandler.addEventListener('hardwareBackPress', () => true);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', () => true);
    }, []);

    React.useState(() => {
      readKey();
    }, []);

    const setProfilePictureInServer = React.useCallback(async (uri) => {
      // TODO : use id to set profile image in the server
      const image = {
        uri: uri,
        type: 'image/jpeg',
        name: `${id}-profile.jpg`,
      };
      const imgBody = new FormData();
      imgBody.append('id', id);
      imgBody.append('image', image);
      await axios({
        method: 'put',
        url: `${API_URL}/emp/profile-picture/change`,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${API_KEY}`,
        },
        data: imgBody,
      }).then((res) => {
        requestProfile(id);
        requestProfileImage(id);
      })
      .catch(err => {
        // console.log(err);
        setModalCautionHeader('ข้อผิดพลาด');
        setModalCautionDesc('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
        setModalCautionVisible(true);
      });
    }, [id, requestProfile, requestProfileImage]);

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

    const captureImage = React.useCallback(async () => {
      setModalPickerVisible(false);
      let options = {
        mediaType: 'photo',
        maxWidth: 350,
        maxHeight: 350,
        cameraType: 'front',
        quality: 1,
        saveToPhotos: false,
      };
      let isCameraPermitted = await requestCameraPermission();
      if (isCameraPermitted) {
        launchCamera(options, async (response) => {
          if (response.didCancel) {
            return;
          } else if (response.errorCode === 'camera_unavailable') {
            setModalCautionHeader('ข้อผิดพลาด');
            setModalCautionDesc('ไม่พบแอปพลิเคชันกล้องในอุปกรณ์นี้');
            setModalCautionVisible(true);
            return;
          } else if (response.errorCode === 'permission') {
            setModalCautionHeader('ข้อผิดพลาด');
            setModalCautionDesc('โปรดอนุญาตให้แอปเข้าถึงกล้อง');
            setModalCautionVisible(true);
            return;
          } else if (response.errorCode === 'others') {
            setModalCautionHeader('ข้อผิดพลาด');
            setModalCautionDesc(response.errorMessage);
            setModalCautionVisible(true);
            return;
          }
          // setImageToShow(`data:image/png;base64,${response.assets[0].base64}`);
          await setProfilePictureInServer(response.assets[0].uri);
          RNFS.unlink(response.assets[0].uri);
        });
      }
    }, [setProfilePictureInServer]);

      const chooseFile = React.useCallback(async () => {
        let options = {
          mediaType: 'photo',
          maxWidth: 350,
          maxHeight: 350,
          quality: 1,
          saveToPhotos: false,
        };
        launchImageLibrary(options, async (response) => {

          if (response.didCancel) {
            setModalPickerVisible(false);
            return;
          } else if (response.errorCode === 'camera_unavailable') {
            setModalCautionHeader('ข้อผิดพลาด');
            setModalCautionDesc('ไม่พบแอปพลิเคชันกล้องในอุปกรณ์นี้');
            setModalCautionVisible(true);
            return;
          } else if (response.errorCode === 'permission') {
            setModalCautionHeader('ข้อผิดพลาด');
            setModalCautionDesc('โปรดอนุญาตให้แอปเข้าถึงกล้อง');
            setModalCautionVisible(true);
            return;
          } else if (response.errorCode === 'others') {
            setModalCautionHeader('ข้อผิดพลาด');
            setModalCautionDesc(response.errorMessage);
            setModalCautionVisible(true);
            return;
          }
          // setImageToShow(`data:image/png;base64,${response.assets[0].base64}`);
          await setProfilePictureInServer(response.assets[0].uri);
          RNFS.unlink(response.assets[0].uri);
          setModalPickerVisible(false);
        });
      }, [setProfilePictureInServer]);

    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          backgroundColor: '#29496E',
          width: wp('100%'),
          height: hp('100%'),
        }}
      >
        <StatusBar backgroundColor={isModalPickerVisible ? 'rgba(0,0,0,0.5)' : 'white'} />
        <View style={styles.oval}/>
        <View style={styles.profileContainer}>
          <MaterialIcon
             name="logout"
              size={hp(3.8)}
              onPress={() => setModalVisible(true)}
              solid
              style={{color: '#29496E',marginTop: hp(3), marginLeft: wp(85), width: wp(8)}}
          />
          <TouchableOpacity
            style={[styles.profileImg,{top: hp(7), left: wp(10)}]}
            onPress={() => setModalPickerVisible(true)}
            activeOpacity={1}
          >
            <View style={[styles.profileImg, {flex: 1}]}>
              <Image
                source={imageToShow}
                resizeMethod={'scale'}
                resizeMode={'cover'}
                fadeDuration={100}
                style={{flex: 1}}
              />
            </View>
          </TouchableOpacity>


          <View style={styles.helloContainer}>
            <Text style={styles.helloText}>สวัสดี</Text>
            <Text style={styles.helloText}>{`คุณ ${profile.name}`}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <View style={{marginBottom: hp('3%')}}>
            <Text style={{fontFamily: 'Kanit-Medium', fontSize: hp(3.6), color: 'white', textAlign: 'center'}}>เลือกโหมดในการเช็คอิน</Text>
          </View>
          <TouchableOpacity
            style={[{backgroundColor: '#A1E5F8'}, styles.button]}
            onPress={() => {
              navigation.navigate('numBus', {id: id, name: profile.name});
            }}
            activeOpacity={0.5}
            underlayColor={'#A1E5F8'}
          >
            <Fontisto
              name="person"
              size={hp(4.4)}
              solid
              style={{color: 'black', paddingRight: 15}}
            />
            <Text style={{fontSize: hp(3.8), color: 'black', fontFamily: 'Kanit-Regular'}}>
              เช็คอินให้ตัวเอง
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[{backgroundColor: '#F8BD7F'}, styles.button]}
            onPress={() => {
              navigation.navigate('findFriend', {masterID: id});
            }}
            activeOpacity={0.5}
            underlayColor={'#F8BD7F'}
          >
          <View style={{flexDirection: 'row', marginRight: wp('5%')}}>
            <Fontisto
              name="persons"
              size={hp(4.4)}
              solid
              style={{color: 'black', paddingRight: 15}}
            />
            <Text style={{fontSize: hp(3.8), color: 'black', fontFamily: 'Kanit-Regular'}}>
              เช็คอินให้ผู้อื่น
            </Text>
          </View>

          </TouchableOpacity>
        </View>

        {/* {Logout modal} */}
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
                    <Text style={styles.modalHeaderText}>ยืนยันการออกจากระบบ</Text>
                </View>
                <View style={styles.modalContentContainer}>
                    <Text style={styles.modalContent}>ยืนยันที่จะออกจากระบบหรือไม่?</Text>
                </View>
                <View style={styles.modalButtonContainer}>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={logOutHandler}
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

        {/* {Caution modal} */}
        <Modal
            isVisible={isModalCautionVisible}
            useNativeDriver={true}
            hideModalContentWhileAnimating={true}
            animationIn={'zoomIn'}
            animationOut={'zoomOut'}
            hasBackdrop={false}
            style={styles.modal}
        >
            <View style={[styles.modalContainer, {height: hp(30)}]}>
                <View style={[styles.modalHeader, {marginTop: hp(15)}]}>
                    <Text style={styles.modalHeaderText}>{modalCautionHeader}</Text>
                </View>
                <View style={[styles.modalContentContainer, {marginTop: hp(15)}]}>
                    <Text style={styles.modalContent}>{modalCautionDesc}</Text>
                </View>
                <View style={[styles.buttonContainer, {marginTop: hp(15)}]}>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => {
                          setModalCautionVisible(false);
                        }}
                    >
                            <Text style={styles.buttonText}>ตกลง</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </Modal>

        {/* {Image Picker modal} */}
        <Modal
          isVisible={isModalPickerVisible}
          onBackdropPress={() => setModalPickerVisible(false)}
          onSwipeComplete={() => setModalPickerVisible(false)}
          useNativeDriver={true}
          swipeDirection={'down'}
          backdropOpacity={0.5}
          propagateSwipe={true}
          animationIn={'zoomIn'}
          animationOut={'zoomOut'}
          hasBackdrop={true}
          style={styles.modal}
        >
            <View style={[styles.modalContainer, {height: hp('23%')}]}>
                <View style={[styles.modalHeader, {borderBottomWidth: 1, borderBottomColor: '#E4E4E4', height: '30%'}]}>
                    <Text style={styles.modalHeaderText}>เปลี่ยนรูปโปรไฟล์</Text>
                </View>
                <View style={[styles.modalContentContainer, {flexDirection: 'row', justifyContent: 'space-around', width: '100%'}]}>
                    <TouchableOpacity onPress={captureImage}>
                      <View>
                        <MaterialIcon
                          name="camera-alt"
                          size={hp(5)}
                          solid
                          style={{
                            color: '#28496E',
                            textAlign: 'center',
                          }}
                        />
                        <Text style={styles.modalContent}>ถ่ายรูป</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={chooseFile}>
                      <View>
                        <MaterialIcon
                            name="photo-album"
                            size={hp(5)}
                            solid
                            style={{
                              color: '#28496E',
                              textAlign: 'center',
                            }}
                          />
                        <Text style={styles.modalContent}>อัลบั้มรูป</Text>
                      </View>
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
  button: {
    flexDirection: 'row',
    width: wp('80%'),
    height: hp('15%'),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('5%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.71,
    shadowRadius: 6.27,
    elevation: 15,
  },
  buttonContainer: {
    marginBottom: hp('15%'),
  },
  oval: {
    width: wp('55%'),
    height: hp('55%'),
    borderRadius: 100,
    position: 'absolute',
    top: hp(-30),
    backgroundColor: 'white',
    transform: [{ scaleX: 2 }],
    zIndex: -1,
  },
  profileImg: {
    width: wp(22),
    height: wp(22),
    borderRadius: Math.round(wp(100) + hp(100)) / 2,
    // backgroundColor: 'black',
    overflow: 'hidden',
    position: 'absolute',
    top: hp(0),
    left: wp(0),
  },
  profileContainer: {
    width: wp('100%'),
    height: hp('25%'),
    position: 'absolute',
    top: hp(0),
    // backgroundColor: 'rgba(255,255,0,0.4)',
  },
  helloContainer: {
    // backgroundColor: 'green',
    position: 'absolute',
    top: hp('10%'),
    left: wp('35%'),
  },
  helloText: {
    fontFamily: 'Kanit-Light',
    fontSize: hp(2.55),
  },
});

export default SelectModeScreen;
