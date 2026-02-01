import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

type ThemeMode = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
	private readonly storageKey = 'theme';
	private readonly themeSubject = new BehaviorSubject<ThemeMode>('light');
	readonly theme$ = this.themeSubject.asObservable();

	constructor(@Inject(DOCUMENT) private document: Document) {}

	init(): void {
		const storedTheme = this.getStoredTheme();
		this.setTheme(storedTheme);
	}

	toggle(): void {
		const nextTheme: ThemeMode =
			this.themeSubject.value === 'dark' ? 'light' : 'dark';
		this.setTheme(nextTheme);
	}

	private setTheme(theme: ThemeMode): void {
		this.themeSubject.next(theme);
		this.applyTheme(theme);
		try {
			localStorage.setItem(this.storageKey, theme);
		} catch {
			// Ignore storage errors (e.g. private mode)
		}
	}

	private getStoredTheme(): ThemeMode {
		try {
			const stored = localStorage.getItem(this.storageKey);
			return stored === 'dark' ? 'dark' : 'light';
		} catch {
			return 'light';
		}
	}

	private applyTheme(theme: ThemeMode): void {
		const body = this.document.body;
		if (theme === 'dark') {
			body.classList.add('theme-dark');
		} else {
			body.classList.remove('theme-dark');
		}
	}
}
