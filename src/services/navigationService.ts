export type PageId = 
  | 'dashboard'
  | 'knowledge-base'
  | 'templates'
  | 'canned-responses'
  | 'permissions'
  | 'pwa'
  | 'screenshots'
  | 'csat'
  | 'performance'
  | 'email-integration'
  | 'data-migration'
  | 'user-management'
  | 'settings';

class NavigationService {
  private pageChangeHandler: ((page: PageId) => void) | null = null;
  private dashboardHandler: (() => void) | null = null;

  setPageChangeHandler(handler: (page: PageId) => void) {
    this.pageChangeHandler = handler;
  }

  setDashboardHandler(handler: () => void) {
    this.dashboardHandler = handler;
  }

  navigateTo(page: PageId) {
    if (this.pageChangeHandler) {
      this.pageChangeHandler(page);
    }
  }

  goToDashboard() {
    if (this.dashboardHandler) {
      this.dashboardHandler();
    }
  }
}

export const navigationService = new NavigationService();