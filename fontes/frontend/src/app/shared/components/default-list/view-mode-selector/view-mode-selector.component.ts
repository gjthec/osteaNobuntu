import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ViewToggleService, ViewMode } from './view-toggle.service';
import { take } from 'rxjs';

@Component({
  selector: 'view-mode-selector',
  templateUrl: './view-mode-selector.component.html',
  styleUrls: ['./view-mode-selector.component.scss']
})
export class ViewModeSelectorComponent implements OnInit {
  @Output() viewModeChanged = new EventEmitter<ViewMode>();
  public listState: string = 'list-layout';

  constructor(private viewToggleService: ViewToggleService) { }

  ngOnInit(): void {
    this.viewToggleService.viewMode$.pipe(take(1)).subscribe({
      next: (value) => {
        this.listState = value;
        this.viewModeChanged.emit(value);
      },
      error: (error) => {
        // this.viewModeChanged.emit(newMode);
      },
    });
  }

  changeViewMode(mode: string) {
    this.listState = mode;
    let newMode = ViewMode.listLayout;
    
    if (mode == ViewMode.cardLayout) {
      newMode = ViewMode.cardLayout;
    }

    this.viewToggleService.changeViewMode(newMode);
    this.viewModeChanged.emit(newMode);

  }
}
