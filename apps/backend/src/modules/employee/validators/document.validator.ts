// ==========================================================================
// Document Validator - Validación de documentos de identidad peruanos
// ==========================================================================

export class DocumentValidator {
  /**
   * Valida un DNI peruano (8 dígitos)
   */
  static isValidDNI(dni: string): boolean {
    return /^\d{8}$/.test(dni);
  }

  /**
   * Valida un Carné de Extranjería (9-20 alfanuméricos)
   */
  static isValidCE(ce: string): boolean {
    return /^[a-zA-Z0-9]{9,20}$/.test(ce);
  }

  /**
   * Valida un número de pasaporte
   */
  static isValidPassport(passport: string): boolean {
    return /^[a-zA-Z0-9]{6,20}$/.test(passport);
  }

  /**
   * Valida según el tipo de documento
   */
  static validate(type: string, number: string): { valid: boolean; message?: string } {
    switch (type) {
      case 'DNI':
        if (!this.isValidDNI(number)) {
          return { valid: false, message: 'DNI debe tener 8 dígitos numéricos' };
        }
        return { valid: true };

      case 'CE':
        if (!this.isValidCE(number)) {
          return { valid: false, message: 'CE debe tener entre 9 y 20 caracteres alfanuméricos' };
        }
        return { valid: true };

      case 'Pasaporte':
        if (!this.isValidPassport(number)) {
          return { valid: false, message: 'Pasaporte debe tener entre 6 y 20 caracteres' };
        }
        return { valid: true };

      default:
        return { valid: false, message: 'Tipo de documento no soportado' };
    }
  }
}
