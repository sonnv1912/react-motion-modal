/**
 * Coordinates modal side effects across every ModalProvider that shares one
 * document: body scroll-lock ownership and keyboard (Escape/Tab) ownership.
 *
 * State is keyed by document through a WeakMap, so providers rendered into
 * iframes or custom roots stay isolated from the host document, and nothing
 * leaks once a document is discarded. All functions expect a document that
 * was captured during a provider lifecycle effect and are therefore never
 * called while server-side rendering.
 */

type ScrollLock = {
   tokens: Set<object>;
   initialInlineOverflow: string;
};

type DocumentModalCoordinator = {
   scrollLock: ScrollLock | null;
   keyboardOwners: object[];
};

const coordinators = new WeakMap<Document, DocumentModalCoordinator>();

const getCoordinator = (doc: Document): DocumentModalCoordinator => {
   let coordinator = coordinators.get(doc);

   if (!coordinator) {
      coordinator = { scrollLock: null, keyboardOwners: [] };
      coordinators.set(doc, coordinator);
   }

   return coordinator;
};

/**
 * Locks body scroll for `token`. The inline overflow value seen on the first
 * lock is remembered and restored once the last token is released, so stacked
 * providers can close in any order.
 */
export const acquireScrollLock = (doc: Document, token: object): void => {
   const coordinator = getCoordinator(doc);

   if (!coordinator.scrollLock) {
      coordinator.scrollLock = {
         tokens: new Set([token]),
         initialInlineOverflow: doc.body.style.overflow,
      };
      doc.body.style.overflow = 'hidden';
      return;
   }

   coordinator.scrollLock.tokens.add(token);
};

/**
 * Releases one scroll-lock token. Releasing an unknown token is a safe no-op,
 * so Strict Mode cleanups and repeated unmounts never underflow the lock.
 */
export const releaseScrollLock = (doc: Document, token: object): void => {
   const coordinator = getCoordinator(doc);
   const { scrollLock } = coordinator;

   if (!scrollLock?.tokens.has(token)) {
      return;
   }

   scrollLock.tokens.delete(token);

   if (scrollLock.tokens.size === 0) {
      coordinator.scrollLock = null;
      doc.body.style.overflow = scrollLock.initialInlineOverflow;
   }
};

/**
 * Grants keyboard ownership to `token`. The most recent claim wins, so the
 * provider that opened the latest modal answers Escape and Tab first.
 */
export const claimKeyboardOwnership = (doc: Document, token: object): void => {
   const coordinator = getCoordinator(doc);
   coordinator.keyboardOwners = coordinator.keyboardOwners.filter(
      (owner) => owner !== token,
   );
   coordinator.keyboardOwners.push(token);
};

/**
 * Drops keyboard ownership for `token`, handing interaction back to the next
 * remaining provider. Idempotent.
 */
export const releaseKeyboardOwnership = (
   doc: Document,
   token: object,
): void => {
   const coordinator = getCoordinator(doc);
   coordinator.keyboardOwners = coordinator.keyboardOwners.filter(
      (owner) => owner !== token,
   );
};

/**
 * Returns true while `token` owns the document's modal keyboard
 * interactions. Providers without ownership must ignore Escape and Tab so
 * independent systems never cancel each other.
 */
export const hasKeyboardOwnership = (doc: Document, token: object): boolean => {
   const coordinator = coordinators.get(doc);
   return coordinator?.keyboardOwners.at(-1) === token;
};
