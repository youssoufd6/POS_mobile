import { Image, View, Text } from "react-native"
import tw from 'twrnc';

export const  ItemPanier = ({panier}) =>{
    //console.log(panier)

    return(
        <View>
            {Object.keys(panier).map((key) => {
            const product = panier[key]; // Récupérer le product à partir de la clé
            return (
                <View key={key} style={tw`bg-gray-100 p-1 ml-1 my-1 rounded-lg shadow`}>
                    <View className="flex-row my-1">
                    {product.image ?
                        <Image source={{ uri: `file://${product.image}` }} className="w-12 rounded-lg h-14" />
                            :
                        <Image source={require('../assets/aizeC.jpeg')} className="w-12 rounded-lg h-14" />

                    }
                        
                        <View className="ml-3">
                            <Text className="text-sm font-semibold ">{product.nom}</Text>
                            <View className='border border-green-700 px-2 py-1 bottom-0 absolute rounded-full'>
                                <Text className="text-xs">x{product.quantity}</Text>
                            </View>
                        </View>
                        <Text className="absolute bottom-0 right-0 ml-[8%] font-medium">{product.total_price} GNF</Text>
                    </View>
                </View>
            );
        })}
        </View>
    )
}