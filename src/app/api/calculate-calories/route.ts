import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { exercise, duration, intensity } = await request.json();

    // Create a prompt for OpenAI
    const prompt = `Calculate the estimated calories burned for the following workout:
    Exercise: ${exercise}
    Duration: ${duration} minutes
    Intensity: ${intensity}
    
    Please provide only the number of calories burned as a single number, based on average values for a person weighing 70kg.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      temperature: 0.3,
      max_tokens: 50,
    });

    // Extract the number from the response
    const response = completion.choices[0]?.message?.content || '';
    const calories = parseInt(response.replace(/[^0-9]/g, ''));

    if (isNaN(calories)) {
      throw new Error('Failed to calculate calories');
    }

    return NextResponse.json({ calories });
  } catch (error) {
    console.error('Error calculating calories:', error);
    return NextResponse.json(
      { error: 'Failed to calculate calories' },
      { status: 500 }
    );
  }
} 