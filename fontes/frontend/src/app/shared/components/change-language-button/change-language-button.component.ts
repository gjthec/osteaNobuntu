import { Component } from '@angular/core';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'change-language-button',
  templateUrl: './change-language-button.component.html',
  styleUrls: ['./change-language-button.component.scss']
})
export class ChangeLanguageButtonComponent {
  availableLangs: AvailableLangs;
  activeLang: string;
  flagCodes: { [key: string]: string };
  private _cdRef: any;

  /**
   * Constructor
   */
  constructor(
      private _translocoService: TranslocoService
  )
  {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void
  {
      // Get the available languages from transloco
      this.availableLangs = this._translocoService.getAvailableLangs();
      // console.log("Linguagens disponíveis para seleção: ", this.availableLangs);

      // Subscribe to language changes
      this._translocoService.langChanges$.subscribe((activeLang) => {

          // Get the active lang
          this.activeLang = activeLang;
          // console.log(this.activeLang);

      });

      // Set the country iso codes for languages for flags
      this.flagCodes = {
          'en': 'us',
          'pt-BR': 'ptbr'
      };
      // console.log(this.flagCodes);
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void
  {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Set the active lang
   *
   * @param lang
   */
  setActiveLang(lang: string): void
  {
      // Set the active lang
      this._translocoService.setActiveLang(lang);
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any
  {
      return item.id || index;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------


}
