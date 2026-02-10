// Test Expenses API
import { api } from './services/api.js';
import { db } from './lib/db.js';

async function testExpenseAPI() {
  console.log('🧪 Testing Expenses API...');
  
  try {
    // Initialize database
    await db.init();
    console.log('✅ Database initialized');
    
    // Test 1: Get all expenses
    const allExpenses = await api.expenses.getAll();
    console.log('✅ getAll() result:', allExpenses);
    
    // Test 2: Create expense
    const newExpense = await api.expenses.create({
      description: 'Test Expense',
      amount: 50.00,
      category: 'مصروفات نثرية'
    });
    console.log('✅ create() result:', newExpense);
    
    // Test 3: Get all expenses again
    const updatedExpenses = await api.expenses.getAll();
    console.log('✅ getAll() after create:', updatedExpenses);
    
    // Test 4: Delete expense
    await api.expenses.delete(newExpense.id);
    console.log('✅ delete() completed');
    
    // Test 5: Final check
    const finalExpenses = await api.expenses.getAll();
    console.log('✅ getAll() after delete:', finalExpenses);
    
    console.log('🎉 All Expense API tests passed!');
    
  } catch (error) {
    console.error('❌ Expense API test failed:', error);
  }
}

testExpenseAPI();
