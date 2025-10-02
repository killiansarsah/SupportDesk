class TicketIdGenerator {
  static counter = 10000; // Start from 10000 for 5-digit numbers
  
  /**
   * Generate a short, readable ticket ID in format TKT-XXXXX
   * @returns {Promise<string>} Short ticket ID like "TKT-10001"
   */
  static async generateShortId() {
    this.counter++;
    return `TKT-${this.counter.toString().padStart(5, '0')}`;
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