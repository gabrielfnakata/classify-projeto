package br.com.ifsp.classify.utils;

import java.nio.ByteBuffer;
import java.util.List;
import java.util.UUID;

public class Utils {

    public static boolean isNullOrEmpty(String word) {
        return word == null || word.trim().isEmpty();
    }

    public static <T> boolean hasElements(List<T> list) {
        return !(list == null || list.isEmpty());
    }
}