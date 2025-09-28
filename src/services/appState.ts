class AppState {
  private static instance: AppState;
  private listeners: ((ticketId: string) => void)[] = [];

  static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  openTicket(ticketId: string) {
    this.listeners.forEach(listener => listener(ticketId));
  }

  onTicketOpen(listener: (ticketId: string) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

export default AppState;