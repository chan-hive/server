export function searchText(haystack: string | undefined, needle: string, caseSensitive?: boolean) {
    if (!haystack) {
        return false;
    }

    haystack = caseSensitive ? haystack : haystack.toLowerCase();
    needle = caseSensitive ? needle : needle.toLowerCase();

    return haystack.indexOf(needle) >= 0;
}
