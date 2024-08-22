'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  amount: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    amount: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      const response = await axios.post('http://localhost:8000/api/create-payment-session', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;
      console.log('Payment session created:', data);
      if (data.url) {
        window.location.href = `${data.url}?encData=${encodeURIComponent(data.encData)}&clientCode=${data.clientCode}`;
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      // Handle the error appropriately in your application
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md bg-white shadow-md rounded-lg p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center">Payment Form</h2>
        
        <div>
          <label className="block text-gray-700">First Name</label>
          <input 
            type="text"
            name="firstName"
            placeholder="First Name" 
            onChange={handleChange} 
            className="mt-2 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div>
          <label className="block text-gray-700">Last Name</label>
          <input 
            type="text" 
            name="lastName" 
            placeholder="Last Name" 
            onChange={handleChange} 
            className="mt-2 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div>
          <label className="block text-gray-700">Email</label>
          <input 
            type="email" 
            name="email" 
            placeholder="Email" 
            onChange={handleChange} 
            className="mt-2 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div>
          <label className="block text-gray-700">Phone</label>
          <input 
            type="text" 
            name="phone" 
            placeholder="Phone" 
            onChange={handleChange} 
            className="mt-2 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <div>
          <label className="block text-gray-700">Amount</label>
          <input 
            type="number" 
            name="amount" 
            placeholder="Amount" 
            onChange={handleChange} 
            className="mt-2 p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}
