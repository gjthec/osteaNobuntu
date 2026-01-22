import { AfterViewInit, Component, Injector, Input } from '@angular/core';
import { BaseFieldComponent } from '../base-field/base-field.component';
import { FormGroup, FormControl } from '@angular/forms';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { environment } from 'environments/environment';
import { MatDialog } from '@angular/material/dialog';
import { ConsultaService } from 'app/shared/services/consulta.service';
import { finalize } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface QueryParam {
	variableName: string; // Nome da variável (ex: "situacao")
	className: string; // Nome da classe (opcional)
	attributeName: string; // Nome do atributo (opcional)
}

export interface ISendFormLink { 
	addressDestination: string, 
	title: any, 
	destinationFormat: string 
}

interface ParsedUrl {
	path: string;
	parameters: QueryParam[];
}

@Component({
	selector: 'app-send-form-data',
	templateUrl: './send-form-data.component.html',
	styleUrl: './send-form-data.component.scss'
})
export class SendFormDataComponent extends BaseFieldComponent implements AfterViewInit {

	/**
		 * Nome da classe que pertence esse campo.
		 */
	@Input() className: string;
	/**
	 * Campo de título desse campo.
	 */
	@Input() label: string;
	/**
	 * Ícone svg para ser apresentado no campo.
	 */
	@Input() svgIcon: string | null;
	/**
	 * Posição do icone no campo.\
	 * Exemplo: "end" ou "start".
	 */
	@Input() iconPosition: string = "end";
	/**
	 * Endereço externo para onde os dados serão enviados.
	 */
	@Input() externalAddress: string | null;
	/**
	 * Endereço de destino para onde os dados serão enviados.
		*/
	@Input() links: ISendFormLink[] = [];
	/**
	 * Indica se todos os dados do formulário devem ser enviados.
	 * Se verdadeiro, todos os dados do formulário serão enviados.
	 * Se falso, apenas os dados específicos deste campo serão enviados.
		*/
	@Input() sendAllData: boolean;
	/**
	 * Formulário que contém todos os campos do formulário.
	**/
	@Input() resourceForm: FormGroup
	/**
	 * Campo de exibição do endereço de destino.
	 */
	display = new FormControl<string | null>(null);
	/**
	 * Label que será apresentada no titulo desse campo
	 */
	displayedLabel: string;

	pathToGo: string;

	currentResultAction: string | null = null;
	currentMapping: { [key: string]: string } | null = null;

	public inputValue = new FormControl<string | number | null>(null);

	isButtonActive: boolean = true;

	constructor(protected injector: Injector,
		private httpClient: HttpClient,
		private consultaService: ConsultaService,
		private dialog: MatDialog,
		private http: HttpClient,
		private matSnackBar: MatSnackBar) {
		super(injector);
	}

	ngAfterViewInit(): void {
	}

	getUrlParameters(urlString: string | null | undefined): ParsedUrl {
		const partesUrl = urlString.split('?');
		const caminho = partesUrl[0];
		const parametros: QueryParam[] = [];

		if (partesUrl.length > 1 && partesUrl[1]) {
			const queryString = partesUrl[1];
			const paresDeParametros = queryString.split('&');

			for (const par of paresDeParametros) {
				const [nomeVariavelUrl, placeholderComChaves] = par.split('=');

				if (nomeVariavelUrl && placeholderComChaves) {
					let placeholderSemChaves = '';
					if (placeholderComChaves.startsWith('{') && placeholderComChaves.endsWith('}')) {
						placeholderSemChaves = placeholderComChaves.slice(1, -1);
					} else {
						// Caso o placeholder não esteja entre chaves, tratar como está
						placeholderSemChaves = placeholderComChaves;
					}

					const partesPlaceholder = placeholderSemChaves.split('.');
					let classeOuObjeto: string | undefined = undefined;
					let atributo: string;

					if (partesPlaceholder.length > 1) {
						classeOuObjeto = partesPlaceholder[0];
						atributo = partesPlaceholder.slice(1).join('.'); // Caso haja mais de um ponto no atributo
					} else {
						atributo = partesPlaceholder[0];
					}

					parametros.push({
						attributeName: atributo,
						className: classeOuObjeto || '',
						variableName: nomeVariavelUrl
					});
				}
			}
		}
		this.pathToGo = caminho;
		return {
			path: caminho,
			parameters: parametros
		};
	}

	parseUrlString(urlToParse: string): string {
		if (!urlToParse || urlToParse.trim() === '') {
			return '';
		}

		const parsedUrl = this.getUrlParameters(urlToParse);
		let url = parsedUrl.path;

		parsedUrl.parameters.forEach((param, index) => {
			let placeholder = '';
			try {
				if (param.className !== this.className) {
					placeholder = this.getParamsOtherClass(param.className, param.attributeName);
				} else {
					placeholder = this.resourceForm.get(param.attributeName)?.value || '';
				}

			} catch (error) {
				console.error(`Erro ao obter o valor do parâmetro ${param.variableName}:`, error);
				placeholder = ''; // Define um valor padrão ou vazio em caso de erro
			}

			url += (index === 0 ? '?' : '&') + `${param.variableName}=${placeholder}`;
		});

		return url;
	}

