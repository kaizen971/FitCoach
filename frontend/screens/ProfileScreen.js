import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout, getAuthHeaders } = useAuth();
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutHistory();
  }, []);

  const loadWorkoutHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/workout/history`, {
        headers: getAuthHeaders()
      });

      if (response.data.success) {
        setWorkoutHistory(response.data.sessions);
      }
    } catch (error) {
      console.error('Error loading workout history:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Déconnexion', style: 'destructive', onPress: logout }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileIconText}>
            {user?.gender === 'male' ? '👨' : '👩'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.age}</Text>
            <Text style={styles.statLabel}>ans</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{workoutHistory.length}</Text>
            <Text style={styles.statLabel}>séances</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {workoutHistory.reduce((acc, session) =>
                acc + (session.workoutPlan?.caloriesBurned || 0), 0
              )}
            </Text>
            <Text style={styles.statLabel}>kcal</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Historique des séances</Text>
          <TouchableOpacity onPress={loadWorkoutHistory}>
            <Text style={styles.refreshButton}>🔄</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4C6FFF" />
          </View>
        ) : workoutHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏋️</Text>
            <Text style={styles.emptyText}>Aucune séance pour le moment</Text>
            <Text style={styles.emptySubtext}>
              Commencez votre première séance pour voir votre progression
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.ctaButtonText}>Créer une séance</Text>
            </TouchableOpacity>
          </View>
        ) : (
          workoutHistory.map((session, index) => (
            <TouchableOpacity
              key={session._id || index}
              style={styles.historyCard}
              onPress={() => navigation.navigate('WorkoutResult', {
                workoutPlan: session.workoutPlan
              })}
            >
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>
                  {session.workoutPlan?.sessionName || 'Séance'}
                </Text>
                <Text style={styles.historyDate}>
                  {formatDate(session.createdAt)}
                </Text>
              </View>
              <View style={styles.historyStats}>
                <View style={styles.historyStatBadge}>
                  <Text style={styles.historyStatText}>
                    ⏱ {session.workoutPlan?.duration}
                  </Text>
                </View>
                <View style={styles.historyStatBadge}>
                  <Text style={styles.historyStatText}>
                    🔥 {session.workoutPlan?.caloriesBurned} kcal
                  </Text>
                </View>
              </View>
              <View style={styles.historyDetails}>
                <Text style={styles.historyDetailText}>
                  📏 {session.height} cm • ⚖️ {session.weight} kg
                </Text>
                <Text style={styles.historyDetailText}>
                  🧬 {session.morphology}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Déconnexion</Text>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#1A1F3A',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4C6FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  profileIconText: {
    fontSize: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#8B92B9',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0A0E27',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4C6FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8B92B9',
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  refreshButton: {
    fontSize: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8B92B9',
    textAlign: 'center',
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: '#4C6FFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  ctaButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4C6FFF',
  },
  historyHeader: {
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#8B92B9',
  },
  historyStats: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  historyStatBadge: {
    backgroundColor: '#0A0E27',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyStatText: {
    fontSize: 12,
    color: '#8B92B9',
  },
  historyDetails: {
    borderTopWidth: 1,
    borderTopColor: '#2A3055',
    paddingTop: 12,
  },
  historyDetailText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  actions: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
