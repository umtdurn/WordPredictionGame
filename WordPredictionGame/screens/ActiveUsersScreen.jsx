import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import  useActiveUsers  from '../hooks/useActiveUsers'; // useActiveUsers hook'unun konumunu varsayıyorum

const ActiveUsersScreen = ({ navigation }) => {
  const activeUsers = useActiveUsers();

  return (
    <View style={styles.container}>
      <FlatList
        data={activeUsers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.username}>{item.username}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  userItem: {
    backgroundColor: '#f9c2ff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  username: {
    fontSize: 16,
  },
});

export default ActiveUsersScreen;