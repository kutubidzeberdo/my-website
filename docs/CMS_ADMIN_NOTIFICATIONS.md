# Georgian admin notifications

Payload 3.92.0's native Sonner toaster is reused across every collection/global. No second toast container, optimistic success handler or custom fetch interceptor is installed. NotificationPolicy uses Payload’s exported native toast.getToasts/toast.error API to update an error’s existing ID in place with infinite duration, keeping errors accessible until dismissal without duplicating notifications. Native operations report server-confirmed success/failure. Native field validation remains visible next to invalid fields.

`src/cms/translations.ts` supplies Georgian login labels and create/update/delete/draft/unpublish feedback. Examples: `{{label}} წარმატებით დაემატა`, `ცვლილებები წარმატებით შეინახა`, `ჩანაწერი წარმატებით წაიშალა`, `მონახაზი წარმატებით შეინახა`. Native errors and permission errors are localized where overridden. Some advanced native help/UI remains English because this upstream release has no Georgian language pack; the project supplies a custom Georgian dictionary with English fallback.

`src/app/(payload)/custom.css` styles only the native toaster: rounded corners, shadow, green check/red cross icons, restrained icon entrance/stroke animation and mobile sizing. Sonner provides entrance/exit, close controls, live announcements and loading/info/warning states. Configuration limits visible notifications to 3 and uses 4.5 seconds. Reduced-motion disables the custom animations. No notification styling is loaded into the public site.

Deletion uses Payload's native keyboard-accessible confirmation modal with Georgian heading/body/cancel/delete labels. Canceling sends no DELETE and emits no success. Actual deletion success/error remains native. No ordinary success modal is introduced.

Browser verification covers create/update, exactly one Georgian success toast, validation error without false success, delete cancel/confirm, and reduced-motion/mobile behavior as recorded in the implementation report. API failures are checked independently. The shared native infrastructure applies to the other sections; do not infer that every combination of failure/network interruption has been manually tested.

Native loading feedback varies by operation (save button/processing indicator versus toast); no universal custom loading toast is added.
