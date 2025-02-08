// GlobalStyles.js
import { StyleSheet, useColorScheme } from 'react-native'

// Custom hook to get global styles based on color scheme
export const useGlobalStyles = () => {
  const isDarkMode = useColorScheme() === 'dark'

  // Define color palette for consistency
  const colors = {
    lightBackground: '#FFFFFF',
    darkBackground: '#1c1c1c',
    lightText: '#000000',
    darkText: '#FFFFFF',
    primary: '#2d94ff',
    secondary: '#ff3232',
    success: '#46ba0c',
    buttonText: '#FFFFFF',
    linkTextLight: '#666666',
    linkTextDark: '#aaaaaa',
  }

  return StyleSheet.create({
    isDarkMode: isDarkMode,
    // General container style for consistent padding/margin
    container: {
      padding: 8,
      backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
      borderRadius: 10,
      paddingVertical: 20,
    },
    // Background style
    background: {
      backgroundColor: isDarkMode ? colors.darkBackground : colors.lightBackground,
    },
    // Text styles
    userText: {
      color: isDarkMode ? colors.darkText : colors.lightText,
      fontSize: 16,
      fontWeight: '400',
    },
    titleText: {
      color: isDarkMode ? colors.darkText : colors.lightText,
      fontSize: 24,
      fontWeight: '600',
    },
    headerText: {  // Added headerText style here
      color: isDarkMode ? colors.darkText : colors.lightText,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 8,
    },
    subtitleText: {
      color: isDarkMode ? colors.darkText : colors.lightText,
      fontSize: 18,
      fontWeight: '500',
      marginVertical: 8,
      textAlign: 'center',
    },
    sectionHeader: {
      fontSize: 14,
      fontWeight: '500',
      color: isDarkMode ? colors.linkTextDark : colors.linkTextLight,
      marginBottom: 5,
      textAlign: 'center',
    },
    linkText: {
      fontSize: 14,
      fontWeight: '500',
      textDecorationLine: 'underline',
      color: isDarkMode ? colors.linkTextDark : colors.linkTextLight,
    },
    divider: {
      fontSize: 14,
      color: colors.divider,
      marginHorizontal: 8,
    },
    buttonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: '500',
    },
    // Button styles
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButton: {
      backgroundColor: colors.secondary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Common spacing (useful for consistent margins/paddings)
    spacingSmall: {
      margin: 8,
    },
    spacingMedium: {
      margin: 16,
    },
    spacingLarge: {
      margin: 24,
    },
    colors,
  })
}
