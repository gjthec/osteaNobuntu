import { Component, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CalculatorComponent } from '../calculator/calculator.component';

@Component({
	selector: 'number-field',
	templateUrl: './number-field.component.html',
	styleUrls: ['./number-field.component.scss']
})
export class NumberFieldComponent
	extends BaseFieldComponent
	implements OnInit, OnDestroy
{
	@Input() className: string;
	@Input() label: string;
	@Input() charactersLimit: number;
	@Input() placeholder: string = '';
	@Input() mask: string;
	@Input() maskType: string;
	@Input() svgIcon: string | null = 'heroicons_solid:calculator';
	@Input() isRequired: boolean = false;
	@Input() iconPosition: string = 'end';
	@Input() defaultValue: string | number | null = null;
	@Input() actionOnClickInIcon: () => void = null;
	@Input() conditionalVisibility: { field: string; values: string[] };
	@Input() resourceForm: FormGroup<any>;
	@Input() limiteOfChars: number;
	@Input() numberOfDecimals: number;
	@Input() decimalSeparator: string;

	displayedLabel: string;
	public inputValue = new FormControl<string | number | null>(null);
	private ngUnsubscribe = new Subject();
	public errorMessage: string = '';
	private inputSubscription: any = null;
	valueForSaving: any;

	constructor(
		protected injector: Injector,
		private dialog: MatDialog
	) {
		super(injector);
	}

	ngOnInit(): void {
		this.getDefaultValue();
		this.setLabel();
		this.checkConditional();
		this.setIconPhone();
		this.setupMaskAndListener();
		this.checkCharacterLimit();
	}

	checkCharacterLimit() {
		// Usa limiteOfChars do JSON ou charactersLimit do Input original
		const limitValue = this.limiteOfChars || this.charactersLimit;

		if (limitValue) {
			this.inputValue.addValidators((control: FormControl) => {
				if (!control.value && control.value !== 0) return null;

				// Limpa a string para validar apenas os dígitos
				const valueString = control.value.toString().trim();
				const limitBase = Number(limitValue);
				const decimals = Number(this.numberOfDecimals || 0);

				// Se houver decimais, o limite total considera: inteiros + decimais + 1 (separador)
				const totalAllowed =
					decimals > 0 ? limitBase + decimals + 1 : limitBase;

				return valueString.length <= totalAllowed
					? null
					: { characterLimitExceeded: true };
			});
			// Atualiza o estado visual do erro
			this.inputValue.updateValueAndValidity({ emitEvent: false });
		}
	}

	getDefaultValue() {
		if (this.defaultValue != null) {
			this.inputValue.setValue(this.defaultValue);
		}
	}

	setupMaskAndListener() {
		if (this.inputSubscription) {
			this.inputSubscription.unsubscribe();
		}

		this.inputSubscription = this.inputValue.valueChanges.subscribe((value) => {
			if (value !== null && value !== undefined) {
				let corrected = value.toString();
				const invalidChar = this.decimalSeparator === ',' ? '.' : ',';
				const separator = this.decimalSeparator || '.';

				if (corrected.includes(invalidChar)) {
					corrected = corrected.replace(invalidChar, separator);
				}

				// Prepara o valor para formato "BD" (com ponto)
				let formattedValue: any = corrected.replace(separator, '.');
				const numericValue = parseFloat(formattedValue);

				if (!isNaN(numericValue)) {
					if (this.numberOfDecimals != null && this.numberOfDecimals > 0) {
						const factor = Math.pow(10, this.numberOfDecimals);
						formattedValue = (
							Math.round(numericValue * factor) / factor
						).toFixed(this.numberOfDecimals);
					} else {
						// Se for inteiro (ex: Ano), salva como número puro
						formattedValue = Math.floor(numericValue);
					}
				}

				this.valueForSaving = formattedValue;

				// SINCRONIZAÇÃO COM O FORMULÁRIO PAI (Essencial para salvar)
				if (this.resourceForm && this.resourceForm.get(this.label)) {
					this.resourceForm
						.get(this.label)
						.setValue(this.valueForSaving, { emitEvent: false });
					this.resourceForm.get(this.label).markAsDirty();
				}
			}
		});
	}

	setLabel() {
		this.setTranslation(this.className, this.label)
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe({
				next: (translatedLabel: string) => {
					const limit = this.charactersLimit;
					if (translatedLabel === this.className + '.' + this.label) {
						this.displayedLabel = this.setCharactersLimit(
							this.formatDefaultVariableName(this.label),
							limit
						);
					} else {
						this.displayedLabel = this.setCharactersLimit(
							translatedLabel,
							limit
						);
					}
				},
				error: () => {
					this.displayedLabel = this.setCharactersLimit(
						this.label,
						this.charactersLimit
					);
				}
			});
	}

	checkConditional() {
		if (this.conditionalVisibility) {
			const field = this.resourceForm.get(this.conditionalVisibility.field);

			const updateVisibility = (val: any) => {
				let value = val;
				if (value && typeof value === 'object' && value.id) value = value.id;
				const valueStr = value?.toString();

				if (this.conditionalVisibility.values.includes(valueStr)) {
					this.inputValue.enable();
				} else {
					this.inputValue.disable();
				}
			};

			updateVisibility(field?.value);
			this.resourceForm.valueChanges
				.pipe(takeUntil(this.ngUnsubscribe))
				.subscribe((vals) => {
					updateVisibility(vals[this.conditionalVisibility.field]);
				});
		}
	}

	setIconPhone() {
		if (this.maskType?.toLowerCase() === 'phone') {
			this.svgIcon = 'phone';
			this.actionOnClickInIcon = () => {
				if (this.inputValue.value)
					window.location.href = `tel:${this.inputValue.value}`;
			};
		} else {
			this.svgIcon = 'calculate';
			this.actionOnClickInIcon = () => this.openCalculatorDialog();
		}
	}

	applyFinalFormatting() {
		if (this.valueForSaving != null) {
			this.inputValue.setValue(this.valueForSaving, { emitEvent: false });
		}
	}

	validateInput(): boolean {
		this.inputValue.updateValueAndValidity();
		return this.inputValue.valid;
	}

	setIconPosition(): string {
		return this.iconPosition === 'start' || this.iconPosition === 'end'
			? this.iconPosition
			: 'end';
	}

	openCalculatorDialog() {
		const dialogRef = this.dialog.open(CalculatorComponent, {
			data: { formData: this.inputValue.value }
		});
		dialogRef
			.afterClosed()
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((result) => {
				if (result !== undefined && result !== null && result !== '') {
					this.inputValue.setValue(result.toString());
				}
			});
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next(null);
		this.ngUnsubscribe.complete();
	}
}
