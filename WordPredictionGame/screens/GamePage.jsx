import React, { useRef, useState, useEffect } from 'react';
import {Modal, Text,Pressable, StyleSheet, View, TextInput, Keyboard, Dimensions } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../config/firebaseConfig'; 
const turkce = require("turkce"); // Kelime kontrolü için gerekli modül


const GamePage = ({ navigation,route }) => {
    const currentEmail = route.params?.currentEmail;
    const opponentEmail = route.params?.opponentEmail;
    // const secretWord = "AHMAT".slice(0, gameLeng).toUpperCase(); // Örnek kelime, dinamik olacak
    const gameLeng                      = route.params?.gameLeng || 5; // Varsayılan olarak 5
    const inputTimer                    = route.params?.timer || 30; // Varsayılan olarak 30
    const secretWord                    = route.params?.predictionKeyword || 'Bir ştres var. Kelime düzgün iletilemedi.'
    const fromEmail                     = route.params?.fromEmail;
    const toEmail                       = route.params?.opponentEmail;
    const [inputs, setInputs]           = useState(Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => '')));
    const [cellColors, setCellColors]   = useState(Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => 'white')));
    const inputRefs                     = useRef  (Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => null)));

    const screenWidth                   = Dimensions.get('window').width * 0.9 * 0.94;
    const totalMargin                   = gameLeng * 2 * 2; // her bir kutucuk için 2 piksel margin, iki taraf için
    const boxWidth                      = (screenWidth - totalMargin) / gameLeng; // Her bir kutucuğun genişliği
    const marginVerticalVal             = gameLeng * 0.4; // Dinamik marginVertical değeri

    const socket                          = useSocket();
    const [timer       , setTimer       ] = useState(60);
    const [warningTimer, setWarningTimer] = useState(10);
    const [currentRow  , setCurrentRow  ] = useState(0);
    const timerRef                        = useRef();
    const timerRef2                        = useRef();
    const warningRef                      = useRef();
    
    const [currentUser, setCurrentUser] = useState(null);
    const auth = getAuth(app);
    const [modalVisible, setModalVisible] = useState(false);
    const [gameState,setGameState] = useState(false);
    const [gameFinish,setGameFinish] = useState(false);

    const [startTime, setStartTime] = useState(null);
    let elapsedTime = 0;

    
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user); // Kullanıcıyı state'e kaydet
      });
      return unsubscribe; // Cleanup
    }, []);

    const handleExitConfirm = () => {
      // Oyundan çıkış işlemlerini burada yap
      setModalVisible(false);
      console.log("Oyundan çıkıldı ve oyuncu kaybetti.");
    };
  
    useEffect(() => {
      const handleWaitingAlert = ({message}) => {
          alert(message);
      };
     
  
      socket.on('getWaitingAlert', handleWaitingAlert);
  
      return () => {
          socket.off('getWaitingAlert', handleWaitingAlert);
      };
  }, [socket]);

    useEffect(() => {
      const handleStatusAlert = ({status}) => {
          setGameState(status);
          if (timerRef.current) clearInterval(timerRef.current); // Timer temizle
        if (warningRef.current) clearInterval(warningRef.current); // Warning timer temizle
      };
      
  
      socket.on('StatusAlert', handleStatusAlert);
  
      return () => {
          socket.off('StatusAlert', handleStatusAlert);
      };
  }, [socket]);
   // Ana zamanlayıcıyı başlat veya sıfırla
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(20);
    timerRef.current = setInterval(() => {
        setTimer(prevTimer => {
          elapsedTime = elapsedTime + 1;
            if (prevTimer === 1) {
                clearInterval(timerRef.current);
                startWarningTimer(); // Ana zamanlayıcı bittiğinde uyarı zamanlayıcısını başlat
                return 0;
            }
            return prevTimer - 1;
        });
    }, 1000);
  };
  
  // Uyarı zamanlayıcısını başlat
  const startWarningTimer = () => {
    if (warningRef.current) clearInterval(warningRef.current);
    setWarningTimer(10);
    warningRef.current = setInterval(() => {
        setWarningTimer(prevTimer => {
          elapsedTime = elapsedTime+1;
            if (prevTimer === 1) {
                clearInterval(warningRef.current);
                alert('Mağlup oldun! Hareket etmedin.');
                return 0;
            }
            return prevTimer - 1;
        });
    }, 1000);
  };
  
    // Kullanıcı her harf girdiğinde ana zamanlayıcıyı sıfırla
    useEffect(() => {
      if(!gameFinish){
        startTimer(); // Timer başlat
      }
      

      return () => {
        if (timerRef.current) clearInterval(timerRef.current); // Timer temizle
        if (warningRef.current) clearInterval(warningRef.current); // Warning timer temizle
      };
    }, [currentRow,socket,gameFinish]); // `currentRow` değiştiğinde bu useEffect tetiklenir.

    useEffect(() => {
        setInputs           (Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => '')));
        setCellColors       (Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => 'white')));
        inputRefs.current =  Array.from({ length: gameLeng }, () => Array.from({ length: gameLeng }, () => null));
    }, [gameLeng]);


    const handleTextChange = (text, rowIndex, columnIndex) => {
        const updatedInputs = inputs.map((row, rIndex) => 
          rIndex === rowIndex ? row.map((cell, cIndex) => 
            cIndex === columnIndex ? text.toUpperCase() : cell) : row);
        setInputs(updatedInputs);
      
        // Son sütunsa ve kullanıcı bir karakter girdiyse, tahmin değerlendir
        if (columnIndex === gameLeng - 1 && text) {

          (async () => {
            try {
              const sonuc = await turkce(updatedInputs[rowIndex].join('').toLowerCase());
              // console.log(sonuc);
              // console.log(updatedInputs[rowIndex].join(''));
              if(sonuc){
                evaluateGuess(updatedInputs[rowIndex].join(''), rowIndex);
                if(rowIndex !== gameLeng - 1) {
                      inputRefs.current[rowIndex + 1][0].focus();
                  }
              }
              else{
                alert("Lütfen geçerli bir kelime giriniz.");
                inputRefs.current[rowIndex][0].focus();
                updatedInputs[rowIndex]= Array.from({length: gameLeng}, () => '' );
                setInputs(updatedInputs);
                // console.log(inputs);
              }
            } catch (e) {
              console.error(e);
              alert("Geçerli bir kelime giriniz");
              inputRefs.current[rowIndex][0].focus();
              updatedInputs[rowIndex]= Array.from({length: gameLeng}, () => '' );
              setInputs(updatedInputs);
              // console.log(inputs);
            }
          })();
          
          
        } else if (text) {
                inputRefs.current[rowIndex][columnIndex + 1].focus();
            }

            socket.emit('UpdateArrays', {userEmail: currentEmail, inputArray: inputs, colorArray: cellColors})

      };



    // Tahmin değerlendirme fonksiyonu
