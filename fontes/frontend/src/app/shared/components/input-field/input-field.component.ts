import {
	Component,
	Injector,
	Input,
	OnChanges,
	OnDestroy,
	OnInit
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'input-field',
	templateUrl: './input-field.component.html',
	styleUrls: ['./input-field.component.scss']
})
export class InputFieldComponent
	extends BaseFieldComponent
	implements OnInit, OnDestroy, OnChanges
{
	@Input() className: string;
	@Input() label: string;
	@Input() charactersLimit: number;
	@Input() placeholder: string = '';
	@Input() mask: string;
	@Input() maskType: string;
	@Input() needMaskValue: boolean = true;
	@Input() limiteOfChars: number;
	@Input() svgIcon: string | null;
	@Input() isRequired: boolean = false;
	@Input() iconPosition: string = 'end';
	@Input() actionOnClickInIcon: () => void = null;
	@Input() defaultValue: string | number | null = null;
	@Input() conditionalVisibility: { field: string; values: string[] };
	@Input() resourceForm: FormGroup<any>;

	displayedLabel: string;
	public inputValue = new FormControl<string | number | null>(null);
	private ngUnsubscribe = new Subject();

	constructor(protected injector: Injector) {
		super(injector);
	}

	ngOnInit(): void {
		this.getDefaultValue();
		this.setLabel();
		this.checkConditional();
		this.checkEmailValidation();
		this.setEmailIcon();
		this.checkCharacterLimit();
		this.setupValueSync(); // Nova função para salvar os dados
	}

	ngOnChanges(): void {
		this.checkEmailValidation();
		this.checkCharacterLimit();
	}

	// CORREÇÃO: Validador agora ignora campos vazios (resolve erro em campos não obrigatórios)
	checkCharacterLimit() {
		const limit = this.limiteOfChars || this.charactersLimit;
		if (limit) {
			this.inputValue.setValidators([
				...(this.inputValue.validator ? [this.inputValue.validator] : []),
				(control: FormControl) => {
					const value = control.value;
					// Se não tem valor, não há o que validar (evita erro de 1 dígito ou campo vazio)
					if (value === null || value === undefined || value === '')
						return null;

					const valueString = value.toString();
					return valueString.length <= Number(limit)
						? null
						: { characterLimitExceeded: true };
				}
			]);
			this.inputValue.updateValueAndValidity({ emitEvent: false });
		}
	}

	// CORREÇÃO: Sincroniza o que você digita com o formulário que será SALVO
	setupValueSync() {
		this.inputValue.valueChanges
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe((value) => {
				if (this.resourceForm && this.resourceForm.get(this.label)) {
					this.resourceForm
						.get(this.label)
						.setValue(value, { emitEvent: false });
					this.resourceForm.get(this.label).markAsDirty();
				}
			});
	}

	checkEmailValidation() {
		if (this.maskType?.toLowerCase() === 'email') {
			this.inputValue.addValidators(Validators.email);
		}
		this.inputValue.updateValueAndValidity({ emitEvent: false });
	}

	setEmailIcon() {
		if (this.maskType?.toLowerCase() === 'email') {
			this.svgIcon = 'email';
			this.actionOnClickInIcon = () => {
				const email = this.inputValue.value;
				if (email) window.location.href = `mailto:${email}`;
			};
		}
	}

	checkConditional() {
		if (this.conditionalVisibility) {
			const updateVisibility = (formValues: any) => {
				let fieldValue = formValues[this.conditionalVisibility.field];
				if (fieldValue && typeof fieldValue === 'object' && fieldValue.id)
					fieldValue = fieldValue.id;
				const fieldValueStr = fieldValue?.toString();

				if (this.conditionalVisibility.values.includes(fieldValueStr)) {
					this.inputValue.enable({ emitEvent: false });
				} else {
					this.inputValue.disable({ emitEvent: false });
				}
			};

			updateVisibility(this.resourceForm.value);
			this.resourceForm.valueChanges
				.pipe(takeUntil(this.ngUnsubscribe))
				.subscribe((vals) => updateVisibility(vals));
		}
	}

	setLabel() {
		this.setTranslation(this.className, this.label)
			.pipe(takeUntil(this.ngUnsubscribe))
			.subscribe({
				next: (translatedLabel: string) => {
					const isDefault =
						translatedLabel === this.className + '.' + this.label;
					const finalLabel = isDefault
						? this.formatDefaultVariableName(this.label)
						: translatedLabel;
					this.displayedLabel = this.setCharactersLimit(
						finalLabel,
						this.charactersLimit
					);
				},
				error: () =>
					(this.displayedLabel = this.setCharactersLimit(
						this.label,
						this.charactersLimit
					))
			});
	}

	getDefaultValue() {
		if (this.defaultValue != null) {
			this.inputValue.setValue(this.defaultValue, { emitEvent: false });
		}
	}

	validateInput(): boolean {
		this.inputValue.updateValueAndValidity();
		return this.inputValue.valid;
	}

	setIconPosition(): string {
		if (this.svgIcon == null) return '';
		return this.iconPosition === 'end' || this.iconPosition === 'start'
			? this.iconPosition
			: 'end';
	}

	ngOnDestroy(): void {
		this.ngUnsubscribe.next(null);
		this.ngUnsubscribe.complete();
	}
}
