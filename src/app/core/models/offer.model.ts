/**
 * Interface que define la estructura de una oferta exclusiva.
 * Se utiliza en el carrusel de ofertas de la página principal.
 */
export interface Offer {
    image: string;
    title: string;
    subtitle: string;
    isMemberExclusive: boolean;
    link: string;
}
