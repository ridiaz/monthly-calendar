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

  constructor() { }

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

  }

}
