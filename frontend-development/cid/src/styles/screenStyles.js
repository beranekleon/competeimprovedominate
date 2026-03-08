import { StyleSheet } from 'react-native';
import { Colors } from './colors';

export const ProfileScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerSafeArea: {
    backgroundColor: Colors.background,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 12,
  },
  testButton: {
    marginTop: 16,
    backgroundColor: Colors.purple,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: Colors.purple,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancelText: {
    color: Colors.textGray,
  },
  modalDeleteText: {
    color: Colors.red,
    fontWeight: 'bold',
  },
});

export const UserListScreenStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: Colors.textDark,
    textAlign: 'center',
  },
  card: {
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: Colors.white,
  },
  name: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const ResetPasswordScreenStyles = StyleSheet.create({
  backButtonContainer: {
    marginTop: 20,
    width: '100%',
  },
});
