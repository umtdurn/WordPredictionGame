import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useSocket } from '../context/SocketContext';

const ResultScreen = ({ navigation, route }) => {
    // const { playerOne, playerTwo } = route.params;
    const [playerOne, setPlayerOne] = useState({ email: '', time: 0, score: 0 });
    const [playerTwo, setPlayerTwo] = useState({ email: '', time: 0, score: 0 });
    const results           = route.params?.results         || [];
    const fromEmail         = route.params?.fromEmail       || "";
    const toEmail           = route.params?.toEmail         || "";
    const keyword           = route.params?.keyword         || "";
    const findKeyword       = route.params?.findKeyword     || "";
    let   inputPageMessage  = route.params?.message         || '';
    let   inputPageAlert    = route.params?.check           || false;
    const time              = route.params?.time            || 0;
    const score             = route.params?.score           || 0;
    const socket                          = useSocket();

    useEffect(() => {
        console.log(results);
        console.log(results[fromEmail]?.score + "score6");
        console.log(results[fromEmail] + "  keyword");
        console.log(results[toEmail] + "  keyword");
        console.log(findKeyword + " findKeyword");
        console.log(findKeyword + " findKeyword");
        if(inputPageAlert){
            console.log("");
            setPlayerOne({
                email: fromEmail,
                time: time,
                score: score
            });
            setPlayerTwo({
                email: toEmail,
                time: results[toEmail]?.time,
                score: results[toEmail]?.score
            });
        }
        else{

            setPlayerOne({
                email: fromEmail,
                time: results[fromEmail]?.time,
                score: results[fromEmail]?.score
            });
            setPlayerTwo({
                email: toEmail,
                time: results[toEmail]?.time,
                score: results[toEmail]?.score
            });
        }
    }, []);


  
    useEffect(() => {
      if(inputPageAlert){
        Alert.alert('Uyarı',inputPageMessage);
      }
  
      return () => {
        null
      }
  
    }, [inputPageAlert])
  

    const handleDuelRequest = () => {
        // Düello isteği gönder
        // Bu örnekte basit bir Alert ile simüle ediyorum
        Alert.alert("Düello Teklifi", "Rakibine düello teklifi gönderildi.", [
            { text: "Tamam" }
        ]);
        socket.emit('sendDuelRequest', { toUserId: toEmail, fromUserId: fromEmail });
    };

    const displayScoreDetails = (player) => {
        console.log('player valuesssss: ' + player.email + ' ' + player.time + ' ' + player.score)
        return (
            <View style={styles.scoreDetails}>
                <Text style={styles.text}>User : {player.email} </Text>
                <Text style={styles.text}>Tahmin Süresi: {player.time} saniye</Text>
                <Text style={styles.text}>Puan: {player.score}</Text>
                {/* Puan detayları burada listelenebilir */}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.playerSection}>
                <Text style={styles.header}>Oyuncu 1 (Sen)</Text>
                {displayScoreDetails(playerOne)}
            </View>
            <View style={styles.playerSection}>
                <Text style={styles.header}>Oyuncu 2 (Rakip)</Text>
                {displayScoreDetails(playerTwo)}
            </View>
            <Button title="Düello Teklifi Yap" onPress={handleDuelRequest} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    playerSection: {
        width: '100%',
        padding: 10,
        backgroundColor: '#ddd',
        marginBottom: 20,
        borderRadius: 10,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    text: {
        fontSize: 16,
    },
    scoreDetails: {
        backgroundColor: '#eee',
        padding: 8,
        borderRadius: 5,
    },
});

export default ResultScreen;
