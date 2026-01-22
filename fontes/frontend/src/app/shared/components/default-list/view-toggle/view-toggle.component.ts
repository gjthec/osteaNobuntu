import { Component, Output, EventEmitter } from '@angular/core';
import { ViewToggleService } from 'app/shared/services/view-toggle.service';

@Component({
  selector: 'app-view-toggle',
  templateUrl: './view-toggle.component.html',
  styleUrls: ['./view-toggle.component.scss'],
})
export class ViewToggleComponent {
  @Output() viewModeChanged = new EventEmitter<string>();
  public listState: string = 'list-layout';

  constructor(private viewToggleService: ViewToggleService) {}

  changeViewMode(mode: string) {
    this.listState = mode;
    this.viewToggleService.changeViewMode(mode);
    this.viewModeChanged.emit(mode);
  }
}
