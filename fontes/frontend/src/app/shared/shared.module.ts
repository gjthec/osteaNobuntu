//Modules
import { NgModule } from '@angular/core';
import { CommonModule, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TRANSLOCO_SCOPE, TranslocoModule } from '@ngneat/transloco';
// import { BaseResourceFilterComponent } from './components/filter/base-resource-filter.component';
import { NgxMaskModule } from 'ngx-mask';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { LayoutModule } from '@angular/cdk/layout';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GEOLOCATION } from '@ng-web-apis/geolocation';

//Components
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
// import { FilterPeriodComponent } from './components/filter/filter-period/filter-period.component';
import { CalculatorComponent } from './components/calculator/calculator.component';
// import { FilterTextComponent } from './components/filter/filter-text/filter-text.component';
// import { FilterNumberWithConditionsComponent } from './components/filter/filter-number-with-conditions/filter-number-with-conditions.component';
// import { FilterBooleanComponent } from './components/filter/filter-boolean/filter-boolean.component';
import { InputFieldComponent } from './components/input-field/input-field.component';
import { FieldComponent } from './components/field/field.component';
import { DateFieldComponent } from './components/date-field/date-field.component';
import { InputDateFieldComponent } from './components/input-date-field/input-date-field.component';
import { ForeignKeyInputFieldComponent } from './components/foreign-key-input-field/foreign-key-input-field.component';
import { SelectorInputFieldComponent } from './components/selector-input-field/selector-input-field.component';
import { SelectableCardComponent } from './components/selectable-card/selectable-card.component';
import { SelectableListItemComponent } from './components/selectable-list-item/selectable-list-item.component';
import { InputImageFieldComponent } from './components/input-image-field/input-image-field.component';
import { DefaultListComponent } from './components/default-list/default-list.component';
import { DefaultCardComponent } from './components/default-card/default-card.component';
import { GeneratedSimpleFormComponent } from './components/generated-simple-form/generated-simple-form.component';
import { GeneratedStepperFormComponent } from './components/generated-stepper-form/generated-stepper-form.component';
import { SelectedItemsListComponent } from './components/selected-items-list/selected-items-list.component';
import { SearchInputFieldComponent } from './components/search-input-field/search-input-field.component';
import { SortOrderDialogComponent } from './components/sort-order-dialog/sort-order-dialog.component';
import { DefaultTableComponent } from './components/default-table/default-table.component';
import { DinamicBaseResourceFormComponent } from './components/dinamic-base-resource-form/dinamic-base-resource-form.component';
import { LayoutTestComponent } from './components/layout-test/layout-test.component';
import { LanguagesComponent } from './components/languages/languages.component';
import { SubformComponent } from './components/subform/subform.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { ListAppsComponent } from './components/list-apps/list-apps.component';
import { ConfirmChangeAppComponent } from './components/list-apps/confirm-change-app/confirm-change-app.component';
import { FormSpaceBuildComponent } from './components/form-space-build/form-space-build.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';
import { CheckboxFieldComponent } from './components/checkbox-field/checkbox-field.component';
import { SelectorFieldComponent } from './components/selector-field/selector-field.component';
import { UploadInputFieldComponent } from './components/upload-input-field/upload-input-field.component';
import { TimeFieldComponent, TimePickerDialogComponent } from './components/time-field/time-field.component';
import { EscalaLinearFieldComponent } from './components/escala-linear-field/escala-linear-field.component';
import { CaptureLocationFieldComponent } from './components/capture-location-field/capture-location-field.component';
import { DefaultConsultaComponent } from './components/default-consulta/default-consulta.component';
import { ConsultaFormComponent } from './components/default-consulta/consulta-form/consulta-form.component';
import { LocationFieldComponent } from './components/location-field/location-field.component';
import { LocationPickerDialogComponent } from './components/location-picker-dialog/location-picker-dialog.component';
import { POSITION_OPTIONS } from '@ng-web-apis/geolocation';
import { BrowserModule } from '@angular/platform-browser';
import { PictureFieldComponent } from './components/picture-field/picture-field.component';
import { VideoFieldComponent } from './components/video-field/video-field.component';
import { VerticalBarChartComponent } from './components/vertical-bar-chart/vertical-bar-chart.component';
import { HorizontalBarChartComponent } from './components/horizontal-bar-chart/horizontal-bar-chart.component';
import { PieChartComponent } from './components/pie-chart/pie-chart.component';
import { LineChartComponent } from './components/line-chart/line-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DefaultGraphicComponent } from './components/default-graphic/default-graphic.component';
import { ChartDateFilterComponent } from './components/chart-date-filter/chart-date-filter.component';
import { DefaultDashboardComponent } from './components/default-dashboard/default-dashboard.component';
import { ViewModeSelectorComponent } from './components/default-list/view-mode-selector/view-mode-selector.component';
import { LoadingDialogModule } from './components/loading-dialog/loading-dialog.module';
import { LoadingDialogComponent } from './components/loading-dialog/loading-dialog.component';
import { SendFormDataModule } from './components/send-form-data/send-form-data.module';

