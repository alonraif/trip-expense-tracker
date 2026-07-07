import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('receipt') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No receipt provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64Data = Buffer.from(buffer).toString('base64');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Extract the merchant name, total amount, and date from this receipt.' },
            { inlineData: { data: base64Data, mimeType: file.type } },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            merchant: { type: 'string', description: 'Name of the store or restaurant' },
            total: { type: 'number', description: 'The final total amount charged' },
            date: { type: 'string', description: 'Date of the transaction in YYYY-MM-DD format' },
          },
          required: ['merchant', 'total', 'date'],
        },
      },
    });

    if (!response.text) {
      throw new Error('No text returned from Gemini');
    }

    const data = JSON.parse(response.text);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
