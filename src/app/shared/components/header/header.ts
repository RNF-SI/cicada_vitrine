import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/site-config';
import { NAV_SECTIONS } from './nav-section';

/**
 * Bandeau de navigation de la page unique.
 *
 * Reprend le bandeau de l'application Cicada : fond blanc, 58 px, collant, logo
 * à gauche, liens en Nunito bold bleu-vert, et menu latéral bleu primaire avec
 * barre active jaune sur mobile.
 *
 * Les liens de section passent par le routeur (`routerLink` + `fragment`) et non
 * par un simple `href="#id"` : le bandeau est aussi affiché sur les mentions
 * légales, d'où ces ancres doivent ramener à l'accueil, pas changer le fragment
 * d'une page qui ne contient pas ces sections.
 *
 * La section active est détectée par un `IntersectionObserver` plutôt qu'en
 * écoutant le défilement : pas de calcul à chaque pixel, et le navigateur fait
 * le travail. Il n'est instancié que dans le navigateur, le prérendu statique
 * n'en a pas besoin.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly sections = NAV_SECTIONS;
  protected readonly config = SITE_CONFIG;

  protected readonly menuOpen = signal(false);
  protected readonly activeSection = signal<string | null>(null);
  /** Passe à `true` dès que la page a défilé, pour détacher le bandeau. */
  protected readonly scrolled = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = this.observeSections();
      const onScroll = () => this.scrolled.set(window.scrollY > 8);

      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      destroyRef.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener('scroll', onScroll);
      });
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  /**
   * Surligne la section la plus haute parmi celles visibles. La marge haute
   * compense la hauteur du bandeau collant pour que le surlignage change au
   * moment où le titre passe sous le bandeau.
   */
  private observeSections(): IntersectionObserver | null {
    const targets = this.sections
      .map(({ id }) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) {
      return null;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.add(entry.target.id);
          } else {
            visible.delete(entry.target.id);
          }
        }

        const first = this.sections.find(({ id }) => visible.has(id));
        this.activeSection.set(first?.id ?? null);
      },
      { rootMargin: '-72px 0px -55% 0px', threshold: 0 },
    );

    targets.forEach((target) => observer.observe(target));
    return observer;
  }
}
