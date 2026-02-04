import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { ThemeService } from '../../services/theme.service';

@Component({
	selector: 'app-theme-toggle',
	templateUrl: './theme-toggle.component.html',
	styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent {
	isDark$ = this.themeService.theme$.pipe(map((theme) => theme === 'dark'));

	constructor(private themeService: ThemeService) {}

	toggleTheme(): void {
		this.themeService.toggle();
	}
}
