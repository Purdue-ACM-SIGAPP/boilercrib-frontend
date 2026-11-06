import React, {useState} from 'react';
import { Image, StyleSheet, Dimensions, View, Text, Button, Modal, Pressable } from 'react-native';

price = 5,418;

export default function DisplayDetails() {
    return (
        <View style={styles.container}>
            <Image source={require('/assets/house_image.jpg')} style={styles.image} accessibilityIgnoresInvertColors />
            <View style={styles.details}>
                <Text style={styles.address}>
                    1600 Pennsylvania Avenue NW, Washington, DC 20500
                </Text>
                <Text style={styles.price}>
                    {price} / month
                </Text>
                <Text style={styles.rooms}>
                    2 Beds • 1 Bath
                </Text>
                <Button
                    title="Contact agent"
                    onPress={() => setPopupVisible(true)}
                />
            </View> 
            <Modal
                visible={popupVisible}
                transparent={true}
                onRequestClose={() => setPopupVisible(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setPopupVisible(false)}
                >
                    <Pressable 
                        style={styles.popup}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <Text style={styles.popupTitle}>
                            Contact a buyer's agent
                        </Text>
                        <View style={styles.closeButton}>
                            <Button
                                title="Close"
                                onPress={() => setPopupVisible(false)}
                            />
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    image: {
        width: '100%',
        height: Dimensions.get('window').height * 0.25,
        resizeMode: 'cover',
    },
    details: {
        padding: 16,
    },
    address: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8, 
    },
    price: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    rooms: {
        fontSize: 16,
        color: 'gray',
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    popup: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        padding: 24,
        borderRadius: 16,
        elevation: 5,
    },
    popupText: {
        fontSize: 16,
        marginBottom: 12,
    },
    closeButton: {
        marginTop: 12,
    },
});