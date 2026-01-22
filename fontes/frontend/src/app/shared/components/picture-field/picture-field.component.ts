import { Component, Injector, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FormControl, FormGroup } from '@angular/forms';
import { FileService } from 'app/shared/services/file.service';
import { IFieldFile } from 'app/shared/models/file.model';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-picture-field',
  templateUrl: './picture-field.component.html',
  styleUrls: ['./picture-field.component.scss']
})
export class PictureFieldComponent extends BaseFieldComponent implements OnInit {

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

  /**
   * Subject responsável por remover os observadores que estão rodando na pagina no momento do componente ser deletado.
   */
  private ngUnsubscribe = new Subject();


  @ViewChild('videoElement') videoElementRef: ElementRef<HTMLVideoElement>;

  inputValue = new FormControl();
  isCameraOpen = false;
  videoStream: MediaStream | null = null;
  isFrontCamera = true;
  savedImageUrl: string | null = null;
  showImageUrl: boolean = false;

  constructor(protected injector: Injector,
    private fileService: FileService,
    private matSnackBar: MatSnackBar
  ) {
    super(injector);
  }

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

  // Open the camera
  async openCamera() {
    this.isCameraOpen = true;
    await this.startCamera();
  }

  // Capture image from video stream
  captureImage() {
    if (!this.videoStream) return;

    const videoElement = this.videoElementRef.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const context = canvas.getContext('2d');
    context?.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL('image/png'); // Save captured image as data URL

    this.inputValue.setValue(imageUrl);  // Set the captured image as input value

    this.closeCamera(); // Close the camera after capturing
  }

  // Save image to local storage
  saveImage() {
    const imageUrl = this.inputValue.value;
    if (imageUrl) {
      localStorage.setItem('savedImage', imageUrl);
      this.matSnackBar.open('Imagem salva com sucesso!', 'OK', { duration: 3000 });
      console.log("image saved");
      // depois que enviar pro banco preciso que limpe o storage
      this.savedImageUrl = imageUrl;
      this.showImageUrl = true; // Set showImageUrl to true
      this.inputValue.setValue(null); // Clear the input value to hide the image preview

      // Supondo que você tenha uma referência ao arquivo .png
      const fileName = 'image.png'; // Nome do arquivo
      const fileType = 'image/png'; // Tipo do arquivo
      fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], fileName, { type: fileType });
          const fieldFile: IFieldFile = {
            fieldType: 'string',
            files: [{
              name: file.name,
              size: file.size,
              extension: 'png',
              dataBlob: file,
            }]
          };
          this.fileService.uploadFile(fieldFile).subscribe((response) => {
            console.log("Valor do arquivo: ", response);
          }, (error) => {
            console.log(error);
            this.matSnackBar.open('Erro ao enviar a imagem.', 'OK', { duration: 3000 });
          });
        });
    }
  }


  // Close the camera
  closeCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    this.videoStream = null;
    this.isCameraOpen = false;
  }

  clearImage() {
    this.inputValue.setValue(null);
    this.savedImageUrl = null;
    this.showImageUrl = false;
  }

  async startCamera() {
    const constraints = {
      video: {
        facingMode: this.isFrontCamera ? 'user' : 'environment'
      }
    };

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoElement = this.videoElementRef.nativeElement;
      videoElement.srcObject = this.videoStream;
      videoElement.play();
    } catch (error) {
      console.error('Error accessing camera: ', error);
      this.isCameraOpen = false;
    }
  }

  toggleCamera() {
    this.isFrontCamera = !this.isFrontCamera;
    this.startCamera();
  }
}