const evaluateGuess = (guess, rowIndex) => {
    let newCellColors = [...cellColors]; // Mevcut renkleri kopyalayarak yeni bir dizi oluştur
    let solutionChars = [...secretWord]; // Çözüm kelimesinin karakterlerini bir diziye çevir
    let guessChars = [...guess]; // Tahminin karakterlerini bir diziye çevir
  
    // İlk olarak doğru konumdaki harfleri kontrol et ve işaretle
    guessChars.forEach((char, index) => {
      if (char === solutionChars[index]) {
        newCellColors[rowIndex][index] = 'lightgreen'; // Doğru konum
        solutionChars[index] = null; // İşlenen karakteri null yaparak çıkar
      }
    });
  
    // İkinci olarak, doğru harf ama yanlış konumdakileri kontrol et ve işaretle
    guessChars.forEach((char, index) => {
      if (solutionChars.includes(char) && newCellColors[rowIndex][index] !== 'lightgreen') {
        newCellColors[rowIndex][index] = 'yellow'; // Doğru harf, yanlış konum
        //TODO burada bir ştres olabilir. solutionChats.indexOf(char)
        //yerine solutionChars[index] = null yapılması gerekebilir. 
        solutionChars[solutionChars.indexOf(char)] = null; // İşlenen karakteri null yaparak çıkar
      }
    });
  
    // Mevcut satırdaki beyaz kalanları (işlenmemiş harfleri) belirle
    newCellColors[rowIndex].forEach((color, index) => {
      if (color !== 'lightgreen' && color !== 'yellow') {
        newCellColors[rowIndex][index] = 'lightgrey'; // Yanlış harf
      }
    });
  
    setCellColors(newCellColors); // Yeni renk durumunu güncelle
    if(newCellColors[rowIndex].filter( (x) => x === 'lightgreen' ).length === gameLeng){
      alert('Tebrikler! Kazandınız.');
      console.log('Abi geldiler abiiiiiiiiiiiiiiiiiiii: ' + currentUser)
      if(currentUser){
        console.log('Abi gittiler abiiiiiiiiiiiiiii: ' + toEmail)
        let score = gameLeng*10 + inputTimer;
        socket.emit("oyunuBitir",{winner: currentUser.email,loser: toEmail, findKeyword: secretWord.join(""),time:elapsedTime,score : score})
      }
      // navigation.navigate('GameOverScreen'); // Oyun sonu ekranına yönlendir
    }
      else if( rowIndex === gameLeng-1 && newCellColors[rowIndex].length === gameLeng){
      let green = newCellColors[rowIndex].filter( (x) => x === 'lightgreen' ).length;
      let yellow = newCellColors[rowIndex].filter( (x) => x === 'yellow' ).length;
      let score = green * 10 + yellow * 5 + inputTimer ;
      console.log( "Score: " + elapsedTime);
      // alert('oyun bitti bilemedin parlagkhkhh Puanın : ' + score);
      socket.emit("sendScore",{score: score, fromEmail: currentUser.email, toEmail: toEmail, findKeyword: secretWord.join(""),time:elapsedTime});
      setGameFinish(true);
    };
  };
  
  
    
    
    const renderMatrix = () => {
        return inputs.map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.row, { marginVertical: marginVerticalVal }]}>
                {row.map((value, columnIndex) => (
                    <TextInput
                        key={rowIndex-columnIndex}
                        style={[styles.box, { width: boxWidth, height: boxWidth, backgroundColor: cellColors[rowIndex][columnIndex] }]}
                        onChangeText={(text) => handleTextChange(text, rowIndex, columnIndex)}
                        value={value}
                        ref={(el) => (inputRefs.current[rowIndex][columnIndex] = el)}
                        maxLength={1}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        // onSubmitEditing={() => handleEnterPress(rowIndex)}
                    />
                ))}
    
            </View>
                
        ));
    };

    socket.on('GetGameDatas', ({currentEmail,opponentEmail}) => {
        console.log("kontrolkontrolkontrol")
        console.log(inputs)
        console.log(cellColors)
        setTimeout(() => {
            // 2 saniye sonra çalışacak kod
            console.log('Bu mesaj 2 saniye sonra görünecek.');
            socket.emit('ReturnedDatas', {inputsArray: inputs, colorsArray: cellColors, currentEmail: currentEmail, opponentEmail: opponentEmail})
          }, 2000);
        
    })

    const handleSeeRival = () => {
        // console.log('geldi geldi..!!')
        // console.log('currentdanklfmsa:current: ' + currentEmail)
        // console.log(opponentEmail)
        // socket.emit('GetOpponentArrays',{currentEmail: currentEmail, opponentEmail: opponentEmail});
        //*********************************************//
        socket.emit('GetRivalDatas', {requestByEmail: currentEmail, email: opponentEmail})
    }

    socket.on('RivalServerResponse', ({data}) => {
        navigation.navigate('Rival',{rivalData: data})
    })

    socket.on('SetRivalScreenDatas', ({inputsArray,colorsArray}) => {
        // setInputs(inputsArray)
        // setCellColors(colorsArray)
        navigation.navigate('Rival',{inputsArray: inputsArray, colorsArray: colorsArray})
    })

    return (
        <View style={styles.container}>
            
             <View style={styles.card}>
             <Pressable style={styles.opponentButton}>
                        <Text style={styles.opponentText}
                            // onPress={() => {navigation.navigate('Rival',{currentEmail: currentEmail, opponentEmail: opponentEmail})}}
                            onPress={handleSeeRival}
                        >Rakibi Gör</Text>
                </Pressable>

            <Text style={{color:"white"} }>Zaman: {timer}s</Text>
                    {timer === 0 && <Text style={{color:"white"} }>Uyarı! {warningTimer}s kaldı
            </Text>}
             <Pressable style={styles.buttonContainer} onPress={() => setModalVisible(true)} >
                <Text style={styles.buttonText}>Oyundan Çık</Text>
             </Pressable>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Oyundan çıkmanız halinde oyunu kaybedeceksiniz. Çıkmak istiyorsanız onay butonuna basınız.</Text>
            <View style={styles.buttonModal}>
              <Pressable title="Onayla" onPress={handleExitConfirm} >
                <Text style={styles.buttonText}>Onayla</Text>
              </Pressable>
              <Pressable title="Reddet" onPress={() => setModalVisible(false)} >
                <Text style={styles.buttonText}>Reddet</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
           
                {renderMatrix()}
            </View>
        </View>
    );
};

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
    opponentButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        height: 40,
        borderRadius: 10,
        position: 'absolute',
        top:36,
        right: 14,
        backgroundColor: 'red',
    },
    opponentContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '90%',
        marginTop: '30%',
        // backgroundColor: 'white',
    },
    opponentText: {
        color: 'white',
        fontWeight: '600'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      },
      modalText: {
        marginBottom: 15,
        textAlign: "center"
      },
      buttonContainer: {
            width: '100%',
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'white',
            borderWidth: 1,
            borderRadius: 10,
            marginVertical: 10
          },
          buttonModal: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%'
          },
          buttonText: {
            color: '#131313',
          },
});

export default GamePage;
