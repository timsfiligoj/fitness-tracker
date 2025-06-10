'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

const workoutSchema = z.object({
  exercise: z.string().min(1, 'Exercise is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  intensity: z.enum(['low', 'medium', 'high']),
  date: z.date(),
});

type WorkoutFormData = z.infer<typeof workoutSchema>;

interface WorkoutHistory extends WorkoutFormData {
  calories: number;
}

export default function Home() {
  const [calories, setCalories] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastWorkout, setLastWorkout] = useState<WorkoutFormData | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      date: new Date(),
    },
  });

  const onSubmit = async (data: WorkoutFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calculate-calories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      setCalories(result.calories);
      setLastWorkout(data);
      
      // Add to workout history
      setWorkoutHistory(prev => [...prev, { ...data, calories: result.calories }]);
    } catch (error) {
      console.error('Error calculating calories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Fitness Tracker</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Workout Date
            </label>
            <input
              type="date"
              {...register('date', { valueAsDate: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Exercise
            </label>
            <input
              {...register('exercise')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="e.g., Running, Swimming, Cycling"
            />
            {errors.exercise && (
              <p className="mt-1 text-sm text-red-600">{errors.exercise.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              {...register('duration', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="30"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Intensity
            </label>
            <select
              {...register('intensity')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white text-gray-900"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.intensity && (
              <p className="mt-1 text-sm text-red-600">{errors.intensity.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Calculating...' : 'Calculate Calories'}
          </button>
        </form>

        {calories !== null && (
          <div className="mt-6 p-4 bg-green-50 rounded-md">
            <p className="text-center text-lg font-semibold text-green-800 mb-2">
              Great workout! 💪
            </p>
            <p className="text-center text-lg font-semibold text-green-800">
              {calories} calories
            </p>
            <p className="text-center text-md text-green-700">
              burned during {lastWorkout?.exercise} session
            </p>
          </div>
        )}

        {workoutHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Workout History</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-600 font-medium">Total Workouts</p>
                <p className="text-2xl font-bold text-indigo-900">{workoutHistory.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Calories Burned</p>
                <p className="text-2xl font-bold text-green-900">
                  {workoutHistory.reduce((sum, workout) => sum + workout.calories, 0)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {workoutHistory.map((workout, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <p className="font-medium text-gray-900">
                    {format(workout.date, 'MMMM d, yyyy')}
                  </p>
                  <p className="text-gray-700">
                    {workout.exercise} - {workout.duration} minutes ({workout.intensity} intensity)
                  </p>
                  <p className="text-green-700 font-medium">
                    {workout.calories} calories burned
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
