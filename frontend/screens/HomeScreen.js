import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user, getAuthHeaders } = useAuth();
  const [morphology, setMorphology] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    // Request camera permissions
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', 'L\'accès à la caméra est nécessaire pour prendre une photo');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Ajouter une photo',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: takePhoto
        },
        {
          text: 'Choisir depuis la galerie',
          onPress: pickImage
        },
        {
          text: 'Annuler',
          style: 'cancel'
        }
      ]
    );
  };

  const generateWorkout = async () => {
    if (!morphology || !height || !weight) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isNaN(height) || height < 50 || height > 250) {
      Alert.alert('Erreur', 'Veuillez entrer une taille valide (50-250 cm)');
      return;
    }

    if (isNaN(weight) || weight < 20 || weight > 300) {
      Alert.alert('Erreur', 'Veuillez entrer un poids valide (20-300 kg)');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('morphology', morphology);
      formData.append('height', height);
      formData.append('weight', weight);

      if (photo) {
        formData.append('photo', {
          uri: photo.uri,
          type: 'image/jpeg',
          name: 'photo.jpg'
        });
      }

      const response = await axios.post(`${API_BASE_URL}/workout`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        navigation.navigate('WorkoutResult', {
          workoutPlan: response.data.session.workoutPlan
        });
        // Reset form
        setMorphology('');
        setHeight('');
        setWeight('');
        setPhoto(null);
      }
    } catch (error) {
      console.error('Workout generation error:', error);
      Alert.alert('Erreur', error.response?.data?.error || 'Impossible de générer votre séance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.name || 'Champion'} 👋</Text>
          <Text style={styles.subtitle}>Prêt pour votre prochaine séance ?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.formTitle}>Nouvelle Séance</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Morphologie</Text>
          <View style={styles.morphologyContainer}>
            {['Ectomorphe', 'Mésomorphe', 'Endomorphe'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.morphologyButton,
                  morphology === type && styles.morphologyButtonActive
                ]}
                onPress={() => setMorphology(type)}
              >
                <Text style={[
                  styles.morphologyButtonText,
                  morphology === type && styles.morphologyButtonTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>
            Ectomorphe: mince • Mésomorphe: athlétique • Endomorphe: robuste
          </Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Taille (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="170"
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
            <Text style={styles.label}>Poids (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="70"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Photo (optionnel)</Text>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={showImageOptions}
          >
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>📷</Text>
                <Text style={styles.photoPlaceholderSubtext}>Ajouter une photo</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={generateWorkout}
          disabled={loading}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#FFF" />
              <Text style={[styles.primaryButtonText, { marginLeft: 10 }]}>
                Génération en cours...
              </Text>
            </View>
          ) : (
            <Text style={styles.primaryButtonText}>🎯 Générer ma séance</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B92B9',
  },
  profileButton: {
    backgroundColor: '#1A1F3A',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2A3055',
  },
  row: {
    flexDirection: 'row',
  },
  morphologyContainer: {
    gap: 10,
  },
  morphologyButton: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A3055',
  },
  morphologyButtonActive: {
    backgroundColor: '#4C6FFF',
    borderColor: '#4C6FFF',
  },
  morphologyButtonText: {
    fontSize: 15,
    color: '#8B92B9',
  },
  morphologyButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  photoButton: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2A3055',
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    padding: 40,
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  photoPlaceholderSubtext: {
    fontSize: 14,
    color: '#8B92B9',
  },
  photoPreview: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  primaryButton: {
    backgroundColor: '#4C6FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
