import React, { useEffect, useRef, useState } from 'react'
import { useGlobalStyles } from '../styles'
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'

export const ImageSelector = ({ onSubmit, state, setState }) => {
  const [imageUri, setImageUri] = useState(null)
  const globalStyles = useGlobalStyles()

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri)
        onSubmit(response.assets[0].uri)
      }
    })
  }

  const takePhoto = () => {
    launchCamera({ mediaType: 'photo' }, (response) => {
      if (response.assets && response.assets.length > 0) {
        setImageUri(response.assets[0].uri)
        onSubmit(response.assets[0].uri)
      }
    })
  }
  return (
    <View style={[styles.container]}>
      <Text style={styles.title}>Image Picker</Text>
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Text style={styles.placeholder}>No Image Selected</Text>
        )}
      </View>
      <TouchableOpacity style={[globalStyles.primaryButton, styles.button]} onPress={pickImage}>
        <Text style={styles.buttonText}>Pick Image from Gallery</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[globalStyles.primaryButton, styles.button]} onPress={takePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 15,
    width: 250,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 10,
    width: 200,
    height: 200,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholder: {
    color: '#666',
    fontSize: 16,
  },
})
