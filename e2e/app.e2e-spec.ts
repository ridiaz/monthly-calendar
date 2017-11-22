import { MonthlyCalendarPage } from './app.po';

describe('monthly-calendar App', () => {
  let page: MonthlyCalendarPage;

  beforeEach(() => {
    page = new MonthlyCalendarPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
