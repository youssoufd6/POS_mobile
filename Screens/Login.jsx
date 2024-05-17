import React, { useEffect, useState } from 'react';
import { Text, View,Keyboard,TextInput, TouchableOpacity, Image, ActivityIndicator,ToastAndroid, BackHandler, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import tw from 'twrnc';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../composants/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BaseApi } from '../BaseApi/BaseApi';
import axios from 'axios';
import { UpdateAndSelectDatas } from '../composants/UpdateAndSelectDatas';
import { UpdateVentes } from '../composants/UpdateVentes';



export const Login = () =>{

    //etats
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [erreur, setErreur] = useState(null);
    const [loading, setLoading] = useState(false);
    const { isLoggedIn, setIsLoggedIn } = useAuth(); 
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const navigation = useNavigation();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

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

    //comportements
    
      const handleLogin = async () => {
        try{
          setLoading(true);
          const response = await axios.post(BaseApi.pos+'/api/login_check',
          {
            username: username,
            password: password
          })
          if(response.data.token){
            const token = response.data.token
            const id = response.data.id
            const firstName = response.data.firstName
            const lastName = response.data.lastName
            await AsyncStorage.setItem('token',token);
            await AsyncStorage.setItem('id', id.toString());
            await AsyncStorage.setItem('firstName', firstName);
            await AsyncStorage.setItem('lastName', lastName);
            UpdateVentes.update(token)
            UpdateAndSelectDatas.fetchCategories(token);
            UpdateAndSelectDatas.fetchCategories(token);
            
             setIsLoggedIn(true);
            //console.log(id,lastName,firstName)
             navigation.navigate('vente')
          }
           
         
  
        }
        catch(error){
          if(error.message.includes('Network')){
            setErreur(`Probleme de connection au serveur verifiez votre forfait internet`)
          }else{
            setErreur(`identifiants invalides`)
          }
            
        }
        setLoading(false);
        
      }
    
      
    
     

    //affichage

    return (
        <View style={tw`bg-white flex-1 items-center justify-center`}>
         
          <View style={tw` max-w-xl w-full py-4 px-4 rounded-lg shadow-md`}>
            <Image
              source={require('../assets/aizeC.jpeg')}
              style={tw`w-20 h-20 mb-6 mx-auto rounded-full`}
            />
            <Text style={tw`text-center text-2xl mb-6 font-bold uppercase`}>Connexion</Text>
            <View style={tw`mb-4`}>
              <TextInput
                style={tw`w-full text-lg px-5 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500`}
                placeholder="Votre nom d'utilisateur ou adresse email"
                value={username}
                keyboardType='default'
                onChangeText={(text) => setUsername(text)}
              />
            </View>
            <View style={tw`mb-4`}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={tw`flex-1 text-lg px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-500`}
                  placeholder="Mot de passe"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={(text) => setPassword(text)}
                />
                <TouchableOpacity style={tw`absolute ml-127`} onPress={togglePasswordVisibility}>
                  <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={20} color="#000" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={tw`mb-4`}>
              <TouchableOpacity
                style={tw`w-full bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:shadow-outline-orange active:bg-orange-800`}
                onPress={()=>handleLogin()}
              >
                <Text style={tw`text-center text-white font-bold text-lg uppercase`}>
                  CONNEXION
                </Text>
              </TouchableOpacity>
              {erreur && (
                <Text style={tw`bg-red-500 p-1 mt-2 text-center text-white font-bold`}>
                  {erreur}
                </Text>
              )}
            </View>
           

            

          </View>
          {loading && (
            <View style={tw`absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-gray-900 bg-opacity-50`}>
              <ActivityIndicator size="large" color="#366948"  />
              <Text style={tw`text-green-700`}>Patientez...</Text>
            </View>
          )}
        </View>
      );
    

}