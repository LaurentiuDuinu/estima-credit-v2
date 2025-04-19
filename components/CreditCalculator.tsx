
'use client';
import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function CreditCalculator() {
  const [amount, setAmount] = useState(250000);
  const [years, setYears] = useState(25);
  const [monthlyRate, setMonthlyRate] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [interestRate, setInterestRate] = useState(6.5);
  const [insuranceRate, setInsuranceRate] = useState(0.1);

  const calculate = () => {
    const months = years * 12;
    const monthlyInterest = interestRate / 100 / 12;
    const monthlyPayment =
      (amount * monthlyInterest * Math.pow(1 + monthlyInterest, months)) /
      (Math.pow(1 + monthlyInterest, months) - 1);

    let remaining = amount;
    const newSchedule = [];

    for (let i = 1; i <= months; i++) {
      const interest = remaining * monthlyInterest;
      const principal = monthlyPayment - interest;
      const insurance = remaining * (insuranceRate / 100);
      const total = monthlyPayment + insurance;

      newSchedule.push({
        month: i,
        principal: parseFloat(principal.toFixed(2)),
        interest: parseFloat(interest.toFixed(2)),
        insurance: parseFloat(insurance.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        remaining: parseFloat((remaining - principal).toFixed(2))
      });

      remaining -= principal;
    }

    setMonthlyRate((monthlyPayment + newSchedule[0].insurance).toFixed(2));
    setSchedule(newSchedule);
    setEmailSent(false);
  };

  const resetForm = () => {
    setAmount(250000);
    setYears(25);
    setMonthlyRate(null);
    setSchedule([]);
    setUserName('');
    setUserEmail('');
    setEmailSent(false);
    setInterestRate(6.5);
    setInsuranceRate(0.1);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Simulare Credit Ipotecar', 14, 20);

    const tableData = schedule.map(row => [
      row.month,
      row.principal,
      row.interest,
      row.insurance,
      row.total,
      row.remaining
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Luna', 'Principal', 'Dobandă', 'Asigurare', 'Total', 'Sold Ramas']],
      body: tableData
    });

    doc.save('simulare_credit.pdf');
  };

  const handleEmailSend = () => {
    console.log('Trimite email la:', userEmail);
    setEmailSent(true);
  };

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      <img src='/logo.png' alt='Estima Finance' className='w-48 mb-4' />

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label>Suma creditului (lei)</label>
          <input
            type='number'
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className='border rounded w-full p-2'
          />
        </div>
        <div>
          <label>Durata (ani)</label>
          <input
            type='number'
            value={years}
            onChange={e => setYears(Number(e.target.value))}
            min={5}
            max={30}
            className='border rounded w-full p-2'
          />
        </div>
      </div>

      <div className='flex gap-4'>
        <button onClick={calculate} className='bg-blue-600 text-white px-4 py-2 rounded'>
          Calculează
        </button>
        <button onClick={resetForm} className='bg-gray-300 text-black px-4 py-2 rounded'>
          Resetare formular
        </button>
      </div>

      {monthlyRate && (
        <div className='text-xl font-semibold'>
          Rata lunară estimată: {monthlyRate} lei
        </div>
      )}

      {schedule.length > 0 && (
        <button onClick={generatePDF} className='border px-4 py-2 rounded'>
          Descarcă PDF
        </button>
      )}

      {schedule.length > 0 && (
        <div className='pt-6 space-y-4'>
          <h3 className='font-bold text-lg'>Trimite simularea pe email</h3>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <label>Nume complet</label>
              <input
                type='text'
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className='border rounded w-full p-2'
              />
            </div>
            <div>
              <label>Adresa de email</label>
              <input
                type='email'
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                className='border rounded w-full p-2'
              />
            </div>
          </div>
          <button
            onClick={handleEmailSend}
            className='bg-green-600 text-white px-4 py-2 rounded'
            disabled={!userEmail || !userName}
          >
            Trimite pe email
          </button>
          {emailSent && <div className='text-green-600'>Simularea a fost trimisă cu succes!</div>}
        </div>
      )}

      <div className='text-right'>
        <button onClick={() => setShowAdmin(!showAdmin)} className='text-sm underline'>
          {showAdmin ? 'Ascunde setări admin' : 'Setări admin'}
        </button>
      </div>

      {showAdmin && (
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 border p-4 rounded'>
          <div>
            <label>Dobândă anuală (%)</label>
            <input
              type='number'
              value={interestRate}
              onChange={e => setInterestRate(Number(e.target.value))}
              className='border rounded w-full p-2'
            />
          </div>
          <div>
            <label>Procent asigurare (% pe sold)</label>
            <input
              type='number'
              value={insuranceRate}
              onChange={e => setInsuranceRate(Number(e.target.value))}
              className='border rounded w-full p-2'
            />
          </div>
        </div>
      )}

      {schedule.length > 0 && (
        <div className='pt-6'>
          <h2 className='text-lg font-bold mb-4'>Grafic de rambursare</h2>
          <ResponsiveContainer width='100%' height={300}>
            <LineChart data={schedule}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='month' />
              <YAxis />
              <Tooltip />
              <Line type='monotone' dataKey='total' stroke='#8884d8' name='Total lunar' />
              <Line type='monotone' dataKey='insurance' stroke='#82ca9d' name='Asigurare' />
              <Line type='monotone' dataKey='interest' stroke='#ff7300' name='Dobândă' />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
