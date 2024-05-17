import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { CommandManager } from '../DataBase/CommandManager';
import { ItemPanier } from './ItemPanier';
import { useAuth } from './AuthContext';
import { useNavigation } from '@react-navigation/native';
import { usePanier } from './PanierContext';
import { ProductsManager } from '../DataBase/ProductsManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UpdateVentes } from './UpdateVentes';
import { useNetInfo } from '@react-native-community/netinfo';
import tw from 'twrnc'


export const Panier = () => {
    const [moneyActive, setMoneyActive] = useState(false);
    const [cardActive, setCardActive] = useState(false);
    const [moneyValue, setMoneyValue] = useState('0');
    const [cardValue, setCardValue] = useState('0');
    const { isLoggedIn, setIsLoggedIn } = useAuth();
    const netInfo = useNetInfo();
    const navigation = useNavigation();

    const { panier, setPanier } = usePanier({});
    const [loading, setLoading] = useState(false);
    let total = Object.values(panier).reduce((acc, product) => acc + product.total_price, 0);

    useEffect(() => {
        
        if(moneyActive && cardActive){
            if(parseInt(moneyValue) > parseInt(cardValue)){
                setMoneyValue(total.toString());
            }else{
                setCardValue(total.toString());
            }

        }else if(moneyActive){
            setMoneyValue(total.toString());
        }else if(cardActive){
            setCardValue(total.toString());
        } 
        
    }, [total]);
    
    const toggleMoney = () => {
        setMoneyActive(!moneyActive);
        if (!moneyActive) {
            setMoneyValue(total.toString());
            if (cardActive) {
                setCardValue('0');
            }
        } else {
            setMoneyValue('0');
        }
    };
    
    const toggleCard = () => {
        setCardActive(!cardActive);
        if (!cardActive) {
            setCardValue(total.toString());
            if (moneyActive) {
                setMoneyValue('0');
            }
        } else {
            setCardValue('0');
        }
    };
    

    const handleValiderCommande = async () => {
        if (Object.keys(panier).length === 0) {
            Alert.alert("Le panier est vide. Veuillez ajouter des produits avant de valider la commande.");
            return;
        }

        if (!moneyActive && !cardActive) {
            Alert.alert("Veuillez choisir au moins un mode de paiement.");
            return;
        }

        if (moneyValue === '') {
            setMoneyValue('0');
        }

        if (cardValue === '') {
            setCardValue('0');
        }

        let montantSaisi = 0;
        if (moneyActive && moneyValue !== '0') montantSaisi += parseFloat(moneyValue);
        if (cardActive && cardValue !== '0') montantSaisi += parseFloat(cardValue);

        if (montantSaisi !== total) {
            Alert.alert("Le montant saisis doit être égale au total du panier.");
            return;
        }

        try {
            setLoading(true);
            const user = await AsyncStorage.getItem('id');
            const commandeId = await CommandManager.insertCommande(total, user);

            await Promise.all(Object.entries(panier).map(async ([idProduit, product]) => {
                const produitId = parseInt(idProduit);
                const quantite = product.quantity;
                const price = product.price;
                ProductsManager.searchProductsByID(produitId)
                    .then(async data => {
                        const total = price * quantite;
                        await CommandManager.insertLDCMDStockees(commandeId, quantite, data.name, price, total)
                    })

                try {
                    await CommandManager.insertLigneDeCommande(commandeId, produitId, quantite, price);
                } catch (error) {
                    console.error("Erreur lors de l'ajout de la ligne de commande :", error);
                }
            }));

            Alert.alert("Commande validée avec succès !");
            setLoading(false);
            setPanier({});
            console.log("*************Commande enregistrée avec succés-***************");
            if (cardValue !== '0' && parseInt(cardValue) !== 0 ) {
                CommandManager.insertPayement('Orange Money', parseFloat(cardValue), commandeId)
            }
            if (moneyValue !== '0' && parseInt(moneyValue) !== 0) {
                CommandManager.insertPayement('Espèces', parseFloat(moneyValue), commandeId)
            }

            //l'envoie des commandes si l'internet est activée

            const updateVente =async ()=>{
                const commandes = await CommandManager.selectCommandByStatus()
                if(commandes.length > 0){
                    if(netInfo.isConnected){
                        const token = await AsyncStorage.getItem('token')
                            ToastAndroid.show('mise à jour des ventes en cours...', ToastAndroid.LONG)
                            UpdateVentes.update(token)
                            .then(result => {
                                if (result === 'SessionExpired') {
                                    ToastAndroid.show('votre session a expiré, connectez-vous à nouveau',ToastAndroid.SHORT)
                                    setIsLoggedIn(false);
                                    navigation.navigate('login');
                                }
                            });
                    }else{
                        ToastAndroid.show(`Vous avez ${commandes.length} vente/s non sauvegardée/s`, ToastAndroid.LONG)
                    }
                }
            }
            updateVente();

            //fin de l'envoie
            

            setMoneyValue('0');
            setMoneyActive(false);
            setCardValue('0');
            setCardActive(false);
        } catch (error) {
            console.error("Erreur lors de la validation de la commande :", error);
            Alert.alert("Erreur lors de la validation de la commande. Veuillez réessayer.");
        }
    };

    const handleMoneyValueChange = (value) => {
        if (value === '') {
            setMoneyValue('0');
            setCardValue(total.toString());
        } else {
            const parsedValue = parseFloat(value);
            if (parsedValue < 0) {
                setMoneyValue('0');
                setCardValue(total.toString());
            } else if (parsedValue > total) {
                setMoneyValue(total.toString());
                setCardValue('0');
            } else {
                setMoneyValue(value);
                const remainingAmount = total - parsedValue;
                setCardValue(remainingAmount.toString());
            }
        }
    };
    
    const handleCardValueChange = (value) => {
        if (value === '') {
            setCardValue('0');
            setMoneyValue(total.toString());
        } else {
            const parsedValue = parseFloat(value);
            if (parsedValue < 0) {
                setCardValue('0');
                setMoneyValue(total.toString());
            } else if (parsedValue > total) {
                setCardValue(total.toString());
                setMoneyValue('0');
            } else {
                setCardValue(value);
                const remainingAmount = total - parsedValue;
                setMoneyValue(remainingAmount.toString());
            }
        }
    };
    
    
    

    return (
        <View className="w-3/12 bg-white mt-3 mb-3 shadow-lg rounded-lg mr-2">
            <View className="mx-auto my-1">
                <MaterialIcons name='shopping-cart' size={40} color={'#366948'} />
            </View>
            <ScrollView className="mb-[45%]">
                {total === 0 &&
                    <View className='p-2  mt-32 mx-auto'>
                        <Text className='text-xl font-bold text-gray-500'>Votre panier est vide</Text>
                    </View>
                }
                <ItemPanier panier={panier} />
            </ScrollView>
            <View className="mx-auto bg-green-700 p-1 rounded-lg absolute bottom-36 ml-4">
                <Text className="text-white font-extrabold">Total : {total} GNF</Text>
            </View>
            <View className='flex-row w-[99%] mx-auto rounded-lg absolute bottom-16 mb-2 ml-2'>
                <View className='flex-col my-auto w-5/12 mx-2'>
                    <TouchableOpacity
                        className={`border items-center p-1 mb-1  rounded-xl ${moneyActive ? 'bg-green-700 border-white' : 'border-black'}`}
                        onPress={toggleMoney}
                    >
                        <MaterialIcons name='attach-money' size={25} color={moneyActive ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: 'black',
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            fontSize: 13,
                            color: 'black',
                            backgroundColor: 'white',
                            height: 30,
                            display: moneyActive ? 'flex' : 'none',
                        }}
                        placeholder="Montant"
                        keyboardType="numeric"
                        value={moneyValue}
                        onChangeText={handleMoneyValueChange}
                    />
                </View>
                <View className="flex-col my-auto w-5/12 mx-2">
                    <TouchableOpacity
                        className={`border items-center p-1 mb-1  rounded-xl ${cardActive ? 'bg-green-700 border-white' : 'border-black'}`}
                        onPress={toggleCard}
                    >
                        <MaterialIcons name='credit-card' size={25} color={cardActive ? 'white' : 'black'} />
                    </TouchableOpacity>
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: 'black',
                            borderRadius: 5,
                            paddingHorizontal: 10,
                            paddingVertical: 3,
                            fontSize: 13,
                            color: 'black',
                            backgroundColor: 'white',
                            height: 30,
                            display: cardActive ? 'flex' : 'none',
                        }}
                        placeholder="Montant"
                        keyboardType="numeric"
                        value={cardValue}
                        onChangeText={handleCardValueChange}
                    />
                </View>
            </View>
            {loading ? <>
                <View className='fixed bg-green-700 w-[97%] ml-[1%] p-3 rounded-full  left-0 right-0 bottom-5 '>
                    <ActivityIndicator color={'white'} />
                </View>
            </> : <>
                <TouchableOpacity onPress={handleValiderCommande} className='fixed bg-green-700 w-[97%] ml-[1%] p-3 rounded-full  left-0 right-0 bottom-5 '>
                    <Text className='mx-auto text-white font-bold'>Valider la commande</Text>
                </TouchableOpacity>
            </>}
        </View>
    );
};
