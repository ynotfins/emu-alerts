import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

interface HeaderMenuProps {
  title: string;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
  onSignOutPress?: () => void;
  showBackButton?: boolean;
}

export default function HeaderMenu({
  title,
  onBackPress,
  onSettingsPress,
  onSignOutPress,
  showBackButton = false,
}: HeaderMenuProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        {showBackButton && onBackPress && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.rightSection}>
        {onSettingsPress && (
          <TouchableOpacity onPress={onSettingsPress} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Settings</Text>
          </TouchableOpacity>
        )}
        {onSignOutPress && (
          <TouchableOpacity onPress={onSignOutPress} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Sign Out</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1976d2',
    paddingTop: 44, // Safe area for iOS
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});