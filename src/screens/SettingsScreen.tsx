import React, { useContext, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Modal } from "react-native";
import { Text, Avatar, Divider, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../store/authContext";
import i18n from "../i18n/i18n";

import { useTranslation } from 'react-i18next';

export default function SettingsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const { logout, state } = useContext(AuthContext);
  const user = state.user;

  // Mock Settings State
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);

  /* Language State */
  const [language, setLanguage] = useState(i18n.language);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const langs = [
    { code: 'en', label: 'English', sub: 'English' },
    { code: 'hi', label: 'Hindi', sub: 'हिन्दी' },
  ];

  const currentLangLabel = langs.find(l => l.code === language)?.label || 'English';

  const selectLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setLanguage(code);
    setShowLangMenu(false);
  };

  const handleLogout = () => {
    Alert.alert(t('logout_confirm_title'), t('logout_confirm_msg'), [
      { text: t('cancel'), style: "cancel" },
      { text: t('sign_out'), style: "destructive", onPress: logout }
    ]);
  };

  return (
    <View style={styles.container}>

      {/* -------------------------------------------
          HEADER & PROFILE
      -------------------------------------------- */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={80}
              source={require('../../assets/images/profile.jpg')}
              style={{ backgroundColor: '#fff' }}
            />
            <View style={styles.editIcon}>
              <MaterialCommunityIcons name="pencil" size={14} color="#fff" />
            </View>
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userRole}>{user?.role} Account</Text>
          <Text style={styles.userVillage}>{user?.village || t('no_village_assigned')}</Text>
        </View>
      </View>

      {/* Language Modal */}
      <Modal
        visible={showLangMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLangMenu(false)}
      >
        <View style={styles.langModalOverlay}>
          <View style={styles.langModalContent}>
            <Text style={styles.langTitle}>{t('select_language')}</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {langs.map((l) => (
                <TouchableOpacity
                  key={l.code}
                  style={styles.langOption}
                  onPress={() => selectLanguage(l.code)}
                >
                  <MaterialCommunityIcons
                    name={language === l.code ? "radiobox-marked" : "radiobox-blank"}
                    size={20}
                    color={language === l.code ? "#001F3F" : "#888"}
                  />
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.langText, language === l.code && { color: '#001F3F', fontWeight: 'bold' }]}>
                      {l.label}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#888' }}>{l.sub}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button mode="text" onPress={() => setShowLangMenu(false)} style={{ marginTop: 10 }}>{t('cancel')}</Button>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.content}>

        {/* -------------------------------------------
            GENERAL SETTINGS
        -------------------------------------------- */}
        <Text style={styles.sectionHeader}>{t('preferences')}</Text>
        <View style={styles.section}>

          <SettingItem
            icon="bell-ring-outline"
            title={t('push_notifications')}
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#E0E0E0", true: "#FFD700" }}
                thumbColor={notifications ? "#001F3F" : "#f4f3f4"}
              />
            }
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="translate"
            title={t('language')}
            subtitle={currentLangLabel}
            onPress={() => setShowLangMenu(true)}
            rightElement={<MaterialCommunityIcons name="chevron-down" size={24} color="#ccc" />}
          />

        </View>

        {/* -------------------------------------------
            SECURITY
        -------------------------------------------- */}
        <Text style={styles.sectionHeader}>{t('security')}</Text>
        <View style={styles.section}>

          <SettingItem
            icon="fingerprint"
            title={t('biometric_login')}
            rightElement={
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: "#E0E0E0", true: "#FFD700" }}
                thumbColor={biometrics ? "#001F3F" : "#f4f3f4"}
              />
            }
          />
          <Divider style={styles.divider} />

          <SettingItem
            icon="lock-outline"
            title={t('change_password')}
            onPress={() => Alert.alert("Coming Soon", "Password change flow not implemented yet.")}
            rightElement={<MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />}
          />

        </View>


        {/* -------------------------------------------
            SUPPORT & INFO
        -------------------------------------------- */}
        <Text style={styles.sectionHeader}>{t('support')}</Text>
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title={t('help_center')}
            onPress={() => navigation.navigate("Help")}
            rightElement={<MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />}
          />
          <Divider style={styles.divider} />
          <SettingItem
            icon="file-document-outline"
            title={t('privacy_policy')}
            rightElement={<MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />}
          />
        </View>

        {/* -------------------------------------------
            LOGOUT
        -------------------------------------------- */}
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutBtn}
          textColor="#D32F2F"
          icon="logout"
        >
          {t('sign_out')}
        </Button>

        <Text style={styles.version}>App Version 2.4.0 (Build 502)</Text>

      </ScrollView>
    </View>
  );
}

// -----------------------------------------------------
// Helper Component: Setting Item
// -----------------------------------------------------
function SettingItem({ icon, title, subtitle, rightElement, onPress }: any) {
  const Container: any = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.itemContainer} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name={icon} size={22} color="#001F3F" />
        </View>
        <View>
          <Text style={styles.itemTitle}>{title}</Text>
          {subtitle && <Text style={styles.itemSub}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },

  /* HEADER */
  header: {
    backgroundColor: '#001F3F',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 4,
  },
  profileContainer: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 50,
    padding: 2,
    position: 'relative',
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#001F3F',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  userRole: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  userVillage: {
    fontSize: 14,
    color: '#B0C4DE',
    marginTop: 2,
  },

  /* MODAL */
  langModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  langModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
  },
  langTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    color: '#001F3F',
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  langText: {
    fontSize: 16,
    color: '#333',
  },

  /* CONTENT */
  content: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 4,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  divider: {
    backgroundColor: '#F0F0F0',
    marginLeft: 56,
  },

  /* ITEMS */
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5FAFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },

  /* FOOTER */
  logoutBtn: {
    marginTop: 30,
    backgroundColor: '#FFEBEE',
  },
  version: {
    textAlign: 'center',
    color: '#AAA',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
