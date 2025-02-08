import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useGlobalStyles } from '../../styles'

const CancelButton = ({ onCancel, styleOverwrite = {}, textStyleOverwrite = {} }) => {

  const globalStyles = useGlobalStyles()

  return (
    <TouchableOpacity
      style={[globalStyles.secondaryButton, styles.cancelButton, styleOverwrite]}
      onPress={onCancel}
    >
      <Text style={[globalStyles.buttonText, textStyleOverwrite]}>CANCEL</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cancelButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
})

export default CancelButton
