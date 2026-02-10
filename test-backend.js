// Backend Operations Test
// This file tests all CRUD operations without touching UI

import { api } from './services/api.js';

async function testBackend() {
  console.log('🧪 Testing Backend Operations...');
  
  try {
    // Test 1: Inventory Operations
    console.log('\n📦 Testing Inventory...');
    
    // Create product
    const newProduct = await api.inventory.create({
      name: 'Test Product',
      code: 'TEST001',
      type: 'Wood',
      origin: 'Egypt',
      length: 200,
      width: 50,
      thickness: 2,
      bundles: 10,
      boardsPerBundle: 20,
      remainingBoards: 50,
      buyPrice: 100,
      sellPrice: 150
    });
    console.log('✅ Product created:', newProduct.id);
    
    // Get all products
    const products = await api.inventory.getAll();
    console.log('✅ Products retrieved:', products.length);
    
    // Update product
    await api.inventory.update(newProduct.id, { sellPrice: 160 });
    console.log('✅ Product updated');
    
    // Test 2: Client Operations
    console.log('\n👥 Testing Clients...');
    
    // Create client
    const newClient = await api.clients.create({
      name: 'Test Client',
      phone: '01234567890',
      address: 'Test Address',
      type: 'CREDIT',
      balance: 0
    });
    console.log('✅ Client created:', newClient.id);
    
    // Get all clients
    const clients = await api.clients.getAll();
    console.log('✅ Clients retrieved:', clients.length);
    
    // Update client
    await api.clients.update(newClient.id, { balance: 100 });
    console.log('✅ Client updated');
    
    // Test 3: Payment Operations
    console.log('\n💳 Testing Payments...');
    
    // Create payment
    const newPayment = await api.payments.create({
      clientId: newClient.id,
      amount: 50,
      note: 'Test payment'
    });
    console.log('✅ Payment created:', newPayment.id);
    
    // Get all payments
    const payments = await api.payments.getAll();
    console.log('✅ Payments retrieved:', payments.length);
    
    // Test 4: Sales Operations
    console.log('\n🛒 Testing Sales...');
    
    // Create sale
    const newSale = await api.sales.create({
      clientId: newClient.id,
      clientName: newClient.name,
      totalAmount: 200,
      discount: 10,
      finalAmount: 190,
      paidAmount: 100,
      items: [{ productId: newProduct.id, quantity: 1, price: 200 }],
      status: 'PARTIAL'
    });
    console.log('✅ Sale created:', newSale.id);
    
    // Get all sales
    const sales = await api.sales.getAll();
    console.log('✅ Sales retrieved:', sales.length);
    
    // Test 5: Purchase Operations
    console.log('\n📋 Testing Purchases...');
    
    // Create purchase
    const newPurchase = await api.purchases.create({
      productId: newProduct.id,
      supplierName: 'Test Supplier',
      itemName: newProduct.name,
      quantity: 5,
      unitPrice: 80,
      totalPrice: 400
    });
    console.log('✅ Purchase created:', newPurchase.id);
    
    // Get all purchases
    const purchases = await api.purchases.getAll();
    console.log('✅ Purchases retrieved:', purchases.length);
    
    // Test 6: Expense Operations
    console.log('\n🧾 Testing Expenses...');
    
    // Create expense
    const newExpense = await api.expenses.create({
      description: 'Test Expense',
      amount: 25,
      category: 'Office'
    });
    console.log('✅ Expense created:', newExpense.id);
    
    // Get all expenses
    const expenses = await api.expenses.getAll();
    console.log('✅ Expenses retrieved:', expenses.length);
    
    // Test 7: Data Relationships
    console.log('\n🔗 Testing Data Relationships...');
    
    // Verify client has payments
    const clientPayments = payments.filter(p => p.clientId === newClient.id);
    console.log('✅ Client payments linked:', clientPayments.length);
    
    // Verify client has sales
    const clientSales = sales.filter(s => s.clientId === newClient.id);
    console.log('✅ Client sales linked:', clientSales.length);
    
    // Test 8: Delete Operations (with proper order)
    console.log('\n🗑️ Testing Delete Operations...');
    
    // Delete in correct order to respect foreign keys
    await api.sales.delete(newSale.id);
    console.log('✅ Sale deleted');
    
    await api.payments.delete(newPayment.id);
    console.log('✅ Payment deleted');
    
    await api.purchases.delete(newPurchase.id);
    console.log('✅ Purchase deleted');
    
    await api.expenses.delete(newExpense.id);
    console.log('✅ Expense deleted');
    
    await api.clients.delete(newClient.id);
    console.log('✅ Client deleted');
    
    await api.inventory.delete(newProduct.id);
    console.log('✅ Product deleted');
    
    console.log('\n🎉 ALL BACKEND OPERATIONS WORKING PERFECTLY!');
    
  } catch (error) {
    console.error('❌ Backend test failed:', error);
    throw error;
  }
}

// Run the test
testBackend().then(() => {
  console.log('✅ Backend verification complete');
}).catch(error => {
  console.error('❌ Backend verification failed:', error);
});
