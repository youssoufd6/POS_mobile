import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, ToastAndroid } from 'react-native';
import tw from 'twrnc';
import { CategoriesManager } from '../DataBase/CategoriesManager';
import { usePanier } from './PanierContext';
import { ProductsManager } from '../DataBase/ProductsManager';
import { UpdateAndSelectDatas } from './UpdateAndSelectDatas';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const Categories = ({ onTabClick }) => {
    const [activeTab, setActiveTab] = useState(0);
    const [categories, setCategories] = useState([]);
    const { categorySelected, setCategorySelected } = usePanier(null);

    useEffect(() => {
        const fetchCat = async () => {
            try {
                const categories = await CategoriesManager.allCategories();
                setCategories(categories);
                handleTabClick(0);
                onTabClick(await ProductsManager.allproducts());
            } catch (error) {
                console.error('Une erreur s\'est produite lors du chargement des catégories :', error);
            }
        };
        fetchCat();
    }, []);

    const refreshData = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            await UpdateAndSelectDatas.fetchCategories(token);
            const response = await CategoriesManager.allCategories();
            setCategories(response);
            //ToastAndroid.show('Mise à jour effectuée', ToastAndroid.SHORT);
        } catch (error) {
            console.error('Une erreur s\'est produite lors de la mise à jour des catégories :', error);
        }
    };

    useEffect(() => {
        if (categories.length === 0) {
            refreshData();
        }
    }, [categories]);

    const handleTabClick = async (id) => {
        setActiveTab(id);

        let filteredProducts;
        if (id === 0 || !id) {
            filteredProducts = await ProductsManager.allproducts();
        } else {
            filteredProducts = await ProductsManager.getProductsByCategory(id);
        }
        
        onTabClick(filteredProducts);
        setCategorySelected(id);
    };

    return (
        <View className="my-1">
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            tw`rounded-lg mx-1 p-5 shadow-lg`,
                            item.id === activeTab ? { backgroundColor: '#366948' } : { backgroundColor: 'white' },
                        ]}
                        onPress={() => handleTabClick(item.id)}
                    >
                        <Text style={item.id === activeTab ? tw`text-white font-bold` : tw`text-black font-bold`}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};
