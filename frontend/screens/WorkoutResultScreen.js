import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';

export default function WorkoutResultScreen({ route, navigation }) {
  const { workoutPlan } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.resultHeader}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.resultTitle}>{workoutPlan?.sessionName}</Text>
          <Text style={styles.resultDuration}>⏱ {workoutPlan?.duration}</Text>
          <Text style={styles.resultCalories}>🔥 ~{workoutPlan?.caloriesBurned} kcal</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Échauffement</Text>
          {workoutPlan?.warmup?.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.exercise}</Text>
              <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Entraînement Principal</Text>
          {workoutPlan?.mainWorkout?.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.exercise}</Text>
              <View style={styles.exerciseStats}>
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>📊 {exercise.sets} séries</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>🔢 {exercise.reps} reps</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statText}>⏸ {exercise.rest}</Text>
                </View>
              </View>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Retour au calme</Text>
          {workoutPlan?.cooldown?.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <Text style={styles.exerciseName}>{exercise.exercise}</Text>
              <Text style={styles.exerciseDuration}>{exercise.duration}</Text>
              <Text style={styles.exerciseDescription}>{exercise.description}</Text>
            </View>
          ))}
        </View>

        {workoutPlan?.tips && workoutPlan.tips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Conseils</Text>
            {workoutPlan.tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipText}>• {tip}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.primaryButtonText}>🔄 Nouvelle séance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.secondaryButtonText}>📊 Voir mon historique</Text>
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
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  resultHeader: {
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  resultDuration: {
    fontSize: 16,
    color: '#8B92B9',
    marginBottom: 6,
  },
  resultCalories: {
    fontSize: 18,
    color: '#F59E0B',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  exerciseCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4C6FFF',
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  exerciseDuration: {
    fontSize: 14,
    color: '#8B92B9',
    marginBottom: 6,
  },
  exerciseStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  statBadge: {
    backgroundColor: '#0A0E27',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statText: {
    fontSize: 13,
    color: '#8B92B9',
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  tipText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#4C6FFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 10,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4C6FFF',
  },
  secondaryButtonText: {
    color: '#4C6FFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
