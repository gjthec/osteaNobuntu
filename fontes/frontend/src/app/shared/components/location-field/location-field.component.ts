import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { GeolocationService } from '@ng-web-apis/geolocation';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { MatDialog } from '@angular/material/dialog';
import { LocationPickerDialogComponent } from '../location-picker-dialog/location-picker-dialog.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-location-field',
  templateUrl: './location-field.component.html',
  styleUrls: ['./location-field.component.scss']
})
export class LocationFieldComponent extends BaseFieldComponent implements OnInit {
  @Input() label: string;
  @Input() isRequired: boolean = false;
  @Input() className: string;
  /**
    * Condicao de visibilidade do campo.
    */
  @Input() conditionalVisibility: { field: string, values: string[] }
  /**
  * FormGroup do formulario.
  */
  @Input() resourceForm: FormGroup<any>;
  @Input() locationMarker: { lat: number, lng: number, quadrant?: string };

  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();

  inputValue = new FormControl('');
  displayedLabel = 'Location';

  constructor(private dialog: MatDialog,
    protected injector: Injector,
  ) { super(injector); }

  ngOnInit(): void {
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

  getLocation(): void {
    const dialogRef = this.dialog.open(LocationPickerDialogComponent, {
      width: '100vw', // Largura total da tela
      height: '100vh', // Altura total da tela
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'full-screen-dialog', // Classe CSS para personalização adicional
      data: { locationMarker: this.locationMarker } // Passa o locationMarker para o dialog
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.inputValue.setValue(`Lat: ${result.lat}, Lng: ${result.lng}, Quadrante: ${result.quadrant}`);
        console.log(this.inputValue)
      }
    });
  }
}
