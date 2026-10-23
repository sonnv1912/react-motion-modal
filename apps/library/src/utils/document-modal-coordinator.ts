/**
 * Coordinates modal side effects across every ModalProvider that shares one
 * document: body scroll-lock ownership, keyboard (Escape/Tab) ownership and
 * cross-provider visual layering.
 *
 * State is keyed by document through a WeakMap, so providers rendered into
 * iframes or custom roots stay isolated from the host document, and nothing
 * leaks once a document is discarded. All functions expect a document that
 * was captured during a provider lifecycle effect and are therefore never
 * called while server-side rendering.
 */

type ScrollLock = {
   tokens: Set<object>;
   initialStyles: {
      overflow: string;
      overscrollBehavior: string;
   };
};

type KeyboardOwner = {
   token: object;
   layer: number;
};

type DocumentModalCoordinator = {
   scrollLock: ScrollLock | null;
   keyboardOwners: KeyboardOwner[];
   layerEpoch: number;
};

const coordinators = new WeakMap<Document, DocumentModalCoordinator>();

const getCoordinator = (doc: Document): DocumentModalCoordinator => {
   let coordinator = coordinators.get(doc);

   if (!coordinator) {
      coordinator = { scrollLock: null, keyboardOwners: [], layerEpoch: 0 };
      coordinators.set(doc, coordinator);
   }

   return coordinator;
};

/**
 * Locks body scroll for `token`. The inline overflow and overscroll-behavior
 * values seen on the first lock are remembered and restored once the last
 * token is released, so stacked providers can close in any order. The
 * overscroll lock also stops wheel and touch scrolling from chaining out of
 * the page while a modal is open.
 */
export const acquireScrollLock = (doc: Document, token: object): void => {
   const coordinator = getCoordinator(doc);

   if (!coordinator.scrollLock) {
      coordinator.scrollLock = {
         tokens: new Set([token]),
         initialStyles: {
            overflow: doc.body.style.overflow,
            overscrollBehavior: doc.body.style.overscrollBehavior,
         },
      };
      doc.body.style.overflow = 'hidden';
      doc.body.style.overscrollBehavior = 'none';
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
      doc.body.style.overflow = scrollLock.initialStyles.overflow;
      doc.body.style.overscrollBehavior =
         scrollLock.initialStyles.overscrollBehavior;
   }
};

/**
 * Grants keyboard ownership to `token` and returns its stacking layer. The
 * most recent claim receives the highest layer, so the provider that opened
 * the latest modal answers Escape and Tab first and renders above other
 * providers. Re-claiming by the current owner keeps its layer.
 */
export const claimKeyboardOwnership = (
   doc: Document,
   token: object,
): number => {
   const coordinator = getCoordinator(doc);
   const owners = coordinator.keyboardOwners;
   const current = owners[owners.length - 1];

   if (current?.token === token) {
      return current.layer;
   }

   const layer = ++coordinator.layerEpoch;
   coordinator.keyboardOwners = [
      ...owners.filter((owner) => owner.token !== token),
      { token, layer },
   ];

   return layer;
};

/**
 * Drops keyboard ownership for `token`, handing interaction back to the next
 * remaining provider. Idempotent; resets the layer counter once every
 * provider is gone so layers stay close to the base z-index.
 */
export const releaseKeyboardOwnership = (
   doc: Document,
   token: object,
): void => {
   const coordinator = getCoordinator(doc);
   coordinator.keyboardOwners = coordinator.keyboardOwners.filter(
      (owner) => owner.token !== token,
   );

   if (coordinator.keyboardOwners.length === 0) {
      coordinator.layerEpoch = 0;
   }
};

/**
 * Returns true while `token` owns the document's modal keyboard
 * interactions. Providers without ownership must ignore Escape, Tab, stray
 * focus and touch scrolling so independent systems never cancel each other.
 */
export const hasKeyboardOwnership = (doc: Document, token: object): boolean => {
   const coordinator = coordinators.get(doc);
   return coordinator?.keyboardOwners.at(-1)?.token === token;
};
