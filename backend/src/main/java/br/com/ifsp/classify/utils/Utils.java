package br.com.ifsp.classify.utils;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

public class Utils {

    public static boolean isNullOrEmpty(String word) {
        return word == null || word.trim().isEmpty();
    }

    public static <T> boolean hasElements(List<T> list) {
        return !(list == null || list.isEmpty());
    }

    public static String trimAndUpper(String word) {
        return isNullOrEmpty(word) ? null : word.trim().toUpperCase();
    }

    public static String removeAllNonDigits(String word) {
        return isNullOrEmpty(word)? null : word.replaceAll("\\D", "");
    }

    public static boolean cpfValidator(String cpf) {
        String formattedCPF = removeAllNonDigits(cpf);
        if (formattedCPF.length() != 11 || formattedCPF.matches("(\\d)\\1{10}"))
            return false;

        if (!digitValidation(formattedCPF, true))
            return false;

        return digitValidation(formattedCPF, false);
    }

    private static boolean digitValidation(String cpf, boolean isFirstDigit) {
        int sum = 0;
        int numberToMultiply = (isFirstDigit)
            ? 10
            : 11;
        int length = (isFirstDigit)
            ? 9
            : 10;

        for (int c = 0; c < length; ++c) {
            int digit = Character.getNumericValue(cpf.charAt(c));
            sum += (digit * numberToMultiply);
            --numberToMultiply;
        }

        int expectedDigit = ((sum * 10) % 11);
        if (expectedDigit == 10)
            expectedDigit = 0;

        return Character.getNumericValue(cpf.charAt(length)) == expectedDigit;
    }

    public static <T, K> Map<K, T> mountIndexedMap(List<T> list, Function<T, K> keyExtractor) {
        return list.stream().collect(Collectors.toMap(keyExtractor, Function.identity()));
    }
}