import { UserMenuModule } from './components/user-menu/user-menu.module';
import { TenantMenuModule } from './components/tenant-menu/tenant-menu.module';
import { AvaliacaoFieldComponent } from './components/avaliacao-field/avaliacao-field.component';
import { AvaliacaoUnicaFieldComponent } from './components/avaliacao-unica-field/avaliacao-unica-field.component';
import { MenuChoiceComponent } from './components/side-nav/menu-choice/menu-choice.component';
import { NumberFieldComponent } from './components/number-field/number-field.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FilterModule } from './components/filter/filter.module';
import { LanguageInterceptor } from './interceptors/language.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { UploadFieldComponent } from './components/upload-field/upload-field.component';
import { FileViwerComponent } from './components/file-viwer/file-viwer.component';

@NgModule({
    imports: [
        CommonModule,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatStepperModule,
        MatButtonModule,
        MatCheckboxModule,
        MatListModule,
        MatRadioModule,
        MatMenuModule,
        MatTableModule,
        MatPaginatorModule,
        TranslocoModule,
        NgxMaskModule.forRoot(),
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDialogModule,
        MatSnackBarModule,
        LayoutModule,
        MatCardModule,
        MatDividerModule,
        MatTabsModule,
        MatToolbarModule,
        MatSidenavModule,
        MatProgressSpinnerModule,
        MatExpansionModule,
        MatTooltipModule,
        //Nobuntu Modules
        UserMenuModule,
        TenantMenuModule,
        NgxChartsModule,
        MatButtonToggleModule,
        FilterModule,
        LoadingDialogModule,
        SendFormDataModule,
        // FilterMenuModule
    ],
    providers: [
        { provide: POSITION_OPTIONS, useValue: { enableHighAccuracy: true, timeout: 3000, maximumAge: 1000 } },
        { provide: TRANSLOCO_SCOPE, useValue: { scope: "components", alias: "componentsBase" } },
        { provide: HTTP_INTERCEPTORS, useClass: LanguageInterceptor, multi: true },
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatStepperModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        // BaseResourceFilterComponent,
        MatDialogModule,
        MatMenuModule,
        CalculatorComponent,
        InputFieldComponent,
        MatButtonModule,
        GeneratedSimpleFormComponent,
        DefaultListComponent,
        GeneratedStepperFormComponent,
        TranslocoModule,
        DinamicBaseResourceFormComponent,
        LanguagesComponent,
        MenuChoiceComponent,
        NumberFieldComponent,
        MatButtonToggleModule,
        FilterModule,
        SendFormDataModule,
        // FilterMenuModule,
        LoadingDialogComponent,
    ],
    declarations: [
        CalculatorComponent,
        InputFieldComponent,
        FieldComponent,
        DateFieldComponent,
        InputDateFieldComponent,
        ForeignKeyInputFieldComponent,
        SelectorInputFieldComponent,
        SelectableCardComponent,
        SelectableListItemComponent,
        InputImageFieldComponent,
        DefaultListComponent,
        DefaultCardComponent,
        GeneratedSimpleFormComponent,
        GeneratedStepperFormComponent,
        SelectedItemsListComponent,
        SearchInputFieldComponent,
        SortOrderDialogComponent,
        DefaultTableComponent,
        DinamicBaseResourceFormComponent,
        SideNavComponent,
        ConfirmationDialogComponent,
        LayoutTestComponent,
        LanguagesComponent,
        SubformComponent,
        ListAppsComponent,
        ConfirmChangeAppComponent,
        FormSpaceBuildComponent,
        ResetPasswordComponent,
        EditProfileComponent,
        CheckboxFieldComponent,
        EditProfileComponent,
        SelectorFieldComponent,
        UploadInputFieldComponent,
        TimeFieldComponent,
        EscalaLinearFieldComponent,
        TimePickerDialogComponent,
        CaptureLocationFieldComponent,
        DefaultConsultaComponent,
        ConsultaFormComponent,
        LocationFieldComponent,
        LocationPickerDialogComponent,
        PictureFieldComponent,
        VideoFieldComponent,
        ListAppsComponent,
        VerticalBarChartComponent,
        HorizontalBarChartComponent,
        PieChartComponent,
        LineChartComponent,
        DefaultGraphicComponent,
        ChartDateFilterComponent,
        DefaultDashboardComponent,
        AvaliacaoFieldComponent,
        AvaliacaoUnicaFieldComponent,
        MenuChoiceComponent,
        NumberFieldComponent,
        ViewModeSelectorComponent,
        UploadFieldComponent,
        FileViwerComponent
    ],
})
export class SharedModule { }

