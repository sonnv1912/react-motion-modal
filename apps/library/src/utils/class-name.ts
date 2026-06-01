export const joinClassName = (
   ...values: Array<string | false | null | undefined>
) => values.filter(Boolean).join(' ');
