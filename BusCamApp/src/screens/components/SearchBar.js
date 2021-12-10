import React, {useState} from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
  } from 'react-native-responsive-screen';

const SearchBar = ({updateSearch, style}) => {
    const [query, setQuery] = useState();

    return (
        <View style={[styles.container, style]}>
            <View style={styles.vwPeople}>
                <Icon
                    name={'people'}
                    size={hp(6.35)}
                    solid
                    style={styles.icPeople}
                />
            </View>
            <View style={styles.searchContainer}>

                <TextInput
                    value={query}
                    placeholder="รหัสพนักงาน"
                    style={styles.textInput}
                    keyboardType={'numeric'}
                    maxLength={5}
                    returnKeyType={'search'}
                    onSubmitEditing={()=> updateSearch(query)}
                    onChangeText={(text) => {
                        setQuery(text);
                    }}
                />
                {
                    query ?
                        <TouchableOpacity
                            onPress={() => setQuery('')}
                            style={styles.vwClear}>
                                <Icon
                                    name={'ios-close-circle'}
                                    size={hp(2.55)}
                                    solid
                                    style={styles.icSearch}
                                />
                        </TouchableOpacity>
                        : <View style={styles.vwClear} />
                }
                <View style={styles.vwSearch}>
                    <Icon
                        name={'ios-search'}
                        size={hp(2.55)}
                        solid
                        style={styles.icSearch}
                        onPress={() => updateSearch(query)}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    vwClear: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        height: hp('10%'),
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Kanit-Medium',
        fontSize: hp(2.3),
    },
    vwSearch: {
        flex: 0.2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icSearch: {
        color: '#6C6C6C',
    },
    vwPeople: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'flex-start',
        // backgroundColor: 'red',
    },
    icPeople: {
        color: 'black',
    },
    searchContainer:
    {
        backgroundColor: '#E5E5E5',
        width: wp('70%'),
        height: hp('5%'),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5,
        paddingHorizontal: wp('2%'),
    },
    container: {
        width: wp('100%'),
        height: hp('10%'),
        flexDirection: 'row',
        justifyContent: 'center',
        // backgroundColor: 'green',
        alignItems: 'center',
    },
});

export default SearchBar;
