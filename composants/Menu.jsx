import React, { useEffect, useState } from 'react';
import {  Text, View, ToastAndroid, TouchableOpacity, Image } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useMenu } from './MenuContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tw from 'twrnc';

export const Menu = () =>{

    const {menuActive, setMenuActive} = useMenu();
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null); // Pour stocker les données de l'utilisateur

    function handleOpen(){setMenuActive(!menuActive)};

    
    useEffect(() => {
        // Fonction pour charger les données de l'utilisateur depuis AsyncStorage
        const loadUserData = async () => {
            try {
                // Récupérer les données stockées dans AsyncStorage
                const id = await AsyncStorage.getItem('id');
                const firstName = await AsyncStorage.getItem('firstName');
                const lastName = await AsyncStorage.getItem('lastName');

                // Mettre à jour l'état avec les données récupérées
                setUserData({ id, firstName, lastName });
            } catch (error) {
                console.error("Une erreur s'est produite lors de la récupération des données de l'utilisateur :", error);
            }
        };

        // Appel de la fonction pour charger les données de l'utilisateur
        loadUserData();
    }, []); 

    return(
        <View className={menuActive ? "w-1/12 items-center h-full shadow-lg bg-white" : "w-2/12 h-full shadow-lg bg-white"}>
            <View className="flex-row">
            {!menuActive ? <Text className="text-center text-xs py-2 font-bold px-[23%] mt-4 border-b-2 border-gray-200 text-yellow-600"> AIZE-C </Text>: 
            <View className="text-center text-xs py-2 font-bold mx-auto mt-4 border border-gray-200 text-yellow-600"></View>}

                <TouchableOpacity className="mt-4 border-b-2 border-gray-200" onPress={()=>handleOpen(true)}>
                    <MaterialIcons name={menuActive ? 'dehaze' : 'zoom-in-map'} size={30} color={'#ED9E15'} />
                </TouchableOpacity>
            </View>
        <View className="px-[15%] mt-4 space-y-4">
            <TouchableOpacity className='flex-row items-center space-x-2' onPress={()=> navigation.navigate('vente')}>
                <MaterialIcons  name='home' size={25}  color="#ED9E15" />
                <Text>{!menuActive && 'Ventes'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex-row items-center space-x-2' onPress={()=> navigation.navigate('historique')} >
                <MaterialIcons   name='history' size={25}  color="#ED9E15" />
                <Text>{!menuActive && 'Historiques'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex-row items-center space-x-2' onPress={()=> navigation.navigate('aide')} >
                <MaterialIcons   name='help' size={25}  color="#ED9E15" />
                <Text>{!menuActive && 'Aide'}</Text>
            </TouchableOpacity>
            <TouchableOpacity className='flex-row items-center space-x-2' onPress={()=>{setIsLoggedIn(false), AsyncStorage.removeItem('token')}}>
                 <MaterialIcons name='logout' size={25}  color="#ED9E15" />
                 <Text> {!menuActive && 'Deconnexion'}</Text>
            </TouchableOpacity>
            
        </View>
        <View className={menuActive ? 'w-[52%] h-11 border-2 border-gray-300 absolute bottom-5 ml-2 rounded-xl': " w-[88%] h-11 border-2 border-gray-300 absolute bottom-5 ml-2 rounded-xl"} >
            <View className="flex-row fixed">
            <Image source={require('../assets/aizeC.jpeg')} className="w-8 h-8 rounded-full mt-1 ml-1 " />
               
                {menuActive ? '' : 
                <>
                <View className="flex-col">
                <Text className="text-[10px] ml-2 font-bold">{userData? `${userData.lastName} ${userData.firstName}` : ''}</Text>

                    <Text className="text-[10px] ml-2 from-neutral-400">vendeur</Text>
                </View>
                </>}
                
            
            </View>
        </View>
         {/** fin du menu */}
         
    </View>
    );
}