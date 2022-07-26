/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Alert
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import './global';
import "react-native-get-random-values"
import "@ethersproject/shims"
import {
  withWalletConnect,
  useWalletConnect,
} from "@walletconnect/react-native-dapp";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ETHERSCAN_API_KEY = '9Y2KT3A8CQNHUXXSFU72APFAYY55F4NRBW';

const App = (): JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const connector = useWalletConnect();
  const [chainId, setChainId] = useState(0);
  const [address, setAddress] = useState('');
  const [peerId, setPeerId] = useState('');
  const [balance, setBalance] = useState('0');
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    if (connector.connected) {
      setPeerId(connector.peerId);
      setAddress(connector.accounts[0]);
      setChainId(connector.chainId);
      fetch(`https://api.etherscan.io/api?module=account&action=balance&address=${connector.accounts[0]}&tag=latest&apikey=${ETHERSCAN_API_KEY}`)
        .then(async (res) => {
          const data = await res.json();
          if (data.message === "OK") {
            setBalance(data.result)
          } else {
            Alert.alert('Error', data.message);
          }
        })
        .catch((err) => {
          Alert.alert('Error', err.message);
        })
    }
  }, [connector])

  const onConnect = () => {
    connector.connect()
      .then((res) => {

      }).catch((err) => {
        Alert.alert('Error', err.message);
      })
  }

  const onDisconnect = () => {
    connector.killSession();
    setChainId(0)
    setAddress('')
    setPeerId('')
    setBalance('0')
  }

  const onShow = async () => {
    const myWallet = await AsyncStorage.getItem("myWallet");
    if (myWallet) {
      const walletData = JSON.parse(myWallet);
      setPeerId(walletData.peerId);
      setAddress(walletData.address);
      setChainId(walletData.chainId);
      setBalance(walletData.balance);
    } else {
      Alert.alert("Error", "There is no any stored data.")
    }
  }

  const onStore = () => {
    AsyncStorage.setItem("myWallet", JSON.stringify({
      chainId: chainId,
      address: address,
      peerId: peerId,
      balance: balance
    })).then(() => {
      Alert.alert("Success", "Successfully stored data")
    })
      .catch((err) => {
        Alert.alert('Error', err.message);
      })
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.container}>
        <View style={styles.body}>
          <Text>Chain ID: {chainId}</Text>
          <Text>Address: {address}</Text>
          <Text>ENS: {peerId}</Text>
          <Text>Balance: {balance} ETH</Text>
        </View>
        {!connector.connected ? (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnConnect} onPress={onConnect}>
              <Text style={styles.btnTxtConnect}>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnStore} onPress={onShow}>
              <Text style={styles.btnTxtConnect}>Show Stored Data</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnDisconnect} onPress={onDisconnect}>
              <Text style={styles.btnTxtConnect}>Disconnect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnStore} onPress={onStore}>
              <Text style={styles.btnTxtConnect}>Store Data</Text>
            </TouchableOpacity>
          </View>
        )}

      </View>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    width: '90%',
    height: 350,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: '5%'
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    resizeMode: 'contain'
  },
  btnConnect: {
    width: '90%',
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#27B023',
    marginBottom: 14
  },
  btnDisconnect: {
    width: '90%',
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#CF3939',
    marginBottom: 14
  },
  btnStore: {
    width: '90%',
    height: 46,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: '#3795CE',
  },
  btnTxtConnect: {
    color: '#FFFFFF'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: 'gray'
  }
});

export default withWalletConnect(App, {
  redirectUrl: 'yourappscheme://',
  storageOptions: {
    asyncStorage: AsyncStorage as any,
  },
});
