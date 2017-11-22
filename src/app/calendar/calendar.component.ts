import { Component, OnInit } from '@angular/core';
import * as datefns from 'date-fns';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {

  startDate: string;
  numberOfDays: number;
  countryCode: string;
  monthKeys: Array<any>;
  months: Object;
  weekDays: Array<any>;
  holidays: Object;

  constructor() {
    this.weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  }

  ngOnInit() {
  }

  public generate(newStartDate: HTMLInputElement, newNumberOfDays: HTMLInputElement, newCountryCode: HTMLInputElement){

    this.startDate = newStartDate.value;
    this.numberOfDays = Number(newNumberOfDays.value);
    this.countryCode = newCountryCode.value;


    console.log(this.startDate);

    const startDateDate: Date  =  datefns.parse(this.startDate);
    const endDateDate: Date = datefns.addDays(startDateDate, this.numberOfDays);
    const days: Array<Date> = datefns.eachDay(startDateDate, endDateDate);

    this.renderCalendar(days);

  }

  private renderCalendar(days: Array<Date>) {
    this.months = CalendarComponent.groupByMonth(days);
    this.monthKeys = CalendarComponent.getMonths(this.months);
  }

  getWeeksByKey(key): Array<string>{
    const weeks =  CalendarComponent.groupByWeek(this.months[key]);
    return Object.keys(weeks);
  }

  getDays(monthKey, weekKey): Array<Date>{
    const days =  CalendarComponent.groupByWeek(this.months[monthKey]);
    return this.mergeDays(days, weekKey);
  }

  getDate(date){
    const r = datefns.format(date, 'D');
    if (r === 'Invalid Date'){
      return '';
    }
    return r;
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


  static getMonths(monthlyCalendar): Array<string>{
    return Object.keys(monthlyCalendar);
  }


}
