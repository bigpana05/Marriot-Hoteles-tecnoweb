/**
 * Interfaz para botones de acción y navegación.
 */
export interface ActionButton {
    label: string;
    link: string;
    variant: 'primary' | 'secondary';
}
