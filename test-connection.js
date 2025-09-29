// Comprehensive connection test script
const testConnection = async () => {
  console.log('🔍 Testing Backend Connection...\n');
  
  try {
    console.log('🔗 Attempting to connect to http://localhost:3002/api/health');
    const response = await fetch('http://localhost:3002/api/health', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend Status:', data.status);
      console.log('🗜️  Database:', data.database);
      console.log('⏰ Timestamp:', data.timestamp);
      console.log('📊 Uptime:', Math.round(data.uptime), 'seconds');
      
      if (data.mongodb) {
        console.log('🔗 MongoDB Host:', data.mongodb.host || 'Not available');
        console.log('📁 Database Name:', data.mongodb.name || 'Not available');
        console.log('🔌 Ready State:', data.mongodb.readyState, '(1=connected, 0=disconnected)');
      }
      
      if (data.database === 'Connected') {
        console.log('\n🎉 All systems operational!');
        return true;
      } else {
        console.log('\n⚠️  Database connection issue detected');
        console.log('💡 Try running: cd backend && npm run reset-users');
        return false;
      }
    } else {
      console.log('❌ Backend responded with error:', response.status, response.statusText);
      const errorText = await response.text().catch(() => 'No error details');
      console.log('📜 Error details:', errorText);
      return false;
    }
  } catch (error) {
    console.log('❌ Cannot connect to backend server');
    console.log('💡 Troubleshooting steps:');
    console.log('  1. Check if backend is running: cd backend && npm run dev');
    console.log('  2. Verify port 3002 is not blocked by firewall');
    console.log('  3. Check if another service is using port 3002');
    console.log('\n🔧 Error details:', error.message);
    return false;
  }
};

// Test login endpoint
const testLogin = async () => {
  console.log('\n🔐 Testing Login Endpoint...');
  
  try {
    const response = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@company.com',
        password: 'password123'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful for:', data.user?.name);
      console.log('🎫 Token received:', data.token ? 'Yes' : 'No');
      console.log('👤 User ID:', data.user?._id || data.user?.id);
      console.log('🏆 Role:', data.user?.role);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.log('❌ Login failed:', response.status);
      console.log('📜 Error:', errorData.error);
      
      if (errorData.error?.includes('phone')) {
        console.log('💡 Fix: Run "cd backend && npm run reset-users" to fix user data');
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Login test failed:', error.message);
    return false;
  }
};

// Test users endpoint
const testUsers = async () => {
  console.log('\n👥 Testing Users Endpoint...');
  
  try {
    const response = await fetch('http://localhost:3002/api/users');
    
    if (response.ok) {
      const users = await response.json();
      console.log('✅ Found', users.length, 'users in database');
      users.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
      });
      return true;
    } else {
      console.log('❌ Users endpoint failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Users test failed:', error.message);
    return false;
  }
};

// Run comprehensive tests
const runTests = async () => {
  console.log('=' .repeat(60));
  console.log('  🚀 Customer Support System - Connection Test');
  console.log('=' .repeat(60));
  
  const connectionOk = await testConnection();
  
  if (connectionOk) {
    const loginOk = await testLogin();
    const usersOk = await testUsers();
    
    console.log('\n' + '=' .repeat(60));
    console.log('  📋 Test Results Summary');
    console.log('=' .repeat(60));
    console.log('🔗 Backend Connection:', connectionOk ? '✅ OK' : '❌ FAILED');
    console.log('🔐 Login System:', loginOk ? '✅ OK' : '❌ FAILED');
    console.log('👥 User Management:', usersOk ? '✅ OK' : '❌ FAILED');
    
    if (connectionOk && loginOk && usersOk) {
      console.log('\n🎉 All systems are working correctly!');
      console.log('🚀 You can now start the frontend: npm run dev');
    } else {
      console.log('\n⚠️  Some issues detected. Please fix them before proceeding.');
      console.log('💡 Try running: fix-database.bat');
    }
  } else {
    console.log('\n❌ Backend server is not responding');
    console.log('💡 Start the backend first: cd backend && npm run dev');
  }
  
  console.log('\n📋 Connection test completed');
};

runTests();