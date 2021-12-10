/* eslint-disable handle-callback-err */
/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {SafeAreaView,
    View,
    Text,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    TouchableHighlight,
    Image,
} from 'react-native';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';
import SearchBar from './components/SearchBar';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import {API_KEY, API_URL} from '@env';
const axios = require('axios');

const FindFriendScreen = ({route}) => {

    const navigation = useNavigation();
    const [isModalVisible, setModalVisible] = useState(false);
    const [searchData, setSearchData] = useState({});
    const [imageToShow, setImageToShow] = useState({});
    const [firstTime, setFirstTime] = useState(true);
    const [founded, setFounded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [friendID, setFriendID] = useState('');

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
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
            if (id_person === route.params.masterID) { // your self id case
                setIsLoading(false);
                setFounded(false);
            } else { // founded valid id
                requestProfileImage(id_person);
                setIsLoading(false);
                setFounded(true);
                setSearchData(res.data);
            }
        }).catch(err => { // id not found (404) case
            // console.log(err);
            setIsLoading(false);
            setFounded(false);
        });
    }, [requestProfileImage, route.params.masterID]);

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
          if (err.response.status) {
            setImageToShow({
              uri: 'user',
              cache: 'force-cache',
            });
          }
        });
    }, []);

    const updateSearch = (value) => {
        setFriendID(value);
        setIsLoading(true);
        // TODO search algorithms
        requestProfile(value);
        if (firstTime) {
            setFirstTime(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="white" animated={true} />
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>กรอกรหัสพนักงาน</Text>
            </View>
            <SearchBar
                updateSearch={updateSearch}
            />
            <View style={styles.resultContainer}>
                {isLoading && <ActivityIndicator size="large" color="#28496E" />}
                {(!isLoading && !founded && firstTime) && null}
                {(!isLoading && founded) &&
                    <View style={styles.resultBox}>
                        <Image
                            source={imageToShow}
                            resizeMethod={'scale'}
                            resizeMode={'cover'}
                            fadeDuration={100}
                            style={styles.profileImg}
                        />
                        <Text style={styles.resultText}>{`คุณ ${searchData.name}`}</Text>
                        <TouchableOpacity style={styles.button} onPress={() => toggleModal()}>
                            <Text style={styles.buttonText}>ต่อไป</Text>
                        </TouchableOpacity>
                    </View>
                }
                {
                    (!isLoading && !founded && !firstTime) &&
                    <View style={styles.resultBox}>
                        <Icon
                            name="md-alert-circle"
                            size={hp(12)}
                            solid
                            style={styles.alertIcon}
                        />
                        <Text style={styles.resultFailedText}>
                            {friendID === route.params.masterID
                            ? 'ไม่สามารถเช็คอินให้รหัสของตัวเองได้'
                            : 'ไม่พบข้อมูลของรหัสพนักงานนี้'}
                        </Text>
                    </View>
                }
            </View>
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
                        <Text style={styles.modalHeaderText}>ยืนยันการเช็คอิน</Text>
                    </View>
                    <View style={styles.modalContentContainer}>
                        <Text style={styles.modalContent}>{`ยืนยันที่จะเช็คอินให้${'\n'}คุณ ${searchData.name}${'\n'}ใช่หรือไม่?`}</Text>
                    </View>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setModalVisible(false);
                                navigation.navigate('numBus', {id: friendID, name: searchData.name});
                            }}
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
        flex: 0.7,
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
    profileImg: {
        width: wp('24%'),
        height: wp('24%'),
        borderRadius: Math.round(wp(100) + hp(100)) / 2,
        // backgroundColor: 'black',
        overflow: 'hidden',
    },
    resultBox: {
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(0,0,0,0.2)',
        alignItems: 'center',
        justifyContent: 'space-evenly',
    },
    resultText: {
        fontSize: hp(2.3),
        fontFamily: 'Kanit-Regular',
        color: 'black',
    },
    resultFailedText: {
        fontSize: hp(2.3),
        fontFamily: 'Kanit-Regular',
        color: '#C4C4C4',
    },
    resultContainer: {
        width: wp('100%'),
        height: hp('30%'),
        // backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertIcon: {
        color: '#C4C4C4',
    },
    container: {
        flex: 1,
        width: wp('100%'),
        height: hp('100%'),
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    button: {
        width: wp('35%'),
        height: hp('6%'),
        backgroundColor: '#28496E',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
    },
    buttonText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Bold',
        fontSize: hp(2.8),
        color: 'white',
    },
    headerContainer: {
        marginTop: hp('10%'),
        marginBottom: hp('3%'),
    },
    headerText: {
        textAlign: 'center',
        fontFamily: 'Kanit-Bold',
        fontSize: hp(4.55),
        color: '#29496F',
    },
  });

export default FindFriendScreen;
