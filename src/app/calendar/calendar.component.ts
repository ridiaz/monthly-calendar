import { Component, OnInit } from '@angular/core';
import * as datefns from 'date-fns';
import {Http, Response} from '@angular/http';
import 'rxjs/add/operator/map'

interface CalendarCell {
  label: string;
  colorClass: string;
  holidayName: string;
}

interface MonthView {
  key: string;
  weeks: Array<Array<CalendarCell>>;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  startDate: string;
  numberOfDays: number;
  countryCode: string;
  viewMonths: Array<MonthView> = [];
  weekDays: Array<any>;
  holidays: Object;

  constructor(private http: Http) {
    this.weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  }

  ngOnInit() {
  }

  public generate(newStartDate: HTMLInputElement, newNumberOfDays: HTMLInputElement, newCountryCode: HTMLInputElement){

    this.startDate = newStartDate.value;
    this.numberOfDays = Number(newNumberOfDays.value);
    this.countryCode = newCountryCode.value;
    this.holidays = {};


    console.log(this.startDate);

    const startDateDate: Date  =  datefns.parse(this.startDate);
    const endDateDate: Date = datefns.addDays(startDateDate, this.numberOfDays);
    const days: Array<Date> = datefns.eachDay(startDateDate, endDateDate);

    this.getHolidays(this.countryCode, '2008').subscribe((response) => {
      this.holidays = response['holidays'];
      this.renderCalendar(days);
      console.log(this.holidays);
    }, (error) => {
      console.log('Got an error', error);
      this.renderCalendar(days);
    });

  }


  getHolidays(countryCode, year){

    const url = `https://holidayapi.com/v1/holidays?key=9ab5366a-1dfc-4520-aaeb-fe14b33dc0e6&country=${countryCode}&year=${year}`;

    return this.http.get(url).map(
      (response: Response) => {
        return (<any>response.json());
      }
    )

  }

  private renderCalendar(days: Array<Date>) {
    const months = CalendarComponent.groupByMonth(days);
    const monthKeys = CalendarComponent.getMonths(months);
    const viewMonths: Array<MonthView> = [];
    for (let i = 0; i < monthKeys.length; i++) {
      const key = monthKeys[i];
      const weeksByKey = CalendarComponent.groupByWeek(months[key]);
      const weekKeys = Object.keys(weeksByKey);
      const weeks: Array<Array<CalendarCell>> = [];
      for (let j = 0; j < weekKeys.length; j++) {
        const mergedDays = this.mergeDays(weeksByKey, weekKeys[j]);
        const cells: Array<CalendarCell> = [];
        for (let k = 0; k < mergedDays.length; k++) {
          const day = mergedDays[k];
          cells.push({
            label: this.getDate(day),
            colorClass: this.getColorOfDay(day),
            holidayName: this.getHolidayName(day)
          });
        }
        weeks.push(cells);
      }
      viewMonths.push({ key: key, weeks: weeks });
    }
    this.viewMonths = viewMonths;
  }

  private getDate(date){
    const r = datefns.format(date, 'D');
    if (r === 'Invalid Date'){
      return '';
    }
    return r;
  }

  private getHolidayName(date){
    let key = datefns.format(date, 'YYYY[-]MM[-]DD');
    if ((key in this.holidays)){
      return this.holidays[key][0]['name'];
    }else{
      return '';
    }
  }

  private getColorOfDay(date){
    const r = datefns.format(date, 'D');
    if (r === 'Invalid Date'){
      return 'gray';

    }else if (this.isHoliday(date)){
      return 'orange'
    }else if(datefns.isWeekend(date)){

      return 'yellow';

    }else{
      return 'green';
    }
  }

  private isHoliday(date){
    return datefns.format(date, 'YYYY[-]MM[-]DD') in this.holidays;
  }

  private mergeDays(days, weekKey): Array<Date> {
    const days_merged = [];
    for (let i = 0; i < this.weekDays.length; i=i+1) {
      days_merged.push(undefined);
    }
    for (let i = 0; i < days[weekKey].length; i=i+1) {
      let index = datefns.getDay(days[weekKey][i]);
      days_merged[index] = days[weekKey][i];
    }
    //console.log(days_merged);
    return days_merged;
  }

  static groupByMonth(days: Array<Date>): Object{

    const groups = {};
    const len = days.length;
    for (let i=0; i < len; i=i+1){
      let key = datefns.format(days[i], 'YYYY[-]MM');
      if (!(key in groups)){
        groups[key] = {};
        groups[key] = [days[i]];
      }else{
        groups[key].push(days[i]);
      }
    }
    return groups;
  }

  static groupByWeek(monthlyCalendar: Array<any>): Object{

    let count = 0;
    const groups  = {};
    let startOfWeek = datefns.startOfWeek(monthlyCalendar[0]);
    for(let i=0; i < monthlyCalendar.length; i=i+1){
      if(!datefns.isSameWeek(startOfWeek, monthlyCalendar[i])){
        count += 1;
        startOfWeek = datefns.startOfWeek(monthlyCalendar[i]);
      }
      if (!(count in groups)){
        groups[count] = [ monthlyCalendar[i] ];
      }else{
        groups[count].push(monthlyCalendar[i]);
      }
    }

    return groups;
  }


  static getMonths(monthlyCalendar): Array<string> {
    return Object.keys(monthlyCalendar);
  }


}
