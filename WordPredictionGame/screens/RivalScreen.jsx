import { StyleSheet, View, TextInput, Keyboard, Dimensions, Text } from 'react-native';
import React, { useRef, useState, useEffect } from 'react'
import { useSocket } from '../context/SocketContext';

const RivalScreen = ({navigation,route}) => {
    const socket = useSocket();
    const gameLeng = 4;
    const rivalData = route.params?.rivalData
    // const currentEmail = route.params?.currentEmail;
    // const opponentEmail = route.params?.opponentEmail;
    const currentEmail = 'cem5@gmail.com'
    const opponentEmail = 'cem6@gmail.com'
    const inputsArraySample = route.params?.inputsArray
    const colorsArraySample = route.params?.colorsArray
    const [inputs, setInputs] = useState(Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => '')));
    const [cellColors, setCellColors] = useState(Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => 'white')));
    let tmpInput = [[]]
    let rowInput = ['A','A','A','A','A']
    tmpInput.push(rowInput)
    tmpInput.push(rowInput)
    tmpInput.push(rowInput)
    tmpInput.push(rowInput)
    tmpInput.push(rowInput)
    let tmpCellColors = [[]]
    let tmpRowCellColors = ['lightgreen','lightgreen','lightgreen','lightgreen','lightgreen']
    tmpCellColors.push(tmpRowCellColors);
    tmpCellColors.push(tmpRowCellColors);
    tmpCellColors.push(tmpRowCellColors);
    tmpCellColors.push(tmpRowCellColors);
    tmpCellColors.push(tmpRowCellColors);
    const screenWidth = Dimensions.get('window').width * 0.9 * 0.94;
    const totalMargin = gameLeng * 2 * 2; // her bir kutucuk için 2 piksel margin, iki taraf için
    const boxWidth = (screenWidth - totalMargin) / gameLeng; // Her bir kutucuğun genişliği
    const marginVerticalVal = gameLeng * 0.4; // Dinamik marginVertical değeri

    useEffect(() => {
        setInputs(rivalData.inputArray)
        setCellColors(rivalData.colorArray)
      return () => {
      }
    }, [])
    
    // socket.on('SetRivalScreenDatas', ({inputsArray,colorsArray}) => {
    //     // setInputs(inputsArray)
    //     // setCellColors(colorsArray)
    //     navigation.navigate('',)
    // })

    const renderMatrix = () => {
        return inputs.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, { marginVertical: marginVerticalVal }]}>
                {row.map((value, columnIndex) => (
                    <TextInput
                        key={rowIndex-columnIndex}
                        style={[styles.box, {width: boxWidth, height: boxWidth, backgroundColor: cellColors[rowIndex][columnIndex] }]}
                        // onChangeText={(text) => handleTextChange(text, rowIndex, columnIndex)}
                        value={value}
                        // ref={(el) => (inputRefs.current[rowIndex][columnIndex] = el)}
                        // maxLength={1}
                        // autoCapitalize="characters"
                        autoCorrect={false}
                        editable={false}
                    />
                ))}
            </View>
        ));
    };


  return (
    <View style={styles.container}>
            <View style={styles.card}>
                {renderMatrix()}
            </View>
        </View>
  );
}

export default RivalScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#141414',
    },
    card: {
        width: '90%',
        height: 800,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 40,
        padding: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    box: {
        width: 50,
        height: 50,
        borderWidth: 1,
        borderRadius: 14,
        borderColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        margin: 2,
        backgroundColor: 'white',
    },
});