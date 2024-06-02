import { 
    StyleSheet, 
    Text, 
    View,
    TextInput,
    Dimensions,
    Pressable,
} from 'react-native'
import React, { useState, useRef, useEffect,  } from 'react'
import { useSocket } from '../context/SocketContext';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../config/firebaseConfig'; 

const turkce = require("turkce"); // Kelime kontrolü için gerekli modül

const InputForDynamicPage = ({navigation,route}) => {
    const gameLeng          = route.params?.gameLeng;
    const toEmail           = route.params?.toEmail;
    const [input, setInput] = useState(Array.from({length: gameLeng}, () => ''))
    const [timer, setTimer] = useState(60)
    const inputRefs         = useRef(Array.from({length: gameLeng}, () => null))
    const socket            = useSocket();
    const screenWidth       = Dimensions.get('window').width * 0.9 * 0.94;
    const totalMargin       = gameLeng * 2 * 2; // her bir kutucuk için 2 piksel margin, iki taraf için
    const boxWidth          = (screenWidth - totalMargin) / gameLeng; // Her bir kutucuğun genişliği
    const [findKeyword, setFindKeyword] = useState(""); 
    const [currentUser, setCurrentUser] = useState(null);
    const auth = getAuth(app);
    let tmpUserMail = '';
    const [infoMessage, setInfoMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            // console.log(user);
            tmpUserMail = user.email;
            setCurrentUser(user); // Kullanıcıyı state'e kaydet
        });
        return unsubscribe; // Cleanup
      }, [currentUser]);

      useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prevTimer => {
                if(prevTimer <= 1){
                    // console.log(currentUser)
                    socket.emit('CheckPlayers',{fromEmail: tmpUserMail});
                    // clearInterval(interval);
                    setShowMessage(false);
                    return 0; // Timer 0 veya daha küçük bir değere düşerse, 0'a sabitleyin ve interval'i durdurun.
                }
                return prevTimer - 1; // Aksi takdirde, timer'ı bir azaltın.
            });
        }, 1000);
    
        return () => {
            clearInterval(interval); // Cleanup fonksiyonu, component unmount olduğunda interval'i temizler.
        };
    }, [input]) // Dependency array'ini boş bırakarak, bu useEffect'i sadece component mount edildiğinde çalıştırın.
    
    useEffect(() => {
        const handleWinnerAlert = ({winner, loser,score, time,message}) => {
            console.log(winner);
            navigation.navigate('Result', {fromEmail: winner, toEmail: loser,score:score,message: message, check: true});
        };
        const handleLoserAlert = ({ winner, loser,score, time,message}) => {
            navigation.navigate('Result', {fromEmail: loser, toEmail: winner,score:score,message: message, check: true});
        };

        const handleGoToResults = ({results,fromEmail,toEmail}) => {
            console.log(results + "input ney laa");
            console.log(fromEmail + "input ney laa");
            console.log(toEmail + "input ney laa");
            navigation.navigate('Result', {results: results, fromEmail: fromEmail, toEmail: toEmail});
        };
    
        socket.on('WinnerAlert', handleWinnerAlert);
        socket.on('LoserAlert', handleLoserAlert);
        socket.on('goToResults', handleGoToResults);
    
        return () => {
            socket.off('WinnerAlert', handleWinnerAlert);
            socket.off('LoserAlert', handleLoserAlert);
        };
    }, [socket, navigation]);

    socket.on('NoInputAlert', ({message}) => {
        setInfoMessage(message);
        setShowMessage(true);
        setTimer(5);
    });

    useEffect(() => {
        if(input.length>0) {
          socket.on("getFindKeyword", ({ keyword }) => {
            setFindKeyword(keyword);
          });
        }

        return () => {
            socket.off('getFindKeyword');
          };
    }, [input]);

    useEffect(() => {

        if(input.length>0 && findKeyword>0) {

            console.log(findKeyword+ " AAAAAAAAAAAAAAAAAAAAAAAAAAAAA "+ input);
        // navigation.navigate("GamePage",{gameLeng : gameLeng})
        }    
    }, [input,findKeyword]);
    
    const validationKeyword = () => {
          // then
        //  turkce(input.join("").toLowerCase()).then(console.log).catch(console.error);
        // async / await
         (async () => {
           try {
             const sonuc = await turkce(input.join("").toLowerCase());
             console.log(sonuc);
             if(sonuc){
                 sendKeyword();
             }
             else{
                 setInfoMessage("Lütfen geçerli bir kelime giriniz.");
                 setShowMessage(true);
             }
           } catch (e) {
             console.error(e);
             alert("Geçerli bir kelime giriniz");

           }
         })();
        
    };

    const sendKeyword = () => {
        if(socket && input  && currentUser){
            // if(currentUser.email === 'cem6@gmail.com')
            // {
            //     toEmail = 'cem5@gmail.com'
            // }
            console.log(input);
            console.log('from email: ' + currentUser.email);
            console.log('to email: ' + toEmail);
            socket.emit("AddNewInput",{ keyword: input, toEmail: toEmail, fromEmail: currentUser.email });
            
        }
    }

    socket.on('GoGamePage', ({entriedInput, opponentInput, fromEmail, toEmail}) => {
        // console.log(fromEmail + ' email adresinden ' + toEmail + ' adresine ' + entriedInput + ' kelimesi gönderildi. Karşı tarafın kelimesi: ' + opponentInput);
        navigation.navigate('GamePage', {predictionKeyword: opponentInput, gameLeng: gameLeng, currentEmail: fromEmail, opponentEmail: toEmail,timer: timer});
    });

    const renderInput = () => {
        return (
            <View style={styles.card}>
            {
                input.map((value, index) => (
                    <TextInput
                        style={[{ width: boxWidth, height: boxWidth},styles.box]}
                        key={index} // Eksik olan kısım burasıydı, her TextInput elemanına bir key prop'u eklenmeli.
                        ref={el => inputRefs.current[index] = el} // Bu satırı TextInput'unuza odaklanmak için kullanabilirsiniz.
                        value={value}
                        onChangeText={text => {
                            const newInputs = [...input];
                            newInputs[index] = text;
                            setInput(newInputs);
                        }}
                    />
                ))
            }

           
            </View>
        );
    };

return (
    <View style={styles.container}>
        <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{timer}</Text>
        </View>
        {showMessage && (
                <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{infoMessage}</Text>
                </View>
            )}
        {renderInput()}
        <Pressable style={styles.button} onPress={() => validationKeyword()}>
                <Text style={styles.buttonText}>ONAYLA</Text>
        </Pressable>
    </View>
)
}

export default InputForDynamicPage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#131313'
    },
    card: {
        flexDirection: 'row',
        marginBottom: '70%',
        borderRadius: 10,   
        width: '90%',
        height: 70,
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: { 
        margin: 5,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'white',
        // width: 60,
        // height: 60,
        borderRadius: 10,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        borderWidth: 1,
        borderRadius: 10,
        marginVertical: 10
      },
      buttonText: {
        color: '#131313',
      },
      timerContainer: {
        width: '90%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 30
      },
      timerText: {
        color: 'white',
        fontSize: 30,
        textAlign: 'center'
      },
      messageBox: {
        padding: 10,
        marginVertical: 20,
        backgroundColor: 'yellow',
        borderRadius: 5
    },
    messageText: {
        color: 'black',
        textAlign: 'center'
    }
})