import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Transaction, Category } from '@/lib/firebase';

export const useTransactions = (userId: string | undefined, profileType: string) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const transactionsRef = collection(db, 'users', userId, 'profiles', profileType, 'transactions');
      const q = query(transactionsRef, orderBy('date', 'desc'), limit(100));

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const transactionData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Transaction[];
          
          setTransactions(transactionData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error fetching transactions:', error);
          setError('Failed to load transactions');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up transactions listener:', error);
      setError('Failed to load transactions');
      setLoading(false);
    }
  }, [userId, profileType]);

  return { transactions, loading, error };
};

export const useCategories = (userId: string | undefined, profileType: string) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const categoriesRef = collection(db, 'users', userId, 'profiles', profileType, 'categories');
      
      const unsubscribe = onSnapshot(categoriesRef, 
        (snapshot) => {
          const categoryData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Category[];
          
          setCategories(categoryData);
          setLoading(false);
          setError(null);
        },
        (error) => {
          console.error('Error fetching categories:', error);
          setError('Failed to load categories');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up categories listener:', error);
      setError('Failed to load categories');
      setLoading(false);
    }
  }, [userId, profileType]);

  return { categories, loading, error };
};

export const useFinancialSummary = (transactions: Transaction[]) => {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyData: [] as Array<{ month: string; income: number; expenses: number }>
  });

  useEffect(() => {
    if (!transactions.length) {
      setSummary({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        monthlyData: []
      });
      return;
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Filter current month transactions
    const currentMonthTransactions = transactions.filter(transaction => {
      const transactionDate = transaction.date?.toDate?.() || new Date();
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Generate monthly data for the last 6 months
    const monthlyData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = { month: date.getMonth(), year: date.getFullYear() };
      
      const monthTransactions = transactions.filter(transaction => {
        const transactionDate = transaction.date?.toDate?.() || new Date();
        return transactionDate.getMonth() === monthYear.month && 
               transactionDate.getFullYear() === monthYear.year;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyData.push({
        month: months[monthYear.month],
        income: monthIncome,
        expenses: monthExpenses
      });
    }

    setSummary({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      monthlyData
    });
  }, [transactions]);

  return summary;
};