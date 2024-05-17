import React, { useEffect, useState } from 'react';
import {  BackHandler, ToastAndroid, View,Alert } from 'react-native';
import { Menu } from '../composants/Menu';
import { Panier } from '../composants/panier';
import ProductContainer from '../composants/ProductContainer';
import axios from 'axios';
import { BaseApi } from '../BaseApi/BaseApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommandManager } from '../DataBase/CommandManager';
import { UpdateVentes } from '../composants/UpdateVentes';
import {useNetInfo} from "@react-native-community/netinfo";
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../composants/AuthContext';
import tw from 'twrnc';

export const Vente = () => {
   
  //la demande pour quitter l'application lorsqu'on click sur le bouton retour
  useEffect(() => {
    const backAction = () => {
      Alert.alert("Sortie !!!", "êtes-vous sûr de vouloir quitter AIZE CONNECT ?", [
        {
          text: "NON",
          onPress: () => null,
          style: "cancel"
        },
        { text: "OUI", onPress: () => BackHandler.exitApp() }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);



return(
    <View style={tw`flex-1`}>
        <View style={tw`flex-1 flex-row`}>
        
        {/** le menu */}
        <Menu/>
          {/** la vente */}


                <ProductContainer />
                {/* La gestion du panier */}
                <Panier/>
           
        
          </View>
    </View>
);
    
}
