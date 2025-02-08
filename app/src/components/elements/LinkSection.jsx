import { Linking, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useGlobalStyles } from '../../styles'

export const LinksSection = () => {
  const globalStyles = useGlobalStyles()

  return (
    <View style={[globalStyles.container, styles.linksContainer]}>
      <Text style={globalStyles.sectionHeader}>
        Tap below to learn more:
      </Text>
      <View style={styles.linksRow}>
        <Text
          style={globalStyles.linkText}
          onPress={() => Linking.openURL('https://ezkl.xyz/')}
        >
          ezkl.xyz
        </Text>
        <Text style={globalStyles.divider}>|</Text>
        <Text
          style={globalStyles.linkText}
          onPress={() => Linking.openURL('https://discord.gg/cbNvpsThmd')}
        >
          Discord
        </Text>
        <Text style={globalStyles.divider}>|</Text>
        <Text
          style={globalStyles.linkText}
          onPress={() => Linking.openURL('https://t.me/+QRzaRvTPIthlYWMx')}
        >
          Telegram
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  linksContainer: {
    marginTop: 20,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
