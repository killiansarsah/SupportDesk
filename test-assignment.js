// Test script to verify ticket assignment functionality
const API_BASE_URL = 'http://localhost:3002/api';

async function testAssignment() {
  try {
    console.log('=== TESTING TICKET ASSIGNMENT ===');
    
    // 1. Get all users
    console.log('\n1. Fetching users...');
    const usersResponse = await fetch(`${API_BASE_URL}/users`);
    const users = await usersResponse.json();
    console.log('Users:', users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role })));
    
    // 2. Get all tickets
    console.log('\n2. Fetching tickets...');
    const ticketsResponse = await fetch(`${API_BASE_URL}/tickets`);
    const tickets = await ticketsResponse.json();
    console.log('Tickets:', tickets.map(t => ({ 
      id: t.id, 
      title: t.title, 
      assignedTo: t.assignedTo,
      status: t.status 
    })));
    
    if (tickets.length === 0) {
      console.log('No tickets found. Creating a test ticket...');
      
      // Create a test ticket
      const customerUser = users.find(u => u.role === 'customer');
      if (!customerUser) {
        console.error('No customer user found');
        return;
      }
      
      const newTicketResponse = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Assignment Ticket',
          description: 'This is a test ticket for assignment functionality',
          category: 'Technical',
          priority: 'medium',
          customerId: customerUser._id
        })
      });
      
      const newTicket = await newTicketResponse.json();
      console.log('Created test ticket:', newTicket);
      tickets.push(newTicket);
    }
    
    // 3. Test assignment
    const testTicket = tickets[0];
    const agentUser = users.find(u => u.role === 'support-agent');
    
    if (!agentUser) {
      console.error('No agent user found');
      return;
    }
    
    console.log(`\n3. Assigning ticket ${testTicket.id} to agent ${agentUser.name} (${agentUser._id})...`);
    
    const updateResponse = await fetch(`${API_BASE_URL}/tickets/${testTicket.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assignedTo: agentUser._id
      })
    });
    
    const updatedTicket = await updateResponse.json();
    console.log('Updated ticket:', {
      id: updatedTicket.id,
      title: updatedTicket.title,
      assignedTo: updatedTicket.assignedTo,
      status: updatedTicket.status
    });
    
    // 4. Verify assignment by fetching tickets for the agent
    console.log(`\n4. Fetching tickets for agent ${agentUser._id}...`);
    const agentTicketsResponse = await fetch(`${API_BASE_URL}/tickets?userId=${agentUser._id}&userRole=support-agent`);
    const agentTickets = await agentTicketsResponse.json();
    
    const assignedTickets = agentTickets.filter(t => t.assignedTo === agentUser._id);
    console.log('Agent assigned tickets:', assignedTickets.map(t => ({
      id: t.id,
      title: t.title,
      assignedTo: t.assignedTo
    })));
    
    console.log('\n=== TEST COMPLETED ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAssignment();