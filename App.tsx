/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  View,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';

import { Historique } from './Screens/Historique';
import { Login } from './Screens/Login';
import { Vente } from './Screens/vente';
import { MenuProvider, useMenu } from './composants/MenuContext';
import { ProductsManager } from './DataBase/ProductsManager';
import { CategoriesManager } from './DataBase/CategoriesManager';
import { CommandManager } from './DataBase/CommandManager';
import { AuthProvider, useAuth } from './composants/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PanierProvider } from './composants/PanierContext';
import { Splash } from './Screens/Splash';
import { Aide } from './Screens/Aide';



//ProductsManager.DropProducts()
//CategoriesManager.DropCategories()
//CommandManager.DropLigneCmd()
//CommandManager.DropCmd()
//CommandManager.DropPayements();
ProductsManager.creationProducts();
CategoriesManager.createCategories();
CommandManager.createTables();

   

function App(){

  const Stack = createNativeStackNavigator();
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const [token,setToken] = useState("");
  //const [categories,setCategories] = useState([]);

  useEffect(() => {
   
    const fetchData = async () => {
      try {
        const tk = await AsyncStorage.getItem('token');
        if (tk !== null) {
          setIsLoggedIn(true);
          //console.log(tk);
          //console.log(isLoggedIn);
          
          setToken(tk);
          
        } 
      } catch (error) {
          console.log('pas de token');
      }
    };

    fetchData();
   
  }, []);


  async function requestStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permission d\'accès au stockage externe',
          message: 'L\'application a besoin de votre permission pour accéder au stockage externe afin de sauvegarder des fichiers.',
          buttonPositive: 'OK',
        },
      );

    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
    }
  }

  //la demande de permission
  requestStoragePermission();
 

  return (
    <View style={{ flex: 1 }}>
      
      <NavigationContainer>
        <Stack.Navigator>
          {!isLoggedIn ?
          <>
          <Stack.Screen name="splash" component={Splash} options={{ headerShown: false }}/>
          <Stack.Screen name="vente" component={Vente} options={{ headerShown: false }}/>
          <Stack.Screen name="historique" component={Historique} options={{ headerShown: false }}/>
          <Stack.Screen name="aide" component={Aide} options={{ headerShown: false }}/>
          </>:
          <>
          <Stack.Screen name="splash" component={Splash} options={{ headerShown: false }}/>
          <Stack.Screen name="login" component={Login} options={{ headerShown: false }}/>
          </>}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
  
}
const AppWrapper = () => {
  return (
    <AuthProvider>  
      <MenuProvider>
        <PanierProvider>
            <App />
        </PanierProvider>
      </MenuProvider>
    </AuthProvider>
  );
};
export default AppWrapper;
