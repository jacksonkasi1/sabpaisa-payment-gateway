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
      if (data.url) {
        window.location.href = `${data.url}?encData=${encodeURIComponent(data.encData)}&clientCode=${data.clientCode}`;
      }
    } catch (error) {
      console.error('Error creating payment session:', error);
      // Handle the error appropriately in your application
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="firstName" placeholder="First Name" onChange={handleChange} />
      <input type="text" name="lastName" placeholder="Last Name" onChange={handleChange} />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} />
      <input type="text" name="phone" placeholder="Phone" onChange={handleChange} />
      <input type="number" name="amount" placeholder="Amount" onChange={handleChange} />
      <button type="submit">Pay Now</button>
    </form>
  );
}
