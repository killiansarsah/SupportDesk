class TicketIdGenerator {
  static counter = null; // Will be initialized from database
  
  /**
   * Initialize counter from database
   * @param {Model} TicketModel - The Ticket model to query
   */
  static async initializeCounter(TicketModel) {
    if (this.counter !== null) return; // Already initialized
    
    try {
      // Find the ticket with the highest ticket number
      const lastTicket = await TicketModel.findOne({ ticketNumber: /^TKT-\d+$/ })
        .sort({ ticketNumber: -1 })
        .select('ticketNumber')
        .lean();
      
      if (lastTicket && lastTicket.ticketNumber) {
        // Extract the number part from "TKT-XXXXX"
        const lastNumber = parseInt(lastTicket.ticketNumber.replace('TKT-', ''));
        this.counter = isNaN(lastNumber) ? 10000 : lastNumber;
        console.log('✅ Ticket counter initialized from database:', this.counter);
      } else {
        this.counter = 10000;
        console.log('✅ Ticket counter initialized (no existing tickets):', this.counter);
      }
    } catch (error) {
      console.error('❌ Error initializing ticket counter:', error);
      this.counter = 10000; // Fallback to default
    }
  }
  
  /**
   * Generate a short, readable ticket ID in format TKT-XXXXX
   * @param {Model} TicketModel - The Ticket model to query (for initialization)
   * @returns {Promise<string>} Short ticket ID like "TKT-10001"
   */
  static async generateShortId(TicketModel) {
    // Initialize counter if not already done
    await this.initializeCounter(TicketModel);
    
    // Increment and generate ticket number
    this.counter++;
    const ticketNumber = `TKT-${this.counter.toString().padStart(5, '0')}`;
    
    // Double-check this ticket number doesn't exist (in case of race conditions)
    if (TicketModel) {
      const exists = await TicketModel.findOne({ ticketNumber });
      if (exists) {
        console.warn('⚠️ Ticket number collision detected, regenerating...');
        return this.generateShortId(TicketModel); // Recursive call to try next number
      }
    }
    
    return ticketNumber;
  }
  
  /**
   * Generate an even shorter ticket ID in format T-XXXX
   * @returns {Promise<string>} Very short ticket ID like "T-1001"
   */
  static async generateVeryShortId() {
    this.counter++;
    return `T-${this.counter.toString().padStart(4, '0')}`;
  }
  
  /**
   * Generate a date-based ticket ID for better organization
   * @returns {Promise<string>} Date-based ticket ID like "241002-001"
   */
  static async generateDateBasedId() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    
    // Simple counter for the day (in real app, this should be stored in DB)
    const dailyCounter = Math.floor(Math.random() * 999) + 1;
    
    return `${year}${month}${day}-${dailyCounter.toString().padStart(3, '0')}`;
  }
}

export default TicketIdGenerator;