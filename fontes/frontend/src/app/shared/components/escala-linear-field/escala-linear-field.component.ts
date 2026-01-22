import { AfterViewInit, Input, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';

export interface IOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-escala-linear-field',
  templateUrl: './escala-linear-field.component.html',
  styleUrls: ['./escala-linear-field.component.scss']
})
export class EscalaLinearFieldComponent implements AfterViewInit, OnInit {
   /**
   * Título que será apresentado no componente
   */
   @Input() label: string;
   @Input() valuesOptionList: IOption [];
   
   
   public inputValue = new FormControl<object[]>([]);
   
   constructor(
     private translocoService: TranslocoService
   ){
   }

   ngOnInit(): void {
   // console.log(this.valuesOptionList)

   }
 
   ngAfterViewInit(): void {
   }
 
}
