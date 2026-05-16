package br.com.ifsp.classify.utils;

import java.util.List;

public class Utils {

    public static boolean isNullOrEmpty(String word) {
        return word == null || word.trim().isEmpty();
    }

    public static <T> boolean hasElements(List<T> list) {
        return !(list == null || list.isEmpty());
    }
}