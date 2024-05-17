import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Menu } from '../composants/Menu';
import { useMenu } from '../composants/MenuContext';
import { CommandManager } from '../DataBase/CommandManager';
import { Recu } from '../composants/Recu';
import tw from 'twrnc';

export const Historique = () => {
    const { menuActive, setMenuActive } = useMenu();
    const [commandes, setCommandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commandeSelectionnee, setCommandeSelectionnee] = useState(null);
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
        CommandManager.SelectCmd()
        .then(cmd => {
            setCommandes(cmd);
            setLoading(false)
            
        })
        .catch(error => console.log(error));

    

    const handleClickCommande = (commande) => {
        setCommandeSelectionnee(commande);
    };


    return (
        <View className="flex-1 flex-row mr-3  bg-gray-200">
            <Menu />
            <View>
            
                <View className="flex flex-row ml-3 h-full">
                    <View className="w-4/12 bg-green-700 p-4 text-white my-1 ">
                        <View className="flex items-center justify-between mb-6">
                            <Text className="text-xl text-white font-bold">Reçus</Text>
                        </View>
                        <ScrollView className="space-y-4 ">
                            <Text className="text-sm text-white  font-bold mt-6 mb-2">{ daysOfWeek[new Date().getDay()]} {new Date().toLocaleString()}</Text>
                            {commandes.map((cmd) => (
                                <TouchableOpacity key={cmd.id} className="bg-white shadow-lg p-4 rounded-lg" onPress={() => handleClickCommande(cmd)}>
                                    <View className="flex-row justify-between">
                                        <View>
                                            <Text className="font-bold">{cmd.total} GNF</Text>
                                            <Text className="text-sm">{cmd.date}</Text>
                                        </View>
                                        <Text className="text-sm">{cmd.id}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                    <View className={menuActive ? "w-7/12  bg-gray-200 p-4 mx-auto my-auto rounded-xl" : "w-6/12 rounded-xl  bg-gray-200 p-4 my-auto mx-auto"}>
                        {commandeSelectionnee && <Recu commande={commandeSelectionnee} />}
                    </View>
                </View>
                 {/** l'indicateur de d'activité lors de la recherche des historiques dans la bdd */}
                 {loading && (
                    <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center bg-gray-200 bg-opacity-50">
                        <ActivityIndicator size="large" color="#366948" />
                        <Text className="text-green-700">Patientez...</Text>
                    </View>
                    )}
            </View>
        </View>
    );
};
