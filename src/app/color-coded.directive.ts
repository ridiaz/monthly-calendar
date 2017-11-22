import { Directive, HostBinding, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appColorCoded]'
})
export class ColorCodedDirective implements OnInit{

  @Input() colorClass: string;
  @Input() name: string;
  @HostBinding('attr.class') cssClass = '';


  ngOnInit(): void {
    //console.log('colorClass', this.colorClass);
    this.cssClass = this.colorClass;
  }

  constructor() {
  }

}
