import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Bloc marque UE + LIFE BIODIV'FRANCE et clause de non-responsabilité de l'UE.
 *
 * Obligation contractuelle du projet LIFE BIODIV'FRANCE : tout outil de
 * communication — site web inclus — doit porter le bloc marque officiel, **non
 * recomposé**, et la mention « Cofinancé par l'Union européenne… » dans un
 * encart clairement délimité et lisible.
 *
 * Le visuel et les textes sont repris **à l'identique** du composant
 * `app-eu-funding-notice` de l'application CICADA, lui-même aligné sur le guide
 * « Mentions et visuels obligatoires » du LIFE. Ne rien reformuler sans l'accord
 * de la coordination communication du LIFE : une communication dépourvue de
 * cette phrase peut voir son financement refusé par l'Union européenne.
 */
@Component({
  selector: 'app-eu-funding-notice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="eu-notice">
      <img
        src="/assets/images/bloc-marque-ue-life-biodiv.jpg"
        alt="Cofinancé par l'Union européenne — programme LIFE — BIODIV'FRANCE"
        class="eu-notice__logo"
        width="975"
        height="280"
        loading="lazy"
      />
      <div class="eu-notice__text">
        <p class="eu-notice__disclaimer">
          Cofinancé par l’Union européenne. Les points de vue et les opinions exprimés sont
          toutefois ceux des auteurs et ne reflètent pas nécessairement ceux de l’Union européenne
          ou de CINEA. Ni l’Union européenne ni l’autorité chargée de l’octroi de la subvention ne
          peuvent en être tenues pour responsables.
        </p>
        <p class="eu-notice__project">
          Réalisé dans le cadre du projet LIFE BIODIV’FRANCE<br />
          Coordonné par l’Office Français de la Biodiversité, ce projet rassemble un consortium de
          31 participants. Il accompagne la mise en œuvre de la stratégie nationale pour la
          biodiversité en travaillant sur 5 cibles : les territoires, aires protégées, filières,
          citoyens et acteurs de la formation.
        </p>
      </div>
    </div>
  `,
  styleUrl: './eu-funding-notice.scss',
})
export class EuFundingNotice {}
