export const truncateWords = (text, wordLimit = 3) => {
    const words = text.trim().split(" ");

    if (words.length <= wordLimit) {
        return text;
    }

    return words.slice(0, wordLimit).join(" ") + "...";
}
