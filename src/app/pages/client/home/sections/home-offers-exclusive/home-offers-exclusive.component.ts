import { Component, OnInit, OnDestroy } from '@angular/core';
import { Offer } from '../../../../../core/models/offer.model';

// Constantes para breakpoints responsive
const BREAKPOINT_MOBILE_SMALL = 425;
const BREAKPOINT_MOBILE = 768;
const BREAKPOINT_TABLET = 920;
const BREAKPOINT_LAPTOP = 1200;

// Constantes para dimensiones de items
const ITEM_WIDTH_DESKTOP = 364;
const ITEM_WIDTH_TABLET = 300;
const CAROUSEL_GAP = 20;

/**
 * Componente para mostrar ofertas exclusivas en un carrusel responsive.
 * Muestra 3 ofertas en desktop, 2 en tablet y 1 en móvil.
 */
@Component({
    selector: 'app-home-offers-exclusive',
    templateUrl: './home-offers-exclusive.component.html',
    styleUrls: ['./home-offers-exclusive.component.scss']
})
export class HomeOffersExclusiveComponent implements OnInit, OnDestroy {

    offers: Offer[] = [
        {
            image: 'assets/brand/offers/image1.jpg',
            title: 'Ahorra hasta un 20% reservando como miembro de Marriott.',
            subtitle: 'FECHAS EXCLUSIVAS PARA MIEMBROS',
            isMemberExclusive: true,
            link: '#'
        },
        {
            image: 'assets/brand/offers/image2.jpg',
            title: 'Retiros en resort - Gana hasta $100 en crédito diario',
            subtitle: 'MÚLTIPLES UBICACIONES',
            isMemberExclusive: false,
            link: '#'
        },
        {
            image: 'assets/brand/offers/image3.jpg',
            title: 'Ahorra en estancias de +5 noches',
            subtitle: 'MÚLTIPLES UBICACIONES',
            isMemberExclusive: false,
            link: '#'
        },
        {
            image: 'assets/brand/offers/image1.jpg',
            title: 'Oferta Futura 1',
            subtitle: 'PRÓXIMAMENTE',
            isMemberExclusive: false,
            link: '#'
        },
        {
            image: 'assets/brand/offers/image2.jpg',
            title: 'Oferta Futura 2',
            subtitle: 'PRÓXIMAMENTE',
            isMemberExclusive: false,
            link: '#'
        },
        {
            image: 'assets/brand/offers/image3.jpg',
            title: 'Oferta Futura 3',
            subtitle: 'PRÓXIMAMENTE',
            isMemberExclusive: false,
            link: '#'
        }
    ];

    currentSlide = 0;
    itemsPerSlide = 3;
    itemWidth = ITEM_WIDTH_DESKTOP;
    gap = CAROUSEL_GAP;

    private resizeListener: () => void;

    constructor() {
        this.resizeListener = () => this.checkScreenSize();
    }

    ngOnInit(): void {
        this.checkScreenSize();
        window.addEventListener('resize', this.resizeListener);
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.resizeListener);
    }

    /**
     * Ajusta el número de items visibles y su tamaño según el ancho de pantalla.
     * Utiliza breakpoints responsive para optimizar la visualización en diferentes dispositivos.
     */
    checkScreenSize(): void {
        const width = window.innerWidth;

        if (width < BREAKPOINT_MOBILE) {
            this.itemsPerSlide = 1;
        } else if (width <= BREAKPOINT_TABLET) {
            this.itemWidth = ITEM_WIDTH_TABLET;
            this.itemsPerSlide = 2;
        } else if (width <= BREAKPOINT_LAPTOP) {
            this.itemWidth = ITEM_WIDTH_DESKTOP;
            this.itemsPerSlide = 2;
        } else {
            this.itemWidth = ITEM_WIDTH_DESKTOP;
            this.itemsPerSlide = 3;
        }

        if (this.currentSlide >= this.totalSlides) {
            this.currentSlide = 0;
        }
    }

    /**
     * Calcula el estilo de transformación para el carrusel.
     * En móvil (1 item), usa porcentajes ya que cada slide ocupa 100% del ancho.
     * En desktop/tablet (múltiples items), usa píxeles con el ancho del item + gap.
     * @returns String con el valor CSS translateX.
     */
    get transformStyle(): string {
        if (this.itemsPerSlide === 1) {
            const percentShift = this.currentSlide * 100;
            return `translateX(-${percentShift}%)`;
        } else {
            const shift = this.currentSlide * this.itemsPerSlide * (this.itemWidth + this.gap);
            return `translateX(-${shift}px)`;
        }
    }

    get totalSlides(): number {
        return Math.ceil(this.offers.length / this.itemsPerSlide);
    }

    get slides(): number[] {
        const slides = [];
        for (let i = 0; i < this.totalSlides; i++) {
            slides.push(i);
        }
        return slides;
    }

    /**
     * Avanza al siguiente grupo de ofertas en el carrusel.
     */
    nextSlide(): void {
        this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    }

    /**
     * Retrocede al grupo anterior de ofertas en el carrusel.
     */
    prevSlide(): void {
        this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    }

    /**
     * Navega a un slide específico del carrusel.
     * @param index Índice del slide al que se desea navegar.
     */
    goToSlide(index: number): void {
        this.currentSlide = index;
    }
}
