import { Component, OnDestroy, OnInit } from '@angular/core';
import { AvailableLangs, TranslocoService } from '@ngneat/transloco';

@Component({
  selector: 'languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss']
})
export class LanguagesComponent implements OnInit, OnDestroy
{
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

            // Update the navigation
            this._updateNavigation(activeLang);
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

    /**
     * Update the navigation
     *
     * @param lang
     * @private
     */
    private _updateNavigation(lang: string): void
    {
        // For the demonstration purposes, we will only update the Dashboard names
        // from the navigation but you can do a full swap and change the entire
        // navigation data.
        //
        // You can import the data from a file or request it from your backend,
        // it's up to you.

        // Get the navigation
        // const navigation = this._translocoService.translate('navigation', { lang });

        // Update the navigation
        // this._navigationService.unregister('main');
        // this._navigationService.register('main', navigation);

        // Mark for check
        // this._cdRef.markForCheck();

        // console.log(navigation);
        
    }
}