	getParamsOtherClass(className: string, attributeName: string): string {
		// const classNameFirstLetterUpperCase = className.charAt(0).toUpperCase() + className.slice(1);    const classNameFirstLetterLowerCase = className.charAt(0).toLowerCase() + className.slice(1);
		const classValue = this.resourceForm.get(className).value;
		if (classValue[attributeName]) {
			return classValue[attributeName] || '';
		}

		if (typeof classValue === 'string' || typeof classValue === 'number') {
			let url = environment.backendUrl + `/${className}/` + classValue;
			this.httpClient.get(url).subscribe((response: any) => {
				const attributeValue = response[attributeName];
				if (attributeValue) {
					return attributeValue;
				}
			});
		}

		return '';
	}


	goToPage(item: { addressDestination: string, title: any, destinationFormat: string, result?: { action: string, mapping: { [key: string]: string } } }): void {
		let url = this.parseUrlString(item.addressDestination);

		if (item.destinationFormat === 'newTab') {
			this.goToPageNewTab(url);
		} else if (item.destinationFormat === 'newWindow') {
			this.goToPageNewWindow(url);
		} else if (item.destinationFormat === 'newDialog') {
			this.currentResultAction = item.result?.action || null;
			this.currentMapping = item.result?.mapping || null;
			this.openDialogByRoutePath(this.pathToGo, url);
		}
	}

	goToPageNewTab(url: string): void {
		// Sugestão: Usar 'url' ou 'item.title' na mensagem
		const userConfirmed = confirm(`Você está prestes a navegar para: ${this.pathToGo}. Deseja continuar?`);
		if (userConfirmed) {
			const newTab = window.open(url, '_blank');
			if (!newTab) {
				this.matSnackBar.open('A abertura da nova aba foi bloqueada pelo navegador. Por favor, verifique as configurações do seu bloqueador de pop-ups.', 'OK', { duration: 3000 });
			}
		}
	}

	goToPageNewWindow(url: string): void {
		const userConfirmed = confirm(`Você está prestes a navegar para: ${this.pathToGo}. Deseja continuar?`);
		if (userConfirmed) {
			const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
			if (!newWindow) {
				this.matSnackBar.open('A abertura da nova janela foi bloqueada pelo navegador. Por favor, verifique as configurações do seu bloqueador de pop-ups.', 'OK', { duration: 3000 });
			}
		}
	}

	async openDialogByRoutePath<T>(path: string, url: string) {
		const componentType = this.consultaService.getComponentByPath(path);
		const queryFromUrl = '?' + url.split('?')[1];
		const dialogRef = this.dialog.open(componentType, {
			width: '80%',
			height: '80%',
			data: queryFromUrl,
			panelClass: 'custom-dialog-container',
			autoFocus: false
		});



		if (dialogRef) {
			dialogRef.afterClosed().subscribe(result => {
				if (!result) {
					return;
				} else if (this.currentResultAction == 'fillForm') {
					this.fillFormWithResult(result, this.currentMapping);
				}
			});
		}

	}

	fillFormWithResult(result: any, mapping: { [key: string]: string }): void {
		if (!result || !mapping) {
			return;
		}

		for (const [formControlName, resultKey] of Object.entries(mapping)) {
			const formControl = this.resourceForm.get(formControlName);
			if (formControl) {
				const valueName = resultKey.split('.').pop();
				if (result[valueName] === undefined) {
					console.warn(`O valor "${valueName}" não foi encontrado no resultado.`);
				}
				formControl.setValue(result[valueName]);
			}
		}
	}

	exportDocument(item: ISendFormLink): void {
		const classQueryUrl = this.parseUrlString(item.addressDestination);
		const url = `${environment.backendUrl}/api/consulta/exportDocument/${classQueryUrl}`;
		const title = item.title
		this.downloadDocument(url, title);
	}

	private downloadDocument(url: string, title: string): void {
		const format = 'csv';
		this.isButtonActive = false;

		this.http.get(url,{ 
			responseType: 'blob',
			observe: 'response'
		}).subscribe({
			next: (response) => {
				let filename = `${title[this.translocoService.getActiveLang()]}_export.${format}`;
				const contentDisposition = response.headers.get('Content-Disposition');
				if (contentDisposition) {
					const match = contentDisposition.match(/filename="?([^"]+)"?/);
					if (match?.[1]) {
						filename = match[1];
					}
				}

				// Cria blob e trigger do download
				const blob = new Blob([response.body!], { 
					type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
				});
				
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
				this.isButtonActive = true;
			},
			error: (error) => {
				this.isButtonActive = true;
				console.error('Erro ao fazer download:', error);
				//TODO: MENSAGEM DE ERRO PERSONALIZADO E TRADUZIDO
				// this.error = `Erro ao fazer download do arquivo ${format.toUpperCase()}`;
			}
		});
	}
}
