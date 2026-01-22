import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-input-image-field',
  templateUrl: './input-image-field.component.html',
  styleUrls: ['./input-image-field.component.scss']
})
export class InputImageFieldComponent {
  @Input() imagePath: string;
  @Input() imageDescription: string;
}
