import { Component } from '@angular/core';
import { Benefit } from 'src/app/core/models/benefit.model';
import { ActionButton } from 'src/app/core/models/action-button.model';

/**
 * Componente para mostrar la sección de Join Marriott International.
 * Muestra información sobre beneficios de membresía con iconos y botones de acción.
 */
@Component({
    selector: 'app-home-join-marriott',
    templateUrl: './home-join-marriott.component.html',
    styleUrls: ['./home-join-marriott.component.scss']
})
export class HomeJoinMarriottComponent {
    // Datos de los beneficios de membresía
    benefits: Benefit[] = [
        {
            icon: 'assets/icons/bed.svg',
            label: 'OBTÉN NOCHES GRATIS'
        },
        {
            icon: 'assets/icons/member.svg',
            label: 'TARIFAS PARA MIEMBROS'
        },
        {
            icon: 'assets/icons/wifi.svg',
            label: 'WIFI GRATIS'
        },
        {
            icon: 'assets/icons/smartphone-check.svg',
            label: 'CHECK-IN MÓVIL'
        }
    ];

    // Botones de acción principales
    actionButtons: ActionButton[] = [
        {
            label: 'Inscríbete gratis',
            link: '/client/register',
            variant: 'primary'
        },
        {
            label: 'Iniciar sesión',
            link: '/client/login',
            variant: 'secondary'
        }
    ];
}
