import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-capture-location-field',
  templateUrl: './capture-location-field.component.html',
  styleUrls: ['./capture-location-field.component.scss']
})
export class CaptureLocationFieldComponent extends BaseFieldComponent implements OnInit, OnDestroy {
  @Input() label: string;
  @Input() charactersLimit: number;
  @Input() isRequired: boolean = false;
  @Input() className: string;
  @Input() placeholder: string = 'Clique para capturar localização';
  @Input() mask: string;
  @Input() svgIcon: string | null = 'my_location'; // Ícone de localização padrão
  @Input() actionOnClickInIcon: (() => void) | null = null;
  /**
    * Condicao de visibilidade do campo.
    */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;

  displayedLabel: string;
  inputValue = new FormControl<string | null>(null);
  private ngUnsubscribe = new Subject();

  constructor(protected injector: Injector, private matSnackBar: MatSnackBar) {
    super(injector);
  }

  ngOnInit(): void {
    this.setLabel();
    this.checkConditional();
  }

  
  checkConditional() {
    if (this.conditionalVisibility) {
      // Verifica o valor inicial
      let initialFieldValue = this.resourceForm.get(this.conditionalVisibility.field)?.value;
      console.log('Initial field value:', initialFieldValue);
      if (initialFieldValue && typeof initialFieldValue === 'object' && initialFieldValue.id) {
        initialFieldValue = initialFieldValue.id;
      }
      if (initialFieldValue !== null && typeof initialFieldValue !== 'string') {
        initialFieldValue = initialFieldValue.toString();
      }
      if (this.conditionalVisibility.values.includes(initialFieldValue)) {
        if (this.inputValue.disabled) {
          this.inputValue.enable();
        }
      } else {
        if (this.inputValue.enabled) {
          this.inputValue.disable();
        }
      }


      // Observa mudanças no valor do resourceForm
      this.resourceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(formValues => {
        // Verifica todas as alterações dos campos de input 
        let fieldValue = formValues[this.conditionalVisibility.field];
        // Verifica se o valor é um objeto e pega o id
        if (fieldValue && typeof fieldValue === 'object' && fieldValue.id) {
          fieldValue = fieldValue.id;
        }
        // Transforma em string caso nao seja
        const fieldValueStr = fieldValue?.toString();
        if (this.conditionalVisibility.values.includes(fieldValueStr)) {
          // Caso o valor do fieldValue seja igual a algum de dentro do values ai é habilitado
          if (this.inputValue.disabled) {
            this.inputValue.enable();
          }
        } else {
          if (this.inputValue.enabled) {
            this.inputValue.disable();
          }
        }
      });
    }
  }

  setLabel() {
    this.setTranslation(this.className, this.label).pipe(takeUntil(this.ngUnsubscribe)).subscribe({
      next: (translatedLabel: string) => {
        if (translatedLabel === (this.className + "." + this.label)) {
          const formattedLabel = this.formatDefaultVariableName(this.label);
          this.displayedLabel = this.setCharactersLimit(formattedLabel, this.charactersLimit);
        } else {
          this.displayedLabel = this.setCharactersLimit(translatedLabel, this.charactersLimit);
        }
      },
      error: () => {
        this.displayedLabel = this.setCharactersLimit(this.label, this.charactersLimit);
      },
    });
  }

  // Obtém a localização ao clicar no campo ou no ícone
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const quadrant = this.getQuadrant(lat, lng);
          this.inputValue.setValue(`Lat: ${lat}, Lng: ${lng}, Quadrante: ${quadrant}`);
          console.log(this.inputValue)
        },
        () => {
          this.matSnackBar.open('Não foi possível obter sua localização.', 'OK', { duration: 3000 });
        }
      );
    } else {
      this.matSnackBar.open('Geolocalização não é suportada pelo seu navegador.', 'OK', { duration: 3000 });
    }
  }

  // Define o quadrante baseado na latitude e longitude
  getQuadrant(lat: number, lng: number): string {
    if (lat >= 0 && lng >= 0) return 'NE (Nordeste)';
    if (lat >= 0 && lng < 0) return 'NO (Noroeste)';
    if (lat < 0 && lng >= 0) return 'SE (Sudeste)';
    return 'SO (Sudoeste)';
  }

  // Define a posição do ícone (início ou fim do campo)
  setIconPosition(): string {
    return 'end';
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
