import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[\W_]/.test(value);
    const isValidLength = value.length >= 8 && value.length <= 64;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && isValidLength;

    return !passwordValid
      ? { passwordStrength: 'A senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas, números e caracteres especiais.' }
      : null;
  };
}
