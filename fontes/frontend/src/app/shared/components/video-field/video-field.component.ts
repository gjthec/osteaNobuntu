import { Component, Injector, Input, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { IFieldFile } from 'app/shared/models/file.model';
import { FileService } from 'app/shared/services/file.service';
import { Subject, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-video-field',
  templateUrl: './video-field.component.html',
  styleUrls: ['./video-field.component.scss']
})
export class VideoFieldComponent extends BaseFieldComponent implements OnInit {

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
  mediaRecorder: MediaRecorder | null = null;
  recordedChunks: Blob[] = [];
  savedVideoUrl: SafeUrl | null = null;
  showVideoUrl: boolean = false;
  isVideoSaved: boolean = false;

  constructor(protected injector: Injector,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private fileService: FileService,
    private matSnackBar: MatSnackBar) {
    super(injector);
  }
  ngOnInit(): void {
    this.checkConditional();
}

checkConditional() {
    if (this.conditionalVisibility) {
        // Verifica o valor inicial
        let initialFieldValue = this.resourceForm.get(this.conditionalVisibility.field)?.value;
        if (initialFieldValue && typeof initialFieldValue === 'object' && initialFieldValue.id) {
            initialFieldValue = initialFieldValue.id;
        }
        if (initialFieldValue !== null && typeof initialFieldValue !== 'string') {
            initialFieldValue = initialFieldValue.toString();
        }
        console.log('Initial field value:', initialFieldValue);
        if (this.conditionalVisibility.values.includes(initialFieldValue)) {
            if (this.inputValue.disabled) {
                this.inputValue.enable();
                console.log('Input enabled');
            }
        } else {
            if (this.inputValue.enabled) {
                this.inputValue.disable();
                console.log('Input disabled');
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
            console.log('Field value changed:', fieldValueStr);
            if (this.conditionalVisibility.values.includes(fieldValueStr)) {
                // Caso o valor do fieldValue seja igual a algum de dentro do values ai é habilitado
                if (this.inputValue.disabled) {
                    this.inputValue.enable();
                    console.log('Input enabled');
                }
            } else {
                if (this.inputValue.enabled) {
                    this.inputValue.disable();
                    console.log('Input disabled');
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

  // Start recording video
  startRecording() {
    if (!this.videoStream) return;

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(this.videoStream);
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };
    this.mediaRecorder.start();
  }

  // Stop recording video
  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const videoBlob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(videoBlob);
        this.inputValue.setValue(videoUrl);  // Set the recorded video as input value
        this.savedVideoUrl = this.sanitizer.bypassSecurityTrustUrl(videoUrl); // Sanitize the video URL
        this.showVideoUrl = true; // Show the video URL
        this.closeCamera(); // Close the camera after recording
        this.cdr.detectChanges(); // Force change detection
      };
    }
  }

  saveVideo() {
    const videoUrl = this.inputValue.value;
    if (videoUrl) {
      localStorage.setItem('savedVideo', videoUrl);
      this.matSnackBar.open('Vídeo salvo com sucesso!', 'OK', { duration: 3000 });
      console.log("video saved");
      this.savedVideoUrl = this.sanitizer.bypassSecurityTrustUrl(videoUrl);
      this.showVideoUrl = true; // Set showVideoUrl to true
      this.isVideoSaved = true; // Set isVideoSaved to true
      this.inputValue.setValue(null); // Clear the input value to hide the video preview
      this.cdr.detectChanges(); // Force change detection

      // Supondo que você tenha uma referência ao arquivo .mp4
      const fileName = 'video.mp4'; // Nome do arquivo
      const fileType = 'video/mp4'; // Tipo do arquivo
      fetch(videoUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], fileName, { type: fileType });
          const fieldFile: IFieldFile = {
            fieldType: 'string',
            files: [{
              name: file.name,
              size: file.size,
              extension: 'mp4',
              dataBlob: file,
            }]
          };
          this.fileService.uploadFile(fieldFile).subscribe((response) => {
            console.log("Valor do arquivo: ", response);
          }, (error) => {
            this.matSnackBar.open('Erro ao enviar o vídeo.', 'OK', { duration: 3000 });
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
    this.cdr.detectChanges(); // Force change detection
  }

  clearVideo() {
    this.inputValue.setValue(null);
    this.savedVideoUrl = null;
    this.showVideoUrl = false;
    this.isVideoSaved = false; // Reset isVideoSaved
    this.cdr.detectChanges(); // Force change detection
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
      this.cdr.detectChanges(); // Force change detection
    }
  }

  toggleCamera() {
    this.isFrontCamera = !this.isFrontCamera;
    this.startCamera();
  }
}