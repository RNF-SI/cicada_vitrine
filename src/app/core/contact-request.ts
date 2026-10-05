/** Objet d'une demande envoyée depuis le formulaire de contact. */
export type ContactSubject = 'saas' | 'installation' | 'bug' | 'partenariat' | 'autre';

/** Charge utile postée à la fonction serverless, qui ouvre le ticket Zammad. */
export interface ContactRequest {
  readonly name: string;
  readonly email: string;
  readonly organisation: string;
  readonly subject: ContactSubject;
  readonly message: string;
  /** Jeton Turnstile, vérifié côté serveur avant création du ticket. */
  readonly captchaToken: string;
}

/** Réponse de la fonction serverless. */
export interface ContactResponse {
  readonly ok: boolean;
  /** Numéro de ticket Zammad, quand l'API le renvoie. */
  readonly ticketNumber?: string;
  readonly error?: string;
}
