import React, { useEffect, useState } from 'react';
import { TextInput, Text, View, TouchableOpacity, Modal } from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { ProductsManager } from '../DataBase/ProductsManager';
import { usePanier } from './PanierContext';
import tw from 'twrnc';

export const Recherche = ({ onSearchClick }) => {
    const [query, setQuery] = useState('');
    const [products, setProducts] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { categorySelected, setCategorySelected } = usePanier(null);

    useEffect(() => {
        ProductsManager.allproducts()
            .then(response => {
                setProducts(response);
            })
            .catch(error => console.error('Error fetching products:', error));
    }, []);

    const toggleModal = () => {
        setModalVisible(!modalVisible);
    };

    const handleSearch = (text) => {
        setQuery(text);

        if (!products) return;

        let searchedProducts = [];
        if (text === '' && (categorySelected === 0 || categorySelected === null)) {
            searchedProducts = products; // Afficher tous les produits si la catégorie sélectionnée est null ou égale à 0
        } else {
            searchedProducts = products.filter(product =>
                product.name.toLowerCase().includes(text.toLowerCase())
            );

            // Filtrer les produits en fonction de la catégorie sélectionnée
            if (categorySelected !== 0 && categorySelected !== null) {
                searchedProducts = searchedProducts.filter(p => p.category === categorySelected);
            }
        }

        onSearchClick(searchedProducts);
    };

    return (
        <View style={tw`flex-row mt-2 mx-auto items-center bg-white rounded-full mb-4 p-1 w-11/12 shadow`}>
            <TextInput
                className="flex-1 text-base px-3"
                placeholder="Rechercher un produit..."
                value={query}
                onChangeText={handleSearch}
            />
            <TouchableOpacity className="ml-2 mr-2 p-1">
                <FontAwesome5 name="search" size={20} color="gray" />
            </TouchableOpacity>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(!modalVisible)}
            >
                <View className="bg-transparent-black flex-1 items-center justify-center">
                    <View className="bg-white rounded-lg">
                        <View className="m-10 items-center">
                            <FontAwesome5 name="headphones" size={50} color="black" />
                            <Text className=' text-gray-500 font-bold uppercase'>je vous ecoute...</Text>
                            <Text className=' text-gray-500 font-bold uppercase'>Dites le nom d'un produit...</Text>
                            <TouchableOpacity onPress={toggleModal} style={{ marginTop: 20 }}>
                                <FontAwesome5 name="times" size={26} color="#ff6347" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
