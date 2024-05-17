import React, { useState } from 'react';
import { ScrollView, Text, View, TouchableOpacity, Image, TextInput } from 'react-native';
import tw from 'twrnc';

const Listeproducts = ({ products, menuActive, quantityACommander, incrementeQuantity, decrementeQuantity, updateQuantity }) => {




    return (
        <ScrollView  className="flex-1 flex">
            <View className={menuActive ? "flex-row flex-wrap items-center justify-between mb-auto mx-5 ": "flex-row flex-wrap items-center mb-auto justify-between mx-5"}>
                {products.map((product) => (
                    <View key={product.id} style={tw`w-[30%]  mt-1 rounded-lg h-60 mb-3 shadow-2xl bg-white`}>
                    {product.image ?
                        <Image source={{ uri: `file://${product.image}` }} className="w-full rounded-t-lg h-[60%]" />
                            :
                        <Image source={require('../assets/aizeC.jpeg')} className="w-full rounded-t-lg h-[60%]" />

                    }
                    <View className=" mx-2 my-1">
                        <Text className="ml-2 capitalize">{product.name} ({product.quantity})</Text>
                        <Text className="ml-2">{product.price} gnf</Text>
                    </View>
                        <View className="flex-row mx-auto bg-gray-200 mt-1 w-[90%] justify-between h-8 rounded-lg px-1">
                            <TouchableOpacity onPress={() => decrementeQuantity(product.id)} className="bg-green-700 w-7 h-7 rounded-full my-auto">
                                <Text className="mx-auto my-auto text-white font-extrabold">-</Text>
                            </TouchableOpacity>
                            <TextInput
                                placeholder='0'
                                keyboardType='numeric'
                                className="border-transparent rounded-full bg-transparent text-center p-2 text-black font-extrabold"
                                value={(quantityACommander[product.id] || 0).toString()}
                                onChangeText={value => updateQuantity(product.id, value)}
                            />
                            <TouchableOpacity onPress={() => incrementeQuantity(product.id)} className="bg-green-700 w-7 h-7 rounded-full my-auto">
                                <Text className="mx-auto my-auto text-white font-extrabold">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

export default Listeproducts